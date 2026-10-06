import React, { useState } from 'react';
import { X, Sliders, Bell, AlertOctagon, Check } from 'lucide-react';

interface TriageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

export const TriageSettingsModal: React.FC<TriageSettingsModalProps> = ({
  isOpen,
  onClose,
  triggerToast,
}) => {
  const [protocol, setProtocol] = useState<'3-tier' | '5-tier'>('3-tier');
  const [spo2Threshold, setSpo2Threshold] = useState('92');
  const [systolicLowThreshold, setSystolicLowThreshold] = useState('90');
  const [systolicHighThreshold, setSystolicHighThreshold] = useState('180');
  const [hrThreshold, setHrThreshold] = useState('120');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoEscalateYellow, setAutoEscalateYellow] = useState('15');
  const [autoEscalateGreen, setAutoEscalateGreen] = useState('60');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Emergency Triage Protocol & Alert Triggers Updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Casualty Triage Configuration</h2>
              <p className="text-xs text-slate-400">ESI algorithms, vital thresholds & escalation policies</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Protocol standard */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Triage Index Standard
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProtocol('3-tier')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  protocol === '3-tier'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">3-Tier Standard (ICMR)</span>
                  {protocol === '3-tier' && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-[11px] text-slate-500">Red (Critical), Yellow (Urgent), Green (Non-urgent)</p>
              </button>

              <button
                type="button"
                onClick={() => setProtocol('5-tier')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  protocol === '5-tier'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">5-Tier ESI Standard</span>
                  {protocol === '5-tier' && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-[11px] text-slate-500">ESI Levels 1 to 5 with resource prediction modeling</p>
              </button>
            </div>
          </div>

          {/* Critical Vital Alarm Thresholds */}
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
            <h3 className="text-xs font-bold text-rose-900 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Code Red Vital Trigger Rules
            </h3>
            <p className="text-[11px] text-rose-700 mb-3">
              Vitals breaching these values trigger immediate Code Red banner and strobe alerts:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">SpO2 Alarm (&lt; %)</label>
                <input
                  type="number"
                  value={spo2Threshold}
                  onChange={(e) => setSpo2Threshold(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-rose-200 rounded-lg font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Systolic BP Low (&lt; mmHg)</label>
                <input
                  type="number"
                  value={systolicLowThreshold}
                  onChange={(e) => setSystolicLowThreshold(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-rose-200 rounded-lg font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Systolic BP High (&gt; mmHg)</label>
                <input
                  type="number"
                  value={systolicHighThreshold}
                  onChange={(e) => setSystolicHighThreshold(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-rose-200 rounded-lg font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Heart Rate Alarm (&gt; bpm)</label>
                <input
                  type="number"
                  value={hrThreshold}
                  onChange={(e) => setHrThreshold(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-rose-200 rounded-lg font-bold bg-white"
                />
              </div>
            </div>
          </div>

          {/* Auto Escalation Waiting Times */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Waiting Room Max Wait Timers
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Yellow Auto-Escalate (Mins)
                </label>
                <input
                  type="number"
                  value={autoEscalateYellow}
                  onChange={(e) => setAutoEscalateYellow(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Green Auto-Escalate (Mins)
                </label>
                <input
                  type="number"
                  value={autoEscalateGreen}
                  onChange={(e) => setAutoEscalateGreen(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>
          </div>

          {/* Sound Notification Check */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">Casualty Speaker Audio Chime</div>
                <div className="text-[10px] text-slate-500">Play alert sound on Code Red patient arrival</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/20"
            >
              Save Triage Policies
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
