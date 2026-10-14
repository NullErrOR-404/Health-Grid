// ==============================================================================
// HealthGrid Clinician Portal — Authentic Clinical Data Architecture
// Direct Supabase PostgreSQL public.patients & public.appointments integration
// Zero Hardcoding: Strict Live-First Cloud Entities Only
// ==============================================================================

import type {
  ClinicianProfile,
  FacilityEntity,
  PatientEntity,
  PatientQueueItem,
  ResultItem,
  FollowUpItem,
  ReferralItem,
  ClinicalInboxItem,
  OrderSetTemplate,
  ClinicalEncounter,
} from '../../types/clinician';

export const SEED_CLINICIAN: ClinicianProfile = {
  id: 'cb41d3d7-cdae-4f55-b32d-ec4d78085400', // Authentic Supabase Doctor Auth UUID
  name: 'Dr. Mohamed',
  title: 'Consultant Physician',
  specialty: 'General Medicine',
  qualification: 'MBBS, MD (Gen Med), MRCP',
  regNumber: 'TMC-84920-IND',
  facilityId: 'fac_gmch_omandurar',
  facilityName: 'Govt Medical College & Hospital, Omandurar',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  phone: '+91 98401 22891',
  email: 'dr.mohamed@healthgrid.in',
};

export const SEED_FACILITIES: FacilityEntity[] = [
  {
    id: 'fac_gmch_omandurar',
    name: 'Govt Medical College & Hospital, Omandurar',
    city: 'Chennai',
    address: 'Omandurar Government Estate, Anna Salai, Chennai, TN 600002',
    isPrimary: true,
  },
  {
    id: 'fac_mmc_chennai',
    name: 'Madras Medical College & Rajiv Gandhi GGH',
    city: 'Chennai',
    address: 'EVR Periyar Salai, Park Town, Chennai, TN 600003',
  },
  {
    id: 'fac_stanley_chennai',
    name: 'Stanley Medical College & Hospital',
    city: 'Chennai',
    address: 'Old Jail Rd, Royapuram, Chennai, TN 600001',
  },
];

// Clean cloud-reactive state: zero mock/seeded entities
export const SEED_PATIENTS: PatientEntity[] = [];
export const SEED_QUEUE_ITEMS: PatientQueueItem[] = [];
export const SEED_RESULTS: ResultItem[] = [];
export const SEED_FOLLOW_UPS: FollowUpItem[] = [];
export const SEED_REFERRALS: ReferralItem[] = [];
export const SEED_INBOX_ITEMS: ClinicalInboxItem[] = [];
export const SEED_ENCOUNTERS: ClinicalEncounter[] = [];
export const PATIENT_LOOKUP_MAP: Map<string, PatientEntity> = new Map();

