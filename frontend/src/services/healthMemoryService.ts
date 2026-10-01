/**
 * HealthGrid Longitudinal Health Memory & Vitals Ingestion Service
 * 
 * Capabilities:
 * - Persistent episodic biometric tracking (BP, Blood Sugar, Heart Rate, SpO2, Temp, Weight)
 * - Per-user isolated storage (local storage + Supabase sync)
 * - Real-time natural language vital extraction from chat conversations
 * - Clinical trend synthesis: computes 14-day rolling baselines, trajectory deltas, and anomalies
 * - Zero technical jargon: formatted purely as warm clinical doctor notes
 */

import { authService } from './authService';

export type VitalType =
  | 'blood_pressure'
  | 'blood_sugar'
  | 'heart_rate'
  | 'spo2'
  | 'temperature'
  | 'weight';

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

export interface BloodSugarValue {
  glucose: number;
  timing: 'fasting' | 'postprandial' | 'random';
}

export type VitalValue =
  | BloodPressureValue
  | BloodSugarValue
  | number; // for pulse (bpm), spo2 (%), temp (°F), weight (kg)

export interface VitalEntry {
  id: string;
  userId: string;
  timestamp: string; // ISO date
  type: VitalType;
  value: VitalValue;
  unit: string;
  source: 'manual_entry' | 'chat_extracted';
  notes?: string;
}

export interface VitalAnomaly {
  type: VitalType;
  vitalLabel: string;
  currentDisplay: string;
  baselineDisplay: string;
  deltaText: string;
  status: 'STABLE' | 'ELEVATED' | 'LOW' | 'CRITICAL';
  clinicalGuidanceEn: string;
  clinicalGuidanceTa: string;
}

export interface ClinicalSynthesis {
  hasRecords: boolean;
  hasAnomalies: boolean;
  totalLogs: number;
  anomalies: VitalAnomaly[];
  summaryEn: string;
  summaryTa: string;
  contextPrompt: string;
}

type VitalsListener = (entries: VitalEntry[]) => void;

