import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ExternalLink, ArrowLeft, Check, Lock } from 'lucide-react';
import type { Language } from '../types';

interface CookieConsentBannerProps {
  lang: Language;
  onOpenPrivacy: () => void;
}

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  telemetry: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'healthgrid_cookie_consent_v1';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  lang,
  onOpenPrivacy,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Preference switches for Manage Choices view
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show after a subtle delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed: ConsentPreferences = JSON.parse(stored);
        setAnalyticsEnabled(!!parsed.analytics);
        setTelemetryEnabled(!!parsed.telemetry);
      }
    } catch {
      // Fallback
    }
  }, []);

  const saveConsent = (analytics: boolean, telemetry: boolean) => {
    try {
      const payload: ConsentPreferences = {
        essential: true,
        analytics,
        telemetry,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore local storage errors
    }
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    saveConsent(false, false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleSaveCustomChoices = () => {
    saveConsent(analyticsEnabled, telemetryEnabled);
  };

  const handleDismiss = () => {
    // Dismiss defaults to essential-only compliance
    handleAcceptEssential();
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label={lang === 'en' ? 'Privacy & Cookie Consent' : 'தனியுரிமை ஒப்புதல்'}
      className="fixed bottom-6 right-6 z-40 max-w-115 w-[calc(100%-2rem)] sm:w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {!showChoices ? (
        // Standard View matching Reference Screenshot 1:1
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#E0F7F6] text-[#00897B] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight">
                  {lang === 'en' ? 'Your privacy matters' : 'உங்கள் தனியுரிமை முக்கியமானது'}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  {lang === 'en'
                    ? 'Choose how HealthGrid uses data'
                    : 'ஹெல்த்கிரிட் தரவை எவ்வாறு பயன்படுத்துகிறது என்பதைத் தேர்ந்தெடுக்கவும்'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 -mr-1.5 -mt-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              title={lang === 'en' ? 'Dismiss' : 'மூடு'}
              aria-label="Dismiss privacy banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description Paragraph */}
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-4">
            {lang === 'en'
              ? 'We use essential storage to keep your session active and protect your health information. Optional analytics help us improve the service.'
              : 'உங்கள் அமர்வைச் செயல்படுத்தவும், மருத்துவத் தகவல்களைப் பாதுகாக்கவும் அத்தியாவசிய சேமிப்பகத்தைப் பயன்படுத்துகிறோம். விருப்பப் பகுப்பாய்வு சேவையை மேம்படுத்த உதவுகிறது.'}
          </p>

          {/* Privacy Policy Link */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                onOpenPrivacy();
              }}
              className="text-[#00897B] hover:text-[#00796B] font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:underline cursor-pointer group"
            >
              <span>{lang === 'en' ? 'Read our Privacy Policy' : 'எங்கள் தனியுரிமைக் கொள்கையைப் படிக்கவும்'}</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2] text-[#00897B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Bottom Actions Row */}
          <div className="mt-6 sm:mt-7 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap pt-1">
            <button
              type="button"
              onClick={() => setShowChoices(true)}
              className="text-xs sm:text-sm font-medium text-[#00897B] hover:text-[#00796B] hover:underline cursor-pointer py-1.5"
            >
              {lang === 'en' ? 'Cookie settings' : 'குக்கீ அமைப்புகள்'}
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
              <button
                type="button"
                onClick={() => setShowChoices(true)}
                className="border border-[#00897B] text-[#00897B] hover:bg-[#E0F7F6]/60 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95"
              >
                {lang === 'en' ? 'Manage choices' : 'விருப்பங்களை நிர்வகி'}
              </button>

              <button
                type="button"
                onClick={handleAcceptEssential}
                className="bg-[#00897B] hover:bg-[#00796B] text-white px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
              >
                {lang === 'en' ? 'Accept essential only' : 'அத்தியாவசியத்தை மட்டும் ஏற்கவும்'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Choices / Preferences Sub-Panel
        <div className="animate-in fade-in duration-200">
          {/* Back button & Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setShowChoices(false)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#00897B] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back' : 'பின்செல்'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            <h4 className="text-slate-900 font-bold text-base sm:text-lg">
              {lang === 'en' ? 'Manage Cookie Choices' : 'குக்கீ விருப்பங்களை நிர்வகியுங்கள்'}
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              {lang === 'en'
                ? 'Configure optional categories. Essential storage is always required to protect your health records.'
                : 'உங்கள் மருத்துவத் தகவல்களைப் பாதுகாக்க அத்தியாவசிய சேமிப்பு எப்போதும் தேவை.'}
            </p>
          </div>

          {/* Categories List */}
          <div className="mt-4 space-y-3 max-h-65 overflow-y-auto pr-1">
            {/* Category 1: Essential (Locked) */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'en' ? 'Essential Storage' : 'அத்தியாவசிய சேமிப்பு'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#00796B] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {lang === 'en' ? 'Always Active' : 'எப்போதும் செயலில்'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {lang === 'en'
                    ? 'Maintains consultation sessions, encrypted local health vault, and emergency SOS routing.'
                    : 'மருத்துவ அமர்வுகள், பாதுகாக்கப்பட்ட சுகாதார பெட்டகம் மற்றும் அவசர சேவைகளை இயக்குகிறது.'}
                </p>
              </div>
              <div className="w-10 h-6 rounded-full bg-[#00897B] flex items-center justify-end px-1 opacity-90 cursor-not-allowed shrink-0">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#00897B] stroke-3" />
                </div>
              </div>
            </div>

            {/* Category 2: Analytics & Performance (Toggleable) */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'en' ? 'Analytics & Performance' : 'பகுப்பாய்வு மற்றும் செயல்பாடு'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {lang === 'en' ? 'Optional' : 'விருப்பமானது'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {lang === 'en'
                    ? 'Anonymous telemetry to detect slow load times and optimize AI doctor triage speed.'
                    : 'பக்கங்களின் வேகம் மற்றும் AI மருத்துவ ஆலோசனையின் வேகத்தை மேம்படுத்த உதவுகிறது.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  analyticsEnabled ? 'bg-[#00897B] justify-end' : 'bg-slate-200 justify-start'
                }`}
                aria-pressed={analyticsEnabled}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
              </button>
            </div>

            {/* Category 3: Emergency Telemetry (Toggleable) */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'en' ? 'Emergency Geo-Telemetry' : 'அவசர புவிஇருப்பிட சேமிப்பு'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {lang === 'en' ? 'Optional' : 'விருப்பமானது'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {lang === 'en'
                    ? 'Caches hospital & 108 ambulance proximity so dispatch works during sudden network dropouts.'
                    : 'நெட்வொர்க் இல்லாத நேரத்திலும் அவசர மருத்துவ ஊர்தி வழிகாட்டலை துரிதப்படுத்த சேமிக்கிறது.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTelemetryEnabled(!telemetryEnabled)}
                className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  telemetryEnabled ? 'bg-[#00897B] justify-end' : 'bg-slate-200 justify-start'
                }`}
                aria-pressed={telemetryEnabled}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="text-xs sm:text-sm font-semibold text-[#00897B] hover:underline cursor-pointer"
            >
              {lang === 'en' ? 'Accept all' : 'அனைத்தையும் ஏற்கவும்'}
            </button>

            <button
              type="button"
              onClick={handleSaveCustomChoices}
              className="bg-[#00897B] hover:bg-[#00796B] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {lang === 'en' ? 'Save preferences' : 'விருப்பங்களைச் சேமி'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
