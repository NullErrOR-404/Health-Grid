/**
 * HealthGrid Doctors & OPD Management Service
 * 
 * Direct Supabase Postgres integration with real-time pub/sub synchronization,
 * weekly OPD scheduling, room allocation, and live consultation queue bridging.
 */

import { supabase } from './supabaseClient';
import { type Appointment, appointmentService } from './appointmentService';
import { securityGuard } from './securityGuard';
import { securitySanitizer } from './securitySanitizer';

export interface DoctorScheduleSlot {
  time: string;
  room: string;
}

export interface DoctorDaySchedule {
  day: string; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  active: boolean;
  slots: DoctorScheduleSlot[];
}

export interface DoctorRecord {
  id: string;
  doctor_code: string; // DOC001
  name: string;
  department: string;
  specialization: string;
  designation: string;
  qualification: string;
  opd_days: string;
  opd_room: string;
  total_slots: number;
  booked_slots: number;
  status: 'In OPD' | 'Available' | 'On Leave';
  reg_no: string;
  experience_years: number;
  avatar_url?: string;
  schedule: DoctorDaySchedule[];
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorOpdMetrics {
  totalDoctors: number;
  currentlyInOpd: number;
  totalOpdConsultations: number;
  avgConsultationTime: number;
  onLeave: number;
  available: number;
}

export interface ConsultationRoomInfo {
  room: string;
  department: string;
  doctorId?: string;
  doctorName?: string;
  status: 'Occupied' | 'Available' | 'Maintenance';
  currentPatient?: string;
  timeSlot?: string;
}

export const INITIAL_DOCTORS: DoctorRecord[] = [];

const LOCAL_STORAGE_KEY = 'healthgrid_doctors_cache_v1';

class DoctorOpdService {
  private doctors: DoctorRecord[] = [...INITIAL_DOCTORS];
  private listeners: Array<() => void> = [];
  public realtimeChannel: any = null;
  public isInitialized = false;

  constructor() {
    this.loadFromLocalStorage();
    this.initSupabaseRealtime();
    this.fetchDoctors();
  }

