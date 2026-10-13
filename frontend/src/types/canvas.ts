/**
 * HealthGrid Dynamic Clinical Canvas & Artifact Domain Types
 * 
 * Defines data structures for the collapsible side-by-side interactive workspace:
 * 1. MEDICATION_PLAN: 7-day visual dosage timeline, adherence tracker, PMBJP generic savings
 * 2. ANATOMICAL_BODY_MAP: Interactive vector SVG pain & symptom localization (Anterior/Posterior)
 * 3. DEEP_RESEARCH: Evidence-graded clinical reports (ICMR, PubMed, Indian Pharmacopoeia, WHO)
 * 4. SOAP_NOTE: Ambient Scribe clinical documentation with digital signature lock
 * 5. LAB_TRENDS: Longitudinal biomarker tracking with clinical reference range bands
 * 6. DIET_PLAN: Culturally tailored medical nutrition therapy
 */

export type ClinicalArtifactType =
  | 'MEDICATION_PLAN'
  | 'ANATOMICAL_BODY_MAP'
  | 'DEEP_RESEARCH'
  | 'SOAP_NOTE'
  | 'LAB_TRENDS'
  | 'DIET_PLAN';

export interface MedicationScheduleItem {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string; // e.g. "Twice Daily (BID)"
  timing: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  foodRelation: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH';
  durationDays: number;
  instructions: string;
  genericSubstitute?: {
    genericName: string;
    brandPrice: number;
    janAushadhiPrice: number;
    savingsPercent: number;
    kendraAvailable: boolean;
  };
  adherenceStatus?: Record<string, boolean>; // date_key -> boolean
}

export interface MedicationPlanData {
  title: string;
  patientName: string;
  doctorName?: string;
  startDate: string;
  items: MedicationScheduleItem[];
  adherencePercentage: number;
  totalMonthlySavingsInr?: number;
}

export interface AnatomicalPainRegion {
  id: string;
  name: string;
  tamilName?: string;
  view: 'anterior' | 'posterior';
  intensity: number; // 0 to 10 Visual Analogue Scale
  character: 'sharp' | 'dull' | 'burning' | 'throbbing' | 'stabbing' | 'colicky' | 'aching';
  radiationTarget?: string; // e.g. "Lumbar spine to right lateral calf"
  duration: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
}

export interface AnatomicalMapData {
  selectedRegions: AnatomicalPainRegion[];
  primaryComplaint: string;
  radiationSummary?: string;
  notes: string;
}

export type GradeEvidenceLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

export interface CitationItem {
  id: string;
  title: string;
  source: 'PubMed' | 'ICMR STG' | 'Indian Pharmacopoeia' | 'WHO' | 'NICE' | 'Lancet' | 'NEJM';
  pmidOrDoi?: string;
  url?: string;
  year: number;
  sampleSize?: number;
  evidenceLevel: GradeEvidenceLevel;
  keyFinding: string;
}

export interface GuidelineComparisonItem {
  domain: string;
  indianGuideline: {
    body: string; // e.g. "ICMR 2024 / Govt of Tamil Nadu"
    recommendation: string;
    level: string;
  };
  internationalGuideline: {
    body: string; // e.g. "WHO / KDIGO / NICE"
    recommendation: string;
    level: string;
  };
  clinicalConsensus: string;
}

export interface DeepResearchProgressStep {
  step: number;
  label: string;
  status: 'pending' | 'running' | 'completed';
  detail?: string;
}

export interface DeepResearchReportData {
  query: string;
  clinicalQuestion: string;
  executiveSummary: string;
  evidenceQualityLevel: GradeEvidenceLevel;
  confidenceScore: number; // 0 to 100
  citations: CitationItem[];
  guidelineComparisons: GuidelineComparisonItem[];
  limitationsAndGaps: string[];
  conflictingFindings?: string[];
  evidenceTable: Array<{
    intervention: string;
    control: string;
    endpoint: string;
    effectEstimate: string; // e.g. "HR 0.72 (95% CI 0.61-0.85)"
    certainty: GradeEvidenceLevel;
  }>;
  actionableRecommendation: string;
  disclosureStatement: string;
}

export interface SoapNoteData {
  id: string;
  patientId: string;
  patientName: string;
  consultationDate: string;
  clinicianName: string;
  clinicianRegNo: string;
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    patientVerbatim?: string;
  };
  objective: {
    vitals: {
      bloodPressure?: string;
      heartRate?: number;
      spo2?: number;
      temperature?: string;
      respiratoryRate?: number;
    };
    examinationFindings: string;
    labsSummary?: string;
  };
  assessment: {
    primaryDiagnosis: string;
    icd10Code: string;
    differentialDiagnoses: Array<{ diagnosis: string; icd10: string }>;
    clinicalReasoning: string;
  };
  plan: {
    prescriptions: Array<{
      drug: string;
      dose: string;
      route: string;
      frequency: string;
      duration: string;
    }>;
    diagnosticOrders: string[];
    patientCounseling: string[];
    followUpDays: number;
  };
  isSigned: boolean;
  digitalSignatureHash?: string;
  signedAt?: string;
}

export interface LabBiomarkerTrend {
  biomarkerKey: string;
  name: string;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  dataPoints: Array<{
    date: string;
    value: number;
    status: 'NORMAL' | 'ELEVATED' | 'CRITICAL_HIGH' | 'LOW';
    note?: string;
  }>;
}

export interface LabTrendsData {
  patientName: string;
  patientHealthId: string;
  trends: LabBiomarkerTrend[];
  clinicalInterpretation: string;
}

export interface DietMealItem {
  mealTime: 'BREAKFAST' | 'MID_MORNING' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER';
  timeLabel: string;
  foodItems: Array<{
    name: string;
    tamilName?: string;
    portion: string;
    glycemicIndex: 'LOW' | 'MEDIUM' | 'HIGH';
    calories: number;
    proteinGrams: number;
    fiberGrams: number;
  }>;
  clinicalNote?: string;
}

export interface DietPlanData {
  title: string;
  condition: string; // e.g. "Type 2 Diabetes Mellitus + Mild Hypertension"
  calorieTarget: number;
  proteinTargetGrams: number;
  meals: DietMealItem[];
  foodsToAvoid: string[];
  hydrationTargetLiters: number;
  culturalNotes: string; // South Indian traditional diet integration
}

export interface ClinicalArtifact {
  id: string;
  type: ClinicalArtifactType;
  title: string;
  subtitle?: string;
  badge: string;
  createdAt: string;
  data:
    | MedicationPlanData
    | AnatomicalMapData
    | DeepResearchReportData
    | SoapNoteData
    | LabTrendsData
    | DietPlanData;
  isEditable?: boolean;
  isSigned?: boolean;
  requiresConfirmation?: boolean;
}
