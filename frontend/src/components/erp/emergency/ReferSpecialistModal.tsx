import React, { useState } from 'react';
import { X, UserPlus, Send } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
} from '../../../services/emergencyService';

interface ReferSpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

export const ReferSpecialistModal: React.FC<ReferSpecialistModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  const [specialty, setSpecialty] = useState('Cardiology');
  const [specialistName, setSpecialistName] = useState('Dr. Rajesh (Cardiologist)');
  const [urgency, setUrgency] = useState('Immediate Bedside (< 15 min)');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalSummary.trim()) {
      triggerToast('Please provide clinical reason for referral');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyService.referToSpecialist(patient.id, {
        specialty,
        specialist_name: specialistName,
        urgency,
        clinical_summary: clinicalSummary.trim(),
      });

      if (res.success) {
        triggerToast(`Specialist consult dispatched to ${specialistName} (${urgency})!`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to dispatch referral');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error processing specialist consult');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">On-Call Specialist Referral</h2>
              <p className="text-xs text-slate-400">Summon casualty specialist or cross-consultation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Patient Overview Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
              <div className="text-xs font-black text-slate-900">{patient.patient_name}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
              <div className="text-xs font-bold text-slate-700">{patient.er_location}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triage Level</span>
              <div className="text-xs font-bold text-rose-600">{patient.triage_level}</div>
            </div>
          </div>

          {/* Specialty Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  if (e.target.value === 'Cardiology') setSpecialistName('Dr. Rajesh (Cardiologist)');
                  else if (e.target.value === 'Neurology') setSpecialistName('Dr. Deepa (Neurologist)');
                  else if (e.target.value === 'Orthopedics') setSpecialistName('Dr. Manoj (Orthopedic Surgeon)');
                  else if (e.target.value === 'General Surgery') setSpecialistName('Dr. Anitha (General Surgeon)');
                  else setSpecialistName('Dr. Meenakshi (Critical Care)');
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold bg-white"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Critical Care">Critical Care / ICU</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Nephrology">Nephrology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultant Name
              </label>
              <input
                type="text"
                value={specialistName}
                onChange={(e) => setSpecialistName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Referral Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                'Immediate Bedside (< 15 min)',
                'Urgent (< 45 min)',
                'Routine ER Consult',
              ].map((urg) => (
                <button
                  key={urg}
                  type="button"
                  onClick={() => setUrgency(urg)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    urgency === urg
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs">{urg}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Indication */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Summary & Specific Question
            </label>
            <textarea
              rows={3}
              required
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              placeholder="e.g. 54M with chest pain, T-wave inversion in V2-V4, elevated Troponin. Requesting urgent cardiology review for primary PCI evaluation."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Specialist Call</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
