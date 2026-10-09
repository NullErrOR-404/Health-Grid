// ==============================================================================
// HealthGrid Clinician Portal — Reactive Workflow Store & State Engine
// ==============================================================================

import type {
  ClinicianPortalTab,
  ClinicianProfile,
  FacilityEntity,
  PatientEntity,
  PatientQueueItem,
  ClinicalEncounter,
  ResultItem,
  FollowUpItem,
  ReferralItem,
  ClinicalInboxItem,
  OrderSetTemplate,
  OrderItem,
  MedicationReconciliationEntry,
  QueueItemStatus,
  QueueItemPriority,
  VisitType,
} from '../../types/clinician';

import {
  SEED_CLINICIAN,
  SEED_FACILITIES,
  SEED_PATIENTS,
  SEED_QUEUE_ITEMS,
  SEED_RESULTS,
  SEED_FOLLOW_UPS,
  SEED_REFERRALS,
  SEED_INBOX_ITEMS,
  SEED_ORDER_SETS,
  SEED_ENCOUNTERS,
  PATIENT_LOOKUP_MAP,
} from './clinicianDataSeed';
import { supabase } from '../supabaseClient';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'ORDER_SET' | 'SOAP_DRAFT' | 'HISTORY_SUMMARY' | 'ABNORMAL_RESULTS' | 'FOLLOW_UPS';
    title: string;
    description: string;
    items?: string[];
    actionLabel: string;
    onExecuteAction?: string;
  };
}

export interface ClinicianStoreState {
  activeTab: ClinicianPortalTab;
  clinician: ClinicianProfile;
  facilities: FacilityEntity[];
  selectedFacilityId: string;
  patients: PatientEntity[];
  queue: PatientQueueItem[];
  activeQueuePatientId: string | null;
  encounters: ClinicalEncounter[];
  activeEncounterId: string | null;
  results: ResultItem[];
  followUps: FollowUpItem[];
  referrals: ReferralItem[];
  inbox: ClinicalInboxItem[];
  orderSets: OrderSetTemplate[];
  globalPatientSearch: string;
  aiDrawerOpen: boolean;
  aiMessages: AiChatMessage[];
  isAiGenerating: boolean;
}

const STORAGE_KEY = 'healthgrid_clinician_store_v1';

