import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  CheckCircle2,
  ExternalLink,
  HeartPulse
} from 'lucide-react';
import { appointmentService, type Appointment } from '../../../services/appointmentService';
import { unifiedPatientStore } from '../../../services/unifiedPatientStore';

interface StartConsultationModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onNavigateToOpd?: (patientId: string) => void;
}

export const StartConsultationModal: React.FC<StartConsultationModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess,
  onNavigateToOpd,
}) => {
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [temperature, setTemperature] = useState('98.4');
  const [spo2, setSpo2] = useState('99');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (openFullOpd: boolean = false) => {
    setIsSubmitting(true);
    try {
      // 1. Advance status in appointments service
      await appointmentService.startConsultation(
        appointment.id,
        observations.trim() || 'Consultation initiated.'
      );

      // 2. Also log vitals to unifiedPatientStore if patient is registered
      const pat = unifiedPatientStore.getPatientByHealthId(appointment.patient_health_id);
      if (pat) {
        unifiedPatientStore.addVitals(pat.id, {
          bpSystolic: Number(bpSystolic) || 120,
          bpDiastolic: Number(bpDiastolic) || 80,
          heartRate: Number(heartRate) || 72,
          temperature: Number(temperature) || 98.4,
          spo2: Number(spo2) || 99,
          loggedBy: appointment.doctor_name,
        });
      }

      onSuccess(`Consultation started for ${appointment.patient_name} with ${appointment.doctor_name}`);
      onClose();

      if (openFullOpd && onNavigateToOpd && pat) {
        onNavigateToOpd(pat.id);
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-lg h-full sm:h-auto max-h-none sm:max-h-[92vh] sm:rounded-2xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Start Consultation</h2>
              <p className="text-xs text-slate-500">Initiate clinical exam & vitals intake</p>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Patient Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                {appointment.patient_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{appointment.patient_name}</div>
                <div className="text-[11px] text-slate-500">
                  UHID: {appointment.patient_health_id} · {appointment.patient_age}y / {appointment.patient_gender}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-2.5 py-1 rounded-full">
                {appointment.appointment_type}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">{appointment.appointment_time}</div>
            </div>
          </div>

          {/* Quick Preliminary Vitals */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Triage Vitals Check
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">BP (mmHg)</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Pulse (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold mt-1"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold mt-1"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold mt-1"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Consulting Doctor</label>
                <div className="px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg font-semibold mt-1">
                  {appointment.doctor_name} ({appointment.department})
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Initial Clinical Observations
            </label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g. Patient conscious and oriented. Complaining of intermittent chest tightness on exertion..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in OPD Consultation Desk</span>
            </button>
            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Starting...' : 'Start Consultation'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
