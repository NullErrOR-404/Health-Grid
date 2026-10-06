import React, { useState } from 'react';
import { X, Stethoscope, CheckCircle2 } from 'lucide-react';
import { unifiedPatientStore } from '../../../services/unifiedPatientStore';

interface StartConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  department: string;
  token?: number;
  onCompleted?: () => void;
}

export const StartConsultationModal: React.FC<StartConsultationModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  department,
  token,
  onCompleted,
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [complaint, setComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState('7');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullNotes = `Chief Complaint: ${complaint || 'Routine review'}\nClinical Findings: ${clinicalNotes || 'Normal vitals and examination'}\nFollow-up: in ${followUpDays} days.`;
    
    unifiedPatientStore.completeConsultation(
      patientId,
      fullNotes,
      diagnosis || `${department} evaluation`
    );

    if (token) {
      unifiedPatientStore.updateOpdStatus(token, 'Completed');
    }

    if (onCompleted) onCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Clinical Consultation</h3>
              <p className="text-xs text-slate-500">
                Patient: {patientName} • {department} {token ? `(Token #${token})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Chief Complaints / Presenting Symptoms
            </label>
            <input
              type="text"
              required
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. Mild chest heaviness post-exertion, sore throat for 2 days"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Primary Diagnosis / Clinical Impression
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Atypical Angina under evaluation, Acute URI"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Clinical Notes & Examination Findings
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Patient afebrile, chest clear, regular heart sounds. Advised rest, hydration, and prescribed Jan Aushadhi generic regimen."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Recommended Follow-up (Days)
            </label>
            <select
              value={followUpDays}
              onChange={(e) => setFollowUpDays(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="3">3 Days (Acute review)</option>
              <option value="7">7 Days (Routine follow-up)</option>
              <option value="14">14 Days (Post-medication)</option>
              <option value="30">30 Days (Chronic refill / review)</option>
              <option value="0">SOS / As needed only</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete & Sign Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
