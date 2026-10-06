import React, { useState } from 'react';
import {
  X,
  BedDouble,
  CheckCircle2,
  Wrench,
  Sparkles,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ipdBedService, type IpdBed, type BedStatus } from '../../../services/ipdBedService';

interface UpdateBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  bed: IpdBed | null;
}

export const UpdateBedModal: React.FC<UpdateBedModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bed,
}) => {
  const [newStatus, setNewStatus] = useState<BedStatus>(bed?.status || 'Available');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !bed) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ok = await ipdBedService.updateBedStatus(bed.bed_number, newStatus);
      if (ok) {
        onSuccess(`Bed ${bed.bed_number} status updated to ${newStatus}.`);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: BedStatus; label: string; desc: string; icon: any; color: string }[] = [
    { value: 'Available', label: 'Available', desc: 'Bed is clean, sanitized and ready for patient admission', icon: BedDouble, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { value: 'Occupied', label: 'Occupied', desc: 'Currently assigned to an admitted inpatient', icon: BedDouble, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'Maintenance', label: 'Maintenance', desc: 'Equipment repair, electrical check or physical servicing', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { value: 'Cleaning', label: 'Cleaning & Sanitation', desc: 'Housekeeping terminal disinfection in progress', icon: Sparkles, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { value: 'Reserved', label: 'Reserved', desc: 'Reserved for incoming emergency trauma or ICU step-down', icon: Clock, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Update Bed {bed.bed_number}</h3>
              <p className="text-xs text-slate-500">{bed.ward_code} • {bed.bed_type}</p>
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
          {bed.status === 'Occupied' && bed.current_patient_name && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Bed currently occupied by {bed.current_patient_name}.</span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Changing status to Available or Maintenance will unassign the patient from this bed. Use Discharge Patient or Transfer Patient for clinical handovers.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Operational Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = newStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewStatus(opt.value)}
                    className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? `${opt.color} ring-2 ring-teal-500/30 font-semibold shadow-xs`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {(newStatus === 'Maintenance' || newStatus === 'Cleaning') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Housekeeping / Maintenance Note</label>
              <input
                type="text"
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                placeholder="e.g. Oxygen flowmeter leak repair, bed disinfection scheduled"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
              />
            </div>
          )}

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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
