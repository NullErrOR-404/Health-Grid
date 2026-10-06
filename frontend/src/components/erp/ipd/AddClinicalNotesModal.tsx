import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { ipdBedService, type IpdAdmission, type IpdClinicalNote } from '../../../services/ipdBedService';

interface AddClinicalNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  admission: IpdAdmission | null;
}

export const AddClinicalNotesModal: React.FC<AddClinicalNotesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  admission,
}) => {
  const [noteType, setNoteType] = useState<IpdClinicalNote['note_type']>('Doctor Round');
  const [authorName, setAuthorName] = useState('Dr. Mohamed');
  const [authorRole, setAuthorRole] = useState('Consultant Physician');
  const [content, setContent] = useState(
    'Morning round: Patient afebrile for past 18 hours. Appetite recovering. Platelet count repeat sample sent. Continue oral hydration, taper IV fluids to 50 ml/hr.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !admission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await ipdBedService.addClinicalNote({
        admission_id: admission.id,
        patient_health_id: admission.patient_health_id,
        note_type: noteType,
        author_name: authorName,
        author_role: authorRole,
        content: content.trim(),
      });
      onSuccess(`Clinical note added to Bed ${admission.bed_number} (${admission.patient_name}).`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Add Clinical Round Note</h3>
              <p className="text-xs text-slate-500">
                Bed {admission.bed_number} • {admission.patient_name} ({admission.patient_health_id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Note Type</label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
              >
                <option value="Doctor Round">Doctor Round</option>
                <option value="Nursing Observation">Nursing Observation</option>
                <option value="Consultation Note">Consultation Note</option>
                <option value="Dietary Plan">Dietary Plan</option>
                <option value="Critical Alert">Critical Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Doctor Name"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Author Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Physician / Nurse"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Observation / Instructions</label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record vitals evaluation, systemic findings, changes to treatment plan, or discharge readiness..."
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Clinical Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
