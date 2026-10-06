import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, Clock, AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
  type EmergencyStatus,
} from '../../../services/emergencyService';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  const [newStatus, setNewStatus] = useState<EmergencyStatus>(
    patient?.status || 'In Treatment'
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when patient changes
  React.useEffect(() => {
    if (patient) {
      setNewStatus(patient.status);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await emergencyService.updateCaseStatus(
        patient.id,
        newStatus,
        reason.trim() || undefined
      );

      if (res.success) {
        triggerToast(`Status for ${patient.patient_name} updated to ${newStatus}`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to update status');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error updating emergency case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: Array<{ status: EmergencyStatus; label: string; desc: string; icon: any; color: string }> = [
    {
      status: 'In Treatment',
      label: 'In Treatment',
      desc: 'Active medical or trauma management in casualty bed',
      icon: RefreshCw,
      color: 'border-blue-500 bg-blue-50 text-blue-700',
    },
    {
      status: 'Observation',
      label: 'Observation',
      desc: 'Hemodynamic stability monitoring in observation bay',
      icon: Clock,
      color: 'border-purple-500 bg-purple-50 text-purple-700',
    },
    {
      status: 'Waiting',
      label: 'Waiting',
      desc: 'Awaiting doctor assessment or secondary diagnostic workup',
      icon: AlertCircle,
      color: 'border-amber-500 bg-amber-50 text-amber-700',
    },
    {
      status: 'Discharged',
      label: 'Discharged',
      desc: 'Symptoms resolved or patient stabilized for home discharge',
      icon: LogOut,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    },
    {
      status: 'Transferred',
      label: 'Transferred',
      desc: 'Escalated to Inpatient Department (IPD) or external facility',
      icon: ArrowRight,
      color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Update Patient Status</h2>
              <p className="text-xs text-slate-400">Transition clinical workflow state in real-time</p>
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
          {/* Patient Overview */}
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
              <div className="text-xs font-bold text-teal-700">{patient.status}</div>
            </div>
          </div>

          {/* Status Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Select New Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = newStatus === opt.status;
                return (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => setNewStatus(opt.status)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? `${opt.color} ring-2 ring-teal-500 shadow-xs font-bold`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/80 border border-slate-200 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                        <div className="text-[11px] text-slate-500">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Rationale Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Rationale / Handover Note
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vitals normalized following IV fluids and nebulization; stable for observation."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
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
                <span>Updating...</span>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
