import React, { useState } from 'react';
import { X, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
} from '../../../services/emergencyService';

interface CallFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

export const CallFamilyModal: React.FC<CallFamilyModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [conversationNote, setConversationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (patient) {
      setContactName(patient.accompanied_by || 'Emergency Attendant');
      setPhoneNumber(patient.patient_phone || '+91 98765 43210');
      setConversationNote(`Informed family regarding casualty admission in ${patient.er_location}. Patient is currently ${patient.status.toLowerCase()}.`);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSendSms = () => {
    triggerToast(`Automated Casualty Alert SMS dispatched to ${phoneNumber}!`);
  };

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationNote.trim()) {
      triggerToast('Please record communication note');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyService.addClinicalNote(patient.id, {
        author: 'Casualty Liaison Desk',
        role: 'Attending Staff',
        content: `Family Contacted (${contactName} - ${phoneNumber}): ${conversationNote.trim()}`,
      });

      if (res.success) {
        triggerToast(`Family communication logged for ${patient.patient_name}`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to log family call note');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error recording call note');
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
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Emergency Family Liaison</h2>
              <p className="text-xs text-slate-400">Direct dialer, automated SMS & family updates</p>
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
        <form onSubmit={handleLogCall} className="p-6 space-y-5">
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <div className="text-xs font-bold text-teal-700">{patient.status}</div>
            </div>
          </div>

          {/* Contact Details & Direct Call Button */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                  Emergency Contact / Next of Kin
                </span>
                <div className="text-xs font-black text-slate-900 mt-0.5">{contactName}</div>
                <div className="text-xs font-mono font-bold text-slate-600">{phoneNumber}</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <button
                  type="button"
                  onClick={handleSendSms}
                  className="px-3 py-2 bg-white border border-teal-300 hover:bg-teal-100/50 text-teal-800 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send SMS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pre-drafted SMS Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Automated SMS Template:</span>
            &ldquo;HealthGrid Alert: Patient {patient.patient_name} is currently receiving acute care in {patient.er_location} at City Care Casualty Department under {patient.assigned_doctor_name}. For inquiries, contact ER Desk: 044-24567890.&rdquo;
          </div>

          {/* Handover Conversation Log */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Family Conversation Log / Consent Notes
            </label>
            <textarea
              rows={3}
              required
              value={conversationNote}
              onChange={(e) => setConversationNote(e.target.value)}
              placeholder="e.g. Spoke with patient's spouse. Explained condition, vital signs and informed about ongoing blood tests. Spouse arriving at hospital in 30 mins."
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
                <span>Logging...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Communication Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
