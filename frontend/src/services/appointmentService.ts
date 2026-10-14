/**
 * HealthGrid Appointments Management Service
 * 
 * Direct Supabase Postgres integration with real-time pub/sub synchronization,
 * bidirectional OPD queue bridging, and sovereign ABDM HealthID patient tracking.
 */

import { supabase } from './supabaseClient';
import { unifiedPatientStore } from './unifiedPatientStore';
import { securityGuard } from './securityGuard';
import { securitySanitizer } from './securitySanitizer';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked In'
  | 'Waiting'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export type AppointmentType = 'Consultation' | 'Follow-up' | 'Routine' | 'Emergency';

export interface Appointment {
  id: string;
  appointment_id: string; // e.g. APPT250929001
  patient_id?: string;
  patient_health_id: string; // e.g. HG001245, HG-PP27BNQ
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
  patient_avatar?: string;
  doctor_id?: string;
  doctor_name: string;
  department: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. '09:00 AM'
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  checked_in_at?: string | null;
  source: string; // 'Online Booking' | 'Walk-in' | 'Mobile App' | 'Referral'
  reason_for_visit?: string;
  notes?: string;
  clinical_observations?: string;
  cancellation_reason?: string;
  rescheduled_from?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentMetrics {
  total: number;
  checkedIn: number;
  checkedInPercentage: number;
  waiting: number;
  waitingPercentage: number;
  cancelledNoShow: number;
  cancelledNoShowPercentage: number;
}

const LOCAL_STORAGE_KEY = 'healthgrid_appointments_cache_v1';


class AppointmentService {
  private appointments: Appointment[] = [];
  private listeners: Set<() => void> = new Set();
  private hasInitialized = false;

  constructor() {
    this.loadInitialCache();
    this.initSupabaseSync();
  }

