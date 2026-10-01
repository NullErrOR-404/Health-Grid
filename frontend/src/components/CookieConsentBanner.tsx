import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, ArrowRight } from 'lucide-react';
import type { Language } from '../types';

interface CookieConsentBannerProps {
  lang: Language;
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  lang,
  onOpenPrivacy,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('healthgrid_cookie_consent_v1');
      if (!consent) {
        // Show after a short delay for graceful entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('healthgrid_cookie_consent_v1', 'accepted');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>{lang === 'en' ? 'Privacy & Data Consent' : 'தனியுரிமை & தரவு ஒப்புதல்'}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              </h4>
              <p className="text-[10px] text-slate-400">
                {lang === 'en' ? 'Compliant with HIPAA, DISHA & DPDP Standards' : 'HIPAA & DISHA பாதுகாப்பு நெறிமுறைகளுக்கு உட்பட்டது'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAccept}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          {lang === 'en'
            ? 'HealthGrid uses essential in-memory session cookies and local encrypted vault storage to maintain your clinical consultations and emergency contacts. We strictly never sell your data or deploy third-party advertising trackers.'
            : 'உங்கள் மருத்துவ ஆலோசனை மற்றும் அவசர தொடர்புகளைப் பாதுகாக்க மட்டுமே தேவையான குக்கீகள் பயன்படுத்தப்படுகின்றன. உங்கள் தரவுகள் விளம்பரங்களுக்கு ஒருபோதும் பயன்படுத்தப்படாது.'}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              handleAccept();
              onOpenPrivacy();
            }}
            className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{lang === 'en' ? 'Review Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {lang === 'en' ? 'Accept Essential' : 'ஏற்றுக்கொள்கிறேன்'}
          </button>
        </div>
      </div>
    </div>
  );
};
