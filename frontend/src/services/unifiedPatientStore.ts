/**
 * HealthGrid Unified Patient & Hospital ERP Reactive Store
 * ABDM-Compliant Federated HealthID Architecture
 * 
 * Synchronizes Patient Management, OPD Queue, Hospital ERP KPIs,
 * Doctor Telemedicine, and Citizen Personal Health Vaults in real time with Supabase.
 * STRICT LIVE-FIRST: Zero mock/seeded accounts allowed.
 */

import { healthMemoryService } from './healthMemoryService';
import { supabase } from './supabaseClient';
import { generateImmutableHealthId } from './authService';
import { hospitalAlertsService } from './hospitalAlertsService';
import {
  type DatabaseAppointmentRecord,
} from './generatedPatientsData';

export interface PatientInsurance {
  provider: string;
  policyNumber: string;
  validTill?: string;
  status: 'Active' | 'Not Available' | 'Expired';
}

export interface PatientVitalsRecord {
  id: string;
  timestamp: string;
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  temperature: number;
  spo2: number;
  bloodSugar?: number;
  loggedBy: string;
}

export interface PrescriptionItem {
  drug: string;
  dosage: string;
  freq: string;
  duration: string;
  timing?: string;
  instructions?: string;
}

export interface BillItem {
  id?: string;
  desc?: string;
  description?: string;
  category?: 'Consultation' | 'Pharmacy' | 'Diagnostics' | 'Procedures' | 'Room' | string;
  amount: number;
  quantity?: number;
}

export interface PatientBill {
  billNo: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Claim Processing';
  createdAt: string;
  items: BillItem[];
}

export interface PatientVisit {
  id: string;
  visitId: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  type: string;
  status: 'Checked In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  notes?: string;
  diagnosis?: string;
  prescriptions?: PrescriptionItem[];
  bill?: PatientBill;
}

export interface UnifiedPatient {
  id: string;
  healthId: string;
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  insurance: PatientInsurance;
  lastVisit: {
    date: string;
    department: string;
    doctor: string;
  };
  nextVisit: {
    date: string;
    department: string;
    doctor: string;
  } | null;
  status: 'Checked In' | 'In Consultation' | 'Waiting' | 'Completed' | 'Follow-up' | 'Admitted';
  reportsCount: number;
  documentsCount: number;
  registeredDate: string;
  role: string;
  todayVisit?: PatientVisit;
  vitalsHistory: PatientVitalsRecord[];
  visitsHistory: PatientVisit[];
}

export interface OpdQueueItem {
  token: number;
  tokenDisplay: string;
  patientId: string;
  patientName: string;
  uhid: string;
  phone: string;
  age: number;
  gender: string;
  department: string;
  doctor: string;
  status: 'Checked In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  checkInTime: string;
  waitingTimeMinutes: number;
  visitType: string;
  visitNumber: string;
  triagePriority?: 'P1' | 'P2' | 'P3';
}

export interface HospitalErpStats {
  totalPatients: number;
  todayVisits: number;
  newPatientsToday: number;
  activeFollowUps: number;
  totalOpdToday: number;
  currentlyWaiting: number;
  inConsultation: number;
  completedToday: number;
  avgWaitTimeMinutes: number;
}

const STORAGE_KEY = 'healthgrid_unified_patients';
const OPD_QUEUE_KEY = 'healthgrid_opd_queue';

