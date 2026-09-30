import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Language } from '../types';

interface OutbreakBannerProps {
  lang: Language;
}

export const OutbreakBanner: React.FC<OutbreakBannerProps> = ({ lang }) => {
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length >= 10) {
      setSubscribed(true);
      setTimeout(() => {
        setPhone('');
        setSubscribed(false);
      }, 4000);
    } else {
      alert(lang === 'en' ? 'Please enter a valid 10-digit mobile number' : 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 sm:my-6">
      <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all">
        
        {/* Left Side: Alert Icon Badge & Alert Copy */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 border border-rose-200 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-rose-800 leading-snug">
              {lang === 'en'
                ? 'High Alert: Dengue fever spreading in North Chennai.'
                : 'அதிவேக எச்சரிக்கை: வடசென்னையில் டெங்கு காய்ச்சல் பரவல்.'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {lang === 'en'
                ? 'Drink boiled water and clear stagnant water outside your home.'
                : 'காய்ச்சிய குடிநீரைக் குடிக்கவும், வீட்டைச் சுற்றி தண்ணீர் தேங்காமல் பார்த்துக் கொள்ளவும்.'}
            </p>
          </div>
        </div>

        {/* Divider on Large Screens */}
        <div className="hidden lg:block w-px h-10 bg-rose-200 mx-2"></div>

        {/* Right Side: WhatsApp Alert Subscription Form */}
        <div className="w-full lg:w-auto flex-shrink-0">
          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Subscribed! You will receive local health alerts on WhatsApp.'
                  : 'இணைக்கப்பட்டது! உங்கள் வாட்ஸ்அப்பில் சுகாதார எச்சரிக்கைகள் வரும்.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                {lang === 'en' ? 'Get alert messages on your WhatsApp:' : 'உங்கள் வாட்ஸ்அப்பில் எச்சரிக்கை பெற:'}
              </span>
              <div className="flex items-center w-full sm:w-auto">
                <div className="flex items-center bg-white rounded-l-xl border border-r-0 border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 font-semibold">
                  +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={lang === 'en' ? 'Enter your number' : 'மொபைல் எண்'}
                  className="bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 w-full sm:w-36"
                  maxLength={10}
                />
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-r-xl transition-colors whitespace-nowrap shadow-sm"
                >
                  {lang === 'en' ? 'Subscribe' : 'இணை'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
