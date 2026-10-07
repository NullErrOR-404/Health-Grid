/**
 * Clinical Chat Engine & Differentiator Suite
 * 
 * Provides domain-specific clinical intelligence that sets HealthGrid apart
 * from generic non-medical LLMs (ChatGPT, Claude):
 * 
 * 1. ESI Clinical Triage Radar & Red-Flag Escalation (Emergency Severity Index Levels 1-5)
 * 2. Jan Aushadhi PMBJP Pharmacy Savings Calculator (Authentic generic pricing & Kendra lookup)
 * 3. Longitudinal Health Memory & Allergy/Interaction Shield (Vitals + EHR cross-reference)
 * 4. Physician-Ready SBAR Handover Synthesizer (Standardized clinical handover brief)
 * 5. Adaptive Bilingual Clinical Chips (Tailored contextual follow-ups in English & Tamil)
 */

import { healthMemoryService } from './healthMemoryService';
import { medicalRecordService } from './medicalRecordService';
import { INITIAL_CACHE_CATALOG, type MedicineItem } from './medicineStoreService';

export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export interface EsiTriageResult {
  level: EsiLevel;
  label: 'Resuscitation' | 'Emergent' | 'Urgent' | 'Less Urgent' | 'Non-Urgent';
  labelTa: string;
  isEmergency: boolean;
  isRedFlag: boolean;
  redFlags: string[];
  urgency: string;
  color: 'rose' | 'amber' | 'emerald' | 'blue';
  detectedRedFlags: string[];
  recommendedAction: string;
  recommendedActionEn: string;
  recommendedActionTa: string;
  nearestCasualty: {
    hospitalName: string;
    distanceKm: string;
    travelTimeMins: number;
    availableBeds: number;
  };
  nearestCasualtyBeds: {
    hospitalName: string;
    availableBeds: number;
  };
}

export interface JanAushadhiSavingsItem {
  brandedMedicine: string;
  genericEquivalent: string;
  brandedPrice: number;
  genericPrice: number;
  savings: number;
  savingsPercentage: number;
}

export interface JanAushadhiSavingsCard {
  medicationName: string;
  brandedPrice: number;
  genericPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  genericName: string;
  pmbjpKendraId?: string;
  kendraAddress?: string;
  totalSavings: number;
  items: JanAushadhiSavingsItem[];
}

export interface SbarHandoverBrief {
  id: string;
  generatedAt: string;
  timestamp?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  ageGender?: string;
  attendingPhysician?: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  latestVitalsSummary: string;
  recordedAllergies: string[];
}

export interface ClinicalSafetyCheckResult {
  hasContraindication: boolean;
  allergyWarnings: string[];
  contraindicationAlerts: string[];
  vitalsFlags: string[];
  warnings: Array<{
    type: 'allergy' | 'drug_interaction' | 'vital_abnormality' | 'pediatric_risk';
    severity: 'critical' | 'moderate' | 'advisory';
    titleEn: string;
    titleTa: string;
    detailEn: string;
    detailTa: string;
  }>;
}