class HealthMemoryService {
  private entries: VitalEntry[] = [];
  private listeners: Set<VitalsListener> = new Set();
  private storageKeyPrefix = 'healthgrid_vitals_v1_';

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      authService.subscribe((user) => {
        if (user) {
          this.loadFromStorage();
        } else {
          this.entries = [];
          this.notify();
        }
      });
    }
  }

  private getStorageKey(): string {
    const user = authService.getCurrentUser();
    return `${this.storageKeyPrefix}${user ? user.id : 'guest'}`;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(this.getStorageKey());
      if (data) {
        this.entries = JSON.parse(data);
      } else {
        this.entries = [];
      }
    } catch {
      this.entries = [];
    }
    this.notify();
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.entries));
    } catch {
      // quota or local storage restriction
    }
    this.notify();
  }

  public subscribe(listener: VitalsListener): () => void {
    this.listeners.add(listener);
    listener([...this.entries]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const copy = [...this.entries];
    this.listeners.forEach((fn) => fn(copy));
  }

  public getEntries(): VitalEntry[] {
    return [...this.entries];
  }

  public addEntry(
    type: VitalType,
    value: VitalValue,
    unit: string,
    source: 'manual_entry' | 'chat_extracted' = 'manual_entry',
    notes?: string
  ): VitalEntry {
    const user = authService.getCurrentUser();
    const newEntry: VitalEntry = {
      id: `vital-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user ? user.id : 'guest',
      timestamp: new Date().toISOString(),
      type,
      value,
      unit,
      source,
      notes,
    };

    // Prepend (latest first)
    this.entries = [newEntry, ...this.entries];
    this.saveToStorage();
    return newEntry;
  }

  public deleteEntry(id: string): void {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.saveToStorage();
  }

  public clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  /**
   * Natural Language Extractor: Intelligently detects vitals in patient chat messages
   * E.g. "my BP was 140/90 today", "sugar 145", "pulse 84", "oxygen 98%", "fever 101 F"
   */
  public extractVitalsFromText(text: string): VitalEntry[] {
    if (!text || text.trim().length === 0) return [];
    const extracted: VitalEntry[] = [];
    const lower = text.toLowerCase();

    // 1. Blood Pressure: matches "120/80", "140 / 90", "bp: 130/85", "bp 145/95 mmHg"
    const bpMatch = text.match(/\b(?:bp|blood\s*pressure)?[:\s]*(\d{2,3})\s*[\/|\\]\s*(\d{2,3})(?:\s*mmhg)?\b/i);
    if (bpMatch) {
      const sys = parseInt(bpMatch[1], 10);
      const dia = parseInt(bpMatch[2], 10);
      if (sys >= 70 && sys <= 250 && dia >= 40 && dia <= 160) {
        // Prevent duplicate extract in short timeframe
        const isRecentDup = this.entries.slice(0, 3).some(
          (e) =>
            e.type === 'blood_pressure' &&
            typeof e.value === 'object' &&
            'systolic' in e.value &&
            e.value.systolic === sys &&
            e.value.diastolic === dia &&
            Date.now() - new Date(e.timestamp).getTime() < 300000 // within 5 mins
        );
        if (!isRecentDup) {
          const entry = this.addEntry('blood_pressure', { systolic: sys, diastolic: dia }, 'mmHg', 'chat_extracted', 'Extracted from consultation message');
          extracted.push(entry);
        }
      }
    }

    // 2. Blood Sugar / Glucose: matches "sugar 140", "fasting 105", "glucose 160 mg/dl", "postprandial 180"
    const sugarMatch = text.match(/\b(?:sugar|glucose|fasting\s*sugar|postprandial|சர்க்கரை)[:\s]*(\d{2,3})\s*(?:mg\/dl)?\b/i);
    if (sugarMatch) {
      const val = parseInt(sugarMatch[1], 10);
      if (val >= 40 && val <= 500) {
        const timing = lower.includes('fasting') ? 'fasting' : lower.includes('after food') || lower.includes('postprandial') ? 'postprandial' : 'random';
        const isRecentDup = this.entries.slice(0, 3).some(
          (e) =>
            e.type === 'blood_sugar' &&
            typeof e.value === 'object' &&
            'glucose' in e.value &&
            e.value.glucose === val &&
            Date.now() - new Date(e.timestamp).getTime() < 300000
        );
        if (!isRecentDup) {
          const entry = this.addEntry('blood_sugar', { glucose: val, timing }, 'mg/dL', 'chat_extracted', 'Extracted from consultation message');
          extracted.push(entry);
        }
      }
    }

    // 3. Heart Rate / Pulse: matches "pulse 76", "heart rate 85 bpm", "hr: 90"
    const pulseMatch = text.match(/\b(?:pulse|heart\s*rate|hr)[:\s]*(\d{2,3})\s*(?:bpm)?\b/i);
    if (pulseMatch) {
      const val = parseInt(pulseMatch[1], 10);
      if (val >= 40 && val <= 200) {
        const isRecentDup = this.entries.slice(0, 3).some(
          (e) => e.type === 'heart_rate' && e.value === val && Date.now() - new Date(e.timestamp).getTime() < 300000
        );
        if (!isRecentDup) {
          const entry = this.addEntry('heart_rate', val, 'bpm', 'chat_extracted', 'Extracted from consultation message');
          extracted.push(entry);
        }
      }
    }

    // 4. Oxygen SpO2: matches "spo2 98%", "oxygen 97%", "pulse ox 96%"
    const spo2Match = text.match(/\b(?:spo2|oxygen|pulse\s*ox)[:\s]*(\d{2,3})\s*(?:%)?\b/i);
    if (spo2Match) {
      const val = parseInt(spo2Match[1], 10);
      if (val >= 70 && val <= 100) {
        const isRecentDup = this.entries.slice(0, 3).some(
          (e) => e.type === 'spo2' && e.value === val && Date.now() - new Date(e.timestamp).getTime() < 300000
        );
        if (!isRecentDup) {
          const entry = this.addEntry('spo2', val, '%', 'chat_extracted', 'Extracted from consultation message');
          extracted.push(entry);
        }
      }
    }

    // 5. Body Temperature: matches "temp 101", "100.4 F", "fever 102", "101.5 f"
    const tempMatch = text.match(/\b(?:temp|temperature|fever)[:\s]*(\d{2,3}(?:\.\d)?)\s*(?:°?f|deg)?\b/i);
    if (tempMatch) {
      const val = parseFloat(tempMatch[1]);
      if (val >= 94 && val <= 107) {
        const isRecentDup = this.entries.slice(0, 3).some(
          (e) => e.type === 'temperature' && e.value === val && Date.now() - new Date(e.timestamp).getTime() < 300000
        );
        if (!isRecentDup) {
          const entry = this.addEntry('temperature', val, '°F', 'chat_extracted', 'Extracted from consultation message');
          extracted.push(entry);
        }
      }
    }

    // 6. Weight: matches "weight 72 kg", "74 kgs"
    const weightMatch = text.match(/\b(?:weight|wt)[:\s]*(\d{2,3}(?:\.\d)?)\s*(?:kg|kgs)?\b/i);
    if (weightMatch) {
      const val = parseFloat(weightMatch[1]);
      if (val >= 25 && val <= 250) {
        const isRecentDup = this.entries.slice(0, 3).some(
          (e) => e.type === 'weight' && e.value === val && Date.now() - new Date(e.timestamp).getTime() < 300000
        );
        if (!isRecentDup) {
          const entry = this.addEntry('weight', val, 'kg', 'chat_extracted', 'Extracted from consultation message');
          extracted.push(entry);
        }
      }
    }

    return extracted;
  }

  /**
   * Computes longitudinal 14-day baselines, trajectories, and clinical anomalies
   */
  public getClinicalTrendSynthesis(): ClinicalSynthesis {
    if (this.entries.length === 0) {
      return {
        hasRecords: false,
        hasAnomalies: false,
        totalLogs: 0,
        anomalies: [],
        summaryEn: 'No recorded vitals yet in personal health memory.',
        summaryTa: 'தனிப்பட்ட மருத்துவ நினைவகத்தில் இதுவரை அளவீடுகள் இல்லை.',
        contextPrompt: '',
      };
    }

    const anomalies: VitalAnomaly[] = [];

    // Helper to filter entries within last 30 days
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentLogs = this.entries.filter(
      (e) => new Date(e.timestamp).getTime() >= thirtyDaysAgo
    );

    // 1. Analyze Blood Pressure
    const bpLogs = recentLogs.filter((e) => e.type === 'blood_pressure');
    if (bpLogs.length > 0) {
      const latest = bpLogs[0].value as BloodPressureValue;
      if (bpLogs.length >= 2) {
        // Compute baseline from older readings (excluding the latest)
        const older = bpLogs.slice(1);
        const avgSys = Math.round(older.reduce((sum, e) => sum + (e.value as BloodPressureValue).systolic, 0) / older.length);
        const avgDia = Math.round(older.reduce((sum, e) => sum + (e.value as BloodPressureValue).diastolic, 0) / older.length);

        const deltaSys = latest.systolic - avgSys;
        const deltaDia = latest.diastolic - avgDia;

        let status: 'STABLE' | 'ELEVATED' | 'LOW' | 'CRITICAL' = 'STABLE';
        if (latest.systolic >= 180 || latest.diastolic >= 110) {
          status = 'CRITICAL';
        } else if (latest.systolic >= 140 || latest.diastolic >= 90 || deltaSys >= 15) {
          status = 'ELEVATED';
        } else if (latest.systolic < 90 || latest.diastolic < 60) {
          status = 'LOW';
        }

        if (status !== 'STABLE') {
          anomalies.push({
            type: 'blood_pressure',
            vitalLabel: 'Blood Pressure',
            currentDisplay: `${latest.systolic}/${latest.diastolic} mmHg`,
            baselineDisplay: `${avgSys}/${avgDia} mmHg (Average)`,
            deltaText: `${deltaSys >= 0 ? `+${deltaSys}` : deltaSys}/${deltaDia >= 0 ? `+${deltaDia}` : deltaDia} mmHg`,
            status,
            clinicalGuidanceEn:
              status === 'CRITICAL'
                ? 'Significantly elevated blood pressure. Immediate clinical review at the nearest hospital or emergency center is advised.'
                : `Currently ${latest.systolic}/${latest.diastolic} mmHg, which is higher than your usual baseline of ${avgSys}/${avgDia} mmHg. Rest in a quiet space, limit salt, and monitor again in 2 hours.`,
            clinicalGuidanceTa:
              status === 'CRITICAL'
                ? 'இரத்த அழுத்தம் மிக அதிகமாக உள்ளது. உடனடியாக அருகில் உள்ள அரசு அல்லது தனியார் மருத்துவமனையை அணுகவும்.'
                : `தற்போதைய இரத்த அழுத்தம் உங்கள் வழக்கமான அளவை விட சற்று அதிகமாக உள்ளது (${latest.systolic}/${latest.diastolic} mmHg). ஓய்வெடுக்கவும், 2 மணிநேரத்தில் மீண்டும் சோதிக்கவும்.`,
          });
        }
      } else {
        // Single reading check
        if (latest.systolic >= 140 || latest.diastolic >= 90) {
          anomalies.push({
            type: 'blood_pressure',
            vitalLabel: 'Blood Pressure',
            currentDisplay: `${latest.systolic}/${latest.diastolic} mmHg`,
            baselineDisplay: 'First Recorded Baseline',
            deltaText: 'New entry',
            status: latest.systolic >= 180 ? 'CRITICAL' : 'ELEVATED',
            clinicalGuidanceEn: 'Blood pressure is in the elevated range. Recommend periodic daily monitoring.',
            clinicalGuidanceTa: 'இரத்த அழுத்தம் சற்று அதிகமாக உள்ளது. தினமும் கண்காணிப்பது நல்லது.',
          });
        }
      }
    }

    // 2. Analyze Blood Sugar
    const sugarLogs = recentLogs.filter((e) => e.type === 'blood_sugar');
    if (sugarLogs.length > 0) {
      const latest = sugarLogs[0].value as BloodSugarValue;
      const isFasting = latest.timing === 'fasting';
      const highThreshold = isFasting ? 126 : 200;
      const lowThreshold = 70;

      if (latest.glucose >= highThreshold || latest.glucose <= lowThreshold) {
        const status = latest.glucose <= lowThreshold ? 'LOW' : latest.glucose >= 280 ? 'CRITICAL' : 'ELEVATED';
        anomalies.push({
          type: 'blood_sugar',
          vitalLabel: 'Blood Sugar',
          currentDisplay: `${latest.glucose} mg/dL (${latest.timing})`,
          baselineDisplay: isFasting ? 'Fasting Standard: <100 mg/dL' : 'Postprandial Standard: <140 mg/dL',
          deltaText: status === 'LOW' ? 'Below safe threshold' : 'Above target range',
          status,
          clinicalGuidanceEn:
            status === 'LOW'
              ? 'Low blood glucose (hypoglycemia risk). Consume half a glass of fruit juice or 3 teaspoons of sugar immediately.'
              : 'Blood sugar reading is elevated. Ensure hydration and follow your prescribed dietary guidelines.',
          clinicalGuidanceTa:
            status === 'LOW'
              ? 'சர்க்கரை அளவு குறைவாக உள்ளது (Hypoglycemia). உடனே இனிப்பு அல்லது பழச்சாறு உட்கொள்ளவும்.'
              : 'சர்க்கரை அளவு அதிகமாக உள்ளது. போதுமான தண்ணீர் குடிக்கவும்.',
        });
      }
    }

    // 3. Analyze Oxygen SpO2
    const spo2Logs = recentLogs.filter((e) => e.type === 'spo2');
    if (spo2Logs.length > 0) {
      const latest = spo2Logs[0].value as number;
      if (latest < 95) {
        anomalies.push({
          type: 'spo2',
          vitalLabel: 'Blood Oxygen (SpO2)',
          currentDisplay: `${latest}%`,
          baselineDisplay: 'Healthy Target: 95% - 100%',
          deltaText: `${latest - 95}% below target`,
          status: latest < 92 ? 'CRITICAL' : 'ELEVATED',
          clinicalGuidanceEn:
            latest < 92
              ? 'Oxygen level is significantly reduced. Seek emergency clinical attention or oxygen support immediately.'
              : 'Oxygen saturation is slightly below optimal. Practice deep seated breathing and verify with a pulse oximeter.',
          clinicalGuidanceTa:
            latest < 92
              ? 'ஆக்சிஜன் அளவு மிகவும் குறைந்துள்ளது. உடனடியாக மருத்துவமனைக்குச் செல்லவும்.'
              : 'ஆக்சிஜன் அளவு சற்று குறைவாக உள்ளது. சீராக மூச்சுவிடவும்.',
        });
      }
    }

    // 4. Analyze Temperature
    const tempLogs = recentLogs.filter((e) => e.type === 'temperature');
    if (tempLogs.length > 0) {
      const latest = tempLogs[0].value as number;
      if (latest >= 100.4) {
        anomalies.push({
          type: 'temperature',
          vitalLabel: 'Body Temperature',
          currentDisplay: `${latest}°F`,
          baselineDisplay: 'Normal: 98.6°F',
          deltaText: `+${(latest - 98.6).toFixed(1)}°F`,
          status: latest >= 103 ? 'CRITICAL' : 'ELEVATED',
          clinicalGuidanceEn:
            latest >= 103
              ? 'High-grade fever. Apply cool compresses to forehead and consult a physician.'
              : 'Low to moderate fever. Maintain hydration with warm fluids, rest, and monitor periodically.',
          clinicalGuidanceTa:
            latest >= 103
              ? 'அதிக காய்ச்சல் உள்ளது. குளிர்ந்த நீரில் துணியை நனைத்து நெற்றியில் வைக்கவும்.'
              : 'மிதமான காய்ச்சல். வெதுவெதுப்பான நீர் அருந்தவும், ஓய்வெடுக்கவும்.',
        });
      }
    }

    // Construct human bedside summaries
    const hasAnomalies = anomalies.length > 0;
    let summaryEn = '';
    let summaryTa = '';

    if (hasAnomalies) {
      summaryEn = anomalies.map((a) => `${a.vitalLabel}: ${a.currentDisplay} (${a.deltaText}) - ${a.clinicalGuidanceEn}`).join(' ');
      summaryTa = anomalies.map((a) => `${a.vitalLabel}: ${a.currentDisplay} - ${a.clinicalGuidanceTa}`).join(' ');
    } else {
      summaryEn = `All recent vitals (${recentLogs.length} logs) are within normal baseline ranges.`;
      summaryTa = `அனைத்து அண்மை அளவீடுகளும் இயல்பான அளவில் உள்ளன.`;
    }

    // Clean, concise prompt for Gemini grounding (zero technical jargons)
    const contextPrompt =
      `\n[PATIENT HEALTH MEMORY & VITALS BASELINE (Last 30 Days)]:\n` +
      `- Total Recorded Readings: ${recentLogs.length}\n` +
      anomalies
        .map(
          (a) =>
            `- ${a.vitalLabel}: Latest reading is ${a.currentDisplay} vs. baseline ${a.baselineDisplay}. Trend status: ${a.status}.`
        )
        .join('\n') +
      `\nClinical Guidance: Seamlessly integrate this vital baseline into your response if the patient's symptoms correlate, without reciting raw data coldly. Treat the patient with warm bedside reassurance.\n`;

    return {
      hasRecords: true,
      hasAnomalies,
      totalLogs: recentLogs.length,
      anomalies,
      summaryEn,
      summaryTa,
      contextPrompt,
    };
  }
}

export const healthMemoryService = new HealthMemoryService();
