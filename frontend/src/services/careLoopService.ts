/**
 * HealthGrid Autonomous Proactive Care-Loop Recovery Engine
 * 
 * Manages continuous, longitudinal recovery tracking for patients.
 * Unlike reactive chatbots, DocBot proactively initiates follow-up check-ins
 * after 24 to 48 hours to evaluate recovery trajectory, prevent complications,
 * and escalate to 108 / PHC if symptoms deteriorate.
 * 
 * DESIGN CONSTRAINT: Zero emojis. Pure Lucide vector icons & crisp UI.
 */

import { supabase } from './supabaseClient';

export interface CareLoopFollowUp {
  id: string;
  userId: string;
  condition: string;
  initialSymptoms: string;
  prescribedRegimen?: string;
  scheduledAt: string; // ISO date string
  dueAt: string;       // ISO date string
  status: 'PENDING' | 'CHECKED_IN' | 'ESCALATED' | 'RESOLVED';
  followUpPromptEn: string;
  followUpPromptTa: string;
  patientResponse?: string;
  trajectory?: 'RECOVERING' | 'PERSISTENT' | 'DETERIORATING';
  lastEvaluatedAt?: string;
}

class CareLoopService {
  private activeLoops: CareLoopFollowUp[] = [];
  private listeners: Array<(loops: CareLoopFollowUp[]) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem('healthgrid_care_loops');
      if (data) {
        this.activeLoops = JSON.parse(data);
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('healthgrid_care_loops', JSON.stringify(this.activeLoops));
    } catch {
      // ignore
    }
    this.listeners.forEach((cb) => cb(this.activeLoops));
  }

  public subscribe(callback: (loops: CareLoopFollowUp[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.activeLoops);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public getActiveLoops(): CareLoopFollowUp[] {
    return [...this.activeLoops];
  }

  /**
   * Schedules a proactive clinical recovery check-in for a patient
   */
  public scheduleCareLoop(params: {
    userId: string;
    condition: string;
    initialSymptoms: string;
    prescribedRegimen?: string;
    hoursDelay?: number;
  }): CareLoopFollowUp {
    const hours = params.hoursDelay || 24;
    const now = new Date();
    const dueDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const followUpEn = `Vanakkam! This is DocBot following up on your ${params.condition} and symptoms (${params.initialSymptoms}). It has been ${hours} hours since our clinical consultation. How are you feeling today? Has your body temperature/discomfort settled, and are you taking your prescribed fluids/medications comfortably?`;
    
    const followUpTa = `வணக்கம்! உங்கள் ${params.condition} மற்றும் அறிகுறிகள் (${params.initialSymptoms}) குறித்து விசாரிக்க நான் வந்துள்ளேன். ஆலோசனை முடிந்து ${hours} மணிநேரம் ஆகியுள்ளது. இன்று உங்கள் உடல்நிலை எப்படி இருக்கிறது? காய்ச்சல்/வலி குறைந்துள்ளதா?`;

    const newLoop: CareLoopFollowUp = {
      id: `careloop-${Date.now()}`,
      userId: params.userId,
      condition: params.condition,
      initialSymptoms: params.initialSymptoms,
      prescribedRegimen: params.prescribedRegimen,
      scheduledAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
      status: 'PENDING',
      followUpPromptEn: followUpEn,
      followUpPromptTa: followUpTa,
    };

    // Replace existing loop for same condition or prepend
    this.activeLoops = [newLoop, ...this.activeLoops.filter((l) => l.condition !== params.condition)];
    this.saveToStorage();

    // Optionally sync with Supabase if available
    this.syncToDb(newLoop);

    return newLoop;
  }

  private async syncToDb(loop: CareLoopFollowUp) {
    if (!loop.userId || loop.userId.startsWith('guest')) return;
    try {
      await supabase.from('care_loops').upsert({
        id: loop.id,
        user_id: loop.userId,
        condition: loop.condition,
        initial_symptoms: loop.initialSymptoms,
        due_at: loop.dueAt,
        status: loop.status,
      });
    } catch {
      // ignore
    }
  }

  /**
   * Evaluates patient's recovery trajectory based on their check-in reply
   */
  public evaluatePatientCheckIn(
    loopId: string,
    patientReply: string
  ): {
    trajectory: 'RECOVERING' | 'PERSISTENT' | 'DETERIORATING';
    recommendationEn: string;
    recommendationTa: string;
    isEmergency: boolean;
  } {
    const lower = patientReply.toLowerCase();

    const isWorse =
      lower.includes('worse') ||
      lower.includes('high fever') ||
      lower.includes('chest pain') ||
      lower.includes('vomiting nonstop') ||
      lower.includes('cannot breathe') ||
      lower.includes('spreading') ||
      lower.includes('அதிகமாகிடுச்சு') ||
      lower.includes('ரொம்ப வலி');

    const isRecovering =
      lower.includes('better') ||
      lower.includes('cured') ||
      lower.includes('fever gone') ||
      lower.includes('improving') ||
      lower.includes('normal') ||
      lower.includes('fine') ||
      lower.includes('பரவாயில்ல') ||
      lower.includes('குறைஞ்சிருக்கு');

    let trajectory: 'RECOVERING' | 'PERSISTENT' | 'DETERIORATING' = 'PERSISTENT';
    let isEmergency = false;
    let recEn = '';
    let recTa = '';

    if (isWorse) {
      trajectory = 'DETERIORATING';
      isEmergency = lower.includes('chest pain') || lower.includes('cannot breathe');
      recEn = isEmergency
        ? 'DANGER ALERT: Your symptoms are worsening with critical red-flag signs. Initiating immediate 108 Emergency Ambulance dispatch. Please rest seated at 45 degrees.'
        : 'CLINICAL ALERT: Your symptoms have escalated rather than improving. Please visit your nearest 24/7 Primary Health Centre (PHC) or Government Hospital for an in-person physical assessment and lab tests today.';
      recTa = isEmergency
        ? 'அவசர எச்சரிக்கை: அறிகுறிகள் தீவிரமடைந்துள்ளன. உடனடியாக 108 ஆம்புலன்ஸ் சேவைக்கு அறிவிக்கப்படுகிறது. அமைதியாக ஓய்வெடுக்கவும்.'
        : 'மருத்துவ எச்சரிக்கை: அறிகுறிகள் சீரடையவில்லை. உடனடியாக உங்கள் அருகிலுள்ள ஆரம்ப சுகாதார நிலையம் அல்லது அரசு மருத்துவமனைக்கு நேரில் சென்று பரிசோதிக்கவும்.';
    } else if (isRecovering) {
      trajectory = 'RECOVERING';
      recEn = 'Excellent progress! Your recovery trajectory is clinically favorable. Continue completing your hydration, warm nutritious food, and prescribed medication course to prevent relapse.';
      recTa = 'மகிழ்ச்சியான செய்தி! உங்கள் உடல்நிலை சீராக குணமடைந்து வருகிறது. நீர்ச்சத்து மற்றும் உணவு முறையை தொடர்ந்து பின்பற்றி மருந்துகளை முழுமையாக முடிக்கவும்.';
    } else {
      trajectory = 'PERSISTENT';
      recEn = 'Your symptoms appear to be persisting without significant change. Continue your prescribed rest, hydration, and monitoring. If symptoms do not improve within the next 24 hours, an in-person evaluation is recommended.';
      recTa = 'அறிகுறிகள் இன்னும் மாறாமல் உள்ளன. போதுமான ஓய்வும் நீராகாரமும் எடுத்துக்கொள்ளவும். அடுத்த 24 மணிநேரத்தில் முன்னேற்றம் இல்லாவிட்டால் மருத்துவரை நேரில் அணுகவும்.';
    }

    // Update state
    this.activeLoops = this.activeLoops.map((l) => {
      if (l.id === loopId) {
        return {
          ...l,
          status: isWorse ? 'ESCALATED' : isRecovering ? 'RESOLVED' : 'CHECKED_IN',
          patientResponse: patientReply,
          trajectory,
          lastEvaluatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    this.saveToStorage();

    return {
      trajectory,
      recommendationEn: recEn,
      recommendationTa: recTa,
      isEmergency,
    };
  }

  /**
   * For presentation/testing: Simulates triggering the 24-hour follow-up immediately
   */
  public triggerImmediateSimulatedCheckIn(loopId: string): CareLoopFollowUp | null {
    const loop = this.activeLoops.find((l) => l.id === loopId);
    if (!loop) return null;
    return loop;
  }
}

export const careLoopService = new CareLoopService();
