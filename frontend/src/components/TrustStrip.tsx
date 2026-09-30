import React from 'react';
import { ShieldCheck, Zap, Truck, Lock } from 'lucide-react';
import type { Language } from '../types';

interface TrustStripProps {
  lang: Language;
}

export const TrustStrip: React.FC<TrustStripProps> = ({ lang }) => {
  return (
    <div id="trust-strip" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-t border-slate-200/90 my-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Item 1 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0 border border-teal-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {lang === 'en' ? '100% Doctor-Verified' : 'மருத்துவர் சரிபார்த்தது'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500">
              {lang === 'en' ? 'Medical Facts' : 'உண்மையான தகவல்கள்'}
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 flex-shrink-0 border border-cyan-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {lang === 'en' ? 'Instant Response' : 'உடனடி பதில்'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500">
              {lang === 'en' ? 'In Seconds' : 'நொடிகளில்'}
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0 border border-red-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {lang === 'en' ? 'Fast Ambulance' : 'ஆம்புலன்ஸ் கண்காணிப்பு'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500">
              {lang === 'en' ? 'Live GPS Tracking' : 'நேரலை வரைபடம்'}
            </div>
          </div>
        </div>

        {/* Item 4 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {lang === 'en' ? 'Private & 100% Secure' : '100% பாதுகாப்பானது'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500">
              {lang === 'en' ? 'Your data is always safe' : 'தகவல்கள் ரகசியம்'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
