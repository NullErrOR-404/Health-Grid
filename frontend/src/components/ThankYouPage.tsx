import React, { useEffect } from 'react';
import { CheckCircle2, Home, MessageSquare, Phone, ShieldCheck, MapPin } from 'lucide-react';
import type { Language } from '../types';

interface ThankYouPageProps {
  lang: Language;
  onNavigateHome: () => void;
  onNavigateChat: () => void;
  onNavigateMaps: () => void;
  onOpenAmbulance: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  lang,
  onNavigateHome,
  onNavigateChat,
  onNavigateMaps,
  onOpenAmbulance,
}) => {
  useEffect(() => {
    document.title = lang === 'en'
      ? 'Thank You | HealthGrid - நலம் AI'
      : 'நன்றி | HealthGrid - நலம் AI';
  }, [lang]);

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50/60 via-slate-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Banner with Doctor Mascot Graphic */}
        <div className="bg-linear-to-r from-teal-700 via-teal-800 to-slate-900 p-8 text-center text-white relative">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === 'en' ? 'Thank You for Choosing HealthGrid' : 'HealthGrid-ஐ தேர்ந்தெடுத்ததற்கு நன்றி'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-100 max-w-md mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Your health journey and trust are our utmost priority. Our 24/7 AI Family Doctor and emergency network are always here for you.'
              : 'உங்கள் உடல்நலப் பாதுகாப்பு எங்கள் தலையாய கடமை. 24/7 AI மருத்துவர் மற்றும் அவசர நெட்வொர்க் எப்போதும் உங்களுடன் உள்ளது.'}
          </p>
        </div>

        {/* Reassurance Highlights */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-teal-950">
                  {lang === 'en' ? 'Verified Medical Guidance' : 'சரிபார்க்கப்பட்ட வழிகாட்டல்'}
                </h4>
                <p className="text-[11px] text-teal-800/80 mt-0.5">
                  {lang === 'en' ? 'ICMR clinical protocols & Indian Pharmacopoeia standards' : 'ICMR மருத்துவ நெறிமுறைகள்'}
                </p>
              </div>
            </div>

            <div
              onClick={onOpenAmbulance}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenAmbulance(); }}
              className="p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 flex items-start gap-3 cursor-pointer transition-colors"
            >
              <Phone className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span>{lang === 'en' ? '108 Emergency Standby' : '108 அவசர ஆம்புலன்ஸ்'}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-200/70 px-1.5 py-0.2 rounded-full">
                    {lang === 'en' ? 'Tap to Call' : 'அழைக்க'}
                  </span>
                </h4>
                <p className="text-[11px] text-rose-800/80 mt-0.5">
                  {lang === 'en' ? 'Live GPS casualty routing across Tamil Nadu' : 'நேரலை அவசர சிகிச்சை'}
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onNavigateChat}
              className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{lang === 'en' ? 'Start AI Doctor Consultation' : 'மருத்துவ ஆலோசனையைத் தொடங்கு'}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateMaps}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>{lang === 'en' ? 'Find 24/7 PHCs & Hospitals' : 'அருகிலுள்ள மருத்துவமனைகளைக் காண்க'}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-2.5 px-4 rounded-2xl text-slate-500 hover:text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Return to Home Page' : 'முகப்புப் பக்கத்திற்குத் திரும்பு'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          {lang === 'en'
            ? 'In medical emergencies, always dial 108 immediately.'
            : 'அவசர மருத்துவ தேவைகளுக்கு உடனே 108 எண்ணை அழைக்கவும்.'}
        </div>

      </div>
    </div>
  );
};
