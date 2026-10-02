// HealthGrid Hospital Information System (HIS / EHR) Service
// Manages Clinical OPD Queues, Master Patient Index, HealthGrid CVs,
// Live Doctor Encounters, SOAP Notes, e-Prescribing, Inpatient ADT Bed Census,
// and In-Person Follow-up Referrals.

export type UrgencyLevel = 'RED' | 'AMBER' | 'GREEN';
export type TokenStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'REFERRED_IN_PERSON';
export type WardType = 'ICU' | 'EMERGENCY_CASUALTY' | 'OXYGEN_WARD' | 'GENERAL_WARD';
export type BedStatus = 'OCCUPIED' | 'AVAILABLE' | 'CLEANING';
export type LabStatus = 'ORDERED' | 'IN_ANALYSIS' | 'COMPLETED';

export interface HealthGridCvData {
  patientId: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contactPhone: string;
  abhaId?: string;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  lastVitals: {
    bp: string;
    heartRate: number;
    spo2: number;
    tempF: string;
    recordedAt: string;
  };
}

export interface PatientIntakeInput {
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  chiefComplaint: string;
  onsetTimeline: string;
  conditionProgression: string;
  painScale: number; // 1 to 10
  associatedSymptoms: string[];
  healthGridCv?: HealthGridCvData;
}

export interface PatientToken {
  tokenId: string; // e.g. TK-101
  tokenNumber: number;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  chiefComplaint: string;
  onsetTimeline: string;
  conditionProgression: string;
  painScale: number;
  associatedSymptoms: string[];
  triageUrgency: UrgencyLevel;
  healthGridCv: HealthGridCvData;
  status: TokenStatus;
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
  assignedDoctor?: {
    doctorId: string;
    doctorName: string;
    specialization: string;
  };
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  genericSalt: string;
  dosage: string;
  frequency: string; // e.g. 1-0-1
  durationDays: number;
  instructions: string; // e.g. After food
}

export interface LabOrderItem {
  orderId: string;
  patientId: string;
  patientName: string;
  testName: string;
  specimenType: string;
  priority: 'ROUTINE' | 'STAT' | 'URGENT';
  orderedBy: string;
  orderedAt: string;
  status: LabStatus;
  resultValue?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
}

export interface InPersonReferral {
  referralId: string;
  patientId: string;
  patientName: string;
  referredByDoctor: string;
  facilityName: string;
  department: string;
  scheduledDate: string;
  scheduledSlot: string;
  clinicalReason: string;
  investigationsRequired: string[];
  passQrData: string;
}

export interface ClinicalEncounter {
  encounterId: string;
  tokenId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  subjectiveNotes: string;
  objectiveFindings: string;
  assessmentDiagnosis: string;
  clinicalPlan: string;
  prescriptions: PrescriptionItem[];
  labOrders: LabOrderItem[];
  inPersonReferral?: InPersonReferral | null;
  recordedAt: string;
}

export interface InpatientBed {
  bedId: string;
  bedCode: string; // e.g. ICU-04
  ward: WardType;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  age?: number;
  gender?: string;
  admittedAt?: string;
  primaryDiagnosis?: string;
  attendingDoctor?: string;
  oxygenSupportRequired?: boolean;
}

// Local Storage Persistence Keys
const TOKENS_STORAGE_KEY = 'healthgrid_his_tokens_v1';
const ENCOUNTERS_STORAGE_KEY = 'healthgrid_his_encounters_v1';
const BEDS_STORAGE_KEY = 'healthgrid_his_beds_v1';
const LABS_STORAGE_KEY = 'healthgrid_his_labs_v1';
const CURRENT_PATIENT_TOKEN_KEY = 'healthgrid_current_patient_token_v1';

