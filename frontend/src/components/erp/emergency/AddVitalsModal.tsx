import React, { useState } from 'react';
import { X, Activity, Heart, Thermometer, AlertTriangle } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
  type EmergencyVitals,
} from '../../../services/emergencyService';

interface AddVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

export const AddVitalsModal: React.FC<AddVitalsModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [hr, setHr] = useState('76');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('37.0');
  const [recorder, setRecorder] = useState('Sr. Deepa (ICU Staff)');
  const [notes, setNotes] = useState('Routine hourly casualty check');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (patient?.latest_vitals) {
      const parts = patient.latest_vitals.bp?.split('/') || ['120', '80'];
      setSystolic(parts[0] || '120');
      setDiastolic(parts[1] || '80');
      setHr(String(patient.latest_vitals.hr || 76));
      setSpo2(String(patient.latest_vitals.spo2 || 98));
      setTemp(String(patient.latest_vitals.temp || 37.0));
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const numSpo2 = parseInt(spo2) || 98;
  const numHr = parseInt(hr) || 76;
  const numSystolic = parseInt(systolic) || 120;
  const isCritical = numSpo2 < 92 || numHr > 125 || numSystolic < 90 || numSystolic > 185;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newVitals: EmergencyVitals = {
        bp: `${systolic}/${diastolic}`,
        hr: numHr,
        spo2: numSpo2,
        temp: parseFloat(temp) || 37.0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const res = await emergencyService.addVitals(
        patient.id,
        newVitals,
        recorder.trim() || undefined,
        notes.trim() || undefined
      );

      if (res.success) {
        triggerToast(`Vitals recorded for ${patient.patient_name} (BP: ${newVitals.bp}, SpO2: ${newVitals.spo2}%)`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to record vitals');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error updating vitals');
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
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-rose-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Record Emergency Vitals</h2>
              <p className="text-xs text-slate-400">Continuous telemetry and bedside hemodynamics</p>
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triage Code</span>
              <div
                className={`text-xs font-bold ${
                  patient.triage_level === 'Red'
                    ? 'text-rose-600'
                    : patient.triage_level === 'Yellow'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {patient.triage_level}
              </div>
            </div>
          </div>

          {/* Critical Vital Alarm Warning */}
          {isCritical && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>CRITICAL VITAL ANOMALY: Abnormal parameters detected. Physician review advised.</span>
            </div>
          )}

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Pressure (mmHg)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="Sys"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-center focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="Dia"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-center focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Heart Rate / Pulse (bpm)
              </label>
              <div className="relative">
                <Heart className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oxygen Saturation (SpO2 %)
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className={`w-full px-3 py-2 text-xs border rounded-xl font-bold ${
                  numSpo2 < 92 ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temperature (°C)
              </label>
              <div className="relative">
                <Thermometer className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recorded By
              </label>
              <input
                type="text"
                value={recorder}
                onChange={(e) => setRecorder(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Observation / Response to Medication
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-medium"
              />
            </div>
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Log Vitals</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
