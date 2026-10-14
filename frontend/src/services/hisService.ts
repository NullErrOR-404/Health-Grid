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

// Seed Initial Inpatient Beds - Clean Sanitize Baseline
const INITIAL_BEDS: InpatientBed[] = [
  { bedId: 'b-1', bedCode: 'ICU-01', ward: 'ICU', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-2', bedCode: 'ICU-02', ward: 'ICU', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-3', bedCode: 'ICU-03', ward: 'ICU', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-4', bedCode: 'ICU-04', ward: 'ICU', status: 'AVAILABLE', oxygenSupportRequired: true },

  { bedId: 'b-5', bedCode: 'CAS-01', ward: 'EMERGENCY_CASUALTY', status: 'AVAILABLE' },
  { bedId: 'b-6', bedCode: 'CAS-02', ward: 'EMERGENCY_CASUALTY', status: 'AVAILABLE' },
  { bedId: 'b-7', bedCode: 'CAS-03', ward: 'EMERGENCY_CASUALTY', status: 'AVAILABLE' },
  { bedId: 'b-8', bedCode: 'CAS-04', ward: 'EMERGENCY_CASUALTY', status: 'AVAILABLE' },

  { bedId: 'b-9', bedCode: 'O2-01', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-10', bedCode: 'O2-02', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-11', bedCode: 'O2-03', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },
  { bedId: 'b-12', bedCode: 'O2-04', ward: 'OXYGEN_WARD', status: 'AVAILABLE', oxygenSupportRequired: true },

  { bedId: 'b-13', bedCode: 'GEN-01', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-14', bedCode: 'GEN-02', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-15', bedCode: 'GEN-03', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-16', bedCode: 'GEN-04', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-17', bedCode: 'GEN-05', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
  { bedId: 'b-18', bedCode: 'GEN-06', ward: 'GENERAL_WARD', status: 'AVAILABLE' },
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
      const parsedTokens: PatientToken[] = storedTokens ? JSON.parse(storedTokens) : [];
      // Cleanse legacy mock tokens
      this.tokens = parsedTokens.filter(
        (t) =>
          !t.tokenId?.startsWith('TK-10') ||
          !['R. Soundararajan', 'A. Bhuvaneshwari', 'K. Manikandan'].includes(t.patientName)
      );

      const storedEncounters = localStorage.getItem(ENCOUNTERS_STORAGE_KEY);
      this.encounters = storedEncounters ? JSON.parse(storedEncounters) : [];

      const storedBeds = localStorage.getItem(BEDS_STORAGE_KEY);
      const parsedBeds: InpatientBed[] = storedBeds ? JSON.parse(storedBeds) : INITIAL_BEDS;
      // Sanitize legacy mock occupant names
      this.beds = parsedBeds.map((b) => {
        if (
          b.patientName &&
          ['M. Arumugam', 'K. Selvi', 'S. Vignesh', 'P. Lakshmi', 'T. Murugan', 'D. Anitha'].includes(
            b.patientName
          )
        ) {
          return {
            bedId: b.bedId,
            bedCode: b.bedCode,
            ward: b.ward,
            status: 'AVAILABLE' as const,
            oxygenSupportRequired: b.oxygenSupportRequired,
          };
        }
        return b;
      });

      const storedLabs = localStorage.getItem(LABS_STORAGE_KEY);
      const parsedLabs: LabOrderItem[] = storedLabs ? JSON.parse(storedLabs) : [];
      this.labs = parsedLabs.filter((l) => !l.orderId?.startsWith('LAB-90'));
      this.persistAndNotify();
    } catch {
      this.tokens = [];
      this.encounters = [];
      this.beds = INITIAL_BEDS;
      this.labs = [];
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
