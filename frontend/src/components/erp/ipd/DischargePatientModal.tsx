import React, { useState } from 'react';
import {
  X,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ipdBedService, type IpdAdmission } from '../../../services/ipdBedService';

interface DischargePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  admission: IpdAdmission | null;
}

export const DischargePatientModal: React.FC<DischargePatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  admission,
}) => {
  const [dischargeCondition, setDischargeCondition] = useState('Clinically Improved & Hemodynamically Stable');
  const [dischargeAdvice, setDischargeAdvice] = useState(
    'Patient advised plenty of oral hydration, light home cooked diet, avoid heavy physical exertion for 1 week. Review immediately if high fever or bleeding spots recur.'
  );
  const [medications, setMedications] = useState(
    '1. Tab Paracetamol 650mg SOS for fever\n2. Tab Pantoprazole 40mg OD before breakfast x 5 days\n3. Oral Rehydration Solution (ORS) 1 sachet daily in 1L water'
  );
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [clearedByBilling, setClearedByBilling] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !admission) return null;

  // Calculate length of stay in days
  const admDate = new Date(admission.admission_date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - admDate.getTime());
  const stayDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clearedByBilling) {
      setErrorMsg('Billing clearance confirmation is required prior to releasing patient discharge.');
      return;
    }

    setIsSubmitting(true);
    try {
      const medList = medications.split('\n').filter((m) => m.trim().length > 0);
      const res = await ipdBedService.dischargePatient({
        admissionId: admission.id,
        bedNumber: admission.bed_number,
        dischargeSummary: {
          dischargeDate: new Date().toISOString(),
          dischargeCondition,
          dischargeAdvice,
          medications: medList,
          followUpDate,
          clearedByBilling,
        },
      });

      if (res.success) {
        onSuccess(
          `Patient ${admission.patient_name} successfully discharged from Bed ${admission.bed_number}. Bed marked for sanitation cleaning.`
        );
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to complete discharge process.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Patient Discharge & Clearance</h3>
              <p className="text-xs text-slate-500">Generate discharge summary and release bed back to census</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Patient Census Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Patient</div>
              <div className="font-bold text-slate-900 truncate">{admission.patient_name}</div>
              <div className="text-[10px] text-slate-500 font-mono">{admission.patient_health_id}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Location</div>
              <div className="font-bold text-emerald-700">Bed {admission.bed_number}</div>
              <div className="text-[10px] text-slate-500">{admission.ward_name}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Consultant</div>
              <div className="font-semibold text-slate-900">{admission.doctor_name}</div>
              <div className="text-[10px] text-slate-500">{admission.department}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Length of Stay</div>
              <div className="font-bold text-slate-900">{stayDays} {stayDays === 1 ? 'Day' : 'Days'}</div>
              <div className="text-[10px] text-slate-500">Admitted: {new Date(admission.admission_date).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Final Discharge Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Discharge Condition</label>
            <select
              value={dischargeCondition}
              onChange={(e) => setDischargeCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
            >
              <option value="Clinically Improved & Hemodynamically Stable">Clinically Improved & Hemodynamically Stable</option>
              <option value="Cured / Fully Recovered">Cured / Fully Recovered</option>
              <option value="Transferred to Higher Tertiary Care Center">Transferred to Higher Tertiary Care Center</option>
              <option value="Left Against Medical Advice (LAMA)">Left Against Medical Advice (LAMA)</option>
              <option value="Discharged on Patient Request">Discharged on Patient Request</option>
            </select>
          </div>

          {/* Discharge Advice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Discharge Advice & Home Care Instructions</label>
            <textarea
              rows={3}
              value={dischargeAdvice}
              onChange={(e) => setDischargeAdvice(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Discharge Medications */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Take-Home Discharge Medications (One per line)</label>
            <textarea
              rows={3}
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Follow-up & Clearance Check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Follow-Up Review Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={clearedByBilling}
                  onChange={(e) => setClearedByBilling(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">Hospital Billing & Pharmacy Dues Cleared</span>
              </label>
            </div>
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
              disabled={isSubmitting || !clearedByBilling}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Discharge...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
