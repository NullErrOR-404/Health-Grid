import React, { useState, useEffect } from 'react';
import {
  Activity,
  HeartPulse,
  Thermometer,
  Droplets,
  Weight,
  Clock,
  AlertTriangle,
  Trash2,
  Plus,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import type { Language } from '../types';
import {
  healthMemoryService,
  type VitalEntry,
  type VitalType,
  type BloodPressureValue,
  type BloodSugarValue,
  type ClinicalSynthesis
} from '../services/healthMemoryService';

interface VitalsTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const VitalsTelemetryModal: React.FC<VitalsTelemetryModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [synthesis, setSynthesis] = useState<ClinicalSynthesis>(() =>
    healthMemoryService.getClinicalTrendSynthesis()
  );
  const [activeTab, setActiveTab] = useState<VitalType>('blood_pressure');

  // Input Form States
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [sugarGlucose, setSugarGlucose] = useState<number>(110);
  const [sugarTiming, setSugarTiming] = useState<'fasting' | 'postprandial' | 'random'>('fasting');
  const [heartRate, setHeartRate] = useState<number>(75);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [noteText, setNoteText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    return healthMemoryService.subscribe((list) => {
      setEntries(list);
      setSynthesis(healthMemoryService.getClinicalTrendSynthesis());
    });
  }, []);

  if (!isOpen) return null;

  const handleAddVital = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'blood_pressure') {
      healthMemoryService.addEntry(
        'blood_pressure',
        { systolic: bpSystolic, diastolic: bpDiastolic },
        'mmHg',
        'manual_entry',
        noteText.trim() || undefined
      );
    } else if (activeTab === 'blood_sugar') {
      healthMemoryService.addEntry(
        'blood_sugar',
        { glucose: sugarGlucose, timing: sugarTiming },
        'mg/dL',
        'manual_entry',
        noteText.trim() || undefined
      );
    } else if (activeTab === 'heart_rate') {
      healthMemoryService.addEntry(
        'heart_rate',
        heartRate,
        'bpm',
        'manual_entry',
        noteText.trim() || undefined
      );
    } else if (activeTab === 'spo2') {
      healthMemoryService.addEntry(
        'spo2',
        spo2,
        '%',
        'manual_entry',
        noteText.trim() || undefined
      );
    } else if (activeTab === 'temperature') {
      healthMemoryService.addEntry(
        'temperature',
        temperature,
        '°F',
        'manual_entry',
        noteText.trim() || undefined
      );
    } else if (activeTab === 'weight') {
      healthMemoryService.addEntry(
        'weight',
        weightKg,
        'kg',
        'manual_entry',
        noteText.trim() || undefined
      );
    }

    setNoteText('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    healthMemoryService.deleteEntry(id);
  };

  // Clinical Evaluation helper
  const getBpCategory = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 110) {
      return { label: 'Crisis / Immediate Review', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
    if (sys >= 140 || dia >= 90) {
      return { label: 'Hypertension (Stage 1-2)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    if (sys >= 120 || dia >= 80) {
      return { label: 'Pre-Hypertension (Borderline)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    return { label: 'Optimal Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const getSugarCategory = (glucose: number, timing: string) => {
    if (timing === 'fasting') {
      if (glucose >= 126) return { label: 'Elevated Fasting (Diabetic range)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      if (glucose >= 100) return { label: 'Impaired Fasting Glucose', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      if (glucose < 70) return { label: 'Hypoglycemia (Low Sugar)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      return { label: 'Normal Fasting', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    } else {
      if (glucose >= 200) return { label: 'Elevated Postprandial', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      if (glucose >= 140) return { label: 'Impaired Glucose Tolerance', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      return { label: 'Normal Post-Meal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
  };

  const formatVitalValue = (entry: VitalEntry) => {
    if (entry.type === 'blood_pressure') {
      const v = entry.value as BloodPressureValue;
      return `${v.systolic}/${v.diastolic} mmHg`;
    }
    if (entry.type === 'blood_sugar') {
      const v = entry.value as BloodSugarValue;
      return `${v.glucose} mg/dL (${v.timing})`;
    }
    return `${entry.value} ${entry.unit}`;
  };

  const getVitalIcon = (type: VitalType) => {
    switch (type) {
      case 'blood_pressure':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'blood_sugar':
        return <Droplets className="w-4 h-4 text-amber-600" />;
      case 'heart_rate':
        return <HeartPulse className="w-4 h-4 text-emerald-600" />;
      case 'spo2':
        return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-orange-600" />;
      case 'weight':
        return <Weight className="w-4 h-4 text-purple-600" />;
    }
  };

  const filteredEntries = entries.filter((e) => e.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/90 shadow-2xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-teal-50/40 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  {lang === 'en' ? 'Longitudinal Health Memory' : 'நீண்டகால மருத்துவ நினைவகம்'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100 text-teal-800 flex-shrink-0">
                  {entries.length} {lang === 'en' ? 'Records' : 'பதிவுகள்'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate sm:whitespace-normal">
                {lang === 'en'
                  ? 'Continuous vitals tracking correlated across all your doctor consultations'
                  : 'உங்கள் மருத்துவ ஆலோசனைகளுடன் இணைக்கப்பட்ட உடல் அளவீட்டு வரலாறு'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Stability Trend Card (Abstracted Doctor's Bedside Note) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              synthesis.hasAnomalies ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {synthesis.hasAnomalies ? (
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {lang === 'en' ? 'Clinical Health Trajectory' : 'உடல்நல கண்காணிப்பு நிலை'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  synthesis.hasAnomalies
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {synthesis.hasAnomalies
                    ? (lang === 'en' ? 'Variation Noted' : 'மாற்றம் கண்டறியப்பட்டது')
                    : (lang === 'en' ? 'Baseline Stable' : 'நிலையானது')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {lang === 'en' ? synthesis.summaryEn : synthesis.summaryTa}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body: Tabs & Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Vital Type Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none">
            {[
              { id: 'blood_pressure', label: lang === 'en' ? 'Blood Pressure' : 'இரத்த அழுத்தம்', icon: Activity },
              { id: 'blood_sugar', label: lang === 'en' ? 'Blood Sugar' : 'சர்க்கரை', icon: Droplets },
              { id: 'heart_rate', label: lang === 'en' ? 'Pulse' : 'இதயத்துடிப்பு', icon: HeartPulse },
              { id: 'spo2', label: 'SpO2', icon: Activity },
              { id: 'temperature', label: lang === 'en' ? 'Temp' : 'வெப்பநிலை', icon: Thermometer },
              { id: 'weight', label: lang === 'en' ? 'Weight' : 'எடை', icon: Weight },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as VitalType)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick-Add Form */}
          <form onSubmit={handleAddVital} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                {lang === 'en' ? 'Log New Vital Reading' : 'புதிய அளவீட்டைப் பதிவு செய்க'}
              </span>
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'en' ? 'Saved to memory!' : 'நினைவகத்தில் சேமிக்கப்பட்டது!'}
                </span>
              )}
            </div>

            {/* Field sets based on tab */}
            {activeTab === 'blood_pressure' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Systolic (Top)' : 'சிஸ்டாலிக் (மேல்)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="70"
                        max="250"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(parseInt(e.target.value) || 120)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">mmHg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Diastolic (Bottom)' : 'டயஸ்டாலிக் (கீழ்)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="40"
                        max="160"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(parseInt(e.target.value) || 80)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">mmHg</span>
                    </div>
                  </div>
                </div>

                {/* Instant Clinical Evaluation Pill */}
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${getBpCategory(bpSystolic, bpDiastolic).color}`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>{getBpCategory(bpSystolic, bpDiastolic).label}</span>
                </div>
              </div>
            )}

            {activeTab === 'blood_sugar' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Blood Glucose' : 'சர்க்கரை அளவு'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="40"
                        max="500"
                        value={sugarGlucose}
                        onChange={(e) => setSugarGlucose(parseInt(e.target.value) || 100)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">mg/dL</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Timing Context' : 'நேர விபரம்'}
                    </label>
                    <select
                      value={sugarTiming}
                      onChange={(e) => setSugarTiming(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="fasting">{lang === 'en' ? 'Fasting (Empty Stomach)' : 'சாப்பிடுவதற்கு முன்'}</option>
                      <option value="postprandial">{lang === 'en' ? 'Postprandial (After Food)' : 'சாப்பிட்ட பின்'}</option>
                      <option value="random">{lang === 'en' ? 'Random Check' : 'பொதுவான நேரம்'}</option>
                    </select>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${getSugarCategory(sugarGlucose, sugarTiming).color}`}>
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{getSugarCategory(sugarGlucose, sugarTiming).label}</span>
                </div>
              </div>
            )}

            {activeTab === 'heart_rate' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Resting Heart Rate / Pulse' : 'இதயத்துடிப்பு'}
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value) || 72)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">bpm</span>
                </div>
              </div>
            )}

            {activeTab === 'spo2' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Blood Oxygen Saturation (SpO2)' : 'ஆக்சிஜன் அளவு'}
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={spo2}
                    onChange={(e) => setSpo2(parseInt(e.target.value) || 98)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">%</span>
                </div>
              </div>
            )}

            {activeTab === 'temperature' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Oral or Axillary Temperature' : 'உடல் வெப்பநிலை'}
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="0.1"
                    min="94"
                    max="108"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 98.6)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">°F</span>
                </div>
              </div>
            )}

            {activeTab === 'weight' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Body Weight' : 'உடல் எடை'}
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="0.5"
                    min="20"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 65)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">kg</span>
                </div>
              </div>
            )}

            {/* Optional Note input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {lang === 'en' ? 'Context Note (Optional)' : 'குறிப்பு (விருப்பப்பட்டால்)'}
              </label>
              <input
                type="text"
                placeholder={lang === 'en' ? 'e.g. morning reading after light walk' : 'எ.கா. காலை நடைப்பயிற்சிக்கு பின்'}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Save to Health Memory' : 'நினைவகத்தில் சேமி'}</span>
              </button>
            </div>
          </form>

          {/* Longitudinal Timeline Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'en' ? 'Recorded History' : 'பதிவு செய்யப்பட்ட வரலாறு'}</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {filteredEntries.length} {lang === 'en' ? 'entries for this vital' : 'அளவீடுகள்'}
              </span>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  {lang === 'en' ? 'No recorded entries yet' : 'இன்னும் பதிவுகள் இல்லை'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  {lang === 'en'
                    ? 'Log a reading above, or simply tell DocBot your vitals in chat (e.g. "my BP today is 130/85") to automatically track trends.'
                    : 'மேலே அளவீட்டை உள்ளிடவும், அல்லது அரட்டையில் மருத்துவரிடம் கூறவும் (எ.கா. "இன்று என் BP 130/85").'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-200 shadow-2xs flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {getVitalIcon(entry.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {formatVitalValue(entry)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-600">
                            {entry.source === 'chat_extracted'
                              ? (lang === 'en' ? 'Chat Extracted' : 'அரட்டை மூலம்')
                              : (lang === 'en' ? 'Manual Log' : 'நேரடி பதிவு')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {entry.notes && <span>• {entry.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        {/* Footer info */}
        <div className="p-4 safe-area-pb border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500 font-medium flex-shrink-0">
          <span className="flex items-center gap-1.5 min-w-0 pr-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate sm:whitespace-normal">
              {lang === 'en'
                ? 'Grounded in ICMR & Indian Clinical Practice Standards'
                : 'ICMR மருத்துவ நெறிமுறைகளின்படி சரிபார்க்கப்பட்டது'}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 min-h-[40px] rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex-shrink-0 active:scale-95"
          >
            {lang === 'en' ? 'Done' : 'முடிந்தது'}
          </button>
        </div>
      </div>
    </div>
  );
};
