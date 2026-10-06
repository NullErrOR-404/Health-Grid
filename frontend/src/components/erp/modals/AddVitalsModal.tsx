import React, { useState } from 'react';
import { X, Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react';
import { unifiedPatientStore } from '../../../services/unifiedPatientStore';

interface AddVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onVitalsSaved?: () => void;
}

export const AddVitalsModal: React.FC<AddVitalsModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onVitalsSaved,
}) => {
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('74');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [bloodSugar, setBloodSugar] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    unifiedPatientStore.addVitals(patientId, {
      bpSystolic: parseInt(systolic, 10) || 120,
      bpDiastolic: parseInt(diastolic, 10) || 80,
      heartRate: parseInt(heartRate, 10) || 72,
      temperature: parseFloat(temperature) || 98.6,
      spo2: parseInt(spo2, 10) || 98,
      bloodSugar: bloodSugar ? parseInt(bloodSugar, 10) : undefined,
    });

    if (onVitalsSaved) onVitalsSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Record Vitals</h3>
              <p className="text-xs text-slate-500">Patient: {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* BP */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Blood Pressure (mmHg)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Systolic (120)"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Diastolic (80)"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Pulse & Temp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Heart Rate (bpm)</span>
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                <span>Temperature (°F)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* SpO2 & Blood Sugar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                <span>SpO2 Oxygen (%)</span>
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-purple-500" />
                <span>Blood Sugar (mg/dL)</span>
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700"
            >
              Save Vitals & Sync Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
