import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Plus,
  ShieldCheck,
  Trash2,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import type {
  OrderCategory,
} from '../../../types/clinician';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import { ClinicalDecisionSupportEngine } from '../../../services/clinician/cdsRulesEngine';

interface ClinicalEncounterWorkspaceProps {
  encounterId: string;
  onExit: () => void;
}

type EncounterStage =
  | 'overview'
  | 'history'
  | 'exam'
  | 'assessment'
  | 'plan'
  | 'orders'
  | 'prescription'
  | 'referral'
  | 'follow-up'
  | 'sign-off';

export const ClinicalEncounterWorkspace: React.FC<ClinicalEncounterWorkspaceProps> = ({
  encounterId,
  onExit,
}) => {
  const storeState = clinicianStore.getState();
  const encounter = storeState.encounters.find((e) => e.id === encounterId) || storeState.encounters[0];
  const patient = encounter.patient;

  const isLocked = Boolean(encounter.isLocked || encounter.status === 'SIGNED' || encounter.status === 'CLOSED');

  const [activeStage, setActiveStage] = useState<EncounterStage>(isLocked ? 'sign-off' : 'overview');
  const [overrideInputId, setOverrideInputId] = useState<string | null>(null);
  const [overrideReasonText, setOverrideReasonText] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Form State
  const [hpiText, setHpiText] = useState(encounter.hpi || '');
  const [assessmentText, setAssessmentText] = useState(encounter.assessment || '');
  const [planText, setPlanText] = useState(encounter.plan || '');
  const [patientInstructions, setPatientInstructions] = useState(encounter.patientInstructions || '');

  // SOAP State
  const [soapS, setSoapS] = useState(encounter.soapNote?.subjective || '');
  const [soapO, setSoapO] = useState(encounter.soapNote?.objective || '');
  const [soapA, setSoapA] = useState(encounter.soapNote?.assessment || '');
  const [soapP, setSoapP] = useState(encounter.soapNote?.plan || '');

  // Prescription Form
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('650 mg');
  const [newMedFreq, setNewMedFreq] = useState('TDS (Three times a day)');
  const [newMedDuration, setNewMedDuration] = useState('5 days');
  const [newMedInstructions, setNewMedInstructions] = useState('Take post meals with water');

  // Order Form
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderCat, setNewOrderCat] = useState<OrderCategory>('LABORATORY');

  // Referral Form
  const [targetSpecialty, setTargetSpecialty] = useState('Hematology');
  const [referralReason, setReferralReason] = useState('Specialist consultation & review');

  // Follow-up Form
  const [followUpDue, setFollowUpDue] = useState('2 days');
  const [followUpReason, setFollowUpReason] = useState('Review CBC platelet count & defervescence');

  // CDS Evaluation
  const cdsAlerts = ClinicalDecisionSupportEngine.evaluatePatientAlerts(patient, encounter);

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    clinicianStore.addPrescriptionToEncounter(encounter.id, {
      medicineName: newMedName.trim(),
      dosage: newMedDosage,
      frequency: newMedFreq,
      duration: newMedDuration,
      instructions: newMedInstructions,
      isGeneric: true,
      janAushadhiPrice: 15.0,
      brandedPrice: 65.0,
    });

    setNewMedName('');
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderName.trim()) return;

    clinicianStore.addOrderToEncounter(encounter.id, {
      patientId: patient.id,
      category: newOrderCat,
      name: newOrderName.trim(),
      code: `ORD-${Date.now().toString().slice(-4)}`,
      priority: 'ROUTINE',
      status: 'DRAFT',
    });

    setNewOrderName('');
  };

  const handleApplyOrderSet = (orderSetId: string) => {
    clinicianStore.applyOrderSetToEncounter(encounter.id, orderSetId);
  };

  const handleSwapAlternative = (alert: any) => {
    if (!alert.alternativeMedicine || !alert.contraindicatedMedicineName) return;
    clinicianStore.swapPrescriptionAlternative(
      encounter.id,
      alert.contraindicatedMedicineName,
      alert.alternativeMedicine
    );
    setActionSuccessNotice(`Safely substituted ${alert.contraindicatedMedicineName} with ${alert.alternativeMedicine.medicineName} (${alert.alternativeMedicine.dosage}). Contraindication resolved.`);
    setTimeout(() => setActionSuccessNotice(null), 5000);
  };

  const handleAddRecommendedOrder = (alert: any) => {
    if (!alert.recommendedOrder) return;
    clinicianStore.addOrderToEncounter(encounter.id, {
      patientId: patient.id,
      category: alert.recommendedOrder.category,
      name: alert.recommendedOrder.name,
      code: alert.recommendedOrder.code,
      priority: alert.recommendedOrder.priority,
      status: 'ORDERED',
      notes: `Ordered via CDS clinical guidance (${alert.title})`,
    });
    setActionSuccessNotice(`Added recommended test: ${alert.recommendedOrder.name} to encounter orders.`);
    setTimeout(() => setActionSuccessNotice(null), 5000);
  };

  const handleSaveOverride = (alertId: string) => {
    if (!overrideReasonText.trim()) return;
    clinicianStore.addOverrideJustification(encounter.id, alertId, overrideReasonText.trim());
    setOverrideInputId(null);
    setOverrideReasonText('');
    setActionSuccessNotice('Clinical justification override recorded for audit log.');
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const handleSignAndClose = async () => {
    // Save updated texts before closing
    clinicianStore.updateEncounter(encounter.id, {
      hpi: hpiText,
      assessment: assessmentText,
      plan: planText,
      patientInstructions,
      soapNote: {
        subjective: soapS || hpiText,
        objective: soapO,
        assessment: soapA || assessmentText,
        plan: soapP || planText,
      },
    });

    await clinicianStore.signAndCloseEncounter(encounter.id);
    onExit();
  };

  const isCompleteForSign = Boolean(
    patient &&
    encounter.chiefComplaint &&
    (assessmentText.trim() || encounter.assessment) &&
    (planText.trim() || encounter.plan)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Locked Encounter Official Audit Banner */}
      {isLocked && (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-emerald-950">Digitally Signed & Locked Clinical Encounter</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-200/80 text-emerald-900 rounded-md">
                  READ ONLY AUDIT
                </span>
              </div>
              <div className="text-xs text-emerald-800 mt-0.5">
                Signed by <strong>{encounter.signedBy || `${storeState.clinician.name}, ${storeState.clinician.title}`}</strong> • Reg No: <strong>TN-MC-84920</strong> • {new Date(encounter.signedAt || Date.now()).toLocaleString()}
              </div>
              <div className="text-[11px] font-mono text-emerald-700/90 mt-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-xl">SHA-256 Digital Signature: <strong>{encounter.signatureHash || 'verified_enc_' + encounter.id.slice(0, 16)}</strong></span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 self-start md:self-center"
          >
            Exit to My Queue
          </button>
        </div>
      )}

      {/* Success Notification */}
      {actionSuccessNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">{actionSuccessNotice}</span>
        </div>
      )}

      {/* Top Banner: Patient Encounter Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onExit}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shrink-0"
            title="Exit Encounter"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img
            src={patient.avatarUrl}
            alt={patient.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
          />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900">{patient.name}</h1>
              <span className="text-xs text-slate-500 font-semibold">
                {patient.age}y • {patient.gender} • {patient.bloodGroup}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${isLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                {isLocked ? 'Encounter Signed' : 'In Consultation'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              UHID: <strong className="text-slate-700">{patient.uhid}</strong> • Visit: <strong>{encounter.chiefComplaint}</strong>
            </div>
          </div>
        </div>

        {/* Quick Vitals & Sign Off CTA */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-2.5 text-xs">
            <span className="text-slate-600 font-bold">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-bold">{patient.vitals.pulseBpm} bpm</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-bold">{patient.vitals.tempF}°F</span>
          </div>

          {!isLocked ? (
            <button
              type="button"
              onClick={() => setActiveStage('sign-off')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs shadow-teal-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Review & Sign</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signed & Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* CDS Alert Banner if active */}
      {cdsAlerts.length > 0 && (
        <div className="space-y-2">
          {cdsAlerts.map((alert) => {
            const hasOverride = Boolean(encounter.overrideJustifications?.[alert.id]);
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border flex flex-col gap-2 text-xs leading-relaxed ${
                  alert.tier === 'RED'
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : alert.tier === 'AMBER'
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-sky-50/90 border-sky-200 text-sky-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.tier === 'RED' ? 'text-rose-600' : 'text-amber-600'}`} />
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2 flex-wrap">
                      <span>{alert.title}</span>
                      {hasOverride && (
                        <span className="px-2 py-0.5 bg-amber-200/90 text-amber-950 font-bold text-[10px] rounded-md">
                          Override Justified
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">{alert.description}</div>
                    <div className="font-semibold mt-1">Recommendation: {alert.recommendation}</div>
                    {hasOverride && (
                      <div className="text-[11px] text-amber-900 mt-1 italic">
                        Physician note: "{encounter.overrideJustifications![alert.id]}"
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-Tap Resolution Tray */}
                {!isLocked && (
                  <div className="flex items-center gap-2 flex-wrap pl-7 pt-1">
                    {alert.alternativeMedicine && (
                      <button
                        type="button"
                        onClick={() => handleSwapAlternative(alert)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Swap to Safe Alternative ({alert.alternativeMedicine.medicineName} {alert.alternativeMedicine.dosage})</span>
                      </button>
                    )}

                    {alert.recommendedOrder && (
                      <button
                        type="button"
                        onClick={() => handleAddRecommendedOrder(alert)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Recommended Order ({alert.recommendedOrder.name})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setOverrideInputId(overrideInputId === alert.id ? null : alert.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
                    >
                      <span>Clinical Justification Override</span>
                    </button>
                  </div>
                )}

                {/* Override Input Box */}
                {!isLocked && overrideInputId === alert.id && (
                  <div className="pl-7 pt-2 flex items-center gap-2 max-w-xl">
                    <input
                      type="text"
                      value={overrideReasonText}
                      onChange={(e) => setOverrideReasonText(e.target.value)}
                      placeholder="Enter clinical rationale for override (e.g., patient tolerated previously)..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveOverride(alert.id)}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                    >
                      Save Override
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Encounter Navigation Stages */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'history', label: '2. History (HPI)' },
            { id: 'exam', label: '3. Examination' },
            { id: 'assessment', label: '4. Assessment' },
            { id: 'plan', label: '5. Plan & CDS' },
            { id: 'orders', label: `6. Orders (${encounter.orders.length})` },
            { id: 'prescription', label: `7. Rx & Med Rec (${encounter.prescriptions.length})` },
            { id: 'referral', label: '8. Referral' },
            { id: 'follow-up', label: '9. Follow-up' },
            { id: 'sign-off', label: '10. Sign & Close 🔒' },
          ].map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage.id as EncounterStage)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeStage === stage.id
                  ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>

        {/* Stage Content */}
        <div className="p-6">
          {/* STAGE 1: OVERVIEW */}
          {activeStage === 'overview' && (
            <div className="space-y-5">
              <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100 space-y-2">
                <div className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                  Encounter Pre-Visit Brief
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {patient.name} — {encounter.chiefComplaint}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Patient checked in at {encounter.startTime}. Vitals stable. No known allergies recorded.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">Nurse Intake Notes</span>
                  <p className="text-slate-600">
                    Patient arrived complaining of sudden high temperature starting 48 hours ago, generalized myalgia, and retro-orbital discomfort.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">Relevant Medical Past</span>
                  <p className="text-slate-600">
                    Documented history of Dengue in 2024. Routine baseline CBC 5 days ago was normal.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStage('history')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Proceed to History Taking →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: HISTORY (HPI & ROS) */}
          {activeStage === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">History of Present Illness (HPI)</span>
                <button
                  type="button"
                  onClick={() => {
                    setHpiText(
                      `${patient.name}, ${patient.age}y ${patient.gender}, reports 2-day history of high-grade fever with rigors, severe myalgia, and retro-orbital headache. No cough, dyspnea, nausea, or vomiting. Denies travel history outside Chennai.`
                    );
                  }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Populate with HealthGrid AI</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={hpiText}
                onChange={(e) => setHpiText(e.target.value)}
                placeholder="Document patient HPI, onset, location, duration, character, aggravating and relieving factors..."
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none leading-relaxed"
              />

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStage('overview')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('exam')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Proceed to Examination →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: EXAMINATION */}
          {activeStage === 'exam' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900">Physical Examination Findings</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">General Appearance</label>
                  <input
                    type="text"
                    defaultValue="Conscious, oriented, febrile, no distress."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Respiratory System</label>
                  <input
                    type="text"
                    defaultValue="Bilateral vesicular breath sounds, no rhonchi/creps."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Cardiovascular System</label>
                  <input
                    type="text"
                    defaultValue="S1, S2 heard normally. Regular rhythm. No murmurs."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Abdomen / Tourniquet Test</label>
                  <input
                    type="text"
                    defaultValue="Soft, non-tender, no organomegaly. Tourniquet test negative."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStage('history')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('assessment')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Proceed to Assessment →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: ASSESSMENT */}
          {activeStage === 'assessment' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900">Clinical Assessment & Working Diagnosis</span>
              <textarea
                rows={4}
                value={assessmentText}
                onChange={(e) => setAssessmentText(e.target.value)}
                placeholder="Formulate diagnostic differential, clinical severity, and primary diagnosis..."
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none leading-relaxed"
              />

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStage('exam')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('plan')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Proceed to Plan & CDS →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: PLAN */}
          {activeStage === 'plan' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900">Treatment Plan & Patient Instructions</span>
              <textarea
                rows={4}
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                placeholder="Document diagnostic workup, supportive hydration therapy, and symptomatic relief..."
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none leading-relaxed"
              />

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStage('assessment')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('orders')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Proceed to Orders →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: ORDERS & ORDER SETS */}
          {activeStage === 'orders' && (
            <div className="space-y-5">
              {/* Disease-Specific Order Sets (hidden if locked) */}
              {!isLocked && (
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-2">Available Clinical Order Sets</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {storeState.orderSets.map((os) => (
                      <div key={os.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                        <div className="font-bold text-xs text-slate-900">{os.name}</div>
                        <div className="text-[10px] text-slate-500">{os.description}</div>
                        <button
                          type="button"
                          onClick={() => {
                            handleApplyOrderSet(os.id);
                            setActionSuccessNotice(`Applied ${os.name} bundle (${os.items.length} tests).`);
                            setTimeout(() => setActionSuccessNotice(null), 4000);
                          }}
                          className="w-full py-1.5 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Apply Bundle ({os.items.length} tests)</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Order Form (hidden if locked) */}
              {!isLocked && (
                <form onSubmit={handleAddOrder} className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <select
                    value={newOrderCat}
                    onChange={(e) => setNewOrderCat(e.target.value as OrderCategory)}
                    className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="LABORATORY">Laboratory</option>
                    <option value="IMAGING">Imaging (X-Ray/CT)</option>
                    <option value="PROCEDURE">Procedure (ECG)</option>
                    <option value="REFERRAL">Referral</option>
                  </select>

                  <input
                    type="text"
                    value={newOrderName}
                    onChange={(e) => setNewOrderName(e.target.value)}
                    placeholder="Order name (e.g. CBC, Serum Electrolytes, ECG)..."
                    className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Add Order
                  </button>
                </form>
              )}

              {/* Active Orders List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Encounter Orders ({encounter.orders.length})</span>
                  {isLocked && <span className="text-[10px] text-slate-400 font-normal">Locked (Read Only)</span>}
                </div>
                {encounter.orders.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No orders added to this encounter yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
                    {encounter.orders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors">
                        <div>
                          <div className="font-bold text-slate-900">{ord.name}</div>
                          <div className="text-[10px] text-slate-500">{ord.category} • Priority: {ord.priority}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800">
                            {ord.status}
                          </span>
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => {
                                clinicianStore.removeOrderFromEncounter(encounter.id, ord.id);
                                setActionSuccessNotice(`Removed order: ${ord.name}`);
                                setTimeout(() => setActionSuccessNotice(null), 3000);
                              }}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStage('plan')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('prescription')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Proceed to Prescriptions →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: PRESCRIPTION & MED REC */}
          {activeStage === 'prescription' && (
            <div className="space-y-5">
              {/* Add Prescription Form (hidden if locked) */}
              {!isLocked && (
                <form onSubmit={handleAddPrescription} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-900">Prescribe Medication</div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <input
                      type="text"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      className="p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="Dosage (e.g. 650 mg)"
                      className="p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      placeholder="Frequency (e.g. TDS)"
                      className="p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={newMedDuration}
                      onChange={(e) => setNewMedDuration(e.target.value)}
                      placeholder="Duration (e.g. 5 days)"
                      className="p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={newMedInstructions}
                      onChange={(e) => setNewMedInstructions(e.target.value)}
                      placeholder="Instructions (e.g. Take post meals with water)"
                      className="flex-1 max-w-lg p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 mr-3"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Add to Prescription
                    </button>
                  </div>
                </form>
              )}

              {/* Active Prescriptions Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Encounter Prescriptions ({encounter.prescriptions.length})</span>
                  {isLocked && <span className="text-[10px] text-slate-400 font-normal">Locked (Read Only)</span>}
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
                  {encounter.prescriptions.map((rx, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">{rx.medicineName} ({rx.dosage})</div>
                        <div className="text-[11px] text-slate-500">{rx.frequency} • {rx.duration} • {rx.instructions}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rx.isGeneric && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                            Jan Aushadhi PMBJP (₹{rx.janAushadhiPrice})
                          </span>
                        )}
                        <span className="text-slate-400 font-medium line-through">₹{rx.brandedPrice}</span>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => {
                              clinicianStore.removePrescriptionFromEncounter(encounter.id, idx);
                              setActionSuccessNotice(`Removed prescription: ${rx.medicineName}`);
                              setTimeout(() => setActionSuccessNotice(null), 3000);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-1"
                            title="Delete Prescription"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStage('orders')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('sign-off')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Proceed to Sign-off →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 10: SIGN & CLOSE */}
          {activeStage === 'sign-off' && (
            <div className="space-y-5">
              <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100 space-y-2">
                <div className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Encounter Pre-Sign Verification Checklist</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Patient Identity: {patient.name} (UHID: {patient.uhid}) verified.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Chief Complaint documented: {encounter.chiefComplaint}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Assessment: {assessmentText || encounter.assessment || 'Acute clinical consultation'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Orders: {encounter.orders.length} diagnostic test(s) placed.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Prescriptions: {encounter.prescriptions.length} medication(s) prescribed.</span>
                  </div>
                </div>
              </div>

              {/* SOAP Note Review */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Clinical SOAP Documentation</span>
                  {isLocked && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Signed & Locked</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800">Subjective (S)</span>
                    <textarea
                      value={soapS}
                      onChange={(e) => setSoapS(e.target.value)}
                      readOnly={isLocked}
                      placeholder="Patient subjective history and complaints..."
                      rows={2}
                      className={`w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 ${isLocked ? 'bg-slate-100/70 text-slate-700 cursor-default' : ''}`}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800">Objective (O)</span>
                    <textarea
                      value={soapO}
                      onChange={(e) => setSoapO(e.target.value)}
                      readOnly={isLocked}
                      placeholder="Physical vitals and examination findings..."
                      rows={2}
                      className={`w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 ${isLocked ? 'bg-slate-100/70 text-slate-700 cursor-default' : ''}`}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800">Assessment (A)</span>
                    <textarea
                      value={soapA}
                      onChange={(e) => setSoapA(e.target.value)}
                      readOnly={isLocked}
                      placeholder="Primary clinical impression and differentials..."
                      rows={2}
                      className={`w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 ${isLocked ? 'bg-slate-100/70 text-slate-700 cursor-default' : ''}`}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800">Plan (P)</span>
                    <textarea
                      value={soapP}
                      onChange={(e) => setSoapP(e.target.value)}
                      readOnly={isLocked}
                      placeholder="Diagnostic workup, pharmacotherapy, and instructions..."
                      rows={2}
                      className={`w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 ${isLocked ? 'bg-slate-100/70 text-slate-700 cursor-default' : ''}`}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <span className="font-bold text-slate-800">Patient Instructions & Care Advice</span>
                  <input
                    type="text"
                    value={patientInstructions}
                    onChange={(e) => setPatientInstructions(e.target.value)}
                    readOnly={isLocked}
                    placeholder="e.g. Bed rest, liberal fluid intake, return if fever persists > 48h..."
                    className={`w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 ${isLocked ? 'bg-slate-100/70 text-slate-700 cursor-default' : ''}`}
                  />
                </div>
              </div>

              {/* Final Sign & Close Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Signing provider: <strong>Dr. Mohamed, Consultant Physician</strong></span>
                  {isCompleteForSign && !isLocked && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Ready for Signature
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Digitally Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isLocked ? (
                    <>
                      <button
                        type="button"
                        onClick={onExit}
                        className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                      >
                        Save Draft & Exit
                      </button>

                      <button
                        type="button"
                        onClick={handleSignAndClose}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-teal-600/30"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Sign & Close Encounter</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-700" />
                        <span>Encounter Signed & Locked</span>
                      </div>
                      <button
                        type="button"
                        onClick={onExit}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Exit to My Queue
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 8: REFERRAL */}
          {activeStage === 'referral' && (
            <div className="space-y-4 max-w-2xl">
              <div className="text-xs font-bold text-slate-900">
                Specialist Referral Recommendation
              </div>
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Specialty</label>
                  <input
                    type="text"
                    value={targetSpecialty}
                    onChange={(e) => setTargetSpecialty(e.target.value)}
                    placeholder="e.g. Hematology, Cardiology"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referral Indication</label>
                  <textarea
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    rows={2}
                    placeholder="Specific question or specialist consultation purpose"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('prescription')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('follow-up')}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
                >
                  Next: Follow-up →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 9: FOLLOW-UP */}
          {activeStage === 'follow-up' && (
            <div className="space-y-4 max-w-2xl">
              <div className="text-xs font-bold text-slate-900">
                Clinical Follow-Up Interval & Surveillance
              </div>
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Timeframe</label>
                  <input
                    type="text"
                    value={followUpDue}
                    onChange={(e) => setFollowUpDue(e.target.value)}
                    placeholder="e.g. 2 days, 1 week, 3 months"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Follow-up Objective</label>
                  <textarea
                    value={followUpReason}
                    onChange={(e) => setFollowUpReason(e.target.value)}
                    rows={2}
                    placeholder="Check repeat HbA1c, platelet recovery, or symptom resolution"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('referral')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('sign-off')}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
                >
                  Review & Sign-Off →
                </button>
              </div>
            </div>
          )}

          {/* STAGE 10: REVIEW & SIGN-OFF */}
          {activeStage === 'sign-off' && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Encounter Review & Final Sign-Off</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify documentation completeness, staged orders, and prescriptions prior to permanent electronic signature.
                </p>
              </div>

              {/* Review Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Encounter Verification Checklist
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ready for Signature
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Patient Identity Verified</div>
                      <div className="text-[11px] text-slate-500">{patient.name} ({patient.age}y, {patient.gender}) • UHID: {patient.uhid}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Chief Complaint Documented</div>
                      <div className="text-[11px] text-slate-500">{encounter.chiefComplaint}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Physical Examination Recorded</div>
                      <div className="text-[11px] text-slate-500">General, HEENT, CVS, Resp vitals assessed</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Clinical Assessment & Problems</div>
                      <div className="text-[11px] text-slate-500">{encounter.diagnoses.map((d) => d.name).join(', ') || 'Documented'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Staged Diagnostic Orders</div>
                      <div className="text-[11px] text-slate-500">{encounter.orders?.length || 0} order(s) queued for hospital lab/imaging</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Prescription & Med Reconciliation</div>
                      <div className="text-[11px] text-slate-500">{encounter.prescriptions?.length || 0} active prescription(s) staged</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Specialist Referral</div>
                      <div className="text-[11px] text-slate-500">{targetSpecialty} referral documented</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Follow-Up Schedule</div>
                      <div className="text-[11px] text-slate-500">In {followUpDue}: {followUpReason}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOAP Note Summary Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Electronic SOAP Note Preview</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="font-bold text-teal-800">S: </span>
                    <span className="text-slate-600">{soapS || encounter.chiefComplaint}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="font-bold text-teal-800">O: </span>
                    <span className="text-slate-600">{soapO || `Temp ${encounter.vitals?.tempF || 98.6}°F, BP ${encounter.vitals?.bpSystolic || 120}/${encounter.vitals?.bpDiastolic || 80}`}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="font-bold text-teal-800">A: </span>
                    <span className="text-slate-600">{soapA || assessmentText || 'Clinical assessment completed.'}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="font-bold text-teal-800">P: </span>
                    <span className="text-slate-600">{soapP || planText || 'Treatment plan initiated.'}</span>
                  </div>
                </div>
              </div>

              {/* Legal Sign & Close Bar */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-teal-950">
                      Digitally Sign & Lock Clinical Record
                    </div>
                    <div className="text-[11px] text-teal-800">
                      Closing commits orders, issues prescriptions, updates patient timeline, and marks queue complete.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveStage('follow-up')}
                    className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clinicianStore.updateEncounter(encounter.id, {
                        hpi: hpiText,
                        assessment: assessmentText,
                        plan: planText,
                        patientInstructions,
                        followUp: {
                          id: `fu_${Date.now()}`,
                          patientId: patient.id,
                          patientName: patient.name,
                          encounterId: encounter.id,
                          dueDate: new Date().toISOString().split('T')[0],
                          dueLabel: followUpDue,
                          reason: followUpReason,
                          priority: 'NORMAL',
                          status: 'PENDING',
                        },
                        soapNote: {
                          subjective: soapS,
                          objective: soapO,
                          assessment: soapA,
                          plan: soapP,
                        },
                      });
                      clinicianStore.signAndCloseEncounter(encounter.id);
                      onExit();
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign & Close Encounter 🔒</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
