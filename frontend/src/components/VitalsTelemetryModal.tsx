import React, { useState, useEffect } from 'react';
import {
  Activity,
  Thermometer,
  Droplets,
  Clock,
  Plus,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  ChevronRight,
  MoreVertical,
  Heart,
  Scale
} from 'lucide-react';
import type { Language } from '../types';
import {
  healthMemoryService,
  type VitalEntry,
  type BloodPressureValue,
  type BloodSugarValue,
} from '../services/healthMemoryService';

interface VitalsTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface VitalsTableRow {
  id: string;
  dateTime: string;
  bp: string;
  pulse: string;
  spo2: string;
  temp: string;
  weight: string;
  notes: string;
}

const DEFAULT_DEMO_ROWS: VitalsTableRow[] = [
  {
    id: 'demo-v1',
    dateTime: '28 Sep 2025, 09:10 AM',
    bp: '120 / 80 mmHg',
    pulse: '72 bpm',
    spo2: '98 %',
    temp: '36.5 °C',
    weight: '68 kg',
    notes: 'Morning reading',
  },
  {
    id: 'demo-v2',
    dateTime: '25 Sep 2025, 08:45 AM',
    bp: '118 / 76 mmHg',
    pulse: '70 bpm',
    spo2: '97 %',
    temp: '36.4 °C',
    weight: '68 kg',
    notes: 'After walk',
  },
  {
    id: 'demo-v3',
    dateTime: '22 Sep 2025, 09:20 AM',
    bp: '124 / 82 mmHg',
    pulse: '75 bpm',
    spo2: '98 %',
    temp: '36.6 °C',
    weight: '69 kg',
    notes: 'Felt slight headache',
  },
];

