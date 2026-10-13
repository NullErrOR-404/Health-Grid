import React, { useState } from 'react';
import {
  Lock,
  Copy,
  Check,
  Send,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { type SoapNoteData } from '../../types/canvas';
import { ambientScribeService } from '../../services/ambientScribeService';
import { authService } from '../../services/authService';

interface SoapNoteArtifactProps {
  data: SoapNoteData;
  onUpdate?: (updatedData: SoapNoteData) => void;
  onSendToChat?: (text: string) => void;
}

export const SoapNoteArtifact: React.FC<SoapNoteArtifactProps> = ({
  data,
  onUpdate,
  onSendToChat,
}) => {
  const isDoctor = authService.isDoctor();
  const [note, setNote] = useState<SoapNoteData>(data);
  const [isSigning, setIsSigning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(!data.isSigned && isDoctor);

  const handleSign = async () => {
    setIsSigning(true);
    try {
      const signed = await ambientScribeService.signSoapNote(note);
      setNote(signed);
      setEditMode(false);
      onUpdate?.(signed);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCopy = () => {
    const text = `# CLINICAL ENCOUNTER NOTE (SOAP)\nPatient: ${note.patientName} (${note.patientId})\nDate: ${note.consultationDate}\nClinician: ${note.clinicianName} (${note.clinicianRegNo})\nStatus: ${note.isSigned ? 'SIGNED & LOCKED' : 'DRAFT'}\n\n## SUBJECTIVE\n${note.subjective.chiefComplaint}\n${note.subjective.historyOfPresentIllness}\n\n## OBJECTIVE\nVitals: BP: ${note.objective.vitals.bloodPressure || 'N/A'}, HR: ${note.objective.vitals.heartRate || 'N/A'}, SpO2: ${note.objective.vitals.spo2 || 'N/A'}%\nExam: ${note.objective.examinationFindings}\n\n## ASSESSMENT\n${note.assessment.primaryDiagnosis} (${note.assessment.icd10Code})\nReasoning: ${note.assessment.clinicalReasoning}\n\n## PLAN\nPrescriptions:\n${note.plan.prescriptions.map((p) => `- ${p.drug} ${p.dose} (${p.frequency}) for ${p.duration}`).join('\n')}\nOrders:\n${note.plan.diagnosticOrders.map((o) => `- ${o}`).join('\n')}\nCounseling:\n${note.plan.patientCounseling.map((c) => `- ${c}`).join('\n')}\nFollow-up: In ${note.plan.followUpDays} days\n\nSignature: ${note.digitalSignatureHash || 'UNSIGNED'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Clinical Metadata */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              Sovereign Clinical Record
            </span>
            {note.isSigned ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Digitally Locked (SHA-256)
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Edit2 className="w-3 h-3 text-amber-600" />
                Unsigned Draft
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Encounter Note • {note.patientName}
          </h3>
          <p className="text-xs text-slate-500">
            {note.consultationDate} • Attending: {note.clinicianName} ({note.clinicianRegNo})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {!note.isSigned && isDoctor && (
            <button
              onClick={handleSign}
              disabled={isSigning}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              {isSigning ? 'Hashing & Locking...' : 'Sign & Lock 🔒'}
            </button>
          )}

          {!note.isSigned && !isDoctor && (
            <span className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
              Physician Signature Pending
            </span>
          )}
        </div>
      </div>

      {/* S - Subjective */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px]">S</span>
            Subjective (Patient Narrative)
          </span>
          {note.isSigned && <span className="text-[10px] text-slate-400 font-mono">Immutable</span>}
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Chief Complaint</label>
            {editMode && !note.isSigned ? (
              <textarea
                value={note.subjective.chiefComplaint}
                onChange={(e) => {
                  const updated = { ...note, subjective: { ...note.subjective, chiefComplaint: e.target.value } };
                  setNote(updated);
                  onUpdate?.(updated);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                rows={2}
              />
            ) : (
              <p className="text-slate-800 font-medium">{note.subjective.chiefComplaint}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">History of Present Illness (HPI)</label>
            {editMode && !note.isSigned ? (
              <textarea
                value={note.subjective.historyOfPresentIllness}
                onChange={(e) => {
                  const updated = { ...note, subjective: { ...note.subjective, historyOfPresentIllness: e.target.value } };
                  setNote(updated);
                  onUpdate?.(updated);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                rows={3}
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">{note.subjective.historyOfPresentIllness}</p>
            )}
          </div>

          {note.subjective.patientVerbatim && (
            <div className="p-2.5 bg-slate-50 border-l-2 border-teal-500 rounded-r-lg text-[11px] text-slate-600 italic">
              {note.subjective.patientVerbatim}
            </div>
          )}
        </div>
      </div>

      {/* O - Objective */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[11px]">O</span>
            Objective (Vitals & Physical Exam)
          </span>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Blood Pressure</span>
            <span className="font-bold text-slate-900">{note.objective.vitals.bloodPressure || '120/80'}</span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Pulse / Heart Rate</span>
            <span className="font-bold text-slate-900">{note.objective.vitals.heartRate || 72} bpm</span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Oxygen SpO2</span>
            <span className="font-bold text-slate-900">{note.objective.vitals.spo2 || 99}%</span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Temperature</span>
            <span className="font-bold text-slate-900">{note.objective.vitals.temperature || '98.6 °F'}</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Physical Examination</label>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            {note.objective.examinationFindings}
          </p>
        </div>
      </div>

      {/* A - Assessment */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">A</span>
            Assessment & ICD-10 Diagnoses
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">{note.assessment.primaryDiagnosis}</h4>
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              ICD-10: {note.assessment.icd10Code}
            </span>
          </div>

          <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            {note.assessment.clinicalReasoning}
          </p>
        </div>
      </div>

      {/* P - Plan */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">P</span>
            Plan, Prescriptions & Follow-up
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Prescriptions */}
          {note.plan.prescriptions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                E-Prescriptions
              </span>
              <div className="space-y-1.5">
                {note.plan.prescriptions.map((rx, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{rx.drug}</span>
                      <span className="text-slate-500 ml-2 font-mono">{rx.dose} ({rx.route})</span>
                      <div className="text-[11px] text-slate-600">{rx.frequency} • {rx.duration}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Jan Aushadhi PMBJP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Orders */}
          {note.plan.diagnosticOrders.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Diagnostic Orders
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {note.plan.diagnosticOrders.map((ord, idx) => (
                  <li key={idx}>{ord}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-slate-600">
            <span>Review Interval: Follow-up in <strong>{note.plan.followUpDays} days</strong></span>
          </div>
        </div>
      </div>

      {/* Signature Seal Banner */}
      {note.isSigned && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-bold text-emerald-900">Signed & Cryptographically Sealed</div>
              <div className="text-[11px] text-emerald-700 font-mono">{note.digitalSignatureHash}</div>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600">{note.signedAt}</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={() => {
            const summary = `Ambient Scribe SOAP Note (${note.patientName}):\n• Primary Dx: ${note.assessment.primaryDiagnosis} (${note.assessment.icd10Code})\n• Rx Count: ${note.plan.prescriptions.length} items\n• Follow-up: ${note.plan.followUpDays} days\n• Signature: ${note.isSigned ? note.digitalSignatureHash : 'Unsigned'}`;
            onSendToChat?.(summary);
          }}
          className="px-3.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send Note Summary to Chat
        </button>
      </div>
    </div>
  );
};
