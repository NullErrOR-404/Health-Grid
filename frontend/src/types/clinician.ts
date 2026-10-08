// ==============================================================================
// HealthGrid Clinician Portal — Domain Models & Type System
// ==============================================================================

export type ClinicianPortalTab =
  | 'my-queue'
  | 'appointments'
  | 'patients'
  | 'consultations'
  | 'follow-ups'
  | 'referrals'
  | 'inbox'
  | 'messages'
  | 'templates'
  | 'order-sets'
  | 'guidelines'
  | 'settings'
  | 'help';

export interface ClinicianProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  qualification: string;
  regNumber: string; // Medical Council Registration
  facilityId: string;
  facilityName: string;
  avatarUrl: string;
  phone: string;
  email: string;
}

export interface FacilityEntity {
  id: string;
  name: string;
  city: string;
  address: string;
  isPrimary?: boolean;
}

export interface PatientVitals {
  tempF?: number;
  pulseBpm?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2Percent?: number;
  respRate?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  recordedAt: string;
}

export interface PatientAllergy {
  id: string;
  allergen: string;
  category: 'MEDICATION' | 'FOOD' | 'ENVIRONMENTAL';
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  reaction: string;
  verifiedDate: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface PatientMedication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  route: string;
  frequency: string;
  duration?: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'HELD';
  prescriber: string;
  instructions: string;
  isJanAushadhiAvailable?: boolean;
  genericSavingsPercent?: number;
}

export interface PatientProblem {
  id: string;
  code: string; // ICD-10
  name: string;
  category: string;
  onsetDate: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC';
  notes?: string;
}

export interface PatientPastVisit {
  id: string;
  date: string;
  reason: string;
  provider: string;
  facility: string;
  summary: string;
}

export interface PatientInvestigation {
  id: string;
  testName: string;
  date: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  summary: string;
}

export interface PatientEntity {
  id: string;
  uhid: string;
  abhaId: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  phone: string;
  email?: string;
  address: string;
  avatarUrl: string;
  primaryProblem: string;
  vitals: PatientVitals;
  allergies: PatientAllergy[];
  medications: PatientMedication[];
  problems: PatientProblem[];
  investigations: PatientInvestigation[];
  pastVisits: PatientPastVisit[];
  careGaps: Array<{
    id: string;
    title: string;
    dueText: string;
    status: 'OVERDUE' | 'DUE_SOON' | 'SCHEDULED';
  }>;
  careTeam: Array<{
    role: string;
    name: string;
    specialty: string;
  }>;
}

export type QueueItemStatus =
  | 'WAITING'
  | 'IN_CONSULTATION'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type QueueItemPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export type VisitType = 'NEW_PATIENT' | 'FOLLOW_UP' | 'RESULT_REVIEW' | 'POST_PROCEDURE';

export interface PatientQueueItem {
  id: string;
  patientId: string;
  patient: PatientEntity;
  appointmentId: string;
  time: string;
  waitingMinutes: number;
  status: QueueItemStatus;
  priority: QueueItemPriority;
  visitType: VisitType;
  chiefComplaint: string;
  criticalAlert?: string;
  roomNumber?: string;
}

export type EncounterStatus = 'IN_PROGRESS' | 'READY_FOR_SIGN' | 'SIGNED' | 'CLOSED';

export type MedicationReconciliationAction =
  | 'CONTINUE'
  | 'CHANGE'
  | 'STOP'
  | 'HOLD'
  | 'NOT_TAKING';

export interface MedicationReconciliationEntry {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  action: MedicationReconciliationAction;
  notes?: string;
}

export type OrderCategory =
  | 'LABORATORY'
  | 'IMAGING'
  | 'PATHOLOGY'
  | 'PROCEDURE'
  | 'MEDICATION'
  | 'REFERRAL'
  | 'VACCINE'
  | 'PATIENT_EDUCATION';

export type OrderStatus =
  | 'DRAFT'
  | 'SIGNED'
  | 'SUBMITTED'
  | 'IN_PROCESS'
  | 'RESULTED'
  | 'REVIEWED'
  | 'CLOSED';

export interface OrderItem {
  id: string;
  encounterId?: string;
  patientId: string;
  category: OrderCategory;
  name: string;
  code: string;
  priority: 'ROUTINE' | 'STAT' | 'URGENT';
  status: OrderStatus;
  notes?: string;
  orderSetId?: string;
  orderedAt: string;
}

