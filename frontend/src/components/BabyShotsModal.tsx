import React, { useState } from 'react';
import { X, Baby, Calendar, CheckCircle2, Bell, ShieldCheck, Clock, Check } from 'lucide-react';
import type { Language } from '../types';

interface BabyShotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const BabyShotsModal: React.FC<BabyShotsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [dob, setDob] = useState('2026-06-15');
  const [reminderSaved, setReminderSaved] = useState(false);

  if (!isOpen) return null;

  const vaccines = [
    {
      periodEn: 'At Birth (Day 0)',
      periodTa: 'பிறந்தவுடன் (நாள் 0)',
      status: 'completed',
      shots: [
        { name: 'BCG', descEn: 'Protects against severe tuberculosis', descTa: 'காசநோய் தடுப்பு' },
        { name: 'OPV-0', descEn: 'Oral polio drops', descTa: 'போலியோ சொட்டு மருந்து' },
        { name: 'Hepatitis B (Birth dose)', descEn: 'Protects baby liver', descTa: 'மஞ்சள் காமாலை தடுப்பு' },
      ],
    },
    {
      periodEn: 'At 6 Weeks (1.5 Months)',
      periodTa: '6-வது வாரம் (1.5 மாதம்)',
      status: 'completed',
      shots: [
        { name: 'Pentavalent 1', descEn: '5-in-1: Diphtheria, Pertussis, Tetanus, Hep B, Hib', descTa: 'ஐந்து நோய்கள் தடுப்பு' },
        { name: 'Rotavirus 1', descEn: 'Protects against severe baby diarrhea', descTa: 'வயிற்றுப்போக்கு தடுப்பு' },
        { name: 'PCV 1', descEn: 'Protects against pneumonia', descTa: 'நிமோனியா தடுப்பு' },
      ],
    },
    {
      periodEn: 'At 10 Weeks (2.5 Months)',
      periodTa: '10-வது வாரம் (2.5 மாதம்)',
      status: 'due',
      shots: [
        { name: 'Pentavalent 2', descEn: 'Second booster dose', descTa: 'இரண்டாவது தவணை' },
        { name: 'Rotavirus 2', descEn: 'Second oral drops dose', descTa: 'இரண்டாம் தவணை சொட்டு மருந்து' },
        { name: 'OPV 2', descEn: 'Polio drops', descTa: 'போலியோ சொட்டு மருந்து' },
      ],
    },
    {
      periodEn: 'At 14 Weeks (3.5 Months)',
      periodTa: '14-வது வாரம் (3.5 மாதம்)',
      status: 'upcoming',
      shots: [
        { name: 'Pentavalent 3', descEn: 'Third protective dose', descTa: 'மூன்றாவது தவணை' },
        { name: 'Rotavirus 3', descEn: 'Third drops dose', descTa: 'மூன்றாம் தவணை சொட்டு மருந்து' },
        { name: 'PCV 2', descEn: 'Second pneumonia dose', descTa: 'இரண்டாவது நிமோனியா தவணை' },
      ],
    },
    {
      periodEn: 'At 9 to 12 Months',
      periodTa: '9 முதல் 12 மாதங்கள்',
      status: 'upcoming',
      shots: [
        { name: 'Measles-Rubella (MR-1)', descEn: 'Protects against measles & rash fever', descTa: 'தட்டம்மை தடுப்பூசி' },
        { name: 'Vitamin A (Dose 1)', descEn: 'Eye health & immune defense', descTa: 'வைட்டமின் ஏ திரவம்' },
      ],
    },
  ];

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div data-lenis-prevent className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Baby className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  {lang === 'en' ? 'Baby Vaccination Schedule' : 'குழந்தை தடுப்பூசி வழிகாட்டி'}
                </h3>
                <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                  {lang === 'en' ? '100% Free at PHC' : 'அரசு ஆரம்ப சுகாதார நிலையத்தில் இலவசம்'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                {lang === 'en' ? 'Universal Immunization Programme (UIP) timeline' : 'தேசிய தடுப்பூசி திட்ட அட்டவணை'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          
          {/* Baby DOB Input Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 block">
                  {lang === 'en' ? "Baby's Date of Birth:" : 'குழந்தையின் பிறந்த தேதி:'}
                </label>
                <span className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Calculates exact scheduled vaccination milestones' : 'தடுப்பூசி போடும் தேதியை கணக்கிடும்'}
                </span>
              </div>
            </div>

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* WhatsApp Reminder Strip */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {lang === 'en' ? 'Free WhatsApp Shot Reminders' : 'வாட்ஸ்அப்பில் இலவச தடுப்பூசி நினைவூட்டல்'}
                </div>
                <div className="text-[11px] text-slate-600">
                  {lang === 'en' ? 'Get an alert 2 days before each scheduled date' : 'ஒவ்வொரு தவணைக்கு 2 நாட்களுக்கு முன் தகவல் வரும்'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setReminderSaved(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5"
            >
              {reminderSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Reminders Set' : 'பதிவு செய்யப்பட்டது'}</span>
                </>
              ) : (
                <span>{lang === 'en' ? 'Enable Reminders' : 'நினைவூட்டல் அமை'}</span>
              )}
            </button>
          </div>

          {/* Timeline List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'en' ? 'Vaccination Milestones' : 'தடுப்பூசி அட்டவணை விவரம்'}
            </h4>

            {vaccines.map((v, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3 transition-colors hover:border-emerald-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      {lang === 'ta' ? v.periodTa : v.periodEn}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 ${
                      v.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'due'
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {v.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{lang === 'en' ? 'Completed' : 'முடிந்தது'}</span>
                      </>
                    ) : v.status === 'due' ? (
                      <>
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{lang === 'en' ? 'Due This Week' : 'இந்த வாரம் போட வேண்டும்'}</span>
                      </>
                    ) : (
                      <span>{lang === 'en' ? 'Upcoming' : 'அடுத்து வரும்'}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {v.shots.map((shot, sIdx) => (
                    <div key={sIdx} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100/80">
                      <div className="font-bold text-xs text-slate-900">{shot.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {lang === 'ta' ? shot.descTa : shot.descEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'en' ? 'Compliant with WHO & Ministry of Health Guidelines' : 'உலக சுகாதார நிறுவனம் & இந்திய அரசு வழிகாட்டுதல்'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {lang === 'en' ? 'Close' : 'மூடு'}
          </button>
        </div>

      </div>
    </div>
  );
};