  private loadInitialCache() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Appointment[] = JSON.parse(stored);
        // Cleanse any legacy mock appointments
        this.appointments = Array.isArray(parsed)
          ? parsed.filter((a) => !a.patient_health_id?.startsWith('HG001') && !a.patient_health_id?.startsWith('HG-001'))
          : [];
      } else {
        this.appointments = [];
      }
    } catch {
      this.appointments = [];
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.appointments));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.saveCache();
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in appointment listener:', err);
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private async initSupabaseSync() {
    if (this.hasInitialized) return;
    this.hasInitialized = true;

    // Fetch live rows from Supabase
    await this.fetchFromSupabase();

    // Setup Realtime subscription
    try {
      supabase
        .channel('public:appointments')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          async () => {
            await this.fetchFromSupabase();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription fallback:', err);
    }
  }

  public async fetchFromSupabase(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.warn('Supabase appointments fetch error, using local cache:', error.message);
        return this.appointments;
      }

      if (data) {
        this.appointments = (data as Appointment[]).filter((a) =>
          !a.patient_health_id?.startsWith('HG001') && !a.patient_health_id?.startsWith('HG-001')
        );
        this.notify();
      }
      return this.appointments;
    } catch (err) {
      console.warn('Exception during appointments fetch:', err);
      return this.appointments;
    }
  }

  public getAppointments(): Appointment[] {
    return this.appointments;
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find((a) => a.id === id || a.appointment_id === id);
  }

  public getAppointmentsForPatient(healthId: string): Appointment[] {
    return this.appointments.filter(
      (a) => a.patient_health_id?.toLowerCase() === healthId.toLowerCase()
    );
  }

  public calculateMetrics(items: Appointment[] = this.appointments): AppointmentMetrics {
    const total = items.length;
    const checkedIn = items.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation').length;
    const waiting = items.filter((a) => a.status === 'Waiting').length;
    const cancelledNoShow = items.filter((a) => a.status === 'Cancelled' || a.status === 'No Show').length;

    const checkedInPercentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    const waitingPercentage = total > 0 ? Math.round((waiting / total) * 100) : 0;
    const cancelledNoShowPercentage = total > 0 ? Math.round((cancelledNoShow / total) * 100) : 0;

    return {
      total,
      checkedIn,
      checkedInPercentage,
      waiting,
      waitingPercentage,
      cancelledNoShow,
      cancelledNoShowPercentage,
    };
  }

  /**
   * Schedule a new appointment
   */
  public async createAppointment(payload: Partial<Appointment>): Promise<Appointment> {
    // 1. Zero-Trust Access Gate (OWASP A01:2021)
    const user = securityGuard.requireAuthentication('book or schedule an appointment');
    securityGuard.enforceRateLimit('mutation:create_appointment');

    const nextSeq = this.appointments.length + 1;
    const todayNum = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const appointmentId = payload.appointment_id || `APPT${todayNum}${String(nextSeq).padStart(3, '0')}`;

    // 2. Input Sanitization
    const patientName = securitySanitizer.sanitizeText(payload.patient_name || user.name || 'Patient');
    const patientHealthId = payload.patient_health_id || user.healthId || 'HG001245';
    const reasonForVisit = securitySanitizer.sanitizeText(payload.reason_for_visit || '');
    const notes = securitySanitizer.sanitizeText(payload.notes || '');

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      appointment_id: appointmentId,
      patient_health_id: patientHealthId,
      patient_name: patientName,
      patient_phone: payload.patient_phone || user.phone || '+91 98765 43210',
      patient_age: payload.patient_age || 30,
      patient_gender: payload.patient_gender || 'Male',
      patient_avatar: payload.patient_avatar || '',
      doctor_name: securitySanitizer.sanitizeText(payload.doctor_name || 'Dr. Mohamed'),
      department: securitySanitizer.sanitizeText(payload.department || 'General Medicine'),
      appointment_date: payload.appointment_date || new Date().toISOString().slice(0, 10),
      appointment_time: payload.appointment_time || '10:00 AM',
      appointment_type: payload.appointment_type || 'Consultation',
      status: payload.status || 'Scheduled',
      checked_in_at: payload.checked_in_at || null,
      source: payload.source || 'Online Booking',
      reason_for_visit: reasonForVisit,
      notes: notes,
      clinical_observations: payload.clinical_observations || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic cache update
    this.appointments.unshift(newAppointment);
    this.notify();

    // Async sync to Supabase
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          appointment_id: newAppointment.appointment_id,
          patient_health_id: newAppointment.patient_health_id,
          patient_name: newAppointment.patient_name,
          patient_phone: newAppointment.patient_phone,
          patient_age: newAppointment.patient_age,
          patient_gender: newAppointment.patient_gender,
          patient_avatar: newAppointment.patient_avatar,
          doctor_name: newAppointment.doctor_name,
          department: newAppointment.department,
          appointment_date: newAppointment.appointment_date,
          appointment_time: newAppointment.appointment_time,
          appointment_type: newAppointment.appointment_type,
          status: newAppointment.status,
          checked_in_at: newAppointment.checked_in_at,
          source: newAppointment.source,
          reason_for_visit: newAppointment.reason_for_visit,
          notes: newAppointment.notes,
        }])
        .select()
        .single();

      if (!error && data) {
        newAppointment.id = data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('Supabase insert fallback:', e);
    }

    return newAppointment;
  }

  /**
   * Update Status with bidirectional OPD Queue Bridging
   */
  public async updateStatus(
    id: string,
    newStatus: AppointmentStatus,
    extra?: { reason?: string; notes?: string }
  ): Promise<boolean> {
    // 1. Zero-Trust Access Gate
    securityGuard.requireAuthentication('update appointment status');
    securityGuard.enforceRateLimit('mutation:update_appointment_status');

    const idx = this.appointments.findIndex((a) => a.id === id || a.appointment_id === id);
    if (idx === -1) return false;

    const apt = this.appointments[idx];
    apt.status = newStatus;
    apt.updated_at = new Date().toISOString();

    if (newStatus === 'Checked In' && !apt.checked_in_at) {
      apt.checked_in_at = new Date().toISOString();
    }
    if (extra?.reason) {
      apt.cancellation_reason = extra.reason;
    }
    if (extra?.notes) {
      apt.notes = apt.notes ? `${apt.notes}\n${extra.notes}` : extra.notes;
    }

    // Bidirectional OPD Queue Synchronization:
    // If marked Checked In or In Consultation, push to OPD Queue
    if (newStatus === 'Checked In' || newStatus === 'In Consultation') {
      try {
        const matchingPatient = unifiedPatientStore.getPatientByHealthId(apt.patient_health_id);
        if (matchingPatient) {
          unifiedPatientStore.addExistingPatientToOpd(
            matchingPatient.id,
            apt.department,
            apt.doctor_name,
            apt.appointment_type
          );
        }
      } catch (err) {
        console.warn('OPD sync note:', err);
      }
    }

    this.notify();

    // Sync to Supabase
    try {
      await supabase
        .from('appointments')
        .update({
          status: newStatus,
          checked_in_at: apt.checked_in_at,
          cancellation_reason: apt.cancellation_reason,
          notes: apt.notes,
          updated_at: apt.updated_at,
        })
        .or(`id.eq.${apt.id},appointment_id.eq.${apt.appointment_id}`);
    } catch (e) {
      console.warn('Supabase update status fallback:', e);
    }

    return true;
  }

  /**
   * Start Clinical Consultation with quick observations & deep link
   */
  public async startConsultation(
    id: string,
    observations?: string
  ): Promise<boolean> {
    const idx = this.appointments.findIndex((a) => a.id === id || a.appointment_id === id);
    if (idx === -1) return false;

    const apt = this.appointments[idx];
    apt.status = 'In Consultation';
    if (observations) {
      apt.clinical_observations = observations;
    }
    apt.updated_at = new Date().toISOString();

    // Ensure pushed to OPD queue as In Consultation
    try {
      const matchingPatient = unifiedPatientStore.getPatientByHealthId(apt.patient_health_id);
      if (matchingPatient) {
        const qItem = unifiedPatientStore.addExistingPatientToOpd(
          matchingPatient.id,
          apt.department,
          apt.doctor_name,
          apt.appointment_type
        );
        if (qItem) {
          unifiedPatientStore.updateOpdStatus(qItem.token, 'In Consultation');
        }
      }
    } catch (err) {
      console.warn('OPD start consultation note:', err);
    }

    this.notify();

    try {
      await supabase
        .from('appointments')
        .update({
          status: 'In Consultation',
          clinical_observations: apt.clinical_observations,
          updated_at: apt.updated_at,
        })
        .or(`id.eq.${apt.id},appointment_id.eq.${apt.appointment_id}`);
    } catch (e) {
      console.warn('Supabase start consultation fallback:', e);
    }

    return true;
  }

  /**
   * Reschedule Appointment
   */
  public async reschedule(
    id: string,
    newDate: string,
    newTime: string,
    newDoctor?: string,
    reason?: string
  ): Promise<boolean> {
    const idx = this.appointments.findIndex((a) => a.id === id || a.appointment_id === id);
    if (idx === -1) return false;

    const apt = this.appointments[idx];
    apt.rescheduled_from = `${apt.appointment_date} ${apt.appointment_time}`;
    apt.appointment_date = newDate;
    apt.appointment_time = newTime;
    if (newDoctor) apt.doctor_name = newDoctor;
    apt.status = 'Scheduled';
    if (reason) {
      apt.notes = apt.notes ? `${apt.notes}\nRescheduled: ${reason}` : `Rescheduled: ${reason}`;
    }
    apt.updated_at = new Date().toISOString();

    this.notify();

    try {
      await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
          doctor_name: apt.doctor_name,
          rescheduled_from: apt.rescheduled_from,
          status: 'Scheduled',
          notes: apt.notes,
          updated_at: apt.updated_at,
        })
        .or(`id.eq.${apt.id},appointment_id.eq.${apt.appointment_id}`);
    } catch (e) {
      console.warn('Supabase reschedule fallback:', e);
    }

    return true;
  }

  /**
   * Add Clinical or Triage Notes
   */
  public async addNotes(id: string, noteText: string): Promise<boolean> {
    const idx = this.appointments.findIndex((a) => a.id === id || a.appointment_id === id);
    if (idx === -1) return false;

    const apt = this.appointments[idx];
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `[${timestamp}] ${noteText}`;
    apt.notes = apt.notes ? `${apt.notes}\n${formattedNote}` : formattedNote;
    apt.updated_at = new Date().toISOString();

    this.notify();

    try {
      await supabase
        .from('appointments')
        .update({
          notes: apt.notes,
          updated_at: apt.updated_at,
        })
        .or(`id.eq.${apt.id},appointment_id.eq.${apt.appointment_id}`);
    } catch (e) {
      console.warn('Supabase add notes fallback:', e);
    }

    return true;
  }
}

export const appointmentService = new AppointmentService();