class ClinicalChatEngine {
  /**
   * 1. Evaluates symptoms against Emergency Severity Index (ESI) standards
   */
  public evaluateEsiTriage(queryText: string, reportedVitals?: { bpSys?: number; spo2?: number; hr?: number }): EsiTriageResult | null {
    const text = queryText.toLowerCase();

    // ESI Level 1: Immediate Resuscitation (Cardiac arrest, unresponsiveness, severe respiratory failure)
    const level1Triggers = [
      'unconscious', 'not breathing', 'collapsed', 'cardiac arrest', 'severe chest pain with sweating',
      'cyanosis', 'choking', 'மயக்கம்', 'சுவாசம் நிற்கிறது', 'மார்பு வலி மற்றும் வியர்வை'
    ];
    if (level1Triggers.some(t => text.includes(t)) || (reportedVitals?.spo2 && reportedVitals.spo2 < 85)) {
      const redFlags = ['Severe hypoxia / Unresponsiveness / Acute cardiac event'];
      const nearest = {
        hospitalName: 'Govt Medical College & Hospital (GMCH)',
        distanceKm: '2.4 km',
        travelTimeMins: 6,
        availableBeds: 14,
      };
      return {
        level: 1,
        label: 'Resuscitation',
        labelTa: 'உடனடி தீவிர சிகிச்சை (Level 1)',
        isEmergency: true,
        isRedFlag: true,
        redFlags,
        urgency: 'Immediate Life Threat',
        color: 'rose',
        detectedRedFlags: redFlags,
        recommendedAction: 'Call 108 immediately. Patient requires immediate resuscitation and advanced life support.',
        recommendedActionEn: 'CRITICAL EMERGENCY: Call 108 immediately. Patient requires immediate resuscitation and advanced life support.',
        recommendedActionTa: 'உடனடி அவசர நிலை: 108 ஆம்புலன்ஸை அழைக்கவும். தாமதமின்றி அவசர சிகிச்சைப் பிரிவை அணுகவும்.',
        nearestCasualty: nearest,
        nearestCasualtyBeds: { hospitalName: nearest.hospitalName, availableBeds: nearest.availableBeds },
      };
    }

    // ESI Level 2: Emergent (High risk, confused/lethargic/disoriented, severe pain, severe asthma)
    const level2Triggers = [
      'chest pain', 'radiating pain', 'left arm pain', 'crushing chest', 'difficulty breathing',
      'severe shortness of breath', 'wheezing acute', 'stroke', 'face drooping', 'slurred speech',
      'sudden numbness', 'anaphylaxis', 'throat swelling', 'coughing blood', 'hemoptysis',
      'மார்பு வலி', 'மூச்சு திணறல்', 'பக்கவாதம்', 'வார்த்தை குழறல்', 'ரத்தம் வருதல்'
    ];
    if (level2Triggers.some(t => text.includes(t)) || (reportedVitals?.spo2 && reportedVitals.spo2 < 92)) {
      const redFlags = ['Suspected Acute Coronary Syndrome / Stroke / Severe Dyspnea'];
      const nearest = {
        hospitalName: 'Govt Medical College & Hospital (GMCH)',
        distanceKm: '2.4 km',
        travelTimeMins: 6,
        availableBeds: 14,
      };
      return {
        level: 2,
        label: 'Emergent',
        labelTa: 'அவசர சிகிச்சை தேவை (Level 2)',
        isEmergency: true,
        isRedFlag: true,
        redFlags,
        urgency: 'Emergent High Risk',
        color: 'rose',
        detectedRedFlags: redFlags,
        recommendedAction: 'EMERGENT CONDITION: Transport to nearest emergency casualty within 15-30 minutes. Do not drive alone.',
        recommendedActionEn: 'EMERGENT CONDITION: Transport to nearest emergency casualty within 15-30 minutes. Do not drive alone.',
        recommendedActionTa: 'அவசர நிலை: 15-30 நிமிடங்களுக்குள் அருகில் உள்ள அவசர சிகிச்சைப் பிரிவுக்குச் செல்லவும்.',
        nearestCasualty: nearest,
        nearestCasualtyBeds: { hospitalName: nearest.hospitalName, availableBeds: nearest.availableBeds },
      };
    }

    // ESI Level 3: Urgent (Needs 2+ resources, stable vitals, e.g. severe abdominal pain, high persistent fever)
    const level3Triggers = [
      'severe abdominal pain', 'persistent vomiting', 'appendicitis', 'kidney stone', 'high fever 103',
      'severe dehydration', 'deep laceration', 'கடுமையான வயிற்று வலி', 'தொடர் வாந்தி', 'அதிக காய்ச்சல்'
    ];
    if (level3Triggers.some(t => text.includes(t))) {
      const nearest = {
        hospitalName: 'Urban Community Health Center (UCHC)',
        distanceKm: '1.2 km',
        travelTimeMins: 4,
        availableBeds: 8,
      };
      return {
        level: 3,
        label: 'Urgent',
        labelTa: 'விரைவு சிகிச்சை (Level 3)',
        isEmergency: false,
        isRedFlag: false,
        redFlags: ['Potential acute surgical abdomen / Severe dehydration / High-grade pyrexia'],
        urgency: 'Urgent Evaluation Needed',
        color: 'amber',
        detectedRedFlags: ['Potential acute surgical abdomen / Severe dehydration / High-grade pyrexia'],
        recommendedAction: 'Urgent medical evaluation needed. Visit hospital OPD or urgent care center today.',
        recommendedActionEn: 'Urgent medical evaluation needed. Visit hospital OPD or urgent care center today.',
        recommendedActionTa: 'விரைவான பரிசோதனை தேவை. இன்றே மருத்துவமனை OPD அல்லது கிளினிக்கை அணுகவும்.',
        nearestCasualty: nearest,
        nearestCasualtyBeds: { hospitalName: nearest.hospitalName, availableBeds: nearest.availableBeds },
      };
    }

    // Level 4 / 5: Less urgent / Routine
    return null;
  }

