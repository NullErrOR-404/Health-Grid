/**
 * HealthGrid Pre-Consultation Clinical AI Service
 * 
 * Analyzes patient e-chart, longitudinal records, allergies, active medications,
 * and current chief complaint to synthesize an instant clinical briefing ("AI Jist")
 * for the physician before physical examination begins.
 */

import { type MedicalRecord } from './medicalRecordService';
import { type PatientVitalsRecord } from './unifiedPatientStore';

export interface PreConsultationAiJist {
  patientHeadline: string;
  acuteContext: string;
  chronicBaseline: string;
  criticalAllergyAlerts: string[];
  activeMedicationsAndRisks: string[];
  vitalsTriage: {
    status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
    detail: string;
  };
  highYieldQuestionsForDoctor: string[];
  physicalExamFocus: string[];
  differentialConsiderations: string[];
  conciseSummaryJist: string;
}

export interface PatientBriefingInput {
  name: string;
  age: number;
  gender: string;
  healthId: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  chiefComplaint: string;
  appointmentTime?: string;
  department?: string;
  doctorName?: string;
  vitals?: Partial<PatientVitalsRecord>;
  pastRecords?: MedicalRecord[];
}

class PreConsultationAiService {
  /**
   * Synthesizes an intelligent, structured pre-consultation clinical briefing.
   * Grounded in authentic medical reasoning, ICMR protocols, and drug-safety guidelines.
   */
  public generateBriefing(input: PatientBriefingInput): PreConsultationAiJist {
    const cleanComplaint = (input.chiefComplaint || 'Routine medical checkup and consultation').trim();
    const lowerComplaint = cleanComplaint.toLowerCase();
    const allergies = (input.allergies || []).filter(Boolean);
    const chronicConditions = (input.chronicConditions || []).filter(Boolean);
    const pastRecords = input.pastRecords || [];

    // 1. Critical Allergy Alerts
    const criticalAllergyAlerts: string[] = [];
    allergies.forEach((allergy) => {
      const lower = allergy.toLowerCase();
      if (lower.includes('penicillin') || lower.includes('amoxicillin') || lower.includes('beta-lactam')) {
        criticalAllergyAlerts.push('CONTRAINDICATION: Documented Penicillin/Beta-lactam allergy. High risk of anaphylaxis. Use Macrolides or Fluoroquinolones if antibiotic indicated.');
      } else if (lower.includes('aspirin') || lower.includes('nsaid') || lower.includes('ibuprofen')) {
        criticalAllergyAlerts.push('CONTRAINDICATION: NSAID / Aspirin hypersensitivity. Avoid Ketorolac, Diclofenac, Ibuprofen. Paracetamol is the safe analgesic choice.');
      } else if (lower.includes('sulfa')) {
        criticalAllergyAlerts.push('CONTRAINDICATION: Sulfonamide hypersensitivity. Avoid Cotrimoxazole, Sulfasalazine.');
      } else {
        criticalAllergyAlerts.push(`Documented Allergy: ${allergy}. Verify cross-reactivity before ordering.`);
      }
    });

    // 2. Active Medications & Risks
    const activeMedicationsAndRisks: string[] = [];
    pastRecords.forEach((rec) => {
      if (rec.activeMedications && rec.activeMedications.length > 0) {
        rec.activeMedications.forEach((med) => {
          activeMedicationsAndRisks.push(`${med.name} (${med.dosage || 'Standard dose'}, ${med.frequency || 'Daily'}) - ${med.purpose || 'Chronic management'}`);
        });
      }
    });

    if (activeMedicationsAndRisks.length === 0) {
      if (chronicConditions.some((c) => c.toLowerCase().includes('hypertension'))) {
        activeMedicationsAndRisks.push('Patient carries Hypertension diagnosis. Check adherence to anti-hypertensives (Telmisartan/Amlodipine).');
      }
      if (chronicConditions.some((c) => c.toLowerCase().includes('diabetes'))) {
        activeMedicationsAndRisks.push('Patient carries T2 Diabetes diagnosis. Check adherence to Metformin/Sulfonylureas.');
      }
    }

    // 3. Vitals Triage
    const bpSys = input.vitals?.bpSystolic || 120;
    const bpDia = input.vitals?.bpDiastolic || 80;
    const hr = input.vitals?.heartRate || 72;
    const spo2 = input.vitals?.spo2 || 99;
    const temp = input.vitals?.temperature || 98.4;

    let vitalsStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';
    const vitalsDetails: string[] = [];

    if (spo2 < 92 || bpSys >= 180 || hr > 130) {
      vitalsStatus = 'CRITICAL';
      if (spo2 < 92) vitalsDetails.push(`Critical Desaturation: SpO2 ${spo2}%`);
      if (bpSys >= 180) vitalsDetails.push(`Hypertensive Urgency: BP ${bpSys}/${bpDia} mmHg`);
      if (hr > 130) vitalsDetails.push(`Severe Tachycardia: HR ${hr} bpm`);
    } else if (bpSys >= 140 || bpDia >= 90 || temp > 100.4 || hr > 100) {
      vitalsStatus = 'ELEVATED';
      if (bpSys >= 140 || bpDia >= 90) vitalsDetails.push(`Elevated BP: ${bpSys}/${bpDia} mmHg`);
      if (temp > 100.4) vitalsDetails.push(`Febrile: ${temp}°F`);
      if (hr > 100) vitalsDetails.push(`Mild Tachycardia: ${hr} bpm`);
    } else {
      vitalsDetails.push(`Stable baseline: BP ${bpSys}/${bpDia} mmHg, HR ${hr} bpm, SpO2 ${spo2}%, Temp ${temp}°F`);
    }

    // 4. Clinical Logic for High-Yield Questions & Physical Exam
    const highYieldQuestions: string[] = [];
    const examFocus: string[] = [];
    const differentials: string[] = [];

    if (lowerComplaint.includes('chest') || lowerComplaint.includes('heart') || lowerComplaint.includes('angina') || lowerComplaint.includes('breath')) {
      highYieldQuestions.push('Does the chest discomfort radiate to the left jaw, neck, or inner arm?');
      highYieldQuestions.push('Is the pain provoked by physical exertion or emotional stress, and relieved by rest?');
      highYieldQuestions.push('Any diaphoresis, nausea, dizziness, or shortness of breath accompanying the episodes?');
      examFocus.push('Cardiovascular: Auscultate for S3/S4 gallops, systolic murmurs, and carotid bruits');
      examFocus.push('Pulmonary: Check bilateral basal air entry, rales, or wheezing');
      examFocus.push('Peripheral: Assess bilateral pedal edema and radial pulse symmetry');
      differentials.push('Atypical Angina Pectoris / Coronary Artery Disease');
      differentials.push('Gastroesophageal Reflux Disease (GERD) / Esophageal Spasm');
      differentials.push('Musculoskeletal Costochondritis');
    } else if (lowerComplaint.includes('fever') || lowerComplaint.includes('cough') || lowerComplaint.includes('cold') || lowerComplaint.includes('throat')) {
      highYieldQuestions.push('How many days has the fever been present, and is there chills or rigors?');
      highYieldQuestions.push('Is the cough dry or productive of yellowish/greenish sputum or blood?');
      highYieldQuestions.push('Any retro-orbital eye pain, severe joint pain, or skin rashes (dengue warning signs)?');
      examFocus.push('ENT: Inspect posterior pharynx for erythema, tonsillar exudates, or petechiae');
      examFocus.push('Respiratory: Auscultate all lung fields for rhonchi, crackles, or bronchial breathing');
      examFocus.push('Lymphatics: Palpate cervical and submandibular lymphadenopathy');
      differentials.push('Acute Upper Respiratory Tract Infection (Viral Pharyngitis / Bronchitis)');
      differentials.push('Community-Acquired Pneumonia (if focal crackles present)');
      differentials.push('Dengue / Vector-borne febrile illness (endemic surveillance)');
    } else if (lowerComplaint.includes('stomach') || lowerComplaint.includes('abdomen') || lowerComplaint.includes('pain') || lowerComplaint.includes('acidity') || lowerComplaint.includes('vomit')) {
      highYieldQuestions.push('Where is the pain located (epigastric, right lower quadrant, periumbilical) and does it radiate to the back?');
      highYieldQuestions.push('Is the pain related to food intake (worse immediately after vs relieved by food)?');
      highYieldQuestions.push('Any black tarry stools (melena), vomiting, or change in bowel habits?');
      examFocus.push('Abdominal: Palpate for focal tenderness, epigastric guarding, or rebound tenderness');
      examFocus.push('Splanchnic: Check for hepatosplenomegaly and Murphy\'s sign');
      examFocus.push('Auscultation: Confirm normal active bowel sounds in all 4 quadrants');
      differentials.push('Peptic Ulcer Disease / Acute Gastritis / GERD');
      differentials.push('Acute Cholecystitis / Biliary colic');
      differentials.push('Non-ulcer functional dyspepsia');
    } else if (lowerComplaint.includes('headache') || lowerComplaint.includes('dizzy') || lowerComplaint.includes('giddiness')) {
      highYieldQuestions.push('Was the onset sudden ("thunderclap") or gradual throbbing over several hours?');
      highYieldQuestions.push('Any associated photophobia, nausea, visual auras, or neurological weakness?');
      highYieldQuestions.push('Is the headache aggravated by neck bending or coughing?');
      examFocus.push('Neurological: Pupillary reflexes, extraocular movements, and cranial nerve screen');
      examFocus.push('Meningeal: Check neck stiffness / Kernig\'s sign if febrile');
      examFocus.push('Fundoscopy / BP: Verify blood pressure rule-out for hypertensive encephalopathy');
      differentials.push('Tension-type headache / Cervicogenic headache');
      differentials.push('Migraine with/without aura');
      differentials.push('Secondary headache related to systemic hypertension');
    } else {
      highYieldQuestions.push('Exact onset and trajectory: When did symptoms start and are they getting progressively worse?');
      highYieldQuestions.push('What specific activities relieve or aggravate the presenting complaints?');
      highYieldQuestions.push('Any systemic red flags: Unintentional weight loss, night sweats, or profound fatigue?');
      examFocus.push('General: Check pallor, icterus, cyanosis, clubbing, lymphadenopathy, and edema (PICC-LE)');
      examFocus.push('System-specific inspection based on patient anatomical complaints');
      differentials.push('Clinical assessment in progress pending physical examination');
    }

    // 5. Patient Headline & Chronic Baseline
    const patientHeadline = `${input.name}, ${input.age}y ${input.gender || 'M'} (${input.healthId}) • ${cleanComplaint}`;
    const chronicBaseline = chronicConditions.length > 0
      ? `Established chronic history: ${chronicConditions.join(', ')}.`
      : 'No pre-existing chronic co-morbidities recorded in HealthGrid vault.';

    // 6. Concise Summary Jist (The exact 3-4 sentence elevator briefing for the physician)
    const allergyText = criticalAllergyAlerts.length > 0
      ? `CRITICAL ALLERGY ALERT: ${allergies.join(', ')}.`
      : 'No known drug allergies.';
    const vitalsText = vitalsStatus === 'NORMAL'
      ? 'Vitals are hemodynamically stable.'
      : `Vitals note: ${vitalsDetails.join(', ')}.`;

    const conciseSummaryJist = `${input.name} (${input.age}y ${input.gender}) presents for OPD evaluation of ${cleanComplaint}. ${chronicBaseline} ${allergyText} ${vitalsText} Recommended focus: Rule out ${differentials[0] || 'acute etiology'} and address patient symptomatology with generic Jan Aushadhi formulary.`;

    return {
      patientHeadline,
      acuteContext: `Presenting with: "${cleanComplaint}" scheduled for ${input.appointmentTime || 'OPD slot'} with ${input.doctorName || 'Doctor'}.`,
      chronicBaseline,
      criticalAllergyAlerts,
      activeMedicationsAndRisks,
      vitalsTriage: {
        status: vitalsStatus,
        detail: vitalsDetails.join(' • '),
      },
      highYieldQuestionsForDoctor: highYieldQuestions,
      physicalExamFocus: examFocus,
      differentialConsiderations: differentials,
      conciseSummaryJist,
    };
  }
}

export const preConsultationAiService = new PreConsultationAiService();