export const VitalsTelemetryModal: React.FC<VitalsTelemetryModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'vitals' | 'blood_sugar' | 'pulse' | 'spo2' | 'temperature' | 'weight'>('vitals');

  // Input Form States
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [sugarGlucose, setSugarGlucose] = useState<number>(110);
  const [sugarTiming, setSugarTiming] = useState<'fasting' | 'postprandial' | 'random'>('fasting');
  const [heartRate, setHeartRate] = useState<number>(72);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(36.5);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [weightKg, setWeightKg] = useState<number>(68);

  // Optional fields matching Records Hub ref.png
  const [dateTimeValue, setDateTimeValue] = useState<string>('Mon, 29 Sep 2025  10:24 AM');
  const [noteText, setNoteText] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Subscribe to live health memory service
  useEffect(() => {
    return healthMemoryService.subscribe((list) => {
      setEntries(list);
    });
  }, []);

  if (!isOpen) return null;

  const handleAddVital = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'vitals') {
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
    } else if (activeTab === 'pulse') {
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
        tempUnit === 'C' ? '°C' : '°F',
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
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Convert service entries into structured history rows merged with baseline reference rows
  const getCombinedHistoryRows = (): VitalsTableRow[] => {
    const liveRows: VitalsTableRow[] = entries.map((entry) => {
      const dateObj = new Date(entry.timestamp);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ', ' + dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      let bpDisplay = '-';
      let pulseDisplay = '-';
      let spo2Display = '-';
      let tempDisplay = '-';
      let weightDisplay = '-';

      if (entry.type === 'blood_pressure') {
        const v = entry.value as BloodPressureValue;
        bpDisplay = `${v.systolic} / ${v.diastolic} mmHg`;
      } else if (entry.type === 'heart_rate') {
        pulseDisplay = `${entry.value} bpm`;
      } else if (entry.type === 'spo2') {
        spo2Display = `${entry.value} %`;
      } else if (entry.type === 'temperature') {
        tempDisplay = `${entry.value} ${entry.unit || '°C'}`;
      } else if (entry.type === 'weight') {
        weightDisplay = `${entry.value} kg`;
      } else if (entry.type === 'blood_sugar') {
        const v = entry.value as BloodSugarValue;
        bpDisplay = `Sugar: ${v.glucose} mg/dL`;
      }

      return {
        id: entry.id,
        dateTime: formattedDate,
        bp: bpDisplay,
        pulse: pulseDisplay,
        spo2: spo2Display,
        temp: tempDisplay,
        weight: weightDisplay,
        notes: entry.notes || 'Routine check',
      };
    });

    // Merge live rows ahead of default reference rows
    return [...liveRows, ...DEFAULT_DEMO_ROWS];
  };

  const historyRows = getCombinedHistoryRows();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Dialog Card (Matching Records Hub ref.png) */}
      <div className="bg-white rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 shadow-2xl w-full sm:max-w-4xl max-h-dvh sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* 1. MODAL HEADER */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {lang === 'en' ? 'Lifestyle and Health Memory' : 'வாழ்க்கைமுறை மற்றும் உடல்நல நினைவகம்'}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {lang === 'en' ? 'Active' : 'செயலில்'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                {lang === 'en'
                  ? 'Continuous health tracking to provide better and personalised consultation.'
                  : 'சிறந்த மற்றும் தனிப்பயனாக்கப்பட்ட ஆலோசனைக்கான தொடர்ச்சியான உடல்நலக் கண்காணிப்பு.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6">
          
          {/* SECURITY ALERT BANNER */}
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-start gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {lang === 'en' ? 'Your health data is secure' : 'உங்கள் உடல்நலத் தரவு பாதுகாப்பானது'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {lang === 'en' ? 'End-to-end encrypted' : 'முழுமையாக என்க்ரிப்ட் செய்யப்பட்டது'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'We use this information only to provide you with better and personalized healthcare support.'
                  : 'சிறந்த மற்றும் தனிப்பயனாக்கப்பட்ட மருத்துவ ஆதரவை வழங்க மட்டுமே இந்த தகவலைப் பயன்படுத்துகிறோம்.'}
              </p>
            </div>
          </div>

          {/* METRIC CATEGORY TABS (Matching Records Hub ref.png) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'vitals', label: lang === 'en' ? 'Vitals & Measurements' : 'உடல் அளவீடுகள்', icon: Activity },
              { id: 'blood_sugar', label: lang === 'en' ? 'Blood Sugar' : 'இரத்த சர்க்கரை', icon: Droplets },
              { id: 'pulse', label: lang === 'en' ? 'Pulse' : 'இதயத்துடிப்பு', icon: Heart },
              { id: 'spo2', label: 'SpO2', icon: Activity },
              { id: 'temperature', label: lang === 'en' ? 'Temperature' : 'வெப்பநிலை', icon: Thermometer },
              { id: 'weight', label: lang === 'en' ? 'Weight' : 'எடை', icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 border-2 border-teal-600 text-teal-800 font-bold shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. ADD NEW VITALS READING CARD */}
          <form onSubmit={handleAddVital} className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-5">
            {/* Form Section Header */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {lang === 'en' ? 'Add New Vitals Reading' : 'புதிய அளவீட்டைச் சேர்க்க'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Keep your vitals updated for better insights and personalized advice.'
                    : 'துல்லியமான நுண்ணறிவுகளுக்கு உங்கள் அளவீடுகளை உடனுக்குடன் புதுப்பிக்கவும்.'}
                </p>
              </div>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'en' ? 'Saved to Health Memory!' : 'சேமிக்கப்பட்டது!'}</span>
                </span>
              )}
            </div>

            {/* Metric Input Fields */}
            {activeTab === 'vitals' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Systolic (Top)' : 'சிஸ்டாலிக் (மேல்)'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="70"
                      max="250"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(parseInt(e.target.value) || 120)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-16"
                    />
                    <span className="absolute right-3.5 text-xs font-medium text-slate-400">mmHg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Diastolic (Bottom)' : 'டயஸ்டாலிக் (கீழ்)'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(parseInt(e.target.value) || 80)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-16"
                    />
                    <span className="absolute right-3.5 text-xs font-medium text-slate-400">mmHg</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blood_sugar' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Blood Glucose' : 'இரத்த சர்க்கரை அளவு'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="40"
                      max="500"
                      value={sugarGlucose}
                      onChange={(e) => setSugarGlucose(parseInt(e.target.value) || 110)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-16"
                    />
                    <span className="absolute right-3.5 text-xs font-medium text-slate-400">mg/dL</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Timing Context' : 'அளவீட்டு நேரம்'}
                  </label>
                  <select
                    value={sugarTiming}
                    onChange={(e) => setSugarTiming(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="fasting">{lang === 'en' ? 'Fasting (Before Breakfast)' : 'வெறும் வயிற்றில்'}</option>
                    <option value="postprandial">{lang === 'en' ? 'Postprandial (2 hrs after meal)' : 'உணவுக்குப் பின்'}</option>
                    <option value="random">{lang === 'en' ? 'Random Check' : 'எந்த நேரத்திலும்'}</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'pulse' && (
              <div className="max-w-sm">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {lang === 'en' ? 'Heart Rate / Pulse' : 'இதயத்துடிப்பு'}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value) || 72)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-16"
                  />
                  <span className="absolute right-3.5 text-xs font-medium text-slate-400">bpm</span>
                </div>
              </div>
            )}

            {activeTab === 'spo2' && (
              <div className="max-w-sm">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {lang === 'en' ? 'Oxygen Saturation (SpO2)' : 'ஆக்சிஜன் அளவு (SpO2)'}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={spo2}
                    onChange={(e) => setSpo2(parseInt(e.target.value) || 98)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-12"
                  />
                  <span className="absolute right-3.5 text-xs font-medium text-slate-400">%</span>
                </div>
              </div>
            )}

            {activeTab === 'temperature' && (
              <div className="max-w-md flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Body Temperature' : 'உடல் வெப்பநிலை'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 36.5)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex bg-slate-200 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUnit === 'F') {
                        setTemperature(parseFloat(((temperature - 32) * 5 / 9).toFixed(1)));
                        setTempUnit('C');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tempUnit === 'C' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUnit === 'C') {
                        setTemperature(parseFloat(((temperature * 9 / 5) + 32).toFixed(1)));
                        setTempUnit('F');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tempUnit === 'F' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'weight' && (
              <div className="max-w-sm">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {lang === 'en' ? 'Body Weight' : 'உடல் எடை'}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 68)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-12"
                  />
                  <span className="absolute right-3.5 text-xs font-medium text-slate-400">kg</span>
                </div>
              </div>
            )}

            {/* Date & Time (Optional) matching reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Date & Time (Optional)' : 'தேதி மற்றும் நேரம் (விருப்பத்தேர்வு)'}
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={dateTimeValue}
                  onChange={(e) => setDateTimeValue(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500"
                />
                {dateTimeValue && (
                  <button
                    type="button"
                    onClick={() => setDateTimeValue('')}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Notes (Optional) matching reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Notes (Optional)' : 'குறிப்புகள் (விருப்பத்தேர்வு)'}
              </label>
              <div className="relative flex items-center">
                <FileText className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'e.g. Morning reading after light walk...' : 'எ.கா: லேசான நடைப்பயிற்சிக்கு பின்...'}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'en' ? 'Save to Health Memory' : 'நினைவகத்தில் சேமிக்க'}</span>
              </button>
            </div>
          </form>

          {/* 4. RECENT VITALS HISTORY TABLE SECTION */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {lang === 'en' ? 'Recent Vitals History' : 'சமீபத்திய அளவீட்டு வரலாறு'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'en' ? 'Your latest saved readings' : 'உங்கள் சமீபத்திய சேமிக்கப்பட்ட அளவீடுகள்'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Switch tab or refresh
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
              >
                <span>{lang === 'en' ? 'View All History' : 'அனைத்து வரலாறு'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table with Horizontal Touch Scroll on Mobile */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse min-w-180">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-3 px-4 font-semibold">{lang === 'en' ? 'Date & Time' : 'தேதி & நேரம்'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'en' ? 'Blood Pressure' : 'இரத்த அழுத்தம்'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'en' ? 'Pulse' : 'இதயத்துடிப்பு'}</th>
                      <th className="py-3 px-4 font-semibold">SpO2</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'en' ? 'Temperature' : 'வெப்பநிலை'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'en' ? 'Weight' : 'எடை'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'en' ? 'Notes' : 'குறிப்புகள்'}</th>
                      <th className="py-3 px-4 font-semibold text-center">{lang === 'en' ? 'Actions' : 'செயல்கள்'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {historyRows.slice(0, 8).map((row) => (
                      <tr key={row.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="py-3 px-4 text-slate-900 font-medium whitespace-nowrap">{row.dateTime}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{row.bp}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{row.pulse}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{row.spo2}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{row.temp}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{row.weight}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-40 truncate" title={row.notes}>
                          {row.notes}
                        </td>
                        <td className="py-3 px-4 text-center relative whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenuId(activeActionMenuId === row.id ? null : row.id)}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionMenuId === row.id && (
                            <div className="absolute right-4 top-8 z-30 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-left text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  healthMemoryService.deleteEntry(row.id);
                                  setActiveActionMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium text-left cursor-pointer"
                              >
                                {lang === 'en' ? 'Delete entry' : 'நீக்கு'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 5. MODAL FOOTER */}
        <div className="px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Done' : 'முடிந்தது'}
          </button>
        </div>

      </div>
    </div>
  );
};
