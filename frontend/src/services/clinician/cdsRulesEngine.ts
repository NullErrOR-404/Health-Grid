// ==============================================================================
// HealthGrid Clinician Portal — Contextual Clinical Decision Support (CDS)
// ==============================================================================

import type { PatientEntity, ClinicalDecisionAlert, ClinicalEncounter } from '../../types/clinician';

export class ClinicalDecisionSupportEngine {
  public static evaluatePatientAlerts(
    patient: PatientEntity,
    encounter?: ClinicalEncounter
  ): ClinicalDecisionAlert[] {
    const alerts: ClinicalDecisionAlert[] = [];

    // 1. Allergy Conflict Check
    if (patient.allergies.some((a) => a.allergen.toLowerCase().includes('penicillin') && a.status === 'ACTIVE')) {
      // Check if encounter prescriptions or orders include penicillins
      if (encounter) {
        const hasBetaLactam = encounter.prescriptions.some((rx) => {
          const name = rx.medicineName.toLowerCase();
          return (
            name.includes('amoxicillin') ||
            name.includes('ampicillin') ||
            name.includes('augmentin') ||
            name.includes('penicillin')
          );
        });

        if (hasBetaLactam) {
          const offendingRx = encounter.prescriptions.find((rx) => {
            const name = rx.medicineName.toLowerCase();
            return (
              name.includes('amoxicillin') ||
              name.includes('ampicillin') ||
              name.includes('augmentin') ||
              name.includes('penicillin')
            );
          });

          alerts.push({
            id: 'cds_alg_penicillin',
            tier: 'RED',
            title: 'CRITICAL ALLERGY CONFLICT: Penicillin Hypersensitivity',
            description: `${patient.name} has a verified SEVERE allergy to Penicillin (Reaction: Urticaria & angioedema). Prescribing a beta-lactam poses an immediate risk of anaphylaxis.`,
            recommendation: 'Discontinue beta-lactam antibiotic immediately. Consider Macrolides (Azithromycin) or Fluoroquinolones.',
            category: 'ALLERGY',
            contraindicatedMedicineName: offendingRx?.medicineName || 'Amoxicillin',
            alternativeMedicine: {
              medicineName: 'Azithromycin',
              dosage: '500 mg',
              frequency: 'OD (Once a day)',
              duration: '3 days',
              instructions: 'Take 1 hour before or 2 hours after meals with water',
              isGeneric: true,
              janAushadhiPrice: 22.0,
              brandedPrice: 78.0,
            },
          });
        }
      }
    }

    // 2. Severe Hyperkalemia Drug-Drug Interaction
    const onSpironolactone = patient.medications.some((m) => m.name.toLowerCase().includes('spironolactone'));
    const onEnalaprilOrAcei = patient.medications.some(
      (m) =>
        m.name.toLowerCase().includes('enalapril') ||
        m.name.toLowerCase().includes('ramipril') ||
        m.name.toLowerCase().includes('telmisartan')
    );

    if (onSpironolactone && onEnalaprilOrAcei) {
      const isHyperkalemic = patient.investigations.some(
        (inv) => inv.testName.toLowerCase().includes('potassium') && inv.status === 'Critical'
      );

      alerts.push({
        id: 'cds_ddi_hyperkalemia',
        tier: isHyperkalemic ? 'RED' : 'AMBER',
        title: isHyperkalemic ? 'CRITICAL: Severe Hyperkalemia Risk (ACEi + MRA)' : 'Drug Interaction Warning: ACEi + Aldosterone Antagonist',
        description: isHyperkalemic
          ? `Serum Potassium is 6.2 mmol/L. Concomitant use of Enalapril and Spironolactone is actively causing life-threatening hyperkalemia.`
          : `Dual renin-angiotensin aldosterone blockade increases risk of significant hyperkalemia. Frequent electrolyte surveillance advised.`,
        recommendation: isHyperkalemic
          ? 'Immediately HOLD Spironolactone and Enalapril. Obtain stat 12-lead ECG and administer potassium-lowering protocol.'
          : 'Monitor serum creatinine and electrolytes every 4-6 weeks.',
        category: 'INTERACTION',
        recommendedOrder: {
          category: 'LABORATORY',
          name: 'STAT Serum Electrolytes (Na+, K+, Cl-)',
          code: 'LAB-K-STAT',
          priority: 'STAT',
        },
      });
    }

    // 3. Chronic Kidney Disease & NSAID Warning
    const hasCkd = patient.problems.some((p) => p.name.toLowerCase().includes('chronic kidney') || p.code.startsWith('N18'));
    if (hasCkd && encounter) {
      const offendingNsaid = encounter.prescriptions.find((rx) => {
        const n = rx.medicineName.toLowerCase();
        return n.includes('ibuprofen') || n.includes('diclofenac') || n.includes('naproxen') || n.includes('aceclofenac');
      });

      if (offendingNsaid) {
        alerts.push({
          id: 'cds_renal_nsaid',
          tier: 'RED',
          title: 'NEPHROTOXIC ALERT: NSAID in Chronic Kidney Disease',
          description: `Patient has documented CKD Stage 3. Systemic NSAID therapy can precipitate acute renal decompensation.`,
          recommendation: 'Substitute with Paracetamol 650mg or topical analgesics.',
          category: 'RENAL_WARNING',
          contraindicatedMedicineName: offendingNsaid.medicineName,
          alternativeMedicine: {
            medicineName: 'Paracetamol',
            dosage: '650 mg',
            frequency: 'TDS (Three times a day)',
            duration: '3 days',
            instructions: 'Take post meals as needed for pain/fever',
            isGeneric: true,
            janAushadhiPrice: 12.0,
            brandedPrice: 38.0,
          },
        });
      }
    }

    // 4. Suboptimal Glycemic Control & Care Gap
    const hasDiabetes = patient.problems.some((p) => p.code.startsWith('E11') || p.name.toLowerCase().includes('diabetes'));
    if (hasDiabetes) {
      const highHba1c = patient.investigations.find((i) => i.testName.includes('HbA1c') && i.status === 'Abnormal');
      if (highHba1c) {
        alerts.push({
          id: 'cds_caregap_hba1c',
          tier: 'AMBER',
          title: 'Suboptimal Glycemic Control (HbA1c > 8.0%)',
          description: `Last HbA1c is ${highHba1c.summary}. ADA/ICMR clinical guidelines recommend treatment intensification for diabetic patients not at target (< 7.0%).`,
          recommendation: 'Evaluate adding secondary agent (e.g. SGLT2i Empagliflozin/Dapagliflozin or DPP-4i Linagliptin).',
          category: 'CARE_GAP',
          recommendedOrder: {
            category: 'LABORATORY',
            name: 'Urine Albumin-to-Creatinine Ratio (uACR)',
            code: 'LAB-UACR',
            priority: 'ROUTINE',
          },
        });
      }

      // Check care gap for fundus exam
      const eyeGap = patient.careGaps.find((g) => g.title.toLowerCase().includes('eye') || g.title.toLowerCase().includes('retinopathy'));
      if (eyeGap) {
        alerts.push({
          id: 'cds_caregap_eye',
          tier: 'BLUE',
          title: 'Care Gap: Annual Diabetic Retinopathy Screening',
          description: `Dilated fundus examination is ${eyeGap.dueText.toLowerCase()}.`,
          recommendation: 'Place an Ophthalmology referral order before closing the encounter.',
          category: 'CARE_GAP',
          recommendedOrder: {
            category: 'REFERRAL',
            name: 'Ophthalmology Dilated Fundus Examination Referral',
            code: 'REF-OPH-01',
            priority: 'ROUTINE',
          },
        });
      }
    }

    return alerts;
  }
}
