/**
 * HealthGrid Unified Patient & Hospital ERP Reactive Store
 * ABDM-Compliant Federated HealthID Architecture
 * 
 * Synchronizes Patient Management, OPD Queue, Hospital ERP KPIs,
 * Doctor Telemedicine, and Citizen Personal Health Vaults in real time.
 */

import { healthMemoryService } from './healthMemoryService';

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
  instructions: string;
}

export interface BillItem {
  desc: string;
  amount: number;
}

export interface PatientBill {
  billNo: string;
  amount: number;
  status: 'Paid' | 'Pending';
  createdAt: string;
  items: BillItem[];
}

export interface PatientVisitRecord {
  id: string;
  visitId: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  type: string;
  status: 'Checked In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  diagnosis?: string;
  notes?: string;
  prescriptions?: PrescriptionItem[];
  bill?: PatientBill;
}

export interface UnifiedPatient {
  id: string;
  healthId: string; // UHID / Sovereign ABDM HealthID (e.g. HG001245)
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatar?: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  insurance: PatientInsurance;
  lastVisit: {
    date: string;
    department: string;
    doctor: string;
  };
  nextVisit?: string | null;
  status: 'Checked In' | 'Follow-up' | 'Consultation' | 'Waiting' | 'In Consultation' | 'Completed';
  vitalsHistory: PatientVitalsRecord[];
  visitsHistory: PatientVisitRecord[];
  todayVisit?: PatientVisitRecord;
  reportsCount: number;
  documentsCount: number;
  registeredDate: string;
}

export interface OpdQueueItem {
  token: number;
  tokenDisplay: string; // '01', '02', etc.
  patientId: string;
  patientName: string;
  uhid: string; // Patient HealthID
  phone: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  department: string;
  doctor: string;
  status: 'Checked In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  checkInTime: string;
  waitingTimeMinutes: number;
  visitType: string;
  visitNumber: string;
  avatar?: string;
}

export interface HospitalErpStats {
  // Patient Management stats
  totalPatients: number;
  todayVisits: number;
  newPatientsToday: number;
  activeFollowUps: number;
  // OPD stats
  totalOpdToday: number;
  currentlyWaiting: number;
  inConsultation: number;
  completedToday: number;
  avgWaitTimeMinutes: number;
}

const STORAGE_KEY = 'healthgrid_unified_patients_v1';
const OPD_QUEUE_KEY = 'healthgrid_opd_queue_v1';

