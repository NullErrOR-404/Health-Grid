import React, { useState } from 'react';
import {
  X,
  Settings,
  Clock,
  Bell,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface AppointmentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AppointmentSettingsModal: React.FC<AppointmentSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [slotDuration, setSlotDuration] = useState('15');
  const [bufferTime, setBufferTime] = useState('5');
  const [maxPerDoctor, setMaxPerDoctor] = useState('30');
  const [noShowGraceMinutes, setNoShowGraceMinutes] = useState('30');
  const [enableSmsReminders, setEnableSmsReminders] = useState(true);
  const [enableWhatsappAlerts, setEnableWhatsappAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSuccess('Appointment scheduling parameters updated successfully');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-auto max-h-none sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Appointment Settings</h2>
              <p className="text-xs text-slate-500">Configure clinic schedules & automated rules</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Standard Slot Duration
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="10">10 Minutes (Rapid Outpatient)</option>
              <option value="15">15 Minutes (Standard Consultation)</option>
              <option value="20">20 Minutes (Comprehensive Evaluation)</option>
              <option value="30">30 Minutes (Specialty & Super-Specialty)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Buffer Time</label>
              <select
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="0">0 Minutes</option>
                <option value="5">5 Minutes</option>
                <option value="10">10 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Bookings / Doctor</label>
              <input
                type="number"
                value={maxPerDoctor}
                onChange={(e) => setMaxPerDoctor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
              Auto-Mark No Show Grace Window
            </label>
            <select
              value={noShowGraceMinutes}
              onChange={(e) => setNoShowGraceMinutes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="15">15 Minutes after slot time</option>
              <option value="30">30 Minutes after slot time (Recommended)</option>
              <option value="45">45 Minutes after slot time</option>
              <option value="60">60 Minutes after slot time</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              Automated Patient Reminders
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={enableSmsReminders}
                onChange={(e) => setEnableSmsReminders(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>Send SMS confirmation & 24h appointment reminder</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={enableWhatsappAlerts}
                onChange={(e) => setEnableWhatsappAlerts(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>Send WhatsApp live token tracker & digital QR pass</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
