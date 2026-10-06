import React, { useState } from 'react';
import { X, User, Phone, Activity, Heart, Thermometer, ShieldAlert, Check } from 'lucide-react';
import {
  emergencyService,
  type EmergencyTriageLevel,
  type ModeOfArrival,
} from '../../../services/emergencyService';

interface RegisterEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

export const RegisterEmergencyModal: React.FC<RegisterEmergencyModalProps> = ({
  isOpen,
  onClose,
  triggerToast,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [triageLevel, setTriageLevel] = useState<EmergencyTriageLevel>('Yellow');
  const [modeOfArrival, setModeOfArrival] = useState<ModeOfArrival>('Ambulance');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [erLocation, setErLocation] = useState('Acute Bed 03');
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Priya');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [allergies, setAllergies] = useState('No known allergies');

  // Initial Vitals
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('78');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('37.0');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      triggerToast('Please provide patient name');
      return;
    }
    if (!chiefComplaint.trim()) {
      triggerToast('Please state chief complaint');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyService.registerEmergencyPatient({
        patient_name: patientName.trim(),
        patient_age: parseInt(patientAge) || 35,
        patient_gender: patientGender,
        patient_phone: patientPhone.trim() || '+91 98765 00000',
        triage_level: triageLevel,
        mode_of_arrival: modeOfArrival,
        chief_complaint: chiefComplaint.trim(),
        er_location: erLocation,
        assigned_doctor_name: assignedDoctor,
        accompanied_by: accompaniedBy.trim() || 'EMS / Attendant',
        allergies: allergies.trim() || 'No known allergies',
        initial_vitals: {
          bp: `${bpSystolic}/${bpDiastolic}`,
          hr: parseInt(pulse) || 76,
          spo2: parseInt(spo2) || 98,
          temp: parseFloat(temp) || 37.0,
        },
      });

      if (res.success) {
        triggerToast(`Emergency Patient ${patientName} admitted under code ${triageLevel}!`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to register emergency case');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error creating emergency record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Register Emergency Patient</h2>
              <p className="text-xs text-rose-100">Rapid casualty triage admission and bed assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Triage Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Triage Assessment (Emergency Severity Index)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTriageLevel('Red')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  triageLevel === 'Red'
                    ? 'border-red-600 bg-red-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-red-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-red-700 uppercase tracking-wide">Red - Critical</span>
                  {triageLevel === 'Red' && <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>}
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Life threat, immediate resuscitation (0 min)</p>
              </button>

              <button
                type="button"
                onClick={() => setTriageLevel('Yellow')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  triageLevel === 'Yellow'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wide">Yellow - Urgent</span>
                  {triageLevel === 'Yellow' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Severe distress, care within 15 min</p>
              </button>

              <button
                type="button"
                onClick={() => setTriageLevel('Green')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  triageLevel === 'Green'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">Green - Non-Urgent</span>
                  {triageLevel === 'Green' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Stable, routine care within 60 min</p>
              </button>
            </div>
          </div>

          {/* Patient Demographics */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Patient Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mode of Arrival</label>
                <select
                  value={modeOfArrival}
                  onChange={(e) => setModeOfArrival(e.target.value as ModeOfArrival)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium bg-white"
                >
                  <option value="Ambulance">Ambulance (108 / Private)</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Wheelchair">Wheelchair</option>
                  <option value="Private Vehicle">Private Vehicle</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Presentation & Location */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Clinical Context</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint / Symptoms</label>
                <textarea
                  required
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Acute severe retrosternal chest pain with diaphoresis and nausea for 45 minutes"
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned ER Location</label>
                <select
                  value={erLocation}
                  onChange={(e) => setErLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium bg-white"
                >
                  <option value="Resuscitation Bay 1">Resuscitation Bay 1 (Red)</option>
                  <option value="Resuscitation Bay 2">Resuscitation Bay 2 (Red)</option>
                  <option value="Trauma Bay 1">Trauma Bay 1</option>
                  <option value="Acute Bed 01">Acute Bed 01</option>
                  <option value="Acute Bed 02">Acute Bed 02</option>
                  <option value="Acute Bed 03">Acute Bed 03</option>
                  <option value="Acute Bed 04">Acute Bed 04</option>
                  <option value="Observation Bed 01">Observation Bed 01</option>
                  <option value="Observation Bed 02">Observation Bed 02</option>
                  <option value="Fast Track Room 1">Fast Track Room 1 (Green)</option>
                  <option value="Triage Waiting Area">Triage Waiting Area</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician</label>
                <select
                  value={assignedDoctor}
                  onChange={(e) => setAssignedDoctor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium bg-white"
                >
                  <option value="Dr. Priya">Dr. Priya (Emergency Medicine)</option>
                  <option value="Dr. Arvind">Dr. Arvind (Casualty Medical Officer)</option>
                  <option value="Dr. Meenakshi">Dr. Meenakshi (Trauma Specialist)</option>
                  <option value="Dr. Rajesh">Dr. Rajesh (Cardiology On-Call)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accompanied By / Attendant</label>
                <input
                  type="text"
                  value={accompaniedBy}
                  onChange={(e) => setAccompaniedBy(e.target.value)}
                  placeholder="e.g. Suresh (Brother) / 108 Paramedic"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs or None"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Initial Vitals Strip */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              Initial Triage Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">BP (mmHg)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-14 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center font-bold"
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="text"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-14 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pulse (bpm)</label>
                <div className="relative">
                  <Heart className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-2" />
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (°C)</label>
                <div className="relative">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admit to Casualty</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