export const mapDatabasePatientToUnified = (
  pat: any,
  appts: DatabaseAppointmentRecord[] = []
): UnifiedPatient => {
  const patientAppts = appts.filter(
    (a) => a.patient_id === pat.id || a.patient_health_id === pat.health_id
  );
  const todayAppt =
    patientAppts.find((a) => a.appointment_date === 'Today' || a.appointment_date === new Date().toISOString().split('T')[0]) ||
    patientAppts[0];

  return {
    id: pat.id,
    healthId: pat.health_id,
    name: pat.full_name || 'Patient',
    phone: pat.phone_number || '',
    email: pat.email || undefined,
    age: pat.age ?? 30,
    gender: pat.gender || 'Unknown',
    bloodGroup: pat.blood_group || 'O+',
    allergies:
      pat.known_allergies && pat.known_allergies.length > 0
        ? pat.known_allergies
        : ['No known allergies'],
    chronicConditions:
      pat.chronic_conditions && pat.chronic_conditions.length > 0
        ? pat.chronic_conditions
        : ['None reported'],
    insurance: {
      provider: 'Ayushman Bharat / CMCHIS',
      policyNumber: `ABDM-TN-${pat.health_id}`,
      status: 'Active',
    },
    lastVisit: {
      date: todayAppt ? todayAppt.appointment_date : 'Today',
      department: todayAppt ? todayAppt.department : 'General Medicine',
      doctor: todayAppt ? todayAppt.doctor_name : 'Dr. Mohamed',
    },
    nextVisit: null,
    status: todayAppt ? (todayAppt.status as any) : 'Checked In',
    reportsCount: 0,
    documentsCount: 0,
    registeredDate: pat.created_at ? new Date(pat.created_at).toLocaleDateString('en-GB') : 'Today',
    role: pat.role || 'CITIZEN',
    todayVisit: todayAppt
      ? {
          id: `visit-${todayAppt.id}`,
          visitId: todayAppt.appointment_id,
          date: todayAppt.appointment_date,
          time: todayAppt.appointment_time,
          department: todayAppt.department,
          doctor: todayAppt.doctor_name,
          type: todayAppt.appointment_type || 'Consultation',
          status: todayAppt.status as any,
          notes: todayAppt.notes,
        }
      : undefined,
    vitalsHistory: [],
    visitsHistory: [],
  };
};

export const mapDatabaseAppointmentsToQueue = (
  appts: DatabaseAppointmentRecord[]
): OpdQueueItem[] => {
  return appts.map((appt, idx) => ({
    token: idx + 1,
    tokenDisplay: String(idx + 1).padStart(2, '0'),
    patientId: appt.patient_id,
    patientName: appt.patient_name || 'Patient',
    uhid: appt.patient_health_id || 'N/A',
    phone: appt.patient_phone || '',
    age: appt.patient_age ?? 35,
    gender: appt.patient_gender ? (appt.patient_gender.toLowerCase().startsWith('f') ? 'F' : 'M') : 'Other',
    department: appt.department,
    doctor: appt.doctor_name,
    status: (appt.status as any) || 'Waiting',
    checkInTime: appt.appointment_time,
    waitingTimeMinutes: Math.max(5, (idx + 1) * 3),
    visitType: appt.appointment_type || 'General OPD',
    visitNumber: appt.appointment_id,
  }));
};

const INITIAL_PATIENTS: UnifiedPatient[] = [];
const INITIAL_OPD_QUEUE: OpdQueueItem[] = [];

type StoreSubscriber = () => void;

class UnifiedPatientStore {
  private patients: UnifiedPatient[] = [];
  private opdQueue: OpdQueueItem[] = [];
  private subscribers: Set<StoreSubscriber> = new Set();
  private isSyncing = false;

