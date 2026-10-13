/**
 * HealthGrid Multi-Doctor Polypharmacy & Cross-Prescription Conflict Domain Types
 * 
 * Formal clinical data contracts for cross-encounter medication safety:
 * - Normalized medication records with active chemical salts
 * - Prescribing doctor provenance (Doctor name, hospital, specialty, date, license)
 * - Patient-reported taking status (non-mutating clinical reconciliation signal)
 * - Deterministic conflict alerts (Duplication, DDI, Organ Burden, Allergies)
 * - Clinician override audit trail with digital signature
 */

export type MedicationConflictSeverity =
  | 'CONTRAINDICATED' // Red: Life-threatening / lethal combination
  | 'MAJOR'           // Orange: High clinical risk, urgent modification or close monitoring required
  | 'MODERATE'        // Amber: Clinical precaution, dose adjustment or interval spacing
  | 'DUPLICATE_THERAPY'; // Blue: Identical active salt or same therapeutic class from different prescribers

export type ConflictCategory =
  | 'DUPLICATE_MOLECULE'
  | 'DRUG_DRUG_INTERACTION'
  | 'ALLERGY_CONFLICT'
  | 'ORGAN_BURDEN_RENAL'
  | 'ORGAN_BURDEN_HEPATIC'
  | 'ORGAN_BURDEN_CARDIAC'
  | 'CONTRAINDICATION';

export type PatientTakingStatus =
  | 'STILL_TAKING'
  | 'STOPPED'
  | 'TAKING_DIFFERENTLY'
  | 'UNSURE'
  | 'DISCUSS_WITH_DOCTOR';

export type MedicationLifecycleStatus =
  | 'ACTIVE'
  | 'DISCONTINUED'
  | 'PRN_AS_NEEDED'
  | 'COMPLETED'
  | 'PAUSED';

export type MedicationSourceType =
  | 'PRESCRIPTION_SCAN'
  | 'CLINICIAN_ORDER'
  | 'PATIENT_REPORTED'
  | 'DISCHARGE_SUMMARY';

export interface PrescribingDoctorProvenance {
  doctorName: string;
  facilityName: string;
  specialty?: string;
  licenseNumber?: string;
  prescriptionDate: string; // ISO YYYY-MM-DD
  prescriptionSlipId?: string;
  sourceType: MedicationSourceType;
}

export interface NormalizedActiveSalt {
  saltName: string; // e.g. "Rosuvastatin", "Ramipril", "Aceclofenac", "Paracetamol"
  strength: string; // e.g. "10 mg", "500 mg"
  strengthNumber?: number; // numeric value for dosage comparisons
  unit?: string; // "mg", "mcg", "g", "ml"
  atcClass?: string; // e.g. "C10AA07" (Statins), "C09AA05" (ACE inhibitors)
}

export interface ReconciledMedicationItem {
  id: string;
  brandName: string; // e.g. "Rosuvas 10", "Cardace 5", "Hifenac-P"
  normalizedSalts: NormalizedActiveSalt[];
  dosageForm: string; // "Tablet", "Capsule", "Syrup", "Injection"
  dosage: string; // "10 mg", "1-0-1"
  frequency: string; // "Once daily (OD)", "Twice daily (BD)", "Thrice daily (TDS)"
  timing: string; // "After food", "Before food", "Night at bedtime"
  duration?: string;
  purposeEn?: string;
  purposeTa?: string;

  // Provenance & Origin
  provenance: PrescribingDoctorProvenance;

  // Lifecycle & Clinical Status
  status: MedicationLifecycleStatus;

  // Patient Confirmation Layer (Does NOT unilaterally cancel prescriptions)
  patientReportedStatus?: PatientTakingStatus;
  patientReportedNotes?: string;
  lastPatientReportedAt?: string;

  // Jan Aushadhi PMBJP Equivalency
  isGenericAvailable?: boolean;
  genericEquivalentName?: string;
  brandedPriceInr?: number;
  janAushadhiPriceInr?: number;
  monthlySavingsInr?: number;
}

export interface MedicationConflictAlert {
  id: string;
  severity: MedicationConflictSeverity;
  category: ConflictCategory;
  titleEn: string;
  titleTa?: string;
  descriptionEn: string;
  descriptionTa?: string;

  // Source Drugs Involved
  medicationA: {
    id: string;
    brandName: string;
    saltName: string;
    prescriber: string;
    facility: string;
    date: string;
  };
  medicationB?: {
    id: string;
    brandName: string;
    saltName: string;
    prescriber: string;
    facility: string;
    date: string;
  };

  // Clinical Details
  mechanismEn: string;
  clinicalImpactEn: string;
  recommendedActionEn: string;
  evidenceSource: string; // e.g. "ICMR Guidelines 2025 • Indian Pharmacopoeia • CDSCO Drug Safety Alert"
  urgencyLevel: 'IMMEDIATE' | 'NEXT_VISIT' | 'MONITOR';

  // Override State (Audited)
  isOverridden?: boolean;
  overrideRecord?: ClinicianOverrideRecord;
}

export interface ClinicianOverrideRecord {
  clinicianId: string;
  clinicianName: string;
  clinicianLicenseNo: string;
  timestamp: string;
  conflictId: string;
  rationaleCategory: 'BENEFIT_OUTWEIGHS_RISK' | 'PATIENT_TOLERATING_WELL' | 'MONITORING_PROTOCOL_ACTIVE' | 'SHORT_TERM_REGIMEN' | 'OTHER';
  clinicalJustification: string;
  monitoringPlan: string;
  signatureHash: string; // Cryptographic SHA-256 seal
}

export interface PatientSafetyContext {
  knownAllergies: string[];
  patientAge?: number;
  isPregnant?: boolean;
  isLactating?: boolean;
  estimatedGfr?: number; // mL/min/1.73m²
  hasChronicKidneyDisease?: boolean;
  hasLiverCirrhosis?: boolean;
  hasPepticUlcerDisease?: boolean;
  hasHeartFailure?: boolean;
}

export interface PolypharmacySafetyEvaluation {
  overallRiskScore: number; // 0 (Clean) to 100 (Critical danger)
  safetyTier: 'SAFE' | 'MONITOR' | 'ACTION_REQUIRED_HIGH_RISK';
  totalActiveMolecules: number;
  uniquePrescribingDoctorsCount: number;
  uniqueFacilitiesCount: number;
  duplicateSaltsCount: number;
  conflicts: MedicationConflictAlert[];
  reconciledMedications: ReconciledMedicationItem[];
  evaluationTimestamp: string;
  knowledgeGraphVersion: string;
  plainLanguageSummaryEn: string;
  plainLanguageSummaryTa: string;
}