class ClinicianWorkflowStore {
  private state: ClinicianStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
    this.initSupabaseSync();
  }

  private loadInitialState(): ClinicianStoreState {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            // Always ensure seed objects are healthy
            clinician: (parsed.clinician && parsed.clinician.id === SEED_CLINICIAN.id) ? parsed.clinician : SEED_CLINICIAN,
            facilities: parsed.facilities || SEED_FACILITIES,
            orderSets: parsed.orderSets || SEED_ORDER_SETS,
          };
        }
      } catch (e) {
        console.warn('Failed to parse cached clinician store:', e);
      }
    }

    const firstPatient = SEED_PATIENTS[0];
    const initialPatientId = firstPatient?.id || 'a9bd2039-a968-4986-b5d6-d5c9ffda10d5';

    return {
      activeTab: 'my-queue',
      clinician: SEED_CLINICIAN,
      facilities: SEED_FACILITIES,
      selectedFacilityId: SEED_FACILITIES[0].id,
      patients: SEED_PATIENTS,
      queue: SEED_QUEUE_ITEMS,
      activeQueuePatientId: initialPatientId,
      encounters: SEED_ENCOUNTERS,
      activeEncounterId: null,
      results: SEED_RESULTS,
      followUps: SEED_FOLLOW_UPS,
      referrals: SEED_REFERRALS,
      inbox: SEED_INBOX_ITEMS,
      orderSets: SEED_ORDER_SETS,
      globalPatientSearch: '',
      aiDrawerOpen: true,
      isAiGenerating: false,
      aiMessages: [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: `Good day ${SEED_CLINICIAN.name}! I have reviewed today's live queue (${SEED_QUEUE_ITEMS.length} patients). ${firstPatient?.name || 'Your patient'} is waiting in Room 101 with ${firstPatient?.primaryProblem || 'acute symptoms'}. Would you like a clinical brief before starting?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  private persist() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): ClinicianStoreState {
    return this.state;
  }

  // Navigation
  public setActiveTab(tab: ClinicianPortalTab) {
    this.state.activeTab = tab;
    this.persist();
  }

  public setSelectedFacility(facilityId: string) {
    this.state.selectedFacilityId = facilityId;
    const fac = this.state.facilities.find((f) => f.id === facilityId);
    if (fac) {
      this.state.clinician.facilityId = fac.id;
      this.state.clinician.facilityName = fac.name;
    }
    this.persist();
  }

  public setAiDrawerOpen(open: boolean) {
    this.state.aiDrawerOpen = open;
    this.persist();
  }

  public setGlobalPatientSearch(query: string) {
    this.state.globalPatientSearch = query;
    this.notify();
  }

  // Robust patient lookup supporting UUID, UHID, and legacy IDs
  public getPatient(patientId: string): PatientEntity | undefined {
    if (!patientId) return undefined;
    return (
      this.state.patients.find(
        (p) =>
          p.id === patientId ||
          p.uhid === patientId ||
          (p as any).legacyId === patientId
      ) ||
      PATIENT_LOOKUP_MAP.get(patientId) ||
      this.state.patients[0]
    );
  }

  public openChartForPatient(patientId: string) {
    const pat = this.getPatient(patientId);
    if (pat) {
      this.state.activeQueuePatientId = pat.id;
      this.state.activeTab = 'consultations';
      this.persist();
    }
  }

  // Live Supabase Synchronization
  public async initSupabaseSync(): Promise<void> {
    if (!supabase) return;
    await this.fetchFromSupabase();
    try {
      supabase
        .channel('clinician_patients_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
          this.fetchFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          this.fetchFromSupabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription warning:', err);
    }
  }

  public async fetchFromSupabase(): Promise<void> {
    try {
      if (!supabase) return;
      const { data: dbPatients } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbPatients && dbPatients.length > 0) {
        const livePatients: PatientEntity[] = dbPatients.map((p: any, idx: number) => {
          const existing = this.state.patients.find((ep) => ep.id === p.id || ep.uhid === p.health_id);
          if (existing) {
            return {
              ...existing,
              id: p.id,
              uhid: p.health_id || existing.uhid,
              name: p.full_name || existing.name,
              phone: p.phone_number || existing.phone,
              age: p.age || existing.age,
              gender: p.gender || existing.gender,
              bloodGroup: p.blood_group || existing.bloodGroup,
              email: p.email || existing.email,
              address: p.location || existing.address,
            };
          }
          return {
            id: p.id,
            uhid: p.health_id || `HG-${1000 + idx}`,
            abhaId: '****' + (p.health_id ? p.health_id.slice(-4) : '1000'),
            name: p.full_name || 'Patient',
            age: p.age || 30,
            gender: p.gender || 'Female',
            bloodGroup: p.blood_group || 'O+',
            phone: p.phone_number || '+91 90000 00000',
            email: p.email || '',
            address: p.location || 'Chennai, India',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            primaryProblem: p.chronic_conditions?.[0] || 'Routine Clinical Review',
            vitals: {
              tempF: 98.6,
              pulseBpm: 72,
              bpSystolic: 120,
              bpDiastolic: 80,
              spo2Percent: 98,
              recordedAt: '09:00 AM',
            },
            allergies: [],
            medications: [],
            problems: [],
            investigations: [],
            pastVisits: [],
            careGaps: [],
            careTeam: [{ role: 'Primary Physician', name: this.state.clinician.name, specialty: this.state.clinician.specialty }],
          };
        });

        this.state.patients = livePatients;
      }

      const { data: dbAppts } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_time', { ascending: true });

      if (dbAppts && dbAppts.length > 0) {
        const liveQueue: PatientQueueItem[] = dbAppts
          .filter((a: any) => !a.doctor_name || a.doctor_name.toLowerCase().includes('mohamed'))
          .map((a: any, idx: number) => {
            const pat = this.getPatient(a.patient_id) || this.getPatient(a.patient_health_id) || this.state.patients[0];
            return {
              id: `q_${a.id.slice(0, 8)}_${idx}`,
              patientId: pat.id,
              patient: pat,
              appointmentId: a.appointment_id || a.id,
              time: a.appointment_time || '09:30 AM',
              waitingMinutes: a.status === 'Waiting' || a.status === 'Checked In' ? 10 + idx * 3 : 0,
              status: (a.status === 'In Consultation' ? 'IN_CONSULTATION' : a.status === 'Completed' ? 'COMPLETED' : 'WAITING') as QueueItemStatus,
              priority: ((a.reason_for_visit || '').toLowerCase().includes('emergency') ? 'EMERGENCY' : (a.notes || '').toLowerCase().includes('high k+') ? 'URGENT' : 'ROUTINE') as QueueItemPriority,
              visitType: ((a.appointment_type || '').toLowerCase().includes('review') ? 'RESULT_REVIEW' : (a.appointment_type || '').toLowerCase().includes('follow') ? 'FOLLOW_UP' : 'NEW_PATIENT') as VisitType,
              chiefComplaint: a.reason_for_visit || pat.primaryProblem,
              roomNumber: 'Room 101',
            };
          });

        if (liveQueue.length > 0) {
          this.state.queue = liveQueue;
        }
      }

      this.persist();
    } catch (err) {
      console.warn('Clinician store fetchFromSupabase error:', err);
    }
  }

  public async deletePatient(patientId: string): Promise<boolean> {
    try {
      if (supabase) {
        await supabase.from('appointments').delete().or(`patient_id.eq.${patientId},patient_health_id.eq.${patientId}`);
        await supabase.from('user_roles').delete().eq('user_id', patientId);
        await supabase.from('patients').delete().or(`id.eq.${patientId},health_id.eq.${patientId}`);
      }
      this.state.patients = this.state.patients.filter((p) => p.id !== patientId && p.uhid !== patientId);
      this.state.queue = this.state.queue.filter((q) => q.patientId !== patientId && q.patient.uhid !== patientId);
      if (this.state.activeQueuePatientId === patientId) {
        this.state.activeQueuePatientId = this.state.queue[0]?.patientId || this.state.patients[0]?.id || null;
      }
      this.persist();
      return true;
    } catch (err) {
      console.error('Failed to delete patient from clinician store:', err);
      return false;
    }
  }

  // Queue Operations
  public selectQueuePatient(patientId: string) {
    this.state.activeQueuePatientId = patientId;
    this.persist();
  }

  public updateQueueStatus(queueItemId: string, newStatus: QueueItemStatus) {
    this.state.queue = this.state.queue.map((item) =>
      item.id === queueItemId ? { ...item, status: newStatus } : item
    );
    this.persist();
  }

  // Encounter & Consultation Lifecycle
  public startConsultation(patientId: string): ClinicalEncounter {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    // Check if encounter already exists for today
    let encounter = this.state.encounters.find(
      (e) => e.patientId === patient.id && e.status === 'IN_PROGRESS'
    );

    if (!encounter) {
      encounter = {
        id: `enc_${Date.now()}`,
        patientId: patient.id,
        patient,
        appointmentId: `apt_${Date.now()}`,
        clinicianId: this.state.clinician.id,
        facilityId: this.state.selectedFacilityId,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'IN_PROGRESS',
        visitType: patient.pastVisits.length > 0 ? 'FOLLOW_UP' : 'NEW_PATIENT',
        chiefComplaint: patient.primaryProblem,
        hpi: `${patient.name}, ${patient.age}yo ${patient.gender}, presents for clinical consultation regarding ${patient.primaryProblem}.`,
        ros: {},
        vitals: { ...patient.vitals },
        physicalExam: {
          general: 'Well-nourished, conscious, oriented to time, place, and person.',
        },
        assessment: `Clinical assessment in progress for ${patient.primaryProblem}.`,
        diagnoses: [...patient.problems],
        plan: 'Formulate diagnostic workup and targeted pharmacological therapy.',
        medicationReconciliations: patient.medications.map((m) => ({
          medicationId: m.id,
          medicationName: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          action: 'CONTINUE',
        })),
        orders: [],
        prescriptions: [],
        referrals: [],
        patientInstructions: 'Rest, hydrate, and adhere to prescribed medication regimen.',
        soapNote: {
          subjective: `Patient reports: ${patient.primaryProblem}.`,
          objective: `Vitals: Temp ${patient.vitals.tempF || 98.6}°F, PR ${patient.vitals.pulseBpm || 72} bpm, BP ${patient.vitals.bpSystolic || 120}/${patient.vitals.bpDiastolic || 80} mmHg.`,
          assessment: patient.primaryProblem,
          plan: 'Under clinical review.',
        },
      };
      this.state.encounters.unshift(encounter);
    }

    // Update Queue status
    this.state.queue = this.state.queue.map((q) =>
      q.patientId === patientId ? { ...q, status: 'IN_CONSULTATION' } : q
    );

    this.state.activeEncounterId = encounter.id;
    this.state.activeQueuePatientId = patientId;
    this.state.activeTab = 'consultations';
    this.persist();
    return encounter;
  }

  public updateEncounter(encounterId: string, partial: Partial<ClinicalEncounter>) {
    this.state.encounters = this.state.encounters.map((enc) =>
      enc.id === encounterId ? { ...enc, ...partial } : enc
    );
    this.persist();

    const enc = this.state.encounters.find((e) => e.id === encounterId);
    if (enc && supabase) {
      Promise.resolve(
        supabase.from('encounters').upsert({
          id: enc.id,
          patient_id: enc.patientId,
          doctor_id: enc.clinicianId,
          appointment_id: enc.appointmentId,
          status: enc.status,
          stage: (partial as any).stage || 'overview',
          chief_complaint: enc.chiefComplaint,
          hpi: enc.hpi,
          physical_exam: enc.physicalExam,
          assessment: enc.assessment,
          plan: enc.plan,
          patient_instructions: enc.patientInstructions,
          soap_note: enc.soapNote,
          signed_by: enc.signedBy,
          sign_off_timestamp: enc.signedAt,
          signature_hash: enc.signatureHash,
          updated_at: new Date().toISOString(),
        })
      ).catch((err: any) => console.warn('Supabase encounters upsert error:', err));
    }
  }

  public async signAndCloseEncounter(encounterId: string) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    const timestamp = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Generate cryptographic SHA-256 digital signature hash
    const signaturePayload = `${encounter.id}:${encounter.patientId}:${this.state.clinician.id}:${JSON.stringify(encounter.soapNote)}:${timestamp}`;
    let signatureHash = '';
    try {
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        const msgBuffer = new TextEncoder().encode(signaturePayload);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        signatureHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } else {
        signatureHash = `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      }
    } catch {
      signatureHash = `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }

    // Mark encounter SIGNED & LOCKED
    encounter.status = 'SIGNED';
    encounter.isLocked = true;
    encounter.signedAt = timestamp;
    encounter.signedBy = `${this.state.clinician.name}, ${this.state.clinician.title}`;
    encounter.signatureHash = signatureHash;
    encounter.endTime = timeStr;

    // Update patient's past visits
    const patient = this.state.patients.find((p) => p.id === encounter.patientId);
    if (patient) {
      patient.pastVisits.unshift({
        id: `vis_${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        reason: encounter.chiefComplaint,
        provider: this.state.clinician.name,
        facility: this.state.clinician.facilityName,
        summary: encounter.assessment || 'Completed clinical consultation.',
      });

      // Update patient medications if any were added
      if (encounter.prescriptions && encounter.prescriptions.length > 0) {
        encounter.prescriptions.forEach((rx) => {
          if (!patient.medications.some((m) => m.name.toLowerCase() === rx.medicineName.toLowerCase())) {
            patient.medications.push({
              id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: rx.medicineName,
              genericName: rx.medicineName,
              dosage: rx.dosage,
              route: 'Oral',
              frequency: rx.frequency,
              startDate: new Date().toISOString().split('T')[0],
              status: 'ACTIVE',
              prescriber: this.state.clinician.name,
              instructions: rx.instructions,
            });
          }
        });
      }

      // Add follow up if present
      if (encounter.followUp) {
        this.state.followUps.unshift(encounter.followUp);
      }

      // Add orders to orders list
      if (encounter.orders && encounter.orders.length > 0) {
        encounter.orders.forEach((ord) => {
          ord.status = 'SUBMITTED';
          this.state.results.unshift({
            id: `res_ord_${ord.id}`,
            orderId: ord.id,
            patientId: patient.id,
            patientName: patient.name,
            testName: ord.name,
            category: ord.category,
            date: 'Pending collection',
            status: 'NEW',
            isAbnormal: false,
            isCritical: false,
            value: 'In Process',
            interpretation: 'Sample accessioned at hospital lab.',
          });
        });
      }
    }

    // Mark Queue as COMPLETED
    this.state.queue = this.state.queue.map((q) =>
      q.patientId === encounter.patientId ? { ...q, status: 'COMPLETED' } : q
    );

    // Sync to Supabase in background
    if (supabase) {
      Promise.resolve(
        supabase.from('encounters').upsert({
          id: encounter.id,
          patient_id: encounter.patientId,
          doctor_id: encounter.clinicianId,
          appointment_id: encounter.appointmentId,
          status: 'SIGNED',
          stage: 'sign-off',
          chief_complaint: encounter.chiefComplaint,
          hpi: encounter.hpi,
          physical_exam: encounter.physicalExam,
          assessment: encounter.assessment,
          plan: encounter.plan,
          patient_instructions: encounter.patientInstructions,
          soap_note: encounter.soapNote,
          signed_by: encounter.signedBy,
          sign_off_timestamp: timestamp,
          signature_hash: signatureHash,
          updated_at: timestamp,
        })
      ).catch((err: any) => console.warn('Supabase encounters sign error:', err));

      if (encounter.appointmentId) {
        Promise.resolve(
          supabase.from('appointments').update({
            status: 'Completed',
          }).or(`id.eq.${encounter.appointmentId},appointment_id.eq.${encounter.appointmentId}`)
        ).catch((err: any) => console.warn('Supabase appointments update error:', err));
      }
    }

    this.state.activeEncounterId = null;
    this.state.activeTab = 'my-queue';
    this.persist();
  }

  // Medication Reconciliation
  public setMedicationReconciliationAction(
    encounterId: string,
    medicationId: string,
    action: MedicationReconciliationEntry['action'],
    notes?: string
  ) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    const existing = encounter.medicationReconciliations.find((m) => m.medicationId === medicationId);
    if (existing) {
      existing.action = action;
      if (notes) existing.notes = notes;
    }
    this.persist();
  }

  // Orders
  public addOrderToEncounter(encounterId: string, order: Omit<OrderItem, 'id' | 'orderedAt'>) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    const newOrder: OrderItem = {
      ...order,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    encounter.orders.push(newOrder);
    this.persist();

    if (supabase) {
      Promise.resolve(
        supabase.from('clinical_orders').insert({
          id: newOrder.id,
          encounter_id: encounterId,
          patient_id: encounter.patientId,
          category: newOrder.category,
          name: newOrder.name,
          code: newOrder.code,
          priority: newOrder.priority,
          status: newOrder.status,
          notes: newOrder.notes || '',
        })
      ).catch((err: any) => console.warn('Supabase clinical_orders insert error:', err));
    }
  }

  public removeOrderFromEncounter(encounterId: string, orderId: string) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    encounter.orders = encounter.orders.filter((o) => o.id !== orderId);
    this.persist();

    if (supabase) {
      Promise.resolve(
        supabase.from('clinical_orders').delete().eq('id', orderId)
      ).catch((err: any) => console.warn('Supabase clinical_orders delete error:', err));
    }
  }

  public applyOrderSetToEncounter(encounterId: string, orderSetId: string) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    const orderSet = this.state.orderSets.find((os) => os.id === orderSetId);
    if (!encounter || !orderSet) return;

    const newDbOrders: any[] = [];
    orderSet.items.forEach((item) => {
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orderObj: OrderItem = {
        id: orderId,
        encounterId,
        patientId: encounter.patientId,
        category: item.category,
        name: item.name,
        code: item.code,
        priority: 'ROUTINE',
        status: 'DRAFT',
        orderSetId: orderSet.id,
        orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: item.defaultNotes,
      };
      encounter.orders.push(orderObj);
      newDbOrders.push({
        id: orderId,
        encounter_id: encounterId,
        patient_id: encounter.patientId,
        category: item.category,
        name: item.name,
        code: item.code,
        priority: 'ROUTINE',
        status: 'DRAFT',
        notes: item.defaultNotes || '',
      });
    });

    this.persist();

    if (supabase && newDbOrders.length > 0) {
      Promise.resolve(
        supabase.from('clinical_orders').insert(newDbOrders)
      ).catch((err: any) => console.warn('Supabase clinical_orders batch insert error:', err));
    }
  }

  // Prescriptions
  public addPrescriptionToEncounter(
    encounterId: string,
    rx: ClinicalEncounter['prescriptions'][0]
  ) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    encounter.prescriptions.push(rx);
    this.persist();

    if (supabase) {
      Promise.resolve(
        supabase.from('prescriptions').insert({
          id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          encounter_id: encounterId,
          patient_id: encounter.patientId,
          medicine_name: rx.medicineName,
          dosage: rx.dosage,
          frequency: rx.frequency,
          duration: rx.duration,
          instructions: rx.instructions,
          is_generic: rx.isGeneric ?? true,
          jan_aushadhi_price: rx.janAushadhiPrice ?? 0,
          branded_price: rx.brandedPrice ?? 0,
        })
      ).catch((err: any) => console.warn('Supabase prescriptions insert error:', err));
    }
  }

  public removePrescriptionFromEncounter(encounterId: string, rxIndex: number) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter || rxIndex < 0 || rxIndex >= encounter.prescriptions.length) return;

    const removed = encounter.prescriptions[rxIndex];
    encounter.prescriptions.splice(rxIndex, 1);
    this.persist();

    if (supabase && removed) {
      Promise.resolve(
        supabase.from('prescriptions').delete()
          .match({ encounter_id: encounterId, medicine_name: removed.medicineName })
      ).catch((err: any) => console.warn('Supabase prescriptions delete error:', err));
    }
  }

  public swapPrescriptionAlternative(
    encounterId: string,
    contraindicatedMedName: string,
    alternative: NonNullable<ClinicalEncounter['prescriptions'][0]>
  ) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    encounter.prescriptions = encounter.prescriptions.filter(
      (rx) => rx.medicineName.toLowerCase() !== contraindicatedMedName.toLowerCase()
    );
    encounter.prescriptions.push(alternative);
    this.persist();

    if (supabase) {
      Promise.resolve(
        supabase.from('prescriptions').delete()
          .match({ encounter_id: encounterId, medicine_name: contraindicatedMedName })
      ).then(() => {
        return Promise.resolve(
          supabase.from('prescriptions').insert({
            id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            encounter_id: encounterId,
            patient_id: encounter.patientId,
            medicine_name: alternative.medicineName,
            dosage: alternative.dosage,
            frequency: alternative.frequency,
            duration: alternative.duration,
            instructions: alternative.instructions,
            is_generic: alternative.isGeneric ?? true,
            jan_aushadhi_price: alternative.janAushadhiPrice ?? 0,
            branded_price: alternative.brandedPrice ?? 0,
          })
        );
      }).catch((err: any) => console.warn('Supabase swap alternative error:', err));
    }
  }

  public addOverrideJustification(encounterId: string, alertId: string, reason: string) {
    const encounter = this.state.encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    if (!encounter.overrideJustifications) {
      encounter.overrideJustifications = {};
    }
    encounter.overrideJustifications[alertId] = reason;
    this.persist();
  }

  // Results Review
  public acknowledgeResult(resultId: string, reviewerNotes?: string) {
    this.state.results = this.state.results.map((res) =>
      res.id === resultId
        ? {
            ...res,
            status: 'REVIEWED',
            notes: reviewerNotes || 'Reviewed and signed by Dr. Mohamed.',
          }
        : res
    );

    // Update associated inbox item
    this.state.inbox = this.state.inbox.map((inb) =>
      inb.relatedId === resultId ? { ...inb, isRead: true, isActioned: true } : inb
    );

    this.persist();
  }

  // Inbox
  public markInboxItemRead(inboxId: string) {
    this.state.inbox = this.state.inbox.map((item) =>
      item.id === inboxId ? { ...item, isRead: true } : item
    );
    this.persist();
  }

  // HealthGrid AI Assistant Integration
  public async sendAiMessage(promptText: string) {
    const userMsg: AiChatMessage = {
      id: `ai_u_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.state.aiMessages.push(userMsg);
    this.state.isAiGenerating = true;
    this.notify();

    // Context resolution: Current active patient in queue or encounter
    const activePatient =
      this.state.patients.find((p) => p.id === this.state.activeQueuePatientId) ||
      this.state.patients[0];

    setTimeout(() => {
      let replyText = '';
      let actionCard: AiChatMessage['actionCard'] | undefined = undefined;
      const lower = promptText.toLowerCase();

      if (lower.includes('prepare me') || lower.includes('next patient')) {
        replyText = `**Pre-Visit Brief: ${activePatient.name} (28y F, Room 101)**\n• **Chief Complaint**: Fever & generalized body aches x 2 days.\n• **Vitals**: T 99.1°F, HR 98, BP 118/76 mmHg, SpO2 98%.\n• **Safety Alert**: Past Dengue in 2024. No known allergies.\n• **Recent CBC**: Normal baseline (Platelets 2.4L on 24 Sep).\nReady to launch encounter workspace whenever you wish.`;
        actionCard = {
          type: 'HISTORY_SUMMARY',
          title: `Start Encounter with ${activePatient.name}`,
          description: 'Launch dedicated consultation workspace with pre-populated pre-visit vitals & HPI.',
          actionLabel: 'Launch Consultation Workspace',
          onExecuteAction: 'START_CONSULTATION',
        };
      } else if (lower.includes('summarize') || lower.includes('history')) {
        replyText = `**Longitudinal Summary for ${activePatient.name} (UHID: ${activePatient.uhid})**\n• **Chronic Problems**: History of Dengue (2024 - Resolved).\n• **Recent Investigations**: CBC normal, Chest X-ray clear.\n• **Medications**: Nil active.\n• **Preventative**: Cervical screening due in 2 months.`;
        actionCard = {
          type: 'HISTORY_SUMMARY',
          title: 'Open Longitudinal Chart',
          description: 'Review complete 16-tab patient record, allergies, and lab history.',
          actionLabel: 'Open Full Chart',
          onExecuteAction: 'OPEN_CHART',
        };
      } else if (lower.includes('order a cbc') || lower.includes('order set') || lower.includes('cbc')) {
        replyText = `I have drafted the **Acute Febrile Illness & Dengue Workup** order set for **${activePatient.name}**:\n1. Complete Blood Count (CBC) with Platelets\n2. Dengue NS1 Rapid Antigen Card\n3. Peripheral Blood Smear for Parasites`;
        actionCard = {
          type: 'ORDER_SET',
          title: 'Review & Submit Febrile Order Set',
          description: '3 diagnostic investigations ready for review.',
          items: ['Complete Blood Count (CBC) with Platelets', 'Dengue NS1 Antigen Card', 'Peripheral Blood Smear'],
          actionLabel: 'Review & Add to Encounter',
          onExecuteAction: 'APPLY_FEBRILE_ORDER_SET',
        };
      } else if (lower.includes('draft') || lower.includes('note')) {
        replyText = `**Draft SOAP Note for ${activePatient.name}:**\n**S**: 28yo female with 48h fever, retro-orbital pain, severe myalgia.\n**O**: T 99.1°F, HR 98, BP 118/76 mmHg. Chest clear, abdomen soft, no petechiae.\n**A**: Acute viral syndrome; evaluate for arboviral illness.\n**P**: Oral hydration, Paracetamol 650mg TDS, order CBC/Dengue NS1.`;
        actionCard = {
          type: 'SOAP_DRAFT',
          title: 'SOAP Note Ready for Review',
          description: 'Pre-populated based on today’s nurse intake vitals and patient chief complaint.',
          actionLabel: 'Insert Draft into Encounter',
          onExecuteAction: 'INSERT_SOAP_DRAFT',
        };
      } else if (lower.includes('abnormal') || lower.includes('result')) {
        replyText = `You have **2 abnormal lab results** requiring attention:\n1. ⚠️ **Meena Iyer**: Serum Potassium **6.2 mmol/L** (CRITICAL HYPERKALEMIA) — On Enalapril & Spironolactone.\n2. **Ramesh Kumar**: HbA1c **8.1%** (Suboptimal diabetic control).`;
        actionCard = {
          type: 'ABNORMAL_RESULTS',
          title: 'Acknowledge Critical Potassium (Meena Iyer)',
          description: 'Serum K+ 6.2 mmol/L requires immediate medication hold and stat review.',
          actionLabel: 'Open Critical Result Review',
          onExecuteAction: 'OPEN_CRITICAL_RESULT',
        };
      } else if (lower.includes('follow-up') || lower.includes('due today')) {
        replyText = `**Follow-ups due today & this week:**\n• **Ramesh Kumar** (Today): HbA1c review & pharmacotherapy adjustment.\n• **Lakshmi Devi** (In 2 days): Knee osteoarthritis physio evaluation.\n• **Vikram S** (In 3 days): Post-procedure cyst review.`;
        actionCard = {
          type: 'FOLLOW_UPS',
          title: 'View Follow-ups Workspace',
          description: 'Review patient clinical timelines and schedule appointments.',
          actionLabel: 'Open Follow-ups Workspace',
          onExecuteAction: 'OPEN_FOLLOW_UPS',
        };
      } else {
        replyText = `I have updated the clinical working context for **${activePatient.name}**. Let me know if you would like me to draft documentation, order diagnostic panels, or reconcile medications.`;
      }

      this.state.aiMessages.push({
        id: `ai_a_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard,
      });

      this.state.isAiGenerating = false;
      this.persist();
    }, 700);
  }

  // Execute AI action card button
  public executeAiAction(actionCode: string) {
    if (actionCode === 'START_CONSULTATION' && this.state.activeQueuePatientId) {
      this.startConsultation(this.state.activeQueuePatientId);
    } else if (actionCode === 'OPEN_CHART' && this.state.activeQueuePatientId) {
      this.openChartForPatient(this.state.activeQueuePatientId);
    } else if (actionCode === 'APPLY_FEBRILE_ORDER_SET' && this.state.activeEncounterId) {
      this.applyOrderSetToEncounter(this.state.activeEncounterId, 'os_febrile_illness');
    } else if (actionCode === 'OPEN_CRITICAL_RESULT') {
      this.state.activeTab = 'inbox';
      this.persist();
    } else if (actionCode === 'OPEN_FOLLOW_UPS') {
      this.state.activeTab = 'follow-ups';
      this.persist();
    }
  }
}

export const clinicianStore = new ClinicianWorkflowStore();