  constructor() {
    this.loadState();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === OPD_QUEUE_KEY) {
          this.loadState();
          this.notifySubscribers();
        }
      });
      // Immediately initiate live Supabase fetch and Realtime sync
      this.initSupabaseSync();
    }
  }

  private loadState(): void {
    if (typeof window === 'undefined') {
      this.patients = INITIAL_PATIENTS;
      this.opdQueue = INITIAL_OPD_QUEUE;
      return;
    }
    try {
      const pRaw = localStorage.getItem(STORAGE_KEY);
      const loaded: UnifiedPatient[] = pRaw ? JSON.parse(pRaw) : [];
      // Cleanse any legacy mock patients (HG-001... or @healthgrid.in mock accounts)
      const cleaned = loaded.filter((p) => {
        const isMock =
          (p.healthId && p.healthId.startsWith('HG-001')) ||
          p.name === 'Priya Sharma' ||
          p.name === 'Ravi Kumar' ||
          p.name === 'Ananya Iyer';
        return !isMock;
      });
      this.patients = cleaned;

      const qRaw = localStorage.getItem(OPD_QUEUE_KEY);
      const loadedQueue: OpdQueueItem[] = qRaw ? JSON.parse(qRaw) : [];
      const cleanedQueue = loadedQueue.filter((q) => !q.uhid?.startsWith('HG-001'));
      this.opdQueue = cleanedQueue;

      if (cleaned.length !== loaded.length || cleanedQueue.length !== loadedQueue.length) {
        this.saveState();
      }
    } catch {
      this.patients = INITIAL_PATIENTS;
      this.opdQueue = INITIAL_OPD_QUEUE;
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.patients));
      localStorage.setItem(OPD_QUEUE_KEY, JSON.stringify(this.opdQueue));
      window.dispatchEvent(new CustomEvent('healthgrid_unified_patient_sync'));
      this.notifySubscribers();
    } catch (e) {
      console.warn('Failed to save unified patients to storage:', e);
    }
  }

  public subscribe(cb: StoreSubscriber): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Subscriber notification error:', e);
      }
    });
  }

  // --- SUPABASE CLOUD LIVE SYNCHRONIZATION ---

  public async initSupabaseSync(): Promise<void> {
    await this.fetchFromSupabase();

    try {
      supabase
        .channel('public:patients_unified_store')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, async () => {
          await this.fetchFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
          await this.fetchFromSupabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription error in UnifiedPatientStore:', err);
    }
  }

  public async fetchFromSupabase(): Promise<UnifiedPatient[]> {
    if (this.isSyncing) return this.patients;
    this.isSyncing = true;

    try {
      const { data: dbPatients, error: pErr } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (pErr) {
        console.warn('Supabase fetch patients warning:', pErr.message);
        this.isSyncing = false;
        return this.patients;
      }

      const { data: dbAppts } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_time', { ascending: true });

      if (dbPatients) {
        // Strictly filter out any mock patients
        const realPatients = dbPatients.filter((pat: any) => {
          const isMock =
            (pat.health_id && pat.health_id.startsWith('HG-001')) ||
            (pat.email && pat.email.endsWith('@healthgrid.in') && pat.email !== 'dr.mohamed@healthgrid.in');
          return !isMock;
        });

        const mappedPatients = realPatients.map((pat: any) =>
          mapDatabasePatientToUnified(pat, (dbAppts as any) || [])
        );
        this.patients = mappedPatients;

        if (dbAppts) {
          const realAppts = dbAppts.filter((a: any) => !a.patient_health_id?.startsWith('HG-001'));
          this.opdQueue = mapDatabaseAppointmentsToQueue(realAppts as any);
        }

        this.saveState();
      }
    } catch (err) {
      console.error('Supabase fetch exception:', err);
    } finally {
      this.isSyncing = false;
    }

    return this.patients;
  }

  // --- READERS ---

  public getAllPatients(): UnifiedPatient[] {
    return [...this.patients];
  }

  public getPatientById(id: string): UnifiedPatient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public getPatientByHealthId(healthId: string): UnifiedPatient | undefined {
    const clean = healthId.trim().toUpperCase();
    return this.patients.find((p) => p.healthId.toUpperCase() === clean);
  }

  /**
   * Real-time Lookup by HealthGrid ID against Supabase database.
   * If patient is not in local memory, queries Supabase public.patients in real time.
   */
  public async lookupPatientByHealthId(healthId: string): Promise<UnifiedPatient | null> {
    const clean = healthId.trim().toUpperCase();
    if (!clean) return null;

    // 1. Check in memory first
    const existing = this.patients.find((p) => p.healthId.toUpperCase() === clean);
    if (existing) return existing;

    // 2. Query Supabase public.patients
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('health_id', clean)
        .maybeSingle();

      if (error) {
        console.warn('Error querying patient by Health ID:', error.message);
        return null;
      }

      if (data) {
        // Query their appointments
        const { data: dbAppts } = await supabase
          .from('appointments')
          .select('*')
          .or(`patient_id.eq.${data.id},patient_health_id.eq.${data.health_id}`)
          .order('appointment_time', { ascending: false });

        const unified = mapDatabasePatientToUnified(data, (dbAppts as any) || []);
        if (!this.patients.some((p) => p.id === unified.id)) {
          this.patients.unshift(unified);
          this.saveState();
        }
        return unified;
      }
    } catch (err) {
      console.error('Exception looking up patient by Health ID:', err);
    }

    return null;
  }

  public getOpdQueue(): OpdQueueItem[] {
    return [...this.opdQueue];
  }

  public getOpdQueueItemByToken(token: number): OpdQueueItem | undefined {
    return this.opdQueue.find((q) => q.token === token);
  }

  public getStats(): HospitalErpStats {
    const waitingCount = this.opdQueue.filter((q) => q.status === 'Waiting').length;
    const inConsultationCount = this.opdQueue.filter((q) => q.status === 'In Consultation').length;
    const completedQueueCount = this.opdQueue.filter((q) => q.status === 'Completed').length;

    return {
      totalPatients: this.patients.length,
      todayVisits: this.opdQueue.length,
      newPatientsToday: this.patients.filter((p) => p.registeredDate === 'Today').length,
      activeFollowUps: this.patients.filter((p) => p.status === 'Follow-up').length,
      totalOpdToday: this.opdQueue.length,
      currentlyWaiting: waitingCount,
      inConsultation: inConsultationCount,
      completedToday: completedQueueCount,
      avgWaitTimeMinutes: this.opdQueue.length > 0 ? 15 : 0,
    };
  }

  // --- ACTIONS (FULL CRUD WITH DATABASE PERSISTENCE) ---

  /**
   * Register a new patient in the hospital system
   * Generates genuine dynamic UUID and sovereign ABDM HealthID automatically (HG-XXXXXXX),
   * saving to Supabase `patients` and `user_roles` with role 'CITIZEN'.
   * Triggers an alert in the hospital inbox.
   */
  public registerNewPatient(patientData: {
    name: string;
    phone: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    email?: string;
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    initialDepartment?: string;
    initialDoctor?: string;
  }): UnifiedPatient {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `pat-${Date.now()}`;
    const newHealthId = generateImmutableHealthId(newId);

    const newPatient: UnifiedPatient = {
      id: newId,
      healthId: newHealthId,
      name: patientData.name.trim(),
      phone: patientData.phone.trim(),
      email: patientData.email?.trim() || undefined,
      age: patientData.age,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup || 'O+',
      allergies:
        patientData.allergies && patientData.allergies.length > 0
          ? patientData.allergies
          : ['No known allergies'],
      chronicConditions:
        patientData.chronicConditions && patientData.chronicConditions.length > 0
          ? patientData.chronicConditions
          : ['None reported'],
      insurance: {
        provider: patientData.insuranceProvider || 'Ayushman Bharat / CMCHIS',
        policyNumber: patientData.insurancePolicyNumber || `ABDM-TN-${newHealthId}`,
        status: 'Active',
      },
      lastVisit: {
        date: 'Today',
        department: patientData.initialDepartment || 'General Medicine',
        doctor: patientData.initialDoctor || 'Dr. Mohamed',
      },
      nextVisit: null,
      status: 'Checked In',
      reportsCount: 0,
      documentsCount: 0,
      registeredDate: 'Today',
      role: 'CITIZEN',
      vitalsHistory: [],
      visitsHistory: [],
    };

    if (patientData.initialDepartment) {
      newPatient.todayVisit = {
        id: `v-today-${newId}`,
        visitId: `OPD-${String(this.opdQueue.length + 1).padStart(3, '0')}`,
        date: 'Today',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        department: patientData.initialDepartment,
        doctor: patientData.initialDoctor || 'Dr. Mohamed',
        type: 'General OPD',
        status: 'Checked In',
      };
    }

    this.patients.unshift(newPatient);

    if (patientData.initialDepartment) {
      const nextToken = this.opdQueue.length + 1;
      const queueItem: OpdQueueItem = {
        token: nextToken,
        tokenDisplay: String(nextToken).padStart(2, '0'),
        patientId: newPatient.id,
        patientName: newPatient.name,
        uhid: newPatient.healthId,
        phone: newPatient.phone,
        age: newPatient.age,
        gender: newPatient.gender === 'Female' ? 'F' : 'M',
        department: patientData.initialDepartment,
        doctor: patientData.initialDoctor || 'Dr. Mohamed',
        status: 'Checked In',
        checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        waitingTimeMinutes: 5,
        visitType: 'General OPD',
        visitNumber: newPatient.todayVisit?.visitId || `OPD-${String(nextToken).padStart(3, '0')}`,
      };
      this.opdQueue.push(queueItem);
    }

    this.saveState();

    // Async persist to Supabase PostgreSQL & user_roles
    supabase
      .from('patients')
      .insert({
        id: newId,
        health_id: newHealthId,
        full_name: newPatient.name,
        phone_number: newPatient.phone,
        email: newPatient.email || null,
        age: newPatient.age,
        gender: newPatient.gender,
        blood_group: newPatient.bloodGroup,
        known_allergies: newPatient.allergies,
        chronic_conditions: newPatient.chronicConditions,
        location: 'Chennai, TN',
        role: 'CITIZEN',
      })
      .then(({ error }) => {
        if (error) console.warn('Could not insert new patient to Supabase:', error);
      });

    supabase
      .from('user_roles')
      .insert({
        user_id: newId,
        role: 'CITIZEN',
        user_type: 'PATIENT',
        full_name: newPatient.name,
      })
      .then();

    // Trigger alert in hospital notification inbox
    hospitalAlertsService.addAlert({
      type: 'REGISTRATION',
      patientName: newPatient.name,
      healthId: newPatient.healthId,
      message: `${newPatient.name} registered as a new user with Health ID ${newPatient.healthId}`,
    });

    return newPatient;
  }

  /**
   * Delete a patient permanently from the system and Supabase PostgreSQL
   */
  public async deletePatient(patientId: string): Promise<boolean> {
    try {
      // 1. Delete from Supabase cloud
      await supabase.from('appointments').delete().eq('patient_id', patientId);
      await supabase.from('user_roles').delete().eq('user_id', patientId);
      const { error } = await supabase.from('patients').delete().eq('id', patientId);

      if (error) {
        console.warn('Supabase delete patient error:', error.message);
      }

      // 2. Remove from local store & queue
      this.patients = this.patients.filter((p) => p.id !== patientId);
      this.opdQueue = this.opdQueue.filter((q) => q.patientId !== patientId);
      this.saveState();
      return true;
    } catch (err) {
      console.error('Exception deleting patient:', err);
      return false;
    }
  }

  /**
   * Update clinical metadata for a patient (allergies, blood group, chronic conditions, insurance)
   */
  public updatePatientClinicalInfo(
    patientId: string,
    updates: {
      allergies?: string[];
      bloodGroup?: string;
      chronicConditions?: string[];
      insurance?: PatientInsurance;
    }
  ): void {
    const idx = this.patients.findIndex((p) => p.id === patientId);
    if (idx === -1) return;

    this.patients[idx] = {
      ...this.patients[idx],
      ...(updates.allergies !== undefined && { allergies: updates.allergies }),
      ...(updates.bloodGroup !== undefined && { bloodGroup: updates.bloodGroup }),
      ...(updates.chronicConditions !== undefined && { chronicConditions: updates.chronicConditions }),
      ...(updates.insurance !== undefined && { insurance: updates.insurance }),
    };

    this.saveState();

    // Async persist updates to Supabase
    supabase
      .from('patients')
      .update({
        known_allergies: updates.allergies,
        blood_group: updates.bloodGroup,
        chronic_conditions: updates.chronicConditions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', patientId)
      .then();
  }

  /**
   * Register an existing patient into today's OPD Queue
   * Dispatches alert to hospital notification inbox.
   */
  public addExistingPatientToOpd(
    patientId: string,
    department: string,
    doctor: string,
    visitType: string = 'General OPD'
  ): OpdQueueItem | null {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return null;

    const nextToken = this.opdQueue.length + 1;
    const visitId = `OPD-${String(nextToken).padStart(3, '0')}`;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const queueItem: OpdQueueItem = {
      token: nextToken,
      tokenDisplay: String(nextToken).padStart(2, '0'),
      patientId: patient.id,
      patientName: patient.name,
      uhid: patient.healthId,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender === 'Female' ? 'F' : 'M',
      department,
      doctor,
      status: 'Checked In',
      checkInTime: timeStr,
      waitingTimeMinutes: 0,
      visitType,
      visitNumber: visitId,
    };

    patient.todayVisit = {
      id: `v-today-${patient.id}-${nextToken}`,
      visitId,
      date: 'Today',
      time: timeStr,
      department,
      doctor,
      type: visitType,
      status: 'Checked In',
    };
    patient.status = 'Checked In';

    this.opdQueue.push(queueItem);
    this.saveState();

    // Async persist appointment to Supabase
    supabase
      .from('appointments')
      .insert({
        appointment_id: visitId,
        patient_id: patient.id,
        patient_health_id: patient.healthId,
        patient_name: patient.name,
        patient_phone: patient.phone,
        patient_age: patient.age,
        patient_gender: patient.gender,
        department,
        doctor_name: doctor,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: timeStr,
        appointment_type: visitType,
        status: 'Checked In',
        checked_in_at: new Date().toISOString(),
        source: 'Hospital Desk',
        reason_for_visit: visitType,
      })
      .then(({ error }) => {
        if (error) console.warn('Could not insert appointment in Supabase:', error);
      });

    // Alert in hospital inbox
    hospitalAlertsService.addAlert({
      type: 'CHECK_IN',
      patientName: patient.name,
      healthId: patient.healthId,
      message: `${patient.name} (${patient.healthId}) checked into ${department} (Token #${nextToken})`,
    });

    return queueItem;
  }

  /**
   * Update the status of an OPD Queue item (Checked In -> Waiting -> In Consultation -> Completed -> Cancelled)
   */
  public updateOpdStatus(
    token: number,
    newStatus: 'Checked In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled'
  ): void {
    const qItem = this.opdQueue.find((q) => q.token === token);
    if (!qItem) return;

    qItem.status = newStatus;

    // Sync to patient record
    const patient = this.patients.find((p) => p.id === qItem.patientId);
    if (patient) {
      if (newStatus === 'Completed') {
        patient.status = 'Follow-up';
        if (patient.todayVisit) {
          patient.todayVisit.status = 'Completed';
          if (!patient.visitsHistory.some((v) => v.visitId === patient.todayVisit?.visitId)) {
            patient.visitsHistory.unshift({ ...patient.todayVisit });
          }
        }
      } else if (newStatus === 'In Consultation') {
        patient.status = 'In Consultation';
        if (patient.todayVisit) patient.todayVisit.status = 'In Consultation';
      } else if (newStatus === 'Waiting') {
        patient.status = 'Waiting';
        if (patient.todayVisit) patient.todayVisit.status = 'Waiting';
      } else {
        patient.status = 'Checked In';
        if (patient.todayVisit) patient.todayVisit.status = 'Checked In';
      }
    }

    this.saveState();
  }

  /**
   * Log vitals in OPD/Patient Management, immediately updating both hospital records
   * and the patient's personal longitudinal health memory
   */
  public addVitals(
    patientId: string,
    vitals: {
      bpSystolic: number;
      bpDiastolic: number;
      heartRate: number;
      temperature: number;
      spo2: number;
      bloodSugar?: number;
      loggedBy?: string;
    }
  ): void {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newRecord: PatientVitalsRecord = {
      id: `vit-${Date.now()}`,
      timestamp: `Today, ${timeStr}`,
      bpSystolic: vitals.bpSystolic,
      bpDiastolic: vitals.bpDiastolic,
      heartRate: vitals.heartRate,
      temperature: vitals.temperature,
      spo2: vitals.spo2,
      bloodSugar: vitals.bloodSugar,
      loggedBy: vitals.loggedBy || 'Dr. Mohamed',
    };

    patient.vitalsHistory.unshift(newRecord);

    // Sync to healthMemoryService for personal citizen portal
    healthMemoryService.addEntry(
      'blood_pressure',
      {
        systolic: vitals.bpSystolic,
        diastolic: vitals.bpDiastolic,
      },
      'mmHg',
      'manual_entry',
      `Logged at Hospital OPD (${patient.name})`
    );

    healthMemoryService.addEntry('heart_rate', vitals.heartRate, 'bpm', 'manual_entry');
    healthMemoryService.addEntry('temperature', vitals.temperature, '°F', 'manual_entry');
    healthMemoryService.addEntry('spo2', vitals.spo2, '%', 'manual_entry');
    if (vitals.bloodSugar) {
      healthMemoryService.addEntry(
        'blood_sugar',
        {
          glucose: vitals.bloodSugar,
          timing: 'random',
        },
        'mg/dL',
        'manual_entry'
      );
    }

    this.saveState();
  }

  /**
   * Issue a prescription during consultation, updating visit history & pharmacy store
   */
  public addPrescription(patientId: string, items: PrescriptionItem[]): void {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return;

    if (patient.todayVisit) {
      patient.todayVisit.prescriptions = items;
    }

    if (patient.visitsHistory.length > 0) {
      patient.visitsHistory[0].prescriptions = items;
    }

    this.saveState();
  }

  /**
   * Generate an itemized bill for consultation and pharmacy
   */
  public generateBill(
    patientId: string,
    billItems: BillItem[],
    status: 'Paid' | 'Pending' = 'Paid'
  ): PatientBill {
    const patient = this.patients.find((p) => p.id === patientId);
    const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);

    const bill: PatientBill = {
      billNo: `INV-${Date.now().toString().slice(-4)}`,
      amount: totalAmount,
      status,
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      items: billItems,
    };

    if (patient && patient.todayVisit) {
      patient.todayVisit.bill = bill;
    }

    this.saveState();
    return bill;
  }

  /**
   * Complete clinical consultation with notes and diagnosis
   */
  public completeConsultation(patientId: string, notes: string, diagnosis: string): void {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return;

    if (patient.todayVisit) {
      patient.todayVisit.notes = notes;
      patient.todayVisit.diagnosis = diagnosis;
      patient.todayVisit.status = 'Completed';
    }

    const qItem = this.opdQueue.find((q) => q.patientId === patientId);
    if (qItem) {
      qItem.status = 'Completed';
    }

    patient.status = 'Follow-up';
    this.saveState();
  }
}

export const unifiedPatientStore = new UnifiedPatientStore();
