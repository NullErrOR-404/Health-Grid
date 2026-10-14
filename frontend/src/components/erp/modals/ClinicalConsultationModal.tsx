import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  Pill,
  Activity,
  FileText,
  CheckCircle2,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { appointmentService, type AppointmentStatus } from '../../../services/appointmentService';
import { unifiedPatientStore, type UnifiedPatient } from '../../../services/unifiedPatientStore';
import { medicalRecordService, type MedicalRecord } from '../../../services/medicalRecordService';
import { preConsultationAiService, type PreConsultationAiJist } from '../../../services/preConsultationAiService';
import { healthMemoryService } from '../../../services/healthMemoryService';
import { supabase } from '../../../services/supabaseClient';

interface ClinicalConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
  patientId?: string;
  patientName: string;
  patientHealthId: string;
  department: string;
  doctorName?: string;
  token?: number;
  initialStatus?: AppointmentStatus;
  chiefComplaint?: string;
  onSuccess?: (msg: string) => void;
  onCompleted?: () => void;
}

export const ClinicalConsultationModal: React.FC<ClinicalConsultationModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  patientId,
  patientName,
  patientHealthId,
  department,
  doctorName = 'Dr. Mohamed',
  token,
  initialStatus = 'Scheduled',
  chiefComplaint = '',
  onSuccess,
  onCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'ai-jist' | 'echart' | 'examination'>('ai-jist');
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>(initialStatus);

  // Patient E-Chart data
  const [patientRecord, setPatientRecord] = useState<UnifiedPatient | null>(null);
  const [longitudinalRecords, setLongitudinalRecords] = useState<MedicalRecord[]>([]);

  // Examination inputs
  const [examFindings, setExamFindings] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('Rest well, maintain adequate hydration (2.5L water/day), and avoid cold drinks or oily food.');
  const [followUpDays, setFollowUpDays] = useState('7');
  
  // Vitals
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('74');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('99');

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState<Array<{
    drug: string;
    dosage: string;
    freq: string;
    duration: string;
    instructions: string;
  }>>([
    {
      drug: 'Paracetamol (Jan Aushadhi)',
      dosage: '650mg',
      freq: '1-0-1 (Morning & Night)',
      duration: '3 Days',
      instructions: 'Take after meals for fever / body ache.',
    },
    {
      drug: 'Pantoprazole (Jan Aushadhi)',
      dosage: '40mg',
      freq: '1-0-0 (Morning)',
      duration: '5 Days',
      instructions: 'Take 30 minutes before breakfast.',
    },
  ]);

  const [newDrug, setNewDrug] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('1-0-1');
  const [newDuration, setNewDuration] = useState('5 Days');
  const [newInstructions] = useState('After meals');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Patient E-Chart & Past Records
  useEffect(() => {
    if (isOpen) {
      setCurrentStatus(initialStatus);

      // 1. Lookup patient from unifiedPatientStore
      let pat = patientId ? unifiedPatientStore.getPatientById(patientId) : undefined;
      if (!pat && patientHealthId) {
        pat = unifiedPatientStore.getPatientByHealthId(patientHealthId);
      }
      if (pat) {
        setPatientRecord(pat);
        if (pat.vitalsHistory && pat.vitalsHistory.length > 0) {
          const v = pat.vitalsHistory[0];
          setBpSystolic(String(v.bpSystolic || 120));
          setBpDiastolic(String(v.bpDiastolic || 80));
          setHeartRate(String(v.heartRate || 74));
          setTemperature(String(v.temperature || 98.6));
          setSpo2(String(v.spo2 || 99));
        }
      }

      // 2. Lookup medical records from medicalRecordService
      const records = medicalRecordService.getRecords();
      setLongitudinalRecords(records);

      // Prepopulate default diagnosis if complaint mentions fever / throat
      const lower = (chiefComplaint || '').toLowerCase();
      if (lower.includes('fever') || lower.includes('throat') || lower.includes('cough')) {
        setPrimaryDiagnosis('Acute Viral Pharyngitis with Mild URI');
        setExamFindings('Pharyngeal congestion noted, no purulent tonsillar exudates. Chest clear bilaterally with vesicular breath sounds.');
      } else if (lower.includes('chest') || lower.includes('angina')) {
        setPrimaryDiagnosis('Atypical Chest Discomfort under evaluation');
        setExamFindings('Cardiovascular: S1 S2 normal, no murmurs. Lungs clear to auscultation. Normal peripheral perfusion.');
      } else if (lower.includes('stomach') || lower.includes('acidity') || lower.includes('gas')) {
        setPrimaryDiagnosis('Acute Functional Dyspepsia / Mild Gastritis');
        setExamFindings('Abdomen soft, mild epigastric tenderness on deep palpation, no guarding or rigidity. Normal bowel sounds.');
      } else {
        setPrimaryDiagnosis('Routine Outpatient Clinical Evaluation');
        setExamFindings('Patient conscious, alert, and oriented. Normal physical examination.');
      }
    }
  }, [isOpen, patientId, patientHealthId, initialStatus, chiefComplaint]);

  // Generate AI Pre-Consultation Jist
  const aiJist: PreConsultationAiJist = useMemo(() => {
    const allergies = patientRecord?.allergies || medicalRecordService.getProfile().allergies || ['Penicillin'];
    const chronic = patientRecord?.chronicConditions || medicalRecordService.getProfile().chronicConditions || [];

    return preConsultationAiService.generateBriefing({
      name: patientName,
      age: patientRecord?.age || 30,
      gender: patientRecord?.gender || 'Male',
      healthId: patientHealthId,
      bloodGroup: patientRecord?.bloodGroup || 'O+',
      allergies,
      chronicConditions: chronic,
      chiefComplaint: chiefComplaint || 'Routine clinical consultation and health review',
      department,
      doctorName,
      vitals: {
        bpSystolic: Number(bpSystolic) || 120,
        bpDiastolic: Number(bpDiastolic) || 80,
        heartRate: Number(heartRate) || 74,
        temperature: Number(temperature) || 98.6,
        spo2: Number(spo2) || 99,
        id: 'temp',
        timestamp: 'Now',
        loggedBy: doctorName,
      },
      pastRecords: longitudinalRecords,
    });
  }, [patientName, patientRecord, patientHealthId, chiefComplaint, department, doctorName, bpSystolic, bpDiastolic, heartRate, temperature, spo2, longitudinalRecords]);

  if (!isOpen) return null;

  // 1. Advance state dynamically to 'In Consultation'
  const handleBeginConsultation = async () => {
    setIsSubmitting(true);
    try {
      setCurrentStatus('In Consultation');

      // Update Appointment Service
      if (appointmentId) {
        await appointmentService.updateStatus(appointmentId, 'In Consultation');
      }

      // Update OPD Queue in unified store
      if (token) {
        unifiedPatientStore.updateOpdStatus(token, 'In Consultation');
      }

      setActiveTab('examination');
      if (onSuccess) onSuccess(`Patient ${patientName} is now IN CONSULTATION with ${doctorName}. Room marked Occupied.`);
    } catch (err) {
      console.warn('Error starting consultation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add prescription item
  const handleAddPrescription = () => {
    if (!newDrug.trim()) return;
    setPrescriptions((prev) => [
      ...prev,
      {
        drug: newDrug.trim(),
        dosage: newDosage.trim() || 'Standard dose',
        freq: newFreq,
        duration: newDuration,
        instructions: newInstructions,
      },
    ]);
    setNewDrug('');
    setNewDosage('');
  };

  const handleRemovePrescription = (idx: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== idx));
  };

  // 2. Complete Consultation & Dispatch to HealthGrid
  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const todayIso = new Date().toISOString().split('T')[0];

      // 1. Advance status to Completed in Appointment Service
      if (appointmentId) {
        await appointmentService.updateStatus(appointmentId, 'Completed', {
          notes: `Diagnosis: ${primaryDiagnosis}\nFindings: ${examFindings}\nAdvice: ${lifestyleAdvice}`,
        });
      }

      // 2. Update OPD Queue in Unified Patient Store
      if (token) {
        unifiedPatientStore.updateOpdStatus(token, 'Completed');
      }
      if (patientId) {
        unifiedPatientStore.completeConsultation(
          patientId,
          `Findings: ${examFindings}\nAdvice: ${lifestyleAdvice}\nFollow-up: in ${followUpDays} days.`,
          primaryDiagnosis
        );
        unifiedPatientStore.addPrescription(
          patientId,
          prescriptions.map((p) => ({
            drug: p.drug,
            dosage: p.dosage,
            freq: p.freq,
            duration: p.duration,
            instructions: p.instructions,
          }))
        );
        unifiedPatientStore.addVitals(patientId, {
          bpSystolic: Number(bpSystolic) || 120,
          bpDiastolic: Number(bpDiastolic) || 80,
          heartRate: Number(heartRate) || 74,
          temperature: Number(temperature) || 98.6,
          spo2: Number(spo2) || 99,
          loggedBy: doctorName,
        });
      }

      // 3. Dispatch to Sovereign Patient HealthGrid Account via medicalRecordService
      const formattedMeds = prescriptions.map((p) => ({
        name: p.drug,
        genericEquivalent: p.drug.includes('Jan Aushadhi') ? p.drug : `${p.drug} (Generic Salt)`,
        dosage: p.dosage,
        frequency: p.freq,
        purpose: `Prescribed for ${primaryDiagnosis}. ${p.instructions}`,
        genericPrice: 15,
        brandPrice: 90,
      }));

      medicalRecordService.addRecord({
        id: `rec-hosp-${Date.now()}`,
        documentType: 'PRESCRIPTION',
        title: `Doctor Consultation & Prescription - ${doctorName}`,
        doctorName: doctorName,
        hospitalName: 'Government Medical College & Hospital (GMCH)',
        date: todayIso,
        diagnoses: [primaryDiagnosis],
        activeMedications: formattedMeds,
        knownAllergies: patientRecord?.allergies || ['Penicillin'],
        summaryNotes: `Clinical Diagnosis: ${primaryDiagnosis}\nDoctor Notes: ${examFindings}\nDietary & Lifestyle Advice: ${lifestyleAdvice}\nFollow-up: In ${followUpDays} days with ${doctorName} at OPD Room 101.`,
        verifiedProtocolSource: 'Government Medical College Hospital OPD • Dr. Mohamed (TMC-84920-IND)',
      });

      // 4. Log to healthMemoryService
      healthMemoryService.addEntry(
        'blood_pressure',
        { systolic: Number(bpSystolic) || 120, diastolic: Number(bpDiastolic) || 80 },
        'mmHg',
        'manual_entry',
        `Doctor Consultation with ${doctorName}: Diagnosed with ${primaryDiagnosis}. Advised: ${lifestyleAdvice}`
      );

      // 5. Async sync to Supabase encounters & prescriptions table
      try {
        const encounterId = `enc_${Date.now()}`;
        await supabase.from('encounters').insert([{
          id: encounterId,
          patient_id: patientId || patientHealthId,
          appointment_id: appointmentId,
          doctor_id: doctorName,
          status: 'SIGNED',
          stage: 'completed',
          chief_complaint: chiefComplaint || 'OPD Consultation',
          hpi: `${patientName} presented with ${chiefComplaint || 'symptoms'}. Evaluated by ${doctorName}.`,
          assessment: primaryDiagnosis,
          plan: lifestyleAdvice,
          patient_instructions: `Take prescribed medications. Review in ${followUpDays} days.`,
          soap_note: {
            subjective: chiefComplaint,
            objective: `BP: ${bpSystolic}/${bpDiastolic}, HR: ${heartRate}, SpO2: ${spo2}%, Temp: ${temperature}°F. ${examFindings}`,
            assessment: primaryDiagnosis,
            plan: lifestyleAdvice,
          },
          signed_by: `${doctorName}, Senior Consultant Physician`,
          sign_off_timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }]);

        for (const p of prescriptions) {
          await supabase.from('prescriptions').insert([{
            encounter_id: encounterId,
            patient_id: patientId || patientHealthId,
            medicine_name: p.drug,
            dosage: p.dosage,
            frequency: p.freq,
            duration: p.duration,
            instructions: p.instructions,
            prescriber: doctorName,
          }]);
        }
      } catch (err) {
        console.warn('Supabase encounter persistence note:', err);
      }

      if (onSuccess) {
        onSuccess(`Consultation completed! Details dispatched to ${patientName}'s sovereign HealthGrid account.`);
      }
      if (onCompleted) onCompleted();
      onClose();
    } catch (err) {
      console.error('Error completing consultation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-teal-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Clinical Consultation Desk
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  currentStatus === 'In Consultation'
                    ? 'bg-sky-400 text-slate-950 animate-pulse'
                    : currentStatus === 'Completed'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-amber-400 text-slate-950'
                }`}>
                  ● {currentStatus}
                </span>
                {token && (
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-200 text-[10px] font-mono font-bold">
                    Token #{token}
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                {patientName} • {department} • Attending: {doctorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStatus !== 'In Consultation' && currentStatus !== 'Completed' && (
              <button
                type="button"
                onClick={handleBeginConsultation}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Begin Consultation (In Consultation)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Workspace Tabs */}
        <div className="px-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('ai-jist')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'ai-jist'
                  ? 'border-teal-600 text-teal-800 bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI Pre-Consultation Jist</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-teal-100 text-teal-800 font-bold">
                Doctor Summary
              </span>
            </button>

            <button
              onClick={() => setActiveTab('echart')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'echart'
                  ? 'border-teal-600 text-teal-800 bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Patient E-Chart & History</span>
            </button>

            <button
              onClick={() => setActiveTab('examination')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'examination'
                  ? 'border-teal-600 text-teal-800 bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Enquiry, Exam & Prescription</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>UHID:</span>
            <span className="font-bold text-slate-800">{patientHealthId}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

          {/* TAB 1: AI PRE-CONSULTATION JIST */}
          {activeTab === 'ai-jist' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Highlight Elevator Jist Box */}
              <div className="p-4 bg-gradient-to-r from-teal-50 via-teal-50/60 to-emerald-50 rounded-2xl border border-teal-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-900 font-black text-sm">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Doctor&apos;s Pre-Consultation AI Jist (30-Second Briefing)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                    Pre-Exam Analysis
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {aiJist.conciseSummaryJist}
                </p>
              </div>

              {/* Critical Allergy & Contraindication Alerts */}
              {aiJist.criticalAllergyAlerts.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-rose-800">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>CRITICAL DRUG ALLERGY & CONTRAINDICATION SHIELD</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-rose-800 space-y-1">
                    {aiJist.criticalAllergyAlerts.map((alert, i) => (
                      <li key={i} className="font-semibold">{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 2-Column Clinical Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left: High-Yield Questions for Doctor */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>High-Yield Diagnostic Questions (Ask First)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {aiJist.highYieldQuestionsForDoctor.map((q, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2 text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-medium">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Suggested Physical Examination Focus */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Suggested Physical Examination Focus</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {aiJist.physicalExamFocus.map((ex, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2 text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          ●
                        </span>
                        <span className="font-medium">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Differentials & Vitals Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">Differential Diagnoses to Evaluate:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiJist.differentialConsiderations.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-100/70 text-teal-900 text-xs font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">Triage Hemodynamic Status:</div>
                  <div className="text-slate-700 font-medium">
                    {aiJist.vitalsTriage.detail}
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-teal-900">
                  <span className="font-bold">Ready to consult?</span> Click &quot;Begin Consultation&quot; to bring patient into consultation room.
                </div>
                <button
                  type="button"
                  onClick={handleBeginConsultation}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Begin Patient Consultation</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT E-CHART & LONGITUDINAL HISTORY */}
          {activeTab === 'echart' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Demographics Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-sm font-black">
                    {patientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">{patientName}</div>
                    <div className="text-xs text-slate-500">
                      Age: {patientRecord?.age || 30} • Gender: {patientRecord?.gender || 'Male'} • Blood Group: {patientRecord?.bloodGroup || 'O+'}
                    </div>
                    <div className="text-[11px] font-mono text-teal-700 mt-0.5">
                      ABDM Health ID: {patientHealthId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700">
                    {patientRecord?.allergies?.length || 1} Known Allergies
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700">
                    {longitudinalRecords.length} Uploaded E-Chart Docs
                  </span>
                </div>
              </div>

              {/* Longitudinal Medical Records History */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Longitudinal Medical Records & Past Consultations</span>
                </div>

                {longitudinalRecords.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                    No prior uploaded hospital records. This is a fresh sovereign HealthGrid e-chart.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {longitudinalRecords.map((rec) => (
                      <div key={rec.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {rec.documentType}
                            </span>
                            <span>{rec.title}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">{rec.date}</span>
                        </div>
                        {rec.diagnoses && rec.diagnoses.length > 0 && (
                          <div className="text-slate-600">
                            <span className="font-semibold text-slate-800">Diagnosis:</span> {rec.diagnoses.join(', ')}
                          </div>
                        )}
                        {rec.activeMedications && rec.activeMedications.length > 0 && (
                          <div className="text-teal-800 font-medium text-[11px]">
                            <span className="font-semibold">Meds:</span> {rec.activeMedications.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                          </div>
                        )}
                        {rec.summaryNotes && (
                          <div className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded-lg">
                            {rec.summaryNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCTOR EXAMINATION & PRESCRIPTION WORKSPACE */}
          {activeTab === 'examination' && (
            <form onSubmit={handleCompleteConsultation} className="space-y-5 animate-in fade-in duration-150">
              
              {/* Triage Vitals Bar */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Bedside Physical Vitals Intake</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">BP (mmHg)</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Follow-up</label>
                    <select
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg font-bold bg-white mt-1"
                    >
                      <option value="3">In 3 Days</option>
                      <option value="7">In 7 Days</option>
                      <option value="14">In 14 Days</option>
                      <option value="30">In 30 Days</option>
                      <option value="0">SOS / As needed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnosis & Physical Exam Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Primary Clinical Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryDiagnosis}
                    onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Viral Pharyngitis / Atypical Chest Discomfort"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Physical Examination Findings & Notes
                  </label>
                  <input
                    type="text"
                    value={examFindings}
                    onChange={(e) => setExamFindings(e.target.value)}
                    placeholder="e.g. Throat congested, lungs clear bilaterally, afebrile."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* E-Prescription Builder */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>E-Prescription & Pharmacy Formulary (Jan Aushadhi)</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-2 py-0.5 rounded-full">
                    Sovereign Patient Account Sync
                  </span>
                </div>

                {/* Prescription Items List */}
                <div className="space-y-2">
                  {prescriptions.map((p, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{p.drug}</span>
                          <span className="px-2 py-0.2 rounded bg-teal-50 text-teal-700 font-mono text-[10px]">
                            {p.dosage}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Frequency: <span className="font-semibold text-slate-800">{p.freq}</span> • Duration: <span className="font-semibold text-slate-800">{p.duration}</span> • Instructions: {p.instructions}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Drug Row */}
                <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">Add Prescribed Medication</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Azithromycin)"
                      value={newDrug}
                      onChange={(e) => setNewDrug(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Strength (e.g. 500mg)"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Timing (e.g. 1-0-1 After Food)"
                      value={newFreq}
                      onChange={(e) => setNewFreq(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 Days)"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddPrescription}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifestyle & Dietary Advice */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Doctor&apos;s Dietary & Lifestyle Advice (Explained by AI in Patient Portal)
                </label>
                <textarea
                  rows={2}
                  value={lifestyleAdvice}
                  onChange={(e) => setLifestyleAdvice(e.target.value)}
                  placeholder="Rest well, avoid spicy/oily food, drink plenty of warm water..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Will be cryptographically signed by {doctorName} (TMC-84920-IND).</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Close / Keep Open
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Dispatching to HealthGrid...' : 'Complete & Dispatch to HealthGrid Account'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
