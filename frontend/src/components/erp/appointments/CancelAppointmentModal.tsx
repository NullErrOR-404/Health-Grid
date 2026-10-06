import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { appointmentService, type Appointment } from '../../../services/appointmentService';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  mode: 'cancel' | 'no-show';
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  appointment,
  mode,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState(() =>
    mode === 'no-show'
      ? 'Patient failed to report within 30 minutes of scheduled slot time.'
      : 'Patient requested cancellation.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetStatus = mode === 'no-show' ? 'No Show' : 'Cancelled';
      await appointmentService.updateStatus(appointment.id, targetStatus, {
        reason: reason.trim(),
      });
      onSuccess(`Appointment ${appointment.appointment_id} marked as ${targetStatus}`);
      onClose();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-auto max-h-none sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {mode === 'no-show' ? 'Mark as No Show' : 'Cancel Appointment'}
              </h2>
              <p className="text-xs text-slate-500">{appointment.appointment_id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              Are you sure you want to {mode === 'no-show' ? 'mark as No Show' : 'cancel'} the appointment for <strong>{appointment.patient_name}</strong>? This slot will be released.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {mode === 'no-show' ? 'No Show Justification' : 'Cancellation Reason'}
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : mode === 'no-show' ? 'Confirm No Show' : 'Confirm Cancellation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