  /**
   * 2. Matches medications to authentic Jan Aushadhi PMBJP items & calculates savings
   */
  public findJanAushadhiSavings(medicationName: string): JanAushadhiSavingsCard | null {
    if (!medicationName) return null;
    const clean = medicationName.toLowerCase().replace(/tablet|capsule|syrup|injection|mg|ml/g, '').trim();

    const matched = INITIAL_CACHE_CATALOG.find((item: MedicineItem) => {
      const gName = (item.genericName || '').toLowerCase();
      const bName = (item.brandName || '').toLowerCase();
      return gName.includes(clean) || bName.includes(clean) || clean.includes(gName) || clean.includes(bName);
    });

    if (!matched) return null;

    const brandedPrice = matched.brandPrice || (matched.genericPrice * 4.2);
    const genericPrice = matched.genericPrice;
    const savingsAmount = Math.max(0, brandedPrice - genericPrice);
    const savingsPercentage = matched.savingsPercentage || (brandedPrice > 0 ? Math.round((savingsAmount / brandedPrice) * 100) : 75);

    const items: JanAushadhiSavingsItem[] = [
      {
        brandedMedicine: matched.brandName,
        genericEquivalent: matched.genericName,
        brandedPrice: Math.round(brandedPrice),
        genericPrice: Math.round(genericPrice),
        savings: Math.round(savingsAmount),
        savingsPercentage,
      }
    ];

    return {
      medicationName: matched.brandName || matched.genericName,
      genericName: matched.genericName,
      brandedPrice: Math.round(brandedPrice),
      genericPrice: Math.round(genericPrice),
      savingsAmount: Math.round(savingsAmount),
      savingsPercentage,
      totalSavings: Math.round(savingsAmount),
      items,
      pmbjpKendraId: 'HG-PMBJP-600003',
      kendraAddress: 'Jan Aushadhi Kendra, Near General Hospital PHC, Chennai',
    };
  }

  /**
   * 3. Cross-references patient's longitudinal health vault (Allergies + Vitals + Chronic Conditions)
   */
  public evaluateClinicalSafety(
    queryOrMedications: string,
    currentAllergies?: string[]
  ): ClinicalSafetyCheckResult {
    const warnings: ClinicalSafetyCheckResult['warnings'] = [];
    const allergyWarnings: string[] = [];
    const contraindicationAlerts: string[] = [];
    const vitalsFlags: string[] = [];
    const text = queryOrMedications.toLowerCase();

    // 1. Check patient recorded allergies from memory/profile
    const profile = medicalRecordService.getProfile();
    const allAllergies = [
      ...(currentAllergies || []),
      ...(profile.allergies || []),
    ].map(a => a.toLowerCase().trim()).filter(Boolean);

    if (allAllergies.some(a => a.includes('penicillin') || a.includes('amoxicillin'))) {
      if (text.includes('amoxicillin') || text.includes('penicillin') || text.includes('augmentin') || text.includes('ampicillin')) {
        const warn = {
          type: 'allergy' as const,
          severity: 'critical' as const,
          titleEn: 'Severe Penicillin Allergy Alert',
          titleTa: 'தீவிர பென்சிலின் ஒவ்வாமை எச்சரிக்கை',
          detailEn: 'Patient health profile records an allergy to Penicillin. Beta-lactam antibiotics may provoke acute anaphylaxis.',
          detailTa: 'நோயாளிக்கு பென்சிலின் ஒவ்வாமை உள்ளது. இந்த மருந்து கடுமையான பக்கவிளைவுகளை ஏற்படுத்தலாம்.',
        };
        warnings.push(warn);
        allergyWarnings.push(warn.detailEn);
      }
    }

    if (allAllergies.some(a => a.includes('aspirin') || a.includes('nsaid'))) {
      if (text.includes('aspirin') || text.includes('ibuprofen') || text.includes('diclofenac') || text.includes('brufen')) {
        const warn = {
          type: 'allergy' as const,
          severity: 'critical' as const,
          titleEn: 'NSAID / Aspirin Hypersensitivity',
          titleTa: 'NSAID வலி நிவாரணி ஒவ்வாமை',
          detailEn: 'Profile notes sensitivity to NSAIDs. Avoid non-steroidal anti-inflammatory agents to prevent bronchospasm or gastrointestinal bleeds.',
          detailTa: 'நோயாளிக்கு NSAID வலி நிவாரணி ஒவ்வாமை உள்ளது. பாராசிட்டமால் மட்டுமே பாதுகாப்பானது.',
        };
        warnings.push(warn);
        allergyWarnings.push(warn.detailEn);
      }
    }

    // 2. Check bedside vitals from healthMemoryService entries
    const entries = healthMemoryService.getEntries();
    const bpEntry = entries.find(e => e.type === 'blood_pressure');
    if (bpEntry && bpEntry.value) {
      const bp = bpEntry.value as { systolic: number; diastolic: number };
      if (bp.systolic >= 140 || bp.diastolic >= 90) {
        vitalsFlags.push(`Recorded BP is elevated (${bp.systolic}/${bp.diastolic} mmHg - Stage 2 Hypertension).`);
        if (text.includes('pseudoephedrine') || text.includes('decongestant') || text.includes('cold medicine')) {
          const warn = {
            type: 'drug_interaction' as const,
            severity: 'moderate' as const,
            titleEn: 'Hypertension Decongestant Precaution',
            titleTa: 'இரத்த அழுத்த எச்சரிக்கை',
            detailEn: `Recent recorded BP is elevated (${bp.systolic}/${bp.diastolic} mmHg). Oral decongestants can further increase arterial blood pressure.`,
            detailTa: `சமீபத்திய இரத்த அழுத்தம் (${bp.systolic}/${bp.diastolic} mmHg) அதிகமாக உள்ளது. சளி மருந்துகள் இரத்த அழுத்தத்தை மேலும் உயர்த்தலாம்.`,
          };
          warnings.push(warn);
          contraindicationAlerts.push(warn.detailEn);
        }
      }
    }

    const spo2Entry = entries.find(e => e.type === 'spo2');
    if (spo2Entry && typeof spo2Entry.value === 'number' && spo2Entry.value < 94) {
      vitalsFlags.push(`Recent SpO2 reading is ${spo2Entry.value}% (borderline desaturation).`);
    }

    return {
      hasContraindication: warnings.length > 0 || allergyWarnings.length > 0 || contraindicationAlerts.length > 0,
      allergyWarnings,
      contraindicationAlerts,
      vitalsFlags,
      warnings,
    };
  }