// Seed Initial Inpatient Beds
const INITIAL_BEDS: InpatientBed[] = [
  { bedId: 'b-1', bedCode: 'ICU-01', ward: 'ICU', status: 'OCCUPIED', patientId: 'HG-PAT-1082', patientName: 'M. Arumugam', age: 64, gender: 'Male', admittedAt: '2026-10-01 14:30', primaryDiagnosis: 'Acute STEMI - Post Thrombolysis', attendingDoctor: 'Dr. R. Meenakshi, MD (Cardiology)', oxygenSupportRequired: true },
  { bedId: 'b-2', bedCode: 'ICU-02', ward: 'ICU', status: 'OCCUPIED', patientId: 'HG-PAT-1094', patientName: 'K. Selvi', age: 48, gender: 'Female', admittedAt: '2026-10-01 22:15', primaryDiagnosis: 'Severe Dengue Shock Syndrome with Thrombocytopenia', attendingDoctor: 'Dr. V. Rajesh, MD', oxygenSupportRequired: true },
  { bedId: 'b-3', bedCode: 'ICU-03', ward: 'ICU', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-4', bedCode: 'ICU-04', ward: 'ICU', status: 'AVAILABLE', oxygenSupportRequired: true },

  { bedId: 'b-5', bedCode: 'CAS-01', ward: 'EMERGENCY_CASUALTY', status: 'OCCUPIED', patientId: 'HG-PAT-1102', patientName: 'S. Vignesh', age: 29, gender: 'Male', admittedAt: '2026-10-02 08:20', primaryDiagnosis: 'Road Traffic Injury - Right Femur Fracture', attendingDoctor: 'Dr. A. Joseph, MS (Ortho)' },
  { bedId: 'b-6', bedCode: 'CAS-02', ward: 'EMERGENCY_CASUALTY', status: 'AVAILABLE' },
  { bedId: 'b-7', bedCode: 'CAS-03', ward: 'EMERGENCY_CASUALTY', status: 'CLEANING' },
  { bedId: 'b-8', bedCode: 'CAS-04', ward: 'EMERGENCY_CASUALTY', status: 'AVAILABLE' },

  { bedId: 'b-9', bedCode: 'O2-01', ward: 'OXYGEN_WARD', status: 'OCCUPIED', patientId: 'HG-PAT-1045', patientName: 'P. Lakshmi', age: 72, gender: 'Female', admittedAt: '2026-09-30 11:00', primaryDiagnosis: 'COPD Exacerbation with Hypoxia', attendingDoctor: 'Dr. S. Karthik, MD (Pulmonology)', oxygenSupportRequired: true },
  { bedId: 'b-10', bedCode: 'O2-02', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-11', bedCode: 'O2-03', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-12', bedCode: 'O2-04', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },

  { bedId: 'b-13', bedCode: 'GEN-01', ward: 'GENERAL_WARD', status: 'OCCUPIED', patientId: 'HG-PAT-1011', patientName: 'T. Murugan', age: 52, gender: 'Male', admittedAt: '2026-10-01 09:00', primaryDiagnosis: 'Acute Gastroenteritis with Moderate Dehydration', attendingDoctor: 'Dr. N. Priyadarshini, MBBS' },
  { bedId: 'b-14', bedCode: 'GEN-02', ward: 'GENERAL_WARD', status: 'OCCUPIED', patientId: 'HG-PAT-1014', patientName: 'D. Anitha', age: 34, gender: 'Female', admittedAt: '2026-10-01 16:40', primaryDiagnosis: 'Post-Appendectomy Day 1 Recovery', attendingDoctor: 'Dr. A. Joseph, MS' },
  { bedId: 'b-15', bedCode: 'GEN-03', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-16', bedCode: 'GEN-04', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-17', bedCode: 'GEN-05', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-18', bedCode: 'GEN-06', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
];

// Seed Initial Lab Orders
const INITIAL_LABS: LabOrderItem[] = [
  { orderId: 'LAB-901', patientId: 'HG-PAT-1082', patientName: 'M. Arumugam', testName: 'Cardiac Troponin-I (High Sensitivity)', specimenType: 'Venous Blood', priority: 'STAT', orderedBy: 'Dr. R. Meenakshi', orderedAt: '2026-10-02 09:15', status: 'COMPLETED', resultValue: '1.42 ng/mL (High)', referenceRange: '< 0.04 ng/mL', isAbnormal: true },
  { orderId: 'LAB-902', patientId: 'HG-PAT-1094', patientName: 'K. Selvi', testName: 'Complete Blood Count (CBC) + Platelet Count', specimenType: 'EDTA Whole Blood', priority: 'STAT', orderedBy: 'Dr. V. Rajesh', orderedAt: '2026-10-02 10:00', status: 'COMPLETED', resultValue: 'Platelets: 42,000 /uL (Critically Low)', referenceRange: '150,000 - 450,000 /uL', isAbnormal: true },
  { orderId: 'LAB-903', patientId: 'HG-PAT-1045', patientName: 'P. Lakshmi', testName: 'Arterial Blood Gas (ABG) Analysis', specimenType: 'Arterial Blood', priority: 'URGENT', orderedBy: 'Dr. S. Karthik', orderedAt: '2026-10-02 10:30', status: 'IN_ANALYSIS' },
  { orderId: 'LAB-904', patientId: 'HG-PAT-1011', patientName: 'T. Murugan', testName: 'Serum Electrolytes (Na+, K+, Cl-)', specimenType: 'Serum', priority: 'ROUTINE', orderedBy: 'Dr. N. Priyadarshini', orderedAt: '2026-10-02 10:45', status: 'ORDERED' },
];

// Seed Initial Waiting Tokens
const INITIAL_TOKENS: PatientToken[] = [
  {
    tokenId: 'TK-101',
    tokenNumber: 101,
    patientId: 'HG-PAT-3281',
    patientName: 'R. Soundararajan',
    age: 58,
    gender: 'Male',
    bloodGroup: 'B Positive',
    phone: '+91 98401 23456',
    chiefComplaint: 'Substernal chest tightness radiating to left shoulder and cold sweating for 45 minutes.',
    onsetTimeline: 'Started this morning around 9:45 AM while climbing stairs.',
    conditionProgression: 'Tightness worsening; feels like a heavy weight on the chest.',
    painScale: 9,
    associatedSymptoms: ['Cold sweating', 'Nausea', 'Left arm numbness'],
    triageUrgency: 'RED',
    status: 'WAITING',
    createdAt: '2026-10-02 10:32',
    healthGridCv: {
      patientId: 'HG-PAT-3281',
      fullName: 'R. Soundararajan',
      age: 58,
      gender: 'Male',
      bloodGroup: 'B Positive',
      contactPhone: '+91 98401 23456',
      abhaId: '32-8192-4019-9218',
      chronicConditions: ['Type 2 Diabetes Mellitus (8 yrs)', 'Hypertension (5 yrs)', 'Dyslipidemia'],
      allergies: ['Penicillin (Hives/Anaphylactoid)', 'Sulfa Drugs'],
      currentMedications: ['Metformin 500mg BD', 'Telmisartan 40mg OD', 'Atorvastatin 10mg HS'],
      lastVitals: { bp: '158/96 mmHg', heartRate: 104, spo2: 95, tempF: '98.6°F', recordedAt: '10:30 AM' }
    }
  },
  {
    tokenId: 'TK-102',
    tokenNumber: 102,
    patientId: 'HG-PAT-4519',
    patientName: 'A. Bhuvaneshwari',
    age: 32,
    gender: 'Female',
    bloodGroup: 'O Positive',
    phone: '+91 94440 98765',
    chiefComplaint: 'High grade fever with severe retro-orbital eye pain and joint aches for 4 days.',
    onsetTimeline: 'Began 4 days ago with sudden chills and body ache.',
    conditionProgression: 'Persistent fever spikes up to 103°F; noticing petechial red spots on forearms today.',
    painScale: 7,
    associatedSymptoms: ['Retro-orbital headache', 'Severe backache (break-bone fever)', 'Loss of appetite'],
    triageUrgency: 'AMBER',
    status: 'WAITING',
    createdAt: '2026-10-02 10:45',
    healthGridCv: {
      patientId: 'HG-PAT-4519',
      fullName: 'A. Bhuvaneshwari',
      age: 32,
      gender: 'Female',
      bloodGroup: 'O Positive',
      contactPhone: '+91 94440 98765',
      abhaId: '14-5192-3847-1092',
      chronicConditions: ['Mild Asthma (Exercise-induced)'],
      allergies: ['No Known Drug Allergies (NKDA)'],
      currentMedications: ['Salbutamol Inhaler PRN'],
      lastVitals: { bp: '110/74 mmHg', heartRate: 88, spo2: 98, tempF: '102.8°F', recordedAt: '10:40 AM' }
    }
  },
  {
    tokenId: 'TK-103',
    tokenNumber: 103,
    patientId: 'HG-PAT-2983',
    patientName: 'K. Manikandan',
    age: 41,
    gender: 'Male',
    bloodGroup: 'A Positive',
    phone: '+91 97890 11223',
    chiefComplaint: 'Watery diarrhea 5 times since morning with mild abdominal cramps.',
    onsetTimeline: 'Started early morning after eating street food yesterday evening.',
    conditionProgression: 'Frequent loose motions; no blood in stool; feels thirsty and weak.',
    painScale: 5,
    associatedSymptoms: ['Mild nausea', 'Dry mouth', 'Abdominal cramping'],
    triageUrgency: 'GREEN',
    status: 'WAITING',
    createdAt: '2026-10-02 11:05',
    healthGridCv: {
      patientId: 'HG-PAT-2983',
      fullName: 'K. Manikandan',
      age: 41,
      gender: 'Male',
      bloodGroup: 'A Positive',
      contactPhone: '+91 97890 11223',
      abhaId: '29-8301-9923-4512',
      chronicConditions: ['None reported'],
      allergies: ['NSAIDs / Ibuprofen (Gastritis flare)'],
      currentMedications: ['None regular'],
      lastVitals: { bp: '118/76 mmHg', heartRate: 82, spo2: 99, tempF: '99.1°F', recordedAt: '11:00 AM' }
    }
  }
];

class HisService {
  private tokens: PatientToken[] = [];
  private encounters: ClinicalEncounter[] = [];
  private beds: InpatientBed[] = [];
  private labs: LabOrderItem[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    try {
      const storedTokens = localStorage.getItem(TOKENS_STORAGE_KEY);
      this.tokens = storedTokens ? JSON.parse(storedTokens) : INITIAL_TOKENS;

      const storedEncounters = localStorage.getItem(ENCOUNTERS_STORAGE_KEY);
      this.encounters = storedEncounters ? JSON.parse(storedEncounters) : [];

      const storedBeds = localStorage.getItem(BEDS_STORAGE_KEY);
      this.beds = storedBeds ? JSON.parse(storedBeds) : INITIAL_BEDS;

      const storedLabs = localStorage.getItem(LABS_STORAGE_KEY);
      this.labs = storedLabs ? JSON.parse(storedLabs) : INITIAL_LABS;
    } catch {
      this.tokens = INITIAL_TOKENS;
      this.encounters = [];
      this.beds = INITIAL_BEDS;
      this.labs = INITIAL_LABS;
    }
  }

  private persistAndNotify() {
    try {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(this.tokens));
      localStorage.setItem(ENCOUNTERS_STORAGE_KEY, JSON.stringify(this.encounters));
      localStorage.setItem(BEDS_STORAGE_KEY, JSON.stringify(this.beds));
      localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(this.labs));
    } catch {
      // ignore quota limits
    }
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  // --- OPD & Token Queue Methods ---

  public getTokens(): PatientToken[] {
    return [...this.tokens];
  }

  public getWaitingTokens(): PatientToken[] {
    return this.tokens.filter((t) => t.status === 'WAITING' || t.status === 'IN_CONSULTATION');
  }

  public getTokenById(tokenId: string): PatientToken | undefined {
    return this.tokens.find((t) => t.tokenId === tokenId);
  }

  public getCurrentPatientToken(): PatientToken | null {
    try {
      const stored = localStorage.getItem(CURRENT_PATIENT_TOKEN_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Synchronize with live status
      const live = this.getTokenById(parsed.tokenId);
      return live || parsed;
    } catch {
      return null;
    }
  }

  public requestConsultationToken(intake: PatientIntakeInput): {
    token: PatientToken;
    isEmergencyRedFlag: boolean;
    redFlagReason?: string;
  } {
    // 1. Intelligent Screening & Triage Computation
    const complaintLower = (intake.chiefComplaint + ' ' + intake.conditionProgression + ' ' + intake.associatedSymptoms.join(' ')).toLowerCase();

    let urgency: UrgencyLevel = 'GREEN';
    let isEmergencyRedFlag = false;
    let redFlagReason: string | undefined = undefined;

    // Check for Critical Red Flags (Cardiac, Stroke FAST, Severe Dyspnea, Shock)
    if (
      complaintLower.includes('chest pain') ||
      complaintLower.includes('chest tightness') ||
      complaintLower.includes('radiating to left arm') ||
      complaintLower.includes('unconscious') ||
      complaintLower.includes('difficulty breathing') ||
      complaintLower.includes('severe breathlessness') ||
      complaintLower.includes('face drooping') ||
      complaintLower.includes('slurred speech') ||
      complaintLower.includes('heavy bleeding') ||
      intake.painScale >= 9
    ) {
      urgency = 'RED';
      isEmergencyRedFlag = true;
      redFlagReason = 'Critical Red-Flag symptoms detected (High risk of acute cardiac/trauma/respiratory event).';
    } else if (
      complaintLower.includes('high fever') ||
      complaintLower.includes('petechiae') ||
      complaintLower.includes('bleeding gums') ||
      complaintLower.includes('persistent vomiting') ||
      complaintLower.includes('dengue') ||
      complaintLower.includes('wheezing') ||
      intake.painScale >= 7
    ) {
      urgency = 'AMBER';
    }

    // 2. Compute Next Token Number
    const highestNumber = this.tokens.reduce((max, t) => Math.max(max, t.tokenNumber), 100);
    const nextNumber = highestNumber + 1;
    const nextTokenId = `TK-${nextNumber}`;

    // 3. Assemble or Synthesize HealthGrid CV
    const healthGridCv: HealthGridCvData = intake.healthGridCv || {
      patientId: `HG-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: intake.patientName,
      age: intake.age,
      gender: intake.gender,
      bloodGroup: intake.bloodGroup,
      contactPhone: intake.phone,
      abhaId: `${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      chronicConditions: [],
      allergies: ['No Known Drug Allergies (NKDA)'],
      currentMedications: [],
      lastVitals: {
        bp: urgency === 'RED' ? '154/98 mmHg' : '120/80 mmHg',
        heartRate: urgency === 'RED' ? 106 : 78,
        spo2: urgency === 'RED' ? 94 : 98,
        tempF: complaintLower.includes('fever') ? '101.4°F' : '98.6°F',
        recordedAt: 'Today'
      }
    };

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newToken: PatientToken = {
      tokenId: nextTokenId,
      tokenNumber: nextNumber,
      patientId: healthGridCv.patientId,
      patientName: intake.patientName,
      age: intake.age,
      gender: intake.gender,
      bloodGroup: intake.bloodGroup,
      phone: intake.phone,
      chiefComplaint: intake.chiefComplaint,
      onsetTimeline: intake.onsetTimeline,
      conditionProgression: intake.conditionProgression,
      painScale: intake.painScale,
      associatedSymptoms: intake.associatedSymptoms,
      triageUrgency: urgency,
      healthGridCv,
      status: 'WAITING',
      createdAt: formattedDate
    };

    // Emergency red tokens are fast-tracked to the top of the waiting queue
    if (urgency === 'RED') {
      this.tokens = [newToken, ...this.tokens];
    } else {
      this.tokens = [...this.tokens, newToken];
    }

    try {
      localStorage.setItem(CURRENT_PATIENT_TOKEN_KEY, JSON.stringify(newToken));
    } catch {
      // ignore
    }

    this.persistAndNotify();

    return {
      token: newToken,
      isEmergencyRedFlag,
      redFlagReason
    };
  }

  public callPatientToken(tokenId: string, doctor = { doctorId: 'DOC-TN-74892', doctorName: 'Dr. R. Meenakshi, MD', specialization: 'Consultant Physician & Diabetologist' }) {
    const token = this.tokens.find((t) => t.tokenId === tokenId);
    if (!token) return;

    token.status = 'IN_CONSULTATION';
    token.calledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    token.assignedDoctor = doctor;

    // Update current patient local storage if matches
    const current = this.getCurrentPatientToken();
    if (current && current.tokenId === tokenId) {
      current.status = 'IN_CONSULTATION';
      current.calledAt = token.calledAt;
      current.assignedDoctor = doctor;
      try {
        localStorage.setItem(CURRENT_PATIENT_TOKEN_KEY, JSON.stringify(current));
      } catch {
        // ignore
      }
    }

    this.persistAndNotify();
  }

  // --- Clinical Encounter & e-Prescribing Methods ---

  public completeEncounter(encounter: Omit<ClinicalEncounter, 'encounterId' | 'recordedAt'>): ClinicalEncounter {
    const encounterId = `ENC-${Date.now().toString().slice(-6)}`;
    const fullEncounter: ClinicalEncounter = {
      ...encounter,
      encounterId,
      recordedAt: new Date().toISOString()
    };

    this.encounters = [fullEncounter, ...this.encounters];

    // Mark token as completed or referred
    const token = this.tokens.find((t) => t.tokenId === encounter.tokenId);
    if (token) {
      token.status = encounter.inPersonReferral ? 'REFERRED_IN_PERSON' : 'COMPLETED';
      token.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Add any generated lab orders to system labs
    if (encounter.labOrders && encounter.labOrders.length > 0) {
      this.labs = [...encounter.labOrders, ...this.labs];
    }

    // Update current token if matches
    const current = this.getCurrentPatientToken();
    if (current && current.tokenId === encounter.tokenId) {
      current.status = token?.status || 'COMPLETED';
      try {
        localStorage.setItem(CURRENT_PATIENT_TOKEN_KEY, JSON.stringify(current));
      } catch {
        // ignore
      }
    }

    this.persistAndNotify();
    return fullEncounter;
  }

  public getEncountersByPatient(patientId: string): ClinicalEncounter[] {
    return this.encounters.filter((e) => e.patientId === patientId);
  }

  public getAllEncounters(): ClinicalEncounter[] {
    return [...this.encounters];
  }

  // --- Inpatient Bed & ADT Management Methods ---

  public getBeds(): InpatientBed[] {
    return [...this.beds];
  }

  public getBedStats() {
    const total = this.beds.length;
    const occupied = this.beds.filter((b) => b.status === 'OCCUPIED').length;
    const available = this.beds.filter((b) => b.status === 'AVAILABLE').length;
    const icuTotal = this.beds.filter((b) => b.ward === 'ICU').length;
    const icuOccupied = this.beds.filter((b) => b.ward === 'ICU' && b.status === 'OCCUPIED').length;

    return {
      total,
      occupied,
      available,
      occupancyPercentage: Math.round((occupied / total) * 100),
      icuTotal,
      icuOccupied,
      icuAvailable: icuTotal - icuOccupied
    };
  }

  public admitPatientToBed(
    bedId: string,
    patientData: {
      patientId: string;
      patientName: string;
      age: number;
      gender: string;
      primaryDiagnosis: string;
      attendingDoctor: string;
      oxygenSupportRequired?: boolean;
    }
  ) {
    const bed = this.beds.find((b) => b.bedId === bedId);
    if (!bed) return;

    bed.status = 'OCCUPIED';
    bed.patientId = patientData.patientId;
    bed.patientName = patientData.patientName;
    bed.age = patientData.age;
    bed.gender = patientData.gender;
    bed.primaryDiagnosis = patientData.primaryDiagnosis;
    bed.attendingDoctor = patientData.attendingDoctor;
    bed.admittedAt = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    if (patientData.oxygenSupportRequired !== undefined) {
      bed.oxygenSupportRequired = patientData.oxygenSupportRequired;
    }

    this.persistAndNotify();
  }

  public dischargePatientFromBed(bedId: string) {
    const bed = this.beds.find((b) => b.bedId === bedId);
    if (!bed) return;

    bed.status = 'CLEANING';
    delete bed.patientId;
    delete bed.patientName;
    delete bed.age;
    delete bed.gender;
    delete bed.admittedAt;
    delete bed.primaryDiagnosis;

    // After 2 seconds, simulate sanitation complete -> AVAILABLE
    setTimeout(() => {
      const b = this.beds.find((item) => item.bedId === bedId);
      if (b && b.status === 'CLEANING') {
        b.status = 'AVAILABLE';
        this.persistAndNotify();
      }
    }, 3000);

    this.persistAndNotify();
  }

  // --- Lab Orders & Diagnostics ---

  public getLabs(): LabOrderItem[] {
    return [...this.labs];
  }

  public updateLabStatus(orderId: string, status: LabStatus, resultValue?: string, isAbnormal = false) {
    const lab = this.labs.find((l) => l.orderId === orderId);
    if (!lab) return;

    lab.status = status;
    if (resultValue) {
      lab.resultValue = resultValue;
    }
    lab.isAbnormal = isAbnormal;

    this.persistAndNotify();
  }
}

export const hisService = new HisService();
