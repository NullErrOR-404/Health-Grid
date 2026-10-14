// ==============================================================================
// HealthGrid Patient & Appointment Type Definitions
// Dynamic Live Cloud Integration - Zero Static Mock Data
// ==============================================================================

export interface DatabasePatientRecord {
  id: string;
  health_id: string;
  full_name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  blood_group: string;
  phone_number: string;
  email: string;
  location: string;
  dob?: string;
  preferred_language?: string;
  chronic_conditions: string[];
  known_allergies: string[];
  current_medications: Array<{ name: string; dosage?: string; timing?: string }>;
  emergency_contacts: Array<{ name: string; relation: string; phone: string }>;
  role?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface DatabaseAppointmentRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  patient_health_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
  patient_avatar?: string | null;
  doctor_id: string;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason_for_visit: string;
  notes: string;
  consultation_fee: number | string;
  payment_status: string;
  source?: string;
  checked_in_at?: string | null;
  clinical_observations?: string | null;
  cancellation_reason?: string | null;
  rescheduled_from?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Clean Dynamic Baselines - Populated strictly from Supabase PostgreSQL in real time
export const AUTHENTIC_PATIENTS_50: DatabasePatientRecord[] = [];
export const AUTHENTIC_APPOINTMENTS_TODAY: DatabaseAppointmentRecord[] = [];
