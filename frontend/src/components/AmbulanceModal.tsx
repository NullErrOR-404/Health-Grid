import React, { useState, useEffect } from 'react';
import { X, Siren, PhoneCall, Send, CheckCircle2, AlertTriangle, Navigation, MapPin, FileText } from 'lucide-react';
import type { Language } from '../types';

interface AmbulanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenHandover?: () => void;
}

export const AmbulanceModal: React.FC<AmbulanceModalProps> = ({ isOpen, onClose, lang, onOpenHandover }) => {
  const [eta, setEta] = useState(5);
  const [distance, setDistance] = useState(2.1);
  const [selectedChips, setSelectedChips] = useState<string[]>(['Bring Stretcher (2nd Floor, No Lift)', 'Narrow Street (Park on Main Road)']);
  const [customNote, setCustomNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    'Green gate behind the Pillayar temple.',
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
      setDistance((prev) => (prev > 0.4 ? Number((prev - 0.3).toFixed(1)) : 0.3));
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNote.trim()) {
      setNotesList([...notesList, customNote.trim()]);
      setCustomNote('');
    }
  };

  const chipOptions = [
    { en: 'Bring Stretcher (2nd Floor, No Lift)', ta: 'ஸ்ட்ரெச்சர் தேவை (2வது மாடி, லிப்ட் இல்லை)' },
    { en: 'Narrow Street (Park on Main Road)', ta: 'இடுக்கான தெரு (மெயின் ரோட்டில் நிறுத்தவும்)' },
    { en: 'Oxygen Needed', ta: 'ஆக்ஸிஜன் சிலிண்டர் தேவை' },
    { en: 'Patient Unconscious', ta: 'நோயாளி மயக்க நிலையில் உள்ளார்' },
    { en: 'Known Heart Patient', ta: 'இதய நோயாளி' },
  ];

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div data-lenis-prevent className="bg-white rounded-none sm:rounded-3xl w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl overflow-hidden shadow-2xl border-none sm:border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Siren className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-wide flex items-center gap-2">
                <span>{lang === 'en' ? 'Live 108 Ambulance Dispatch' : '108 அவசர ஆம்புலன்ஸ் நேரலை'}</span>
                <span className="text-[10px] bg-white text-red-600 px-2 py-0.5 rounded-full uppercase font-black">
                  En Route
                </span>
              </div>
              <div className="text-xs text-red-100">
                {lang === 'en' ? 'Vehicle ID: TN-09-G-1084 • Sector: Central' : 'வாகனம்: TN-09-G-1084 • பிரிவு: மையம்'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors min-w-[36px] min-h-[36px] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Live Telemetry HUD Bar */}
          <div className="grid grid-cols-3 gap-3 bg-red-50/80 p-3 sm:p-4 rounded-2xl border border-red-200 text-center">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {lang === 'en' ? 'Live ETA' : 'வரும் நேரம்'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-red-600">
                {eta} {lang === 'en' ? 'Mins' : 'நிமிடம்'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {lang === 'en' ? 'Distance' : 'தொலைவு'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {distance} km
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {lang === 'en' ? 'Speed' : 'வேகம்'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-700">
                45 km/h
              </div>
            </div>
          </div>

          {/* Simulated Interactive Map Display */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-56 sm:h-64 bg-slate-100 flex items-center justify-center">
            {/* Map Background Grid Illustration */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
            
            {/* Simulated Road Polyline */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 60 180 Q 150 120 280 140 T 450 80"
                fill="none"
                stroke="#0D9488"
                strokeWidth="5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </svg>

            {/* Destination Patient Pin */}
            <div className="absolute left-12 bottom-12 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold bg-white/95 px-2 py-0.5 rounded shadow mt-1 border border-slate-200">
                {lang === 'en' ? 'Your Location' : 'உங்கள் இருப்பிடம்'}
              </span>
            </div>

            {/* Moving Ambulance Pin */}
            <div className="absolute right-20 top-14 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white animate-pulse">
                <Siren className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow mt-1">
                TN-09-G-1084
              </span>
            </div>

            {/* Overlay Compass Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>{lang === 'en' ? 'Real-Time GPS Active' : 'நேரலை ஜிபிஎஸ் இயங்குகிறது'}</span>
            </div>
          </div>

          {/* Driver & Paramedic Crew Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">
                {lang === 'en' ? 'Assigned Medical Crew' : 'மருத்துவக் குழு'}
              </div>
              <div className="text-sm font-bold text-slate-900">
                Dr. K. Ramesh (Paramedic Lead) • Driver: M. Selvam
              </div>
              <div className="text-xs text-slate-500">
                {lang === 'en' ? 'Equipped with Advanced Life Support (ALS) & Defibrillator' : 'அனைத்து முதலுதவி வசதிகளும் கொண்ட ஊர்தி'}
              </div>
            </div>

            <a
              href="tel:108"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Call Ambulance Driver' : 'ஓட்டுநரை அழைக்க'}</span>
            </a>
          </div>

          {/* Doctor Handover Card Banner */}
          {onOpenHandover && (
            <div className="bg-rose-50/90 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950">
                    {lang === 'en' ? 'Digital Casualty Handover Card' : 'மருத்துவமனை அவசர சிகிச்சை ஒப்படைப்பு ஏடு'}
                  </div>
                  <div className="text-[11px] text-rose-700">
                    {lang === 'en' ? 'Vital signs & drug allergies pre-formatted for hospital triage' : 'மருத்துவரிடம் காட்டக்கூடிய உயிராதார அளவுகள் மற்றும் ஒவ்வாமை விவரம்'}
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenHandover}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shadow-sm transition-colors"
              >
                {lang === 'en' ? 'View Card' : 'பார்க்க'}
              </button>
            </div>
          )}

          {/* Custom Instruction Giving Panel */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Custom Instructions for Incoming Ambulance' : 'ஆம்புலன்ஸ் குழுவிற்கு சிறப்பு அறிவுறுத்தல்கள்'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Tap quick chips so the driver and paramedic team are prepared before arrival:'
                  : 'விரைவான பட்டன்களை அழுத்தினால் ஆம்புலன்ஸ் குழு தயாராக வரும்:'}
              </p>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2">
              {chipOptions.map((chip, idx) => {
                const label = lang === 'en' ? chip.en : chip.ta;
                const isSelected = selectedChips.includes(chip.en);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleChip(chip.en)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Custom Notes Feed */}
            <div className="space-y-2">
              {notesList.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-100/80 p-2.5 rounded-xl text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Add note form */}
            <form onSubmit={handleSendNote} className="flex items-center gap-2">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={lang === 'en' ? 'Add landmark, floor, or medical allergy note...' : 'வழிகாட்டும் அடையாளம் அல்லது ஒவ்வாமை விவரம்...'}
                className="flex-1 bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>{lang === 'en' ? 'Send' : 'அனுப்பு'}</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Paramedic Pre-Arrival Advice Card */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <div className="font-bold">
                {lang === 'en' ? 'Paramedic Return Instruction:' : 'மருத்துவக் குழுவின் முதலுதவி அறிவுரை:'}
              </div>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>{lang === 'en' ? 'Keep patient sitting upright at a 45-degree angle.' : 'நோயாளியை 45 டிகிரி கோணத்தில் அமர வைக்கவும்.'}</li>
                <li>{lang === 'en' ? 'Do not give food or water.' : 'உணவு அல்லது தண்ணீர் கொடுக்க வேண்டாம்.'}</li>
                <li>{lang === 'en' ? 'Keep front porch lights on for rapid driver spotting.' : 'ஆம்புலன்ஸ் எளிதில் அடையாளம் காண வாசலில் வெளிச்சம் வைக்கவும்.'}</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