// Initial Seed Patients matching both reference screenshots
const INITIAL_PATIENTS: UnifiedPatient[] = [
  {
    id: 'pat-1245',
    healthId: 'HG001245',
    name: 'Sameer Ahmed',
    phone: '+91 98765 43210',
    age: 20,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: ['No known allergies'],
    chronicConditions: ['None reported'],
    insurance: {
      provider: 'Not Available',
      policyNumber: '—',
      status: 'Not Available',
    },
    lastVisit: {
      date: '29 Sep 2025',
      department: 'OPD - General Medicine',
      doctor: 'Dr. Mohamed',
    },
    nextVisit: null,
    status: 'Checked In',
    reportsCount: 3,
    documentsCount: 2,
    registeredDate: '15 Jan 2025',
    todayVisit: {
      id: 'visit-today-1245',
      visitId: 'OPD-20250929-001',
      date: '29 Sep 2025',
      time: '10:15 AM',
      department: 'General Medicine (OPD)',
      doctor: 'Dr. Mohamed',
      type: 'General OPD',
      status: 'Checked In',
    },
    vitalsHistory: [
      {
        id: 'vit-1245-1',
        timestamp: '29 Sep 2025, 09:15 AM',
        bpSystolic: 118,
        bpDiastolic: 78,
        heartRate: 72,
        temperature: 98.4,
        spo2: 99,
        loggedBy: 'Nurse Shanthi',
      },
    ],
    visitsHistory: [
      {
        id: 'v-1245-1',
        visitId: 'OPD-20250929-001',
        date: '29 Sep 2025',
        time: '10:15 AM',
        department: 'General Medicine (OPD)',
        doctor: 'Dr. Mohamed',
        type: 'General OPD',
        status: 'Checked In',
      },
      {
        id: 'v-1245-2',
        visitId: 'OPD-20250812-088',
        date: '12 Aug 2025',
        time: '11:30 AM',
        department: 'Fever (OPD)',
        doctor: 'Dr. Priya',
        type: 'Acute Consultation',
        status: 'Completed',
        diagnosis: 'Viral Pharyngitis',
        notes: 'Advised rest, hydration, and paracetamol for fever.',
      },
      {
        id: 'v-1245-3',
        visitId: 'OPD-20250518-042',
        date: '18 May 2025',
        time: '04:00 PM',
        department: 'Viral Infection (OPD)',
        doctor: 'Dr. Arjun',
        type: 'Follow-up',
        status: 'Completed',
        diagnosis: 'Acute Rhinitis',
      },
    ],
  },
  {
    id: 'pat-1244',
    healthId: 'HG001244',
    name: 'Lakshmi Priya',
    phone: '+91 98765 67890',
    age: 34,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    chronicConditions: ['Mild Asthma'],
    insurance: {
      provider: 'Star Health Premier',
      policyNumber: 'SH-8829103',
      validTill: '15 Mar 2027',
      status: 'Active',
    },
    lastVisit: {
      date: '29 Sep 2025',
      department: 'OPD - Cardiology',
      doctor: 'Dr. Revathi',
    },
    nextVisit: '10 Oct 2025',
    status: 'Follow-up',
    reportsCount: 5,
    documentsCount: 4,
    registeredDate: '03 Feb 2024',
    todayVisit: {
      id: 'visit-today-1244',
      visitId: 'OPD-20250929-002',
      date: '29 Sep 2025',
      time: '09:30 AM',
      department: 'Cardiology',
      doctor: 'Dr. Revathi',
      type: 'Follow-up',
      status: 'Waiting',
    },
    vitalsHistory: [
      {
        id: 'vit-1244-1',
        timestamp: '29 Sep 2025, 09:25 AM',
        bpSystolic: 122,
        bpDiastolic: 80,
        heartRate: 76,
        temperature: 98.6,
        spo2: 98,
        loggedBy: 'Nurse Revathi',
      },
    ],
    visitsHistory: [
      {
        id: 'v-1244-1',
        visitId: 'OPD-20250929-002',
        date: '29 Sep 2025',
        time: '09:30 AM',
        department: 'Cardiology',
        doctor: 'Dr. Revathi',
        type: 'Follow-up',
        status: 'Waiting',
      },
      {
        id: 'v-1244-2',
        visitId: 'OPD-20250710-019',
        date: '10 Jul 2025',
        time: '10:00 AM',
        department: 'Cardiology',
        doctor: 'Dr. Revathi',
        type: 'Routine ECG Review',
        status: 'Completed',
        diagnosis: 'Normal Sinus Rhythm',
      },
    ],
  },
  {
    id: 'pat-1243',
    healthId: 'HG001243',
    name: 'Rajesh Kumar',
    phone: '+91 91234 56789',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A+',
    allergies: ['Sulfa drugs'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    insurance: {
      provider: 'National Insurance Medishield',
      policyNumber: 'NIC-992144',
      validTill: '30 Dec 2026',
      status: 'Active',
    },
    lastVisit: {
      date: '29 Sep 2025',
      department: 'OPD - Diabetology',
      doctor: 'Dr. Arjun',
    },
    nextVisit: null,
    status: 'Consultation',
    reportsCount: 8,
    documentsCount: 6,
    registeredDate: '12 Aug 2023',
    todayVisit: {
      id: 'visit-today-1243',
      visitId: 'OPD-20250929-003',
      date: '29 Sep 2025',
      time: '09:45 AM',
      department: 'Diabetology',
      doctor: 'Dr. Arjun',
      type: 'General OPD',
      status: 'Waiting',
    },
    vitalsHistory: [
      {
        id: 'vit-1243-1',
        timestamp: '29 Sep 2025, 09:35 AM',
        bpSystolic: 134,
        bpDiastolic: 86,
        heartRate: 80,
        temperature: 98.2,
        spo2: 97,
        bloodSugar: 148,
        loggedBy: 'Nurse Shanthi',
      },
    ],
    visitsHistory: [
      {
        id: 'v-1243-1',
        visitId: 'OPD-20250929-003',
        date: '29 Sep 2025',
        time: '09:45 AM',
        department: 'Diabetology',
        doctor: 'Dr. Arjun',
        type: 'General OPD',
        status: 'Waiting',
      },
    ],
  },
  {
    id: 'pat-1242',
    healthId: 'HG001242',
    name: 'Meena R',
    phone: '+91 87654 32109',
    age: 28,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: ['No known allergies'],
    chronicConditions: ['None reported'],
    insurance: {
      provider: 'HDFC ERGO My:Health',
      policyNumber: 'HDFC-102941',
      validTill: '18 Nov 2026',
      status: 'Active',
    },
    lastVisit: {
      date: '28 Sep 2025',
      department: 'OPD - Gynaecology',
      doctor: 'Dr. Priya',
    },
    nextVisit: '12 Oct 2025',
    status: 'Follow-up',
    reportsCount: 4,
    documentsCount: 3,
    registeredDate: '10 Jun 2024',
    todayVisit: {
      id: 'visit-today-1242',
      visitId: 'OPD-20250929-004',
      date: '29 Sep 2025',
      time: '10:00 AM',
      department: 'Gynaecology',
      doctor: 'Dr. Priya',
      type: 'ANC Checkup',
      status: 'In Consultation',
    },
    vitalsHistory: [],
    visitsHistory: [
      {
        id: 'v-1242-1',
        visitId: 'OPD-20250929-004',
        date: '29 Sep 2025',
        time: '10:00 AM',
        department: 'Gynaecology',
        doctor: 'Dr. Priya',
        type: 'ANC Checkup',
        status: 'In Consultation',
      },
      {
        id: 'v-1242-2',
        visitId: 'OPD-20250928-091',
        date: '28 Sep 2025',
        time: '02:15 PM',
        department: 'Gynaecology',
        doctor: 'Dr. Priya',
        type: 'Ultrasound Scan',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'pat-1241',
    healthId: 'HG001241',
    name: 'Arun Prakash',
    phone: '+91 99887 76655',
    age: 62,
    gender: 'Male',
    bloodGroup: 'AB+',
    allergies: ['Aspirin'],
    chronicConditions: ['Osteoarthritis (Right Knee)', 'Hypertension'],
    insurance: {
      provider: 'Tamil Nadu CM Comprehensive Scheme',
      policyNumber: 'TN-CMCHS-49012',
      validTill: '31 Mar 2028',
      status: 'Active',
    },
    lastVisit: {
      date: '28 Sep 2025',
      department: 'OPD - Orthopaedics',
      doctor: 'Dr. Karthik',
    },
    nextVisit: null,
    status: 'Consultation',
    reportsCount: 6,
    documentsCount: 4,
    registeredDate: '19 Jan 2023',
    todayVisit: {
      id: 'visit-today-1241',
      visitId: 'OPD-20250929-005',
      date: '29 Sep 2025',
      time: '10:15 AM',
      department: 'Orthopaedics',
      doctor: 'Dr. Karthik',
      type: 'Knee Pain Follow-up',
      status: 'Waiting',
    },
    vitalsHistory: [],
    visitsHistory: [
      {
        id: 'v-1241-1',
        visitId: 'OPD-20250929-005',
        date: '29 Sep 2025',
        time: '10:15 AM',
        department: 'Orthopaedics',
        doctor: 'Dr. Karthik',
        type: 'Knee Pain Follow-up',
        status: 'Waiting',
      },
    ],
  },
  {
    id: 'pat-1240',
    healthId: 'HG001240',
    name: 'Fatima Begum',
    phone: '+91 98760 11223',
    age: 50,
    gender: 'Female',
    bloodGroup: 'O-',
    allergies: ['No known allergies'],
    chronicConditions: ['Hypothyroidism'],
    insurance: {
      provider: 'New India Assurance Asha',
      policyNumber: 'NIA-441029',
      validTill: '15 Jul 2026',
      status: 'Active',
    },
    lastVisit: {
      date: '27 Sep 2025',
      department: 'OPD - General Medicine',
      doctor: 'Dr. Mohamed',
    },
    nextVisit: '05 Oct 2025',
    status: 'Follow-up',
    reportsCount: 3,
    documentsCount: 2,
    registeredDate: '05 Nov 2023',
    todayVisit: {
      id: 'visit-today-1240',
      visitId: 'OPD-20250929-006',
      date: '29 Sep 2025',
      time: '10:30 AM',
      department: 'General Medicine',
      doctor: 'Dr. Mohamed',
      type: 'General OPD',
      status: 'Waiting',
    },
    vitalsHistory: [],
    visitsHistory: [
      {
        id: 'v-1240-1',
        visitId: 'OPD-20250929-006',
        date: '29 Sep 2025',
        time: '10:30 AM',
        department: 'General Medicine',
        doctor: 'Dr. Mohamed',
        type: 'General OPD',
        status: 'Waiting',
      },
    ],
  },
  {
    id: 'pat-1239',
    healthId: 'HG001239',
    name: 'Vignesh S',
    phone: '+91 93456 77889',
    age: 36,
    gender: 'Male',
    bloodGroup: 'A-',
    allergies: ['No known allergies'],
    chronicConditions: ['Eczema (Mild)'],
    insurance: {
      provider: 'Not Available',
      policyNumber: '—',
      status: 'Not Available',
    },
    lastVisit: {
      date: '27 Sep 2025',
      department: 'OPD - Dermatology',
      doctor: 'Dr. Nivetha',
    },
    nextVisit: null,
    status: 'Consultation',
    reportsCount: 2,
    documentsCount: 1,
    registeredDate: '22 Apr 2024',
    todayVisit: {
      id: 'visit-today-1239',
      visitId: 'OPD-20250929-007',
      date: '29 Sep 2025',
      time: '10:45 AM',
      department: 'Dermatology',
      doctor: 'Dr. Nivetha',
      type: 'Skin Flare Consultation',
      status: 'Waiting',
    },
    vitalsHistory: [],
    visitsHistory: [
      {
        id: 'v-1239-1',
        visitId: 'OPD-20250929-007',
        date: '29 Sep 2025',
        time: '10:45 AM',
        department: 'Dermatology',
        doctor: 'Dr. Nivetha',
        type: 'Skin Flare Consultation',
        status: 'Waiting',
      },
    ],
  },
  {
    id: 'pat-1238',
    healthId: 'HG001238',
    name: 'Kavitha N',
    phone: '+91 90012 34567',
    age: 40,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: ['No known allergies'],
    chronicConditions: ['PCOS'],
    insurance: {
      provider: 'Star Health Family Optima',
      policyNumber: 'SH-612093',
      validTill: '01 Jan 2027',
      status: 'Active',
    },
    lastVisit: {
      date: '26 Sep 2025',
      department: 'OPD - Endocrinology',
      doctor: 'Dr. Arjun',
    },
    nextVisit: '09 Oct 2025',
    status: 'Follow-up',
    reportsCount: 4,
    documentsCount: 3,
    registeredDate: '14 Feb 2024',
    todayVisit: {
      id: 'visit-today-1238',
      visitId: 'OPD-20250929-008',
      date: '29 Sep 2025',
      time: '11:00 AM',
      department: 'Endocrinology',
      doctor: 'Dr. Arjun',
      type: 'Hormone Profile Review',
      status: 'Checked In',
    },
    vitalsHistory: [],
    visitsHistory: [
      {
        id: 'v-1238-1',
        visitId: 'OPD-20250929-008',
        date: '29 Sep 2025',
        time: '11:00 AM',
        department: 'Endocrinology',
        doctor: 'Dr. Arjun',
        type: 'Hormone Profile Review',
        status: 'Checked In',
      },
    ],
  },
  {
    id: 'pat-1237',
    healthId: 'HG001237',
    name: 'Suresh Babu',
    phone: '+91 98987 65432',
    age: 55,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Contrast dye'],
    chronicConditions: ['Kidney Stones (History)', 'Borderline Creatinine'],
    insurance: {
      provider: 'United India Insurance Health Plus',
      policyNumber: 'UII-339182',
      validTill: '20 Oct 2026',
      status: 'Active',
    },
    lastVisit: {
      date: '25 Sep 2025',
      department: 'OPD - Nephrology',
      doctor: 'Dr. Mohamed',
    },
    nextVisit: null,
    status: 'Consultation',
    reportsCount: 7,
    documentsCount: 5,
    registeredDate: '08 Dec 2022',
    todayVisit: {
      id: 'visit-today-1237',
      visitId: 'OPD-20250929-009',
      date: '29 Sep 2025',
      time: '11:15 AM',
      department: 'Nephrology',
      doctor: 'Dr. Mohamed',
      type: 'Renal Function Evaluation',
      status: 'Waiting',
    },
    vitalsHistory: [],
    visitsHistory: [
      {
        id: 'v-1237-1',
        visitId: 'OPD-20250929-009',
        date: '29 Sep 2025',
        time: '11:15 AM',
        department: 'Nephrology',
        doctor: 'Dr. Mohamed',
        type: 'Renal Function Evaluation',
        status: 'Waiting',
      },
    ],
  },
];

// Initial OPD Queue matching the OPD Management screenshot
const INITIAL_OPD_QUEUE: OpdQueueItem[] = [
  {
    token: 1,
    tokenDisplay: '01',
    patientId: 'pat-1245',
    patientName: 'Sameer Ahmed',
    uhid: 'HG001245',
    phone: '+91 98765 43210',
    age: 20,
    gender: 'M',
    department: 'General Medicine',
    doctor: 'Dr. Mohamed',
    status: 'Checked In',
    checkInTime: '09:12 AM',
    waitingTimeMinutes: 12,
    visitType: 'General OPD',
    visitNumber: 'OPD-20250929-001',
  },
  {
    token: 2,
    tokenDisplay: '02',
    patientId: 'pat-1244',
    patientName: 'Lakshmi Priya',
    uhid: 'HG001244',
    phone: '+91 98765 67890',
    age: 34,
    gender: 'F',
    department: 'Cardiology',
    doctor: 'Dr. Revathi',
    status: 'Waiting',
    checkInTime: '09:20 AM',
    waitingTimeMinutes: 24,
    visitType: 'Follow-up',
    visitNumber: 'OPD-20250929-002',
  },
  {
    token: 3,
    tokenDisplay: '03',
    patientId: 'pat-1243',
    patientName: 'Rajesh Kumar',
    uhid: 'HG001243',
    phone: '+91 91234 56789',
    age: 45,
    gender: 'M',
    department: 'Diabetology',
    doctor: 'Dr. Arjun',
    status: 'Waiting',
    checkInTime: '09:25 AM',
    waitingTimeMinutes: 28,
    visitType: 'General OPD',
    visitNumber: 'OPD-20250929-003',
  },
  {
    token: 4,
    tokenDisplay: '04',
    patientId: 'pat-1242',
    patientName: 'Meena R',
    uhid: 'HG001242',
    phone: '+91 87654 32109',
    age: 28,
    gender: 'F',
    department: 'Gynaecology',
    doctor: 'Dr. Priya',
    status: 'In Consultation',
    checkInTime: '09:30 AM',
    waitingTimeMinutes: 0,
    visitType: 'ANC Checkup',
    visitNumber: 'OPD-20250929-004',
  },
  {
    token: 5,
    tokenDisplay: '05',
    patientId: 'pat-1241',
    patientName: 'Arun Prakash',
    uhid: 'HG001241',
    phone: '+91 99887 76655',
    age: 62,
    gender: 'M',
    department: 'Orthopaedics',
    doctor: 'Dr. Karthik',
    status: 'Waiting',
    checkInTime: '09:35 AM',
    waitingTimeMinutes: 32,
    visitType: 'Follow-up',
    visitNumber: 'OPD-20250929-005',
  },
  {
    token: 6,
    tokenDisplay: '06',
    patientId: 'pat-1240',
    patientName: 'Fatima Begum',
    uhid: 'HG001240',
    phone: '+91 98760 11223',
    age: 50,
    gender: 'F',
    department: 'General Medicine',
    doctor: 'Dr. Mohamed',
    status: 'Waiting',
    checkInTime: '09:40 AM',
    waitingTimeMinutes: 35,
    visitType: 'General OPD',
    visitNumber: 'OPD-20250929-006',
  },
  {
    token: 7,
    tokenDisplay: '07',
    patientId: 'pat-1239',
    patientName: 'Vignesh S',
    uhid: 'HG001239',
    phone: '+91 93456 77889',
    age: 36,
    gender: 'M',
    department: 'Dermatology',
    doctor: 'Dr. Nivetha',
    status: 'Waiting',
    checkInTime: '09:45 AM',
    waitingTimeMinutes: 38,
    visitType: 'General OPD',
    visitNumber: 'OPD-20250929-007',
  },
  {
    token: 8,
    tokenDisplay: '08',
    patientId: 'pat-1238',
    patientName: 'Kavitha N',
    uhid: 'HG001238',
    phone: '+91 90012 34567',
    age: 40,
    gender: 'F',
    department: 'Endocrinology',
    doctor: 'Dr. Arjun',
    status: 'Checked In',
    checkInTime: '09:50 AM',
    waitingTimeMinutes: 10,
    visitType: 'Follow-up',
    visitNumber: 'OPD-20250929-008',
  },
];

type StoreSubscriber = () => void;

class UnifiedPatientStore {
  private patients: UnifiedPatient[] = [];
  private opdQueue: OpdQueueItem[] = [];
  private subscribers: Set<StoreSubscriber> = new Set();

  constructor() {
    this.loadState();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === OPD_QUEUE_KEY) {
          this.loadState();
          this.notifySubscribers();
        }
      });
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
      this.patients = pRaw ? JSON.parse(pRaw) : INITIAL_PATIENTS;
      const qRaw = localStorage.getItem(OPD_QUEUE_KEY);
      this.opdQueue = qRaw ? JSON.parse(qRaw) : INITIAL_OPD_QUEUE;
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

  public getOpdQueue(): OpdQueueItem[] {
    return [...this.opdQueue];
  }

  public getOpdQueueItemByToken(token: number): OpdQueueItem | undefined {
    return this.opdQueue.find((q) => q.token === token);
  }

  public getStats(): HospitalErpStats {
    // Dynamic calculation based on current state
    const waitingCount = this.opdQueue.filter((q) => q.status === 'Waiting').length;
    const inConsultationCount = this.opdQueue.filter((q) => q.status === 'In Consultation').length;
    const completedQueueCount = this.opdQueue.filter((q) => q.status === 'Completed').length;
    const baseCompleted = 412; // historical completed today baseline

    return {
      totalPatients: 1248 + (this.patients.length - INITIAL_PATIENTS.length),
      todayVisits: 86 + this.opdQueue.length - INITIAL_OPD_QUEUE.length,
      newPatientsToday: 14 + (this.patients.length - INITIAL_PATIENTS.length),
      activeFollowUps: 132,
      totalOpdToday: 540 + (this.opdQueue.length - INITIAL_OPD_QUEUE.length),
      currentlyWaiting: waitingCount,
      inConsultation: inConsultationCount,
      completedToday: baseCompleted + completedQueueCount,
      avgWaitTimeMinutes: 28,
    };
  }

  // --- ACTIONS ---

  /**
   * Register a new patient in the hospital system
   * Generates a sovereign ABDM HealthID automatically if not provided
   */
  public registerNewPatient(patientData: {
    name: string;
    phone: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    initialDepartment?: string;
    initialDoctor?: string;
  }): UnifiedPatient {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newHealthId = `HG${randomSuffix}`;
    const newId = `pat-${randomSuffix}`;

    const newPatient: UnifiedPatient = {
      id: newId,
      healthId: newHealthId,
      name: patientData.name.trim(),
      phone: patientData.phone.trim(),
      age: patientData.age,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup || 'B+',
      allergies: patientData.allergies && patientData.allergies.length > 0 ? patientData.allergies : ['No known allergies'],
      chronicConditions: patientData.chronicConditions && patientData.chronicConditions.length > 0 ? patientData.chronicConditions : ['None reported'],
      insurance: {
        provider: patientData.insuranceProvider || 'Not Available',
        policyNumber: patientData.insurancePolicyNumber || '—',
        status: patientData.insuranceProvider ? 'Active' : 'Not Available',
      },
      lastVisit: {
        date: 'Today',
        department: patientData.initialDepartment || 'General Medicine (OPD)',
        doctor: patientData.initialDoctor || 'Dr. Mohamed',
      },
      nextVisit: null,
      status: 'Checked In',
      reportsCount: 0,
      documentsCount: 0,
      registeredDate: 'Today',
      vitalsHistory: [],
      visitsHistory: [
        {
          id: `v-${newId}-1`,
          visitId: `OPD-20250929-${String(this.opdQueue.length + 1).padStart(3, '0')}`,
          date: 'Today',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          department: patientData.initialDepartment || 'General Medicine',
          doctor: patientData.initialDoctor || 'Dr. Mohamed',
          type: 'Walk-in OPD',
          status: 'Checked In',
        },
      ],
      todayVisit: {
        id: `v-today-${newId}`,
        visitId: `OPD-20250929-${String(this.opdQueue.length + 1).padStart(3, '0')}`,
        date: 'Today',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        department: patientData.initialDepartment || 'General Medicine',
        doctor: patientData.initialDoctor || 'Dr. Mohamed',
        type: 'General OPD',
        status: 'Checked In',
      },
    };

    this.patients.unshift(newPatient);

    // Automatically enqueue into OPD Queue
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
      department: patientData.initialDepartment || 'General Medicine',
      doctor: patientData.initialDoctor || 'Dr. Mohamed',
      status: 'Checked In',
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      waitingTimeMinutes: 5,
      visitType: 'General OPD',
      visitNumber: newPatient.todayVisit?.visitId || `OPD-20250929-${String(nextToken).padStart(3, '0')}`,
    };
    this.opdQueue.push(queueItem);

    this.saveState();
    return newPatient;
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
  }

  /**
   * Register an existing patient into today's OPD Queue
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
    const visitId = `OPD-20250929-${String(nextToken).padStart(3, '0')}`;
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
          // Record into visitsHistory if not already there
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

    // Sync to healthMemoryService for personal citizen portal!
    healthMemoryService.addEntry('blood_pressure', {
      systolic: vitals.bpSystolic,
      diastolic: vitals.bpDiastolic,
    }, 'mmHg', 'manual_entry', `Logged at Hospital OPD (${patient.name})`);

    healthMemoryService.addEntry('heart_rate', vitals.heartRate, 'bpm', 'manual_entry');
    healthMemoryService.addEntry('temperature', vitals.temperature, '°F', 'manual_entry');
    healthMemoryService.addEntry('spo2', vitals.spo2, '%', 'manual_entry');
    if (vitals.bloodSugar) {
      healthMemoryService.addEntry('blood_sugar', {
        glucose: vitals.bloodSugar,
        timing: 'random',
      }, 'mg/dL', 'manual_entry');
    }

    this.saveState();
  }

  /**
   * Issue a prescription during consultation, updating visit history & pharmacy store
   */
  public addPrescription(
    patientId: string,
    items: PrescriptionItem[]
  ): void {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return;

    if (patient.todayVisit) {
      patient.todayVisit.prescriptions = items;
    }

    // Also update in the latest visit history
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
      billNo: `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
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
  public completeConsultation(
    patientId: string,
    notes: string,
    diagnosis: string
  ): void {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return;

    if (patient.todayVisit) {
      patient.todayVisit.notes = notes;
      patient.todayVisit.diagnosis = diagnosis;
      patient.todayVisit.status = 'Completed';
    }

    // Find and update corresponding OPD queue item
    const qItem = this.opdQueue.find((q) => q.patientId === patientId);
    if (qItem) {
      qItem.status = 'Completed';
    }

    patient.status = 'Follow-up';
    this.saveState();
  }
}

export const unifiedPatientStore = new UnifiedPatientStore();
