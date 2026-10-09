import React, { useEffect, useState } from 'react';
import { 
  HeartPulse, 
  Home, 
  ArrowLeft, 
  Stethoscope, 
  MapPin, 
  Pill, 
  Siren, 
  Baby, 
  Activity, 
  Compass, 
  FileQuestion,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import type { Language } from '../types';
import { Navbar } from './Navbar';
import { GovAlertMarquee } from './GovAlertMarquee';
import { Footer } from './Footer';

interface NotFoundPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onNavigateHome: () => void;
  onNavigateChat: () => void;
  onNavigateMaps: () => void;
  onNavigateProfile: () => void;
  onOpenAmbulance: () => void;
  onOpenPrescription: () => void;
  onOpenBabyShots: () => void;
  onOpenPrivacy: () => void;
  onOpenLogin: () => void;
  onNavigateMedicines?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  lang,
  setLang,
  onNavigateHome,
  onNavigateChat,
  onNavigateMaps,
  onNavigateProfile,
  onOpenAmbulance,
  onOpenPrescription,
  onOpenBabyShots,
  onOpenPrivacy,
  onOpenLogin,
  onNavigateMedicines,
}) => {
  const [attemptedPath, setAttemptedPath] = useState('');

  useEffect(() => {
    // Capture the exact attempted pathname & search params
    const path = window.location.pathname + window.location.search;
    setAttemptedPath(path);

    // Set professional browser tab title
    const prevTitle = document.title;
    document.title = lang === 'en' 
      ? '404 - Page Not Found | HealthGrid - நலம் AI'
      : '404 - பக்கம் கிடைக்கவில்லை | HealthGrid - நலம் AI';

    return () => {
      document.title = prevTitle;
    };
  }, [lang]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* Coordinated Sticky Top Navigation */}
      <header className="sticky top-0 z-40 w-full">
        {/* Top Government Health Bulletin Bar */}
        <GovAlertMarquee
          lang={lang}
          onOpenMaps={onNavigateMaps}
          onOpenAmbulance={onOpenAmbulance}
        />
        <Navbar
          lang={lang}
          setLang={setLang}
          activeView="not-found"
          onOpenAmbulance={onOpenAmbulance}
          onOpenVoiceChat={onNavigateChat}
          onOpenPrescription={onOpenPrescription}
          onOpenDiseaseMap={onNavigateMaps}
          onOpenBabyShots={onOpenBabyShots}
          onOpenLogin={onOpenLogin}
          onNavigateProfile={onNavigateProfile}
          onNavigateHome={onNavigateHome}
          onNavigateMedicines={onNavigateMedicines}
        />
      </header>

      {/* Main 404 Telemetry Interface */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        
        {/* Urgent Emergency Warning Ribbon if patient in acute distress */}
        <div className="mb-8 bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-red-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Siren className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                {lang === 'en' 
                  ? 'Experiencing an Acute Medical Emergency?' 
                  : 'அவசர மருத்துவ ஆபத்து அல்லது விபத்தா?'}
              </p>
              <p className="text-xs text-red-100">
                {lang === 'en'
                  ? 'Do not waste time searching. Dispatch emergency 108 ambulance triage immediately.'
                  : 'நேரத்தை வீணாக்காதீர்கள். உடனடியாக 108 ஆம்புலன்ஸ் அழைப்பைத் தொடங்கவும்.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAmbulance}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Siren className="w-4 h-4 text-red-600" />
            {lang === 'en' ? 'Call 108 Ambulance' : '108 ஆம்புலன்ஸ் அழைக்க'}
          </button>
        </div>

        {/* Central 404 Clinical Monitor Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden relative">
          
          {/* Top ECG Vital Bar */}
          <div className="bg-slate-900 text-slate-300 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-mono tracking-wider uppercase text-rose-400 font-bold">
                {lang === 'en' ? 'Telemetry Status: Signal Lost (404)' : 'டெலிமெட்ரி நிலை: இணைப்பு துண்டிக்கப்பட்டது (404)'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 max-w-full overflow-hidden text-ellipsis">
              <FileQuestion className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">PATH: {attemptedPath || '/unknown'}</span>
            </div>
          </div>

          <div className="p-6 sm:p-12 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Visual Diagnostic Graphic */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  
                  {/* Outer glowing pulsing rings */}
                  <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-pulse pointer-events-none" />
                  <div className="absolute -inset-4 rounded-full bg-slate-100 -z-10" />

                  {/* SVG ECG Heartbeat Monitor Display */}
                  <div className="w-full h-full rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 p-4 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden relative">
                    
                    {/* Grid lines overlay */}
                    <div 
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: 'linear-gradient(#00A896 1px, transparent 1px), linear-gradient(90deg, #00A896 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                      }}
                    />

                    {/* Header info */}
                    <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-teal-400/80">
                      <span>ECG MONITOR</span>
                      <span className="text-rose-400">FLATLINE</span>
                    </div>

                    {/* Animated Waveform SVG */}
                    <div className="relative z-10 my-auto">
                      <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                        <defs>
                          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00A896" />
                            <stop offset="50%" stopColor="#2DD4BF" />
                            <stop offset="70%" stopColor="#F43F5E" />
                            <stop offset="100%" stopColor="#94A3B8" />
                          </linearGradient>
                        </defs>
                        {/* Heartbeat pulse that flatlines into 404 */}
                        <path
                          d="M 0 30 L 30 30 L 40 10 L 48 50 L 58 5 L 68 35 L 75 30 L 120 30 L 130 30 L 200 30"
                          fill="none"
                          stroke="url(#ecgGrad)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Traveling glowing pulse point */}
                        <circle cx="75" cy="30" r="3.5" fill="#F43F5E" className="animate-ping" />
                        <circle cx="75" cy="30" r="3" fill="#F43F5E" />
                      </svg>
                    </div>

                    {/* Numeric Diagnostic Readout */}
                    <div className="relative z-10 flex justify-between items-end">
                      <div className="text-left font-mono">
                        <div className="text-[9px] text-slate-400">HEART RATE</div>
                        <div className="text-xs text-rose-400 font-bold tracking-wider">00 BPM</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-2xl font-black text-teal-400 tracking-tight">404</div>
                        <div className="text-[8px] text-slate-400 tracking-widest uppercase">NOT_FOUND</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>{lang === 'en' ? 'HealthGrid Core Diagnostic Route' : 'ஹெல்த்கிரிட் கணினி பாதை'}</span>
                </div>
              </div>

              {/* Right Column: Explanatory Content & Navigation Solutions */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 px-3.5 py-1.5 rounded-full text-xs font-bold">
                  <HeartPulse className="w-4 h-4 text-teal-600" />
                  <span>{lang === 'en' ? 'Error Code 404 • Resource Not Located' : 'பிழை 404 • பக்கம் கண்டறியப்படவில்லை'}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {lang === 'en' 
                    ? 'Diagnostic Signal Lost: This Page Does Not Exist' 
                    : 'மருத்துவத் தொடர்பு கிடைக்கவில்லை: பக்கம் பயன்பாட்டில் இல்லை'}
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {lang === 'en' ? (
                    <>
                      The healthcare route or record at <code className="bg-slate-100 text-teal-700 px-2 py-0.5 rounded font-mono text-xs">{attemptedPath}</code> could not be found on our network. It may have been renamed, moved, or entered with an invalid URL.
                    </>
                  ) : (
                    <>
                      நீங்கள் அணுக முயன்ற <code className="bg-slate-100 text-teal-700 px-2 py-0.5 rounded font-mono text-xs">{attemptedPath}</code> என்ற இணைய முகவரி எங்கள் தளத்தில் காணப்படவில்லை. தட்டச்சு செய்ததில் பிழை இருக்கலாம் அல்லது பக்கம் நகர்த்தப்பட்டிருக்கலாம்.
                    </>
                  )}
                </p>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={onNavigateHome}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Return to Safe Home Hub' : 'முகப்புப் பக்கத்திற்குச் செல்'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.history.length > 1) {
                        window.history.back();
                      } else {
                        onNavigateHome();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>{lang === 'en' ? 'Go Back' : 'முந்தைய பக்கம்'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Service Jump Cards */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" />
                {lang === 'en' ? 'Where would you like to navigate instead?' : 'நீங்கள் செல்ல விரும்பும் பிற மருத்துவச் சேவைகள்:'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. AI Doctor Consultation */}
                <div 
                  onClick={onNavigateChat}
                  className="group bg-slate-50 hover:bg-teal-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">
                      {lang === 'en' ? 'AI Doctor Chat' : 'AI மருத்துவர் உரையாடல்'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {lang === 'en' ? 'Free 24/7 symptom checker & clinical voice consultation.' : '24/7 இலவச மருத்துவ ஆலோசனை மற்றும் அறிகுறி வழிகாட்டி.'}
                    </p>
                  </div>
                </div>

                {/* 2. Find Care Near You */}
                <div 
                  onClick={onNavigateMaps}
                  className="group bg-slate-50 hover:bg-teal-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-900">
                      {lang === 'en' ? 'Hospitals & Care Map' : 'அருகிலுள்ள மருத்துவமனைகள்'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {lang === 'en' ? 'Locate emergency centers, verified clinics & ICU beds.' : 'அவசர சிகிச்சை மையங்கள் மற்றும் கிளினிக்குகள் இருப்பிடம்.'}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={onNavigateMedicines || (() => {
                    window.history.pushState({}, '', '/medicines');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  })}
                  className="group bg-slate-50 hover:bg-teal-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Pill className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-900">
                      {lang === 'en' ? 'Generic Medicine Finder' : 'ஜெனரிக் மருந்துகள் மாற்று'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {lang === 'en' ? 'Scan Rx to save up to 80% on Jan Aushadhi generic pills.' : 'விலை குறைந்த தரமான மருந்துகளைக் கண்டறியவும்.'}
                    </p>
                  </div>
                </div>

                {/* 4. Baby Immunization Tracker */}
                <div 
                  onClick={onOpenBabyShots}
                  className="group bg-slate-50 hover:bg-teal-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Baby className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-900">
                      {lang === 'en' ? 'Baby Shots Tracker' : 'குழந்தை தடுப்பூசி அட்டவணை'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {lang === 'en' ? 'National vaccination schedule & reminder tracker.' : 'தடுப்பூசி கால அட்டவணை மற்றும் நினைவூட்டல்.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Security / Privacy Badge */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>HealthGrid Patient Data & Navigation Security Protocol</span>
              </div>
              <button
                onClick={onOpenPrivacy}
                className="text-teal-600 hover:text-teal-700 underline font-medium"
              >
                {lang === 'en' ? 'Privacy Policy & Data Sovereignty' : 'தனியுரிமைக் கொள்கை'}
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Global Standard HealthGrid Footer */}
      <Footer
        lang={lang}
        setLang={setLang}
        onOpenVoiceChat={onNavigateChat}
        onOpenAmbulance={onOpenAmbulance}
        onOpenPrescription={onOpenPrescription}
        onOpenDiseaseMap={onNavigateMaps}
        onOpenBabyShots={onOpenBabyShots}
        onOpenPrivacy={onOpenPrivacy}
      />
    </div>
  );
};
