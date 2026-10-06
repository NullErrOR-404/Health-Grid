import React, { useState } from 'react';
import { X, LogOut, ShieldCheck } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
} from '../../../services/emergencyService';

interface DischargeEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

export const DischargeEmergencyModal: React.FC<DischargeEmergencyModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  const [dischargeType, setDischargeType] = useState('Routine Medical Discharge');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [dischargeCondition, setDischargeCondition] = useState('Hemodynamically Stable & Ambulatory');
  const [medicationAdvice, setMedicationAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (patient) {
      setFinalDiagnosis(patient.chief_complaint);
      setMedicationAdvice('Paracetamol 650mg TDS PRN, Pantoprazole 40mg OD AC x 3 days. Adequate hydration.');
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setFollowUpDate(d.toISOString().slice(0, 10));
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalDiagnosis.trim()) {
      triggerToast('Please provide final clinical diagnosis');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyService.dischargePatient(patient.id, {
        dischargeType,
        finalDiagnosis: finalDiagnosis.trim(),
        dischargeCondition,
        medicationAdvice: medicationAdvice.trim(),
        followUpDate: followUpDate || undefined,
      });

      if (res.success) {
        triggerToast(`Patient ${patient.patient_name} cleared and discharged from Casualty!`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to discharge patient');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error processing casualty discharge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Casualty Discharge Clearance</h2>
              <p className="text-xs text-slate-400">Clinical summary, take-home advice & follow-up</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Patient Overview Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
              <div className="text-xs font-black text-slate-900">{patient.patient_name}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Location</span>
              <div className="text-xs font-bold text-slate-700">{patient.er_location}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arrival Vitals</span>
              <div className="text-xs font-bold text-teal-700">BP: {patient.latest_vitals.bp}</div>
            </div>
          </div>

          {/* Discharge Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Discharge Category
            </label>
            <select
              value={dischargeType}
              onChange={(e) => setDischargeType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold bg-white"
            >
              <option value="Routine Medical Discharge">Routine Medical Discharge (Resolved/Treated)</option>
              <option value="Against Medical Advice (LAMA)">Left Against Medical Advice (LAMA)</option>
              <option value="Discharge on Request (DOR)">Discharge on Request (DOR)</option>
              <option value="Referred to Outpatient Clinic">Referred to Outpatient Clinic for Day Follow-up</option>
            </select>
          </div>

          {/* Final Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Final Casualty Diagnosis
            </label>
            <input
              type="text"
              required
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="e.g. Acute Gastritis with Dehydration - Resolved"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Condition on Discharge */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition on Discharge
            </label>
            <select
              value={dischargeCondition}
              onChange={(e) => setDischargeCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium bg-white"
            >
              <option value="Hemodynamically Stable & Ambulatory">Hemodynamically Stable & Ambulatory</option>
              <option value="Symptomatically Relieved">Symptomatically Relieved</option>
              <option value="Stable on Oral Medication">Stable on Oral Medication</option>
              <option value="High Risk (LAMA Signoff Acquired)">High Risk (LAMA Signoff Acquired)</option>
            </select>
          </div>

          {/* Take-Home Advice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescription & Take-Home Advice
            </label>
            <textarea
              rows={2}
              value={medicationAdvice}
              onChange={(e) => setMedicationAdvice(e.target.value)}
              placeholder="e.g. Tab Pantoprazole 40mg OD x 5 days. Return immediately if chest tightness or vomiting recurs."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recommended OPD Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Clearance Notice */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clearing frees this casualty bed and updates the ER active census.</span>
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Authorize Discharge</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