export interface OrderSetTemplate {
  id: string;
  name: string;
  specialty: string;
  description: string;
  items: Array<{
    category: OrderCategory;
    name: string;
    code: string;
    defaultNotes?: string;
  }>;
}

export type ResultStatus =
  | 'NEW'
  | 'NEEDS_REVIEW'
  | 'REVIEWED'
  | 'ACTION_REQUIRED'
  | 'PATIENT_NOTIFIED'
  | 'CLOSED';

export interface ResultItem {
  id: string;
  orderId?: string;
  patientId: string;
  patientName: string;
  testName: string;
  category: string;
  date: string;
  status: ResultStatus;
  isAbnormal: boolean;
  isCritical: boolean;
  value: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  notes?: string;
}

export interface ReferralItem {
  id: string;
  encounterId?: string;
  patientId: string;
  patientName: string;
  referringDoctor: string;
  targetSpecialty: string;
  targetDoctorName?: string;
  reason: string;
  priority: 'ROUTINE' | 'URGENT';
  clinicalSummary: string;
  status:
    | 'CREATED'
    | 'SENT'
    | 'ACCEPTED'
    | 'SPECIALIST_SEEN'
    | 'REPORT_RECEIVED'
    | 'CLOSED';
  requestedDate: string;
  reportNotes?: string;
}

export interface FollowUpItem {
  id: string;
  encounterId?: string;
  patientId: string;
  patientName: string;
  reason: string;
  dueDate: string;
  dueLabel: string; // e.g. "Today", "2 days", "3 weeks"
  priority: 'NORMAL' | 'HIGH';
  status: 'SCHEDULED' | 'PENDING' | 'OVERDUE' | 'COMPLETED';
  notes?: string;
}

export interface ClinicalDocument {
  id: string;
  patientId: string;
  title: string;
  category:
    | 'LAB_REPORT'
    | 'IMAGING_REPORT'
    | 'PRESCRIPTION'
    | 'REFERRAL_LETTER'
    | 'DISCHARGE_SUMMARY'
    | 'EXTERNAL_RECORD'
    | 'CONSENT';
  date: string;
  fileSize: string;
  uploadedBy: string;
}

export interface ClinicalInboxItem {
  id: string;
  type:
    | 'RESULTS'
    | 'MESSAGES'
    | 'PRESCRIPTIONS'
    | 'ORDERS'
    | 'REFERRALS'
    | 'DOCUMENTS'
    | 'FOLLOW_UPS'
    | 'NOTES';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  patientId: string;
  patientName: string;
  patientAvatar: string;
  title: string;
  summary: string;
  timestamp: string;
  isRead: boolean;
  isActioned: boolean;
  relatedId?: string;
}

export interface ClinicalDecisionAlert {
  id: string;
  tier: 'RED' | 'AMBER' | 'BLUE';
  title: string;
  description: string;
  recommendation: string;
  category: 'ALLERGY' | 'INTERACTION' | 'CONTRAINDICATION' | 'CARE_GAP' | 'RENAL_WARNING';
}

export interface ClinicalEncounter {
  id: string;
  patientId: string;
  patient: PatientEntity;
  appointmentId: string;
  clinicianId: string;
  facilityId: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: EncounterStatus;
  visitType: VisitType;
  chiefComplaint: string;

  // Clinical Stages
  hpi: string;
  ros: Record<string, string>;
  vitals: PatientVitals;
  physicalExam: {
    general?: string;
    cardiovascular?: string;
    respiratory?: string;
    abdomen?: string;
    neurological?: string;
    musculoskeletal?: string;
    skin?: string;
  };
  assessment: string;
  diagnoses: PatientProblem[];
  plan: string;

  // Linked Clinical Subsystems
  medicationReconciliations: MedicationReconciliationEntry[];
  orders: OrderItem[];
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    isGeneric?: boolean;
    janAushadhiPrice?: number;
    brandedPrice?: number;
  }>;
  referrals: ReferralItem[];
  followUp?: FollowUpItem;
  patientInstructions: string;

  // SOAP Note & Sign-off
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  signedAt?: string;
  signedBy?: string;
}