  private loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.doctors = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading doctors cache:', e);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.doctors));
    } catch (e) {
      console.warn('Error saving doctors cache:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error in doctorOpdService listener:', err);
      }
    });
  }

  private initSupabaseRealtime() {
    try {
      this.realtimeChannel = supabase
        .channel('public:doctors_and_appointments')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'doctors' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newDoc = payload.new as DoctorRecord;
              if (!this.doctors.some((d) => d.id === newDoc.id || d.doctor_code === newDoc.doctor_code)) {
                this.doctors = [...this.doctors, newDoc];
                this.notify();
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedDoc = payload.new as DoctorRecord;
              this.doctors = this.doctors.map((d) =>
                d.id === updatedDoc.id || d.doctor_code === updatedDoc.doctor_code
                  ? { ...d, ...updatedDoc }
                  : d
              );
              this.notify();
            } else if (payload.eventType === 'DELETE') {
              const oldDoc = payload.old as { id: string };
              this.doctors = this.doctors.filter((d) => d.id !== oldDoc.id);
              this.notify();
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Could not establish Supabase real-time channel for doctors:', err);
    }
  }

  public async fetchDoctors(): Promise<DoctorRecord[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('doctor_code', { ascending: true, nullsFirst: false });

      if (!error && data && data.length > 0) {
        // Filter out any legacy entries that have no doctor_code or format them
        const mapped = data.map((d) => ({
          ...d,
          doctor_code: d.doctor_code || `DOC${String(d.id).slice(0, 3).toUpperCase()}`,
          schedule: Array.isArray(d.schedule) ? d.schedule : [],
          status: (d.status as 'In OPD' | 'Available' | 'On Leave') || (d.is_available ? 'Available' : 'On Leave'),
        })) as DoctorRecord[];

        this.doctors = mapped;
        this.isInitialized = true;
        this.notify();
        return this.doctors;
      }
    } catch (err) {
      console.warn('Supabase fetch doctors failed, using cached memory:', err);
    }
    return this.doctors;
  }

  public getDoctors(): DoctorRecord[] {
    return this.doctors;
  }

  public getDoctorById(id: string): DoctorRecord | undefined {
    return this.doctors.find((d) => d.id === id || d.doctor_code === id);
  }

  public getDoctorByCode(code: string): DoctorRecord | undefined {
    return this.doctors.find((d) => d.doctor_code === code);
  }

  public getMetrics(): DoctorOpdMetrics {
    const total = this.doctors.length;
    const inOpd = this.doctors.filter((d) => d.status === 'In OPD').length;
    const onLeave = this.doctors.filter((d) => d.status === 'On Leave').length;
    const available = this.doctors.filter((d) => d.status === 'Available').length;

    const appts = appointmentService.getAppointments();
    const consultationsCount = appts.length;

    return {
      totalDoctors: total,
      currentlyInOpd: inOpd,
      totalOpdConsultations: consultationsCount,
      avgConsultationTime: total > 0 ? 12 : 0,
      onLeave,
      available,
    };
  }

  public async addDoctor(doctor: Omit<DoctorRecord, 'id'>): Promise<DoctorRecord> {
    // 1. Zero-Trust Access Gate (OWASP A01:2021)
    securityGuard.requireAuthentication('register a doctor in clinical roster', ['HEALTHCARE_PROFESSIONAL', 'ADMIN', 'DOCTOR']);
    securityGuard.enforceRateLimit('mutation:add_doctor');

    // 2. Input Sanitization (OWASP A03:2021)
    const sanitizedName = securitySanitizer.sanitizeText(doctor.name);
    const sanitizedDepartment = securitySanitizer.sanitizeText(doctor.department);
    const sanitizedSpecialization = securitySanitizer.sanitizeText(doctor.specialization);
    const sanitizedRegNo = securitySanitizer.sanitizeText(doctor.reg_no);

    const newDocId = crypto.randomUUID();
    const newDoc: DoctorRecord = {
      ...doctor,
      name: sanitizedName,
      department: sanitizedDepartment,
      specialization: sanitizedSpecialization,
      reg_no: sanitizedRegNo,
      id: newDocId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    this.doctors = [...this.doctors, newDoc];
    this.notify();

    // Persist to Supabase
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([{
          id: newDoc.id,
          doctor_code: newDoc.doctor_code,
          name: newDoc.name,
          department: newDoc.department,
          specialization: newDoc.specialization,
          designation: newDoc.designation,
          qualification: newDoc.qualification,
          opd_days: newDoc.opd_days,
          opd_room: newDoc.opd_room,
          total_slots: newDoc.total_slots,
          booked_slots: newDoc.booked_slots,
          status: newDoc.status,
          reg_no: newDoc.reg_no,
          experience_years: newDoc.experience_years,
          avatar_url: newDoc.avatar_url,
          schedule: newDoc.schedule,
          is_available: newDoc.status !== 'On Leave',
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase add doctor error:', error);
      } else if (data) {
        this.doctors = this.doctors.map((d) => (d.id === newDocId ? { ...d, ...data } : d));
        this.notify();
      }
    } catch (e) {
      console.warn('Network issue during addDoctor, cached locally:', e);
    }

    return newDoc;
  }

  public async updateDoctor(id: string, updates: Partial<DoctorRecord>): Promise<DoctorRecord | null> {
    // 1. Zero-Trust Access Gate (OWASP A01:2021)
    securityGuard.requireAuthentication('update doctor roster information', ['HEALTHCARE_PROFESSIONAL', 'ADMIN', 'DOCTOR']);
    securityGuard.enforceRateLimit('mutation:update_doctor');

    const existing = this.doctors.find((d) => d.id === id || d.doctor_code === id);
    if (!existing) return null;

    // 2. Input Sanitization
    const sanitizedUpdates: Partial<DoctorRecord> = { ...updates };
    if (updates.name) sanitizedUpdates.name = securitySanitizer.sanitizeText(updates.name);
    if (updates.department) sanitizedUpdates.department = securitySanitizer.sanitizeText(updates.department);
    if (updates.specialization) sanitizedUpdates.specialization = securitySanitizer.sanitizeText(updates.specialization);

    const updated = {
      ...existing,
      ...sanitizedUpdates,
      updated_at: new Date().toISOString(),
    };

    this.doctors = this.doctors.map((d) => (d.id === existing.id ? updated : d));
    this.notify();

    try {
      const payload: any = { ...sanitizedUpdates, updated_at: updated.updated_at };
      if (updates.status) {
        payload.is_available = updates.status !== 'On Leave';
      }

      const { error } = await supabase
        .from('doctors')
        .update(payload)
        .eq('id', existing.id);

      if (error) {
        console.error('Supabase update doctor error:', error);
      }
    } catch (e) {
      console.warn('Network issue during updateDoctor, cached locally:', e);
    }

    return updated;
  }

  public async deleteDoctor(id: string): Promise<boolean> {
    // 1. Zero-Trust Access Gate (Strict Admin/Clinical Lead requirement)
    securityGuard.requireAuthentication('remove doctor from hospital system', ['HEALTHCARE_PROFESSIONAL', 'ADMIN']);
    securityGuard.enforceRateLimit('mutation:delete_doctor');

    const existing = this.doctors.find((d) => d.id === id || d.doctor_code === id);
    if (!existing) return false;

    this.doctors = this.doctors.filter((d) => d.id !== existing.id);
    this.notify();

    try {
      await supabase.from('doctors').delete().eq('id', existing.id);
    } catch (e) {
      console.warn('Network issue during deleteDoctor:', e);
    }

    return true;
  }

  /**
   * Retrieves today's patient queue for a specific doctor from appointments
   */
  public getTodayPatientsForDoctor(doctorId: string, doctorName: string): Appointment[] {
    const allAppts = appointmentService.getAppointments();
    const docNorm = doctorName.toLowerCase().replace('dr.', '').trim();

    return allAppts.filter((a) => {
      const matchDoc = a.doctor_id === doctorId ||
        (a.doctor_name && a.doctor_name.toLowerCase().includes(docNorm));
      return matchDoc;
    });
  }

  /**
   * Advances consultation queue: Marks waiting patient as 'In Consultation'
   */
  public async startNextConsultation(appointmentId: string): Promise<void> {
    securityGuard.requireAuthentication('advance active patient consultation', ['HEALTHCARE_PROFESSIONAL', 'DOCTOR', 'ADMIN']);
    securityGuard.enforceRateLimit('mutation:advance_consultation');
    await appointmentService.updateStatus(appointmentId, 'In Consultation');
  }

  /**
   * Rooms allocation listing dynamically computed from live doctors and their appointments
   */
  public getConsultationRooms(): ConsultationRoomInfo[] {
    const liveAppointments = appointmentService.getAppointments();
    const activeConsultations = liveAppointments.filter(
      (a) => a.status === 'In Consultation' || a.status === 'Checked In'
    );

    if (this.doctors.length === 0) {
      return [
        {
          room: 'Room 101',
          department: 'General Medicine',
          doctorName: 'Dr. Mohamed',
          status: 'Available',
          timeSlot: '09:00 AM - 01:00 PM',
        },
        {
          room: 'Casualty ER',
          department: 'Emergency Medicine',
          doctorName: 'Dr. Bala Murugan',
          status: 'Available',
          timeSlot: '24/7 STAT',
        },
      ];
    }

    return this.doctors.map((doc, idx) => {
      const roomNumber = doc.opd_room || `Room ${101 + idx}`;
      const activeAppt = activeConsultations.find(
        (a) => a.doctor_name === doc.name || a.doctor_id === doc.id
      );

      return {
        room: roomNumber,
        department: doc.department,
        doctorId: doc.id,
        doctorName: doc.name,
        status: activeAppt ? ('Occupied' as const) : doc.status === 'On Leave' ? ('Maintenance' as const) : ('Available' as const),
        currentPatient: activeAppt?.patient_name,
        timeSlot: doc.schedule?.[0]?.slots?.[0]?.time || '09:00 AM - 01:00 PM',
      };
    });
  }
}

export const doctorOpdService = new DoctorOpdService();