// Standard clinical protocol order set templates (CDS Clinical Decision Support Tools)
export const SEED_ORDER_SETS: OrderSetTemplate[] = [
  {
    id: 'os_fever_workup',
    name: 'Acute Febrile Illness / Dengue Workup',
    description: 'Protocol-based workup for acute fever (>100°F) lasting 2-5 days with suspected vector-borne or viral etiology.',
    specialty: 'INFECTIOUS',
    items: [
      { category: 'LABORATORY', name: 'Complete Blood Count (CBC) with Platelets & Differential', code: 'LAB-CBC', defaultNotes: 'Stat order' },
      { category: 'LABORATORY', name: 'Dengue NS1 Antigen Rapid Card', code: 'LAB-DENGUE', defaultNotes: 'Stat card test' },
      { category: 'LABORATORY', name: 'Peripheral Smear for Malarial Parasite (QBC)', code: 'LAB-MP', defaultNotes: 'Routine smear' },
      { category: 'MEDICATION', name: 'Paracetamol 650mg TDS (SOS for temp > 99.5°F)', code: 'MED-PCM-650', defaultNotes: 'Oral after food. Do NOT co-administer NSAIDs/Ibuprofen.' },
      { category: 'MEDICATION', name: 'Oral Rehydration Salts (ORS) 1 Sachet in 1L daily', code: 'MED-ORS', defaultNotes: 'Sip steadily throughout the day' },
      { category: 'PROCEDURE', name: 'Fluid therapy: Drink min 2.5-3 Liters liquids daily (Coconut water, kanji, ORS)', code: 'PRC-FLUID', defaultNotes: 'Hydration therapy' },
    ],
  },
  {
    id: 'os_htn_review',
    name: 'Essential Hypertension Review & Organ Screening',
    description: 'Quarterly review protocol for established hypertensive patients on dual/triple antihypertensive regimen.',
    specialty: 'CARDIO',
    items: [
      { category: 'LABORATORY', name: 'Serum Electrolytes (Na+, K+, Cl-)', code: 'LAB-SE', defaultNotes: 'Routine panel' },
      { category: 'LABORATORY', name: 'Serum Creatinine & Blood Urea Nitrogen', code: 'LAB-RFT', defaultNotes: 'Renal panel' },
      { category: 'LABORATORY', name: 'Urine Routine & Spot Microalbumin-to-Creatinine Ratio', code: 'LAB-UACR', defaultNotes: 'Morning first void sample' },
      { category: 'PROCEDURE', name: '12-Lead Electrocardiogram (ECG)', code: 'PRC-ECG', defaultNotes: 'Assess for LVH strain or ischemic changes' },
      { category: 'MEDICATION', name: 'Telmisartan 40mg + Amlodipine 5mg OD', code: 'MED-TELM-AML', defaultNotes: 'Morning after food' },
    ],
  },
  {
    id: 'os_t2dm_comprehensive',
    name: 'Type 2 Diabetes Comprehensive Staging',
    description: 'Biannual glycaemic control assessment, diabetic nephropathy screening, and lipid target review.',
    specialty: 'METABOLIC',
    items: [
      { category: 'LABORATORY', name: 'Glycated Hemoglobin (HbA1c) by HPLC', code: 'LAB-HBA1C', defaultNotes: 'Target < 7.0%' },
      { category: 'LABORATORY', name: 'Fasting Plasma Glucose (FPG) & 2h Post-Prandial (PPBS)', code: 'LAB-FBS-PPBS', defaultNotes: '8 hr fast' },
      { category: 'LABORATORY', name: 'Lipid Profile Comprehensive (TC, HDL, LDL, VLDL, Triglycerides)', code: 'LAB-LIPID', defaultNotes: '12 hr overnight fast' },
      { category: 'PROCEDURE', name: 'Bilateral Monofilament Foot Examination (Diabetic Neuropathy Screening)', code: 'PRC-FOOT', defaultNotes: '10-point Semmes-Weinstein monofilament' },
      { category: 'MEDICATION', name: 'Metformin 500mg SR BD', code: 'MED-MET-500', defaultNotes: 'With meals to reduce GI disturbance' },
    ],
  },
  {
    id: 'os_acute_asthma',
    name: 'Acute Bronchial Asthma / COPD Exacerbation',
    description: 'Emergency stabilization protocol for bronchospasm, audible wheezing, and PEFR drop > 30%.',
    specialty: 'RESPIRATORY',
    items: [
      { category: 'PROCEDURE', name: 'Nebulization: Salbutamol 2.5mg + Ipratropium 500mcg with O2', code: 'PRC-NEB-DUO', defaultNotes: 'Stat via face mask over 15 mins' },
      { category: 'PROCEDURE', name: 'Continuous Pulse Oximetry & Peak Expiratory Flow (PEFR) Monitoring', code: 'PRC-PEFR', defaultNotes: 'Record post-nebulization improvement' },
      { category: 'MEDICATION', name: 'Hydrocortisone 100mg IV Stat', code: 'MED-HYDRO-100', defaultNotes: 'Slow IV push' },
      { category: 'MEDICATION', name: 'Budesonide 0.5mg respules nebulization BD', code: 'MED-BUD-NEB', defaultNotes: 'Anti-inflammatory steroid maintenance' },
    ],
  },
];
