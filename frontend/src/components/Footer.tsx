import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  Globe 
} from 'lucide-react';
import type { Language } from '../types';

interface FooterProps {
  lang: Language;
  setLang?: (lang: Language) => void;
  onOpenVoiceChat?: () => void;
  onOpenAmbulance?: () => void;
  onOpenPrescription?: () => void;
  onOpenDiseaseMap?: () => void;
  onOpenBabyShots?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  lang, 
  setLang,
  onOpenVoiceChat,
  onOpenAmbulance,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  onOpenPrivacy,
}) => {
  return (
    <footer className="relative bg-white pt-14 pb-10 border-t border-slate-200/80 overflow-hidden">
      
      {/* Decorative Mint Wave Background at Bottom Matching Footer ref.png */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none -z-0 opacity-70">
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <path
            d="M0 160C240 240 480 80 720 180C960 280 1200 120 1440 200V280H0V160Z"
            fill="url(#footerMintWave1)"
            opacity="0.6"
          />
          <path
            d="M0 200C320 140 640 260 960 160C1280 60 1360 220 1440 180V280H0V200Z"
            fill="url(#footerMintWave2)"
            opacity="0.4"
          />
          <defs>
            <linearGradient id="footerMintWave1" x1="0" y1="0" x2="1440" y2="280" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CCFBF1" />
              <stop offset="1" stopColor="#E6FFFA" />
            </linearGradient>
            <linearGradient id="footerMintWave2" x1="0" y1="0" x2="1440" y2="280" gradientUnits="userSpaceOnUse">
              <stop stopColor="#99F6E4" />
              <stop offset="1" stopColor="#CCFBF1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 5-Column Grid Matching Footer ref.png */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Col 1: Brand Info & 3 Pill Badges (Span 3) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center gap-2.5">
              <img
                src="/Logo.png"
                alt="HealthGrid நலம் AI"
                className="h-9 w-auto object-contain"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Your trusted digital companion for a healthier, safer tomorrow.'
                : 'ஆரோக்கியமான, பாதுகாப்பான நாளைய விடியலுக்கான உங்களின் நம்பகமான வழிகாட்டி.'}
            </p>

            {/* 3 Circular Pill Badges Matching Reference */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>{lang === 'en' ? 'Trusted Information' : 'நம்பகமான தகவல்கள்'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <span>{lang === 'en' ? 'Government Aligned' : 'அரசு வழிகாட்டுதல்'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <span>{lang === 'en' ? 'Secure & Private' : 'பாதுகாப்பானது & ரகசியமானது'}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Our Services (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {lang === 'en' ? 'Our Services' : 'எங்கள் சேவைகள்'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li onClick={onOpenVoiceChat} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Speak to Doctor' : 'குரல் வழி ஆலோசனை'}
              </li>
              <li onClick={onOpenAmbulance} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Call Ambulance' : 'ஆம்புலன்ஸ்'}
              </li>
              <li onClick={onOpenPrescription} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Buy Medicines' : 'மலிவு மருந்துகள்'}
              </li>
              <li onClick={onOpenDiseaseMap} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்'}
              </li>
              <li onClick={onOpenPrescription} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Health Tools' : 'சுகாதார கருவிகள்'}
              </li>
              <li onClick={onOpenBabyShots} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Child Immunization' : 'குழந்தை தடுப்பூசி'}
              </li>
              <li onClick={onOpenVoiceChat} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Health Education' : 'சுகாதார விழிப்புணர்வு'}
              </li>
            </ul>
          </div>

          {/* Col 3: Resources (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {lang === 'en' ? 'Resources' : 'ஆதாரங்கள்'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Health Library' : 'மருத்துவ நூலகம்'}
              </li>
              <li onClick={onOpenDiseaseMap} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Disease Information' : 'நோய் தகவல்கள்'}
              </li>
              <li onClick={onOpenDiseaseMap} className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Public Health Alerts' : 'சுகாதார எச்சரிக்கைகள்'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Guidelines & Policies' : 'வழிகாட்டுதல்கள்'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Downloadable Resources' : 'பதிவிறக்கங்கள்'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Frequently Asked Questions' : 'அடிக்கடி கேட்கப்படும் கேள்விகள்'}
              </li>
            </ul>
          </div>

          {/* Col 4: About (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {lang === 'en' ? 'About' : 'எங்களை பற்றி'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'About HealthGrid' : 'HealthGrid பற்றி'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Our Mission' : 'எங்கள் நோக்கம்'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Partner with Us' : 'எங்களுடன் இணைய'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Careers' : 'பணி வாய்ப்புகள்'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'News & Updates' : 'செய்திகள்'}
              </li>
              <li className="hover:text-teal-700 transition-colors cursor-pointer">
                {lang === 'en' ? 'Contact Us' : 'தொடர்பு கொள்ள'}
              </li>
            </ul>
          </div>

          {/* Col 5: Download App & Stay Connected (Span 3) */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                {lang === 'en' ? 'Download Our App' : 'செயலியை பதிவிறக்க'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'Get HealthGrid on your mobile device for faster access to care and health information.'
                  : 'விரைவான மருத்துவ உதவிக்கு உங்கள் மொபைலில் செயலியை பதிவிறக்குங்கள்.'}
              </p>

              {/* Store Badges Matching Reference */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5 mt-3">
                {/* Google Play */}
                <a
                  href="#playstore"
                  className="bg-black hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all shadow-sm flex-1"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M3.6 1.8L13.8 12L3.6 22.2C3.2 21.8 3 21.1 3 20.2V3.8C3 2.9 3.2 2.2 3.6 1.8Z" fill="#2196F3" />
                    <path d="M17.2 8.6L13.8 12L3.6 1.8C4.1 1.3 4.9 1.1 5.8 1.6L17.2 8.6Z" fill="#4CAF50" />
                    <path d="M17.2 15.4L5.8 22.4C4.9 22.9 4.1 22.7 3.6 22.2L13.8 12L17.2 15.4Z" fill="#F44336" />
                    <path d="M21.6 11.1L17.2 8.6L13.8 12L17.2 15.4L21.6 12.9C22.4 12.4 22.4 11.6 21.6 11.1Z" fill="#FFEB3B" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium leading-none">GET IT ON</div>
                    <div className="text-xs font-bold leading-tight">Google Play</div>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href="#appstore"
                  className="bg-black hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all shadow-sm flex-1"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.13 16.69C20.1 16.78 19.71 18.11 18.71 19.5ZM15.22 4.54C15.89 3.73 16.34 2.61 16.22 1.5C15.25 1.54 14.07 2.15 13.38 2.96C12.77 3.67 12.23 4.81 12.38 5.9C13.46 5.98 14.56 5.35 15.22 4.54Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium leading-none">Download on the</div>
                    <div className="text-xs font-bold leading-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Stay Connected Matching Reference */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                {lang === 'en' ? 'Stay Connected' : 'இணைந்திருங்கள்'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'en' ? 'Follow us for the latest health updates.' : 'மருத்துவ அறிவிப்புகளுக்கு பின்தொடரவும்.'}
              </p>

              {/* 5 Social Circles */}
              <div className="flex items-center gap-2.5 mt-3">
                {/* Facebook */}
                <a
                  href="#facebook"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <span className="font-bold text-sm">f</span>
                </a>

                {/* X */}
                <a
                  href="#x"
                  aria-label="X"
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#instagram"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="#youtube"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#linkedin"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <span className="font-bold text-xs">in</span>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar Matching Footer ref.png */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} HealthGrid. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-600">
            <button onClick={onOpenPrivacy} className="hover:text-teal-700 transition-colors cursor-pointer">Terms of Service</button>
            <span className="text-slate-300">|</span>
            <button onClick={onOpenPrivacy} className="hover:text-teal-700 font-semibold text-slate-800 transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-slate-300">|</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Disclaimer</span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Accessibility</span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Sitemap</span>
          </div>

          {/* Language Switcher with Globe Icon */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <button
              onClick={() => setLang && setLang('en')}
              className={`hover:text-teal-700 transition-colors ${
                lang === 'en' ? 'text-teal-700 underline font-bold' : ''
              }`}
            >
              EN
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setLang && setLang('ta')}
              className={`font-tamil hover:text-teal-700 transition-colors ${
                lang === 'ta' ? 'text-teal-700 underline font-bold' : ''
              }`}
            >
              தமிழ்
            </button>
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};