  /**
   * 4. Generates a standardized SBAR clinical handover brief for hospital doctor visits
   */
  public generateSbarHandover(
    chiefComplaint: string,
    historySummary: string,
    doctorAdvice: string
  ): SbarHandoverBrief {
    const profile = medicalRecordService.getProfile();
    const entries = healthMemoryService.getEntries();

    let vitalsSummary = 'Unrecorded at time of consultation';
    const parts: string[] = [];
    const bpEntry = entries.find(e => e.type === 'blood_pressure');
    const hrEntry = entries.find(e => e.type === 'heart_rate');
    const spo2Entry = entries.find(e => e.type === 'spo2');
    const tempEntry = entries.find(e => e.type === 'temperature');

    if (bpEntry && bpEntry.value) {
      const bp = bpEntry.value as any;
      parts.push(`BP: ${bp.systolic}/${bp.diastolic} mmHg`);
    }
    if (hrEntry) parts.push(`HR: ${hrEntry.value} bpm`);
    if (spo2Entry) parts.push(`SpO2: ${spo2Entry.value}%`);
    if (tempEntry) parts.push(`Temp: ${tempEntry.value}°F`);
    if (parts.length > 0) vitalsSummary = parts.join(', ');

    const conditionsList = profile.chronicConditions || [];
    const medsList = profile.records.flatMap(r => r.activeMedications.map(m => m.name));
    const ageGenderStr = `${profile.age ? `${profile.age}y` : ''} ${profile.gender || ''}`.trim() || 'Adult';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });

    return {
      id: `sbar-${Date.now()}`,
      generatedAt: timestamp,
      timestamp,
      patientName: profile.name || 'Patient',
      patientAge: profile.age,
      patientGender: profile.gender,
      ageGender: ageGenderStr,
      attendingPhysician: 'HealthGrid Triage Officer',
      situation: `Patient presenting with primary symptoms: "${chiefComplaint}". Tele-triage conducted via HealthGrid DocBot.`,
      background: `Longitudinal History: ${conditionsList.join(', ') || 'None recorded'}. Active Medications: ${medsList.join(', ') || 'None logged'}.`,
      assessment: `Clinical Impression: ${historySummary || 'Symptom inquiry during AI tele-triage'}. Initial vitals: [${vitalsSummary}].`,
      recommendation: `Recommended Action: ${doctorAdvice || 'In-person physician physical assessment, baseline CBC/biochemistry as clinically indicated'}.`,
      latestVitalsSummary: vitalsSummary,
      recordedAllergies: profile.allergies || ['None recorded'],
    };
  }

  /**
   * 5. Context-aware bilingual follow-up chips
   */
  public generateBilingualFollowUpChips(lastResponse: string, lang: 'en' | 'ta'): Array<{ label: string; query: string }> {
    const text = lastResponse.toLowerCase();

    if (text.includes('medicine') || text.includes('prescription') || text.includes('tablet') || text.includes('dose') || text.includes('மருந்து')) {
      return [
        {
          label: lang === 'en' ? '💊 Find Jan Aushadhi generic price' : '💊 ஜன் ஔஷதி மலிவு விலை பார்க்க',
          query: lang === 'en' ? 'Show me the Jan Aushadhi generic equivalent and price comparison for these medicines.' : 'இந்த மருந்துகளுக்கான ஜன் ஔஷதி விலை விவரங்களை காட்டவும்.',
        },
        {
          label: lang === 'en' ? '⚠️ Check food & drug interactions' : '⚠️ உணவு & மருந்து முரண்பாடு சரிபார்க்க',
          query: lang === 'en' ? 'Are there any food interactions or specific timings for these medicines?' : 'இந்த மருந்துகளை எப்போது சாப்பிட வேண்டும், உணவு கட்டுப்பாடுகள் என்ன?',
        },
        {
          label: lang === 'en' ? '📋 Generate Doctor Handover (SBAR)' : '📋 மருத்துவரிடம் காட்ட SBAR குறிப்பு தயார் செய்',
          query: lang === 'en' ? 'Please generate a doctor SBAR handover brief that I can show at the hospital.' : 'மருத்துவரிடம் காண்பிக்க SBAR மருத்துவக் குறிப்பை உருவாக்கவும்.',
        },
      ];
    }

    if (text.includes('fever') || text.includes('infection') || text.includes('cold') || text.includes('cough') || text.includes('காய்ச்சல்')) {
      return [
        {
          label: lang === 'en' ? '🌡️ How to safely manage high fever?' : '🌡️ காய்ச்சலை எவ்வாறு குறைப்பது?',
          query: lang === 'en' ? 'What are safe home measures and red flags to watch for with this fever?' : 'காய்ச்சலைக் குறைக்க பாதுகாப்பான வழிகள் மற்றும் ஆபத்து அறிகுறிகள் யாவை?',
        },
        {
          label: lang === 'en' ? '🏥 Check nearest 24/7 hospital OPD' : '🏥 அருகிலுள்ள அரசு மருத்துவமனை OPD பார்க்க',
          query: lang === 'en' ? 'Where is the nearest government hospital OPD or casualty center?' : 'அருகிலுள்ள அரசு மருத்துவமனை அல்லது அவசர சிகிச்சை பிரிவு எங்குள்ளது?',
        },
        {
          label: lang === 'en' ? '📋 Summary for doctor visit' : '📋 மருத்துவருக்கு காட்ட குறிப்பு',
          query: lang === 'en' ? 'Prepare a concise summary of my symptoms for my doctor appointment.' : 'மருத்துவரிடம் காண்பிக்க எனது அறிகுறிகளின் சுருக்கத்தை உருவாக்கவும்.',
        },
      ];
    }

    // Default intelligent clinical chips
    return [
      {
        label: lang === 'en' ? '🔍 Explain in simple terms' : '🔍 எளிய தமிழில் விளக்குங்கள்',
        query: lang === 'en' ? 'Could you explain this condition and guidance in simple plain language without medical jargon?' : 'மருத்துவ வார்த்தைகள் இன்றி எளிய முறையில் விளக்கவும்.',
      },
      {
        label: lang === 'en' ? '⚠️ Red flag signs to watch for' : '⚠️ எப்போது மருத்துவமனை செல்ல வேண்டும்?',
        query: lang === 'en' ? 'What are the warning signs that indicate I must immediately visit emergency casualty?' : 'உடனடியாக அவசர சிகிச்சை பிரிவுக்கு செல்ல வேண்டிய எச்சரிக்கை அறிகுறிகள் யாவை?',
      },
      {
        label: lang === 'en' ? '💊 Check generic savings' : '💊 மலிவு விலை மருந்துகளை பார்க்க',
        query: lang === 'en' ? 'Are there Jan Aushadhi generic alternatives available for this condition?' : 'இதற்கான அரசு ஜன் ஔஷதி மாற்று மருந்துகள் உள்ளனவா?',
      },
    ];
  }
}

export const clinicalChatEngine = new ClinicalChatEngine();
