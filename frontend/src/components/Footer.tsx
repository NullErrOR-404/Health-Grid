import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  Globe,
  Smartphone,
  Download,
  X,
  HelpCircle,
  Info,
  HeartHandshake,
  Briefcase,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import type { Language } from '../types';

interface FooterProps {
  lang: Language;
  setLang?: (lang: Language) => void;
  onOpenVoiceChat?: (query?: string) => void;
  onOpenAmbulance?: () => void;
  onOpenPrescription?: () => void;
  onOpenDiseaseMap?: () => void;
  onOpenBabyShots?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onNavigateMedicines?: () => void;
}

type FooterModalType = 
  | 'none' 
  | 'app' 
  | 'faq' 
  | 'about' 
  | 'mission' 
  | 'partners' 
  | 'careers' 
  | 'contact' 
  | 'disclaimer' 
  | 'accessibility';

const CURRENT_YEAR = 2026;

export const Footer: React.FC<FooterProps> = ({ 
  lang, 
  setLang,
  onOpenVoiceChat,
  onOpenAmbulance,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  onOpenPrivacy,
  onOpenTerms,
  onNavigateMedicines,
}) => {
  const [activeModal, setActiveModal] = useState<FooterModalType>('none');
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  const handleDownloadResources = () => {
    const content = `=====================================================
HEALTHGRID (நலம் AI) - TAMIL NADU PUBLIC HEALTH PROTOCOLS (2026)
=====================================================

1. EMERGENCY CONTACTS (24x7):
   - Ambulance Dispatch: Dial 108 (Direct Live Telemetry Available)
   - State Health Helpline: Dial 104
   - Women Safety Helpline: Dial 1091
   - Child Helpline: Dial 1098

2. PMBJP JAN AUSHADHI MEDICINE SAVINGS:
   - Genuine WHO-GMP certified generic pharmaceuticals available across
     state-wide Primary Health Centres and Jan Aushadhi Kendras.
   - Price savings: 50% to 90% lower cost compared to branded commercial formulations per official PMBJP price schedule.

3. ESSENTIAL IMMUNIZATION TIMELINE:
   - At Birth: BCG, OPV-0, Hepatitis B (Birth Dose)
   - 6 Weeks: Pentavalent-1, OPV-1, Rotavirus-1, fIPV-1, PCV-1
   - 10 Weeks: Pentavalent-2, OPV-2, Rotavirus-2
   - 14 Weeks: Pentavalent-3, OPV-3, Rotavirus-3, fIPV-2, PCV-2
   - 9-12 Months: MR-1, PCV Booster, Vitamin A Dose 1
   - 16-24 Months: MR-2, DPT Booster-1, OPV Booster

4. FEVER & DENGUE RADAR PRECAUTIONS:
   - Keep household water storage tightly covered.
   - Avoid stagnant water in discarded tyres, pots, and coconut shells.
   - In case of high fever with platelet drop or bleeding signs, report
     immediately to the nearest Government Hospital or PHC.

Official HealthGrid Portal: https://healthgrid-app.vercel.app
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'HealthGrid_TN_Public_Health_Protocols_2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  return (
    <>
      <footer id="footer-section" className="relative bg-white pt-14 pb-28 md:pb-12 border-t border-slate-200/80 overflow-hidden reveal-init">
        
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
                  loading="lazy"
                  decoding="async"
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
                <li onClick={() => onOpenVoiceChat && onOpenVoiceChat()} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Speak to Doctor' : 'குரல் வழி ஆலோசனை'}
                </li>
                <li onClick={onOpenAmbulance} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Call Ambulance' : 'ஆம்புலன்ஸ்'}
                </li>
                <li onClick={onNavigateMedicines || onOpenPrescription} className="hover:text-teal-700 transition-colors cursor-pointer">
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
                <li onClick={() => onOpenVoiceChat && onOpenVoiceChat('Health education and prevention tips')} className="hover:text-teal-700 transition-colors cursor-pointer">
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
                <li onClick={onOpenDiseaseMap} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Health Library' : 'மருத்துவ நூலகம்'}
                </li>
                <li onClick={onOpenDiseaseMap} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Disease Information' : 'நோய் தகவல்கள்'}
                </li>
                <li onClick={onOpenDiseaseMap} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Public Health Alerts' : 'சுகாதார எச்சரிக்கைகள்'}
                </li>
                <li>
                  <a 
                    href="/privacy"
                    onClick={(e) => {
                      if (onOpenPrivacy) {
                        e.preventDefault();
                        onOpenPrivacy();
                      }
                    }} 
                    className="hover:text-teal-700 transition-colors block py-0.5"
                  >
                    {lang === 'en' ? 'Privacy Policy & Data Sovereignty' : 'தனியுரிமைக் கொள்கை'}
                  </a>
                </li>
                <li>
                  <a 
                    href="/terms"
                    onClick={(e) => {
                      const handler = onOpenTerms || onOpenPrivacy;
                      if (handler) {
                        e.preventDefault();
                        handler();
                      }
                    }} 
                    className="hover:text-teal-700 transition-colors block py-0.5"
                  >
                    {lang === 'en' ? 'Terms & Conditions of Service' : 'விதிமுறைகள் & நிபந்தனைகள்'}
                  </a>
                </li>
                <li onClick={handleDownloadResources} className="hover:text-teal-700 transition-colors cursor-pointer flex items-center gap-1.5">
                  <span>{lang === 'en' ? 'Downloadable Resources' : 'பதிவிறக்கங்கள்'}</span>
                  <Download className="w-3 h-3 text-teal-600" />
                </li>
                <li onClick={() => setActiveModal('faq')} className="hover:text-teal-700 transition-colors cursor-pointer">
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
                <li onClick={() => setActiveModal('about')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'About HealthGrid' : 'HealthGrid பற்றி'}
                </li>
                <li onClick={() => setActiveModal('mission')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Our Mission' : 'எங்கள் நோக்கம்'}
                </li>
                <li onClick={() => setActiveModal('partners')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Partner with Us' : 'எங்களுடன் இணைய'}
                </li>
                <li onClick={() => setActiveModal('careers')} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Careers' : 'பணி வாய்ப்புகள்'}
                </li>
                <li onClick={() => {
                  const marquee = document.getElementById('gov-alert-marquee');
                  if (marquee) {
                    marquee.scrollIntoView({ behavior: 'smooth' });
                  } else if (onOpenDiseaseMap) {
                    onOpenDiseaseMap();
                  }
                }} className="hover:text-teal-700 transition-colors cursor-pointer">
                  {lang === 'en' ? 'News & Updates' : 'செய்திகள்'}
                </li>
                <li onClick={() => setActiveModal('contact')} className="hover:text-teal-700 transition-colors cursor-pointer">
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

                {/* Store Badges with Real PWA Install / Mobile Modal Trigger */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5 mt-3">
                  {/* Google Play Trigger */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('app')}
                    className="bg-black hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all shadow-sm flex-1 cursor-pointer text-left"
                    title={lang === 'en' ? 'Install Android PWA App' : 'ஆண்ட்ராய்டு செயலி'}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M3.6 1.8L13.8 12L3.6 22.2C3.2 21.8 3 21.1 3 20.2V3.8C3 2.9 3.2 2.2 3.6 1.8Z" fill="#2196F3" />
                      <path d="M17.2 8.6L13.8 12L3.6 1.8C4.1 1.3 4.9 1.1 5.8 1.6L17.2 8.6Z" fill="#4CAF50" />
                      <path d="M17.2 15.4L5.8 22.4C4.9 22.9 4.1 22.7 3.6 22.2L13.8 12L17.2 15.4Z" fill="#F44336" />
                      <path d="M21.6 11.1L17.2 8.6L13.8 12L17.2 15.4L21.6 12.9C22.4 12.4 22.4 11.6 21.6 11.1Z" fill="#FFEB3B" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium leading-none">GET IT ON</div>
                      <div className="text-xs font-bold leading-tight">Google Play</div>
                    </div>
                  </button>

                  {/* App Store Trigger */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('app')}
                    className="bg-black hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all shadow-sm flex-1 cursor-pointer text-left"
                    title={lang === 'en' ? 'Install iOS Web App' : 'ஐஓஎஸ் செயலி'}
                  >
                    <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.13 16.69C20.1 16.78 19.71 18.11 18.71 19.5ZM15.22 4.54C15.89 3.73 16.34 2.61 16.22 1.5C15.25 1.54 14.07 2.15 13.38 2.96C12.77 3.67 12.23 4.81 12.38 5.9C13.46 5.98 14.56 5.35 15.22 4.54Z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium leading-none">Download on the</div>
                      <div className="text-xs font-bold leading-tight">App Store</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stay Connected with Real Working External Links */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                  {lang === 'en' ? 'Stay Connected' : 'இணைந்திருங்கள்'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en' ? 'Follow us for the latest health updates.' : 'மருத்துவ அறிவிப்புகளுக்கு பின்தொடரவும்.'}
                </p>

                {/* 5 Social Circles with Active Links */}
                <div className="flex items-center gap-2.5 mt-3">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <span className="font-bold text-sm">f</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (formerly Twitter)"
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
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
              © {CURRENT_YEAR} HealthGrid. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-600">
              <a 
                href="/terms" 
                onClick={(e) => {
                  const handler = onOpenTerms || onOpenPrivacy;
                  if (handler) {
                    e.preventDefault();
                    handler();
                  }
                }} 
                className="hover:text-teal-700 transition-colors cursor-pointer"
              >
                Terms of Service
              </a>
              <span className="text-slate-300">|</span>
              <a 
                href="/privacy" 
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }} 
                className="hover:text-teal-700 font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setActiveModal('disclaimer')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Disclaimer
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setActiveModal('accessibility')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Accessibility
              </button>
              <span className="text-slate-300">|</span>
              <a 
                href="/sitemap.xml" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-teal-700 transition-colors"
              >
                Sitemap
              </a>
            </div>

            {/* Language Switcher with Globe Icon */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setLang && setLang('en')}
                className={`hover:text-teal-700 transition-colors cursor-pointer ${
                  lang === 'en' ? 'text-teal-700 underline font-bold' : ''
                }`}
              >
                EN
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setLang && setLang('ta')}
                className={`font-tamil hover:text-teal-700 transition-colors cursor-pointer ${
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

      {/* ========================================================================= */}
      {/* RICH INTERACTIVE INLINE MODALS FOR COMPLETE FUNCTIONALITY                 */}
      {/* ========================================================================= */}

      {/* 1. App Download / PWA Installation Modal */}
      {activeModal === 'app' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'en' ? 'Get HealthGrid on Your Mobile' : 'மொபைலில் HealthGrid-ஐ நிறுவவும்'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {lang === 'en' 
                ? 'HealthGrid is an advanced Progressive Web App (PWA) engineered for instant zero-download offline emergency care.' 
                : 'HealthGrid உடனடி ஆஃப்லைன் அவசர சிகிச்சைக்கான அதிநவீன வலைச் செயலி ஆகும்.'}
            </p>

            <div className="space-y-3 mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Android (Chrome / Edge):</span>
                  <p className="text-slate-600 mt-0.5">Tap the menu icon (⋮) in your browser top-right, then select <strong className="text-teal-700 font-semibold">"Install App"</strong> or "Add to Home screen".</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">iPhone / iPad (Safari):</span>
                  <p className="text-slate-600 mt-0.5">Tap the Share icon (📤) at the bottom, scroll down and tap <strong className="text-teal-700 font-semibold">"Add to Home Screen"</strong>.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyAppUrl}
                className="w-full py-3 bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedAppUrl ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'en' ? 'App Link Copied to Clipboard!' : 'இணைப்பு நகலெடுக்கப்பட்டது!'}</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Copy Web App Link for Mobile' : 'மொபைல் பயன்பாட்டு இணைப்பை நகலெடு'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'மூடு'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FAQ Modal */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {lang === 'en' ? 'Frequently Asked Questions' : 'அடிக்கடி கேட்கப்படும் கேள்விகள்'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Everything you need to know about HealthGrid services' : 'HealthGrid சேவைகள் பற்றிய பொதுவான பதில்கள்'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900">1. How does the AI Doctor triage work?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  HealthGrid uses clinical AI algorithms verified against Indian ICMR protocols. It listens to your symptoms in English or Tamil, classifies urgency, and provides immediate guidance or escalates to doctors.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900">2. How does 108 Ambulance Dispatch coordinate emergency response?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  When you tap 108 Ambulance, your real-time GPS telemetry is prepared and connected to Tamil Nadu's 108 network, reducing emergency response dispatch overhead.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900">3. How can I buy genuine medicines at 50% to 90% lower cost?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Under the Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP), high-standard generic equivalents of expensive branded medications are dispensed with identical therapeutic bioavailability.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900">4. Is my personal health data private?</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Yes. HealthGrid complies strictly with India's Digital Personal Data Protection (DPDP) Act 2023. Patient telemetry is encrypted in transit and at rest with zero unauthorized commercial third-party sharing.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. About HealthGrid Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <Info className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">About HealthGrid (நலம் AI)</h3>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              HealthGrid is Tamil Nadu's unified digital healthcare network engineered to eliminate barriers between citizens, public health centres, and emergency responders. By integrating vernacular AI voice triage, real-time disease outbreak surveillance, and direct government generic medicine distribution, HealthGrid delivers equitable healthcare accessibility for every family.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Our Mission Modal */}
      {activeModal === 'mission' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Our Mission & Public Health Commitment</h3>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Our mission is to achieve 100% digital health equity by connecting every citizen to certified healthcare intelligence within 30 seconds. We believe high-quality healthcare is a fundamental human right, not a luxury.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Partner with Us Modal */}
      {activeModal === 'partners' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Partner with HealthGrid</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              We collaborate with district medical authorities, public health clinics, hospital networks, and research institutions to expand healthcare telemetry and accessibility.
            </p>

            <div className="mt-4 p-4 bg-teal-50 rounded-2xl border border-teal-100 text-xs text-teal-900 space-y-1">
              <p className="font-semibold">Institutional Inquiries:</p>
              <p>Email: <a href="mailto:partnerships@healthgrid.org" className="underline font-bold text-teal-800">partnerships@healthgrid.org</a></p>
              <p>Government Directorate Liaison: Secretariat, Chennai, Tamil Nadu</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <a
                href="mailto:partnerships@healthgrid.org?subject=HealthGrid%20Institutional%20Partnership"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Send Inquiry Email
              </a>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Careers Modal */}
      {activeModal === 'careers' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Join the HealthGrid Mission</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              We are assembling a team of clinical technologists, systems architects, and public health practitioners to build the future of autonomous healthcare for 80+ million citizens.
            </p>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-900">Current Openings:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Senior AI/ML Health Systems Engineer</li>
                <li>Tele-Clinic Clinical Informatics Officer (MBBS)</li>
                <li>Vernacular NLP / Speech Specialist (Tamil)</li>
              </ul>
              <p className="pt-2 text-slate-500">Send resume to: <a href="mailto:careers@healthgrid.org" className="underline font-bold text-teal-700">careers@healthgrid.org</a></p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <a
                href="mailto:careers@healthgrid.org?subject=Application%20for%20HealthGrid%20Position"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Email CV
              </a>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Contact Us Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Contact HealthGrid Support</h3>
            <p className="text-xs text-slate-600 mt-1">
              Direct hotlines and response channels for emergency and operational support.
            </p>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-200 flex items-center justify-between">
                <div>
                  <div className="font-bold">Medical Emergency (24x7)</div>
                  <div className="text-[11px] text-red-700">Dial 108 Ambulance Dispatch</div>
                </div>
                <a href="tel:108" className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold">Call 108</a>
              </div>

              <div className="p-3 bg-teal-50 text-teal-900 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <div className="font-bold">Health Helpline</div>
                  <div className="text-[11px] text-teal-700">Dial 104 Government Advice</div>
                </div>
                <a href="tel:104" className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold">Call 104</a>
              </div>

              <div className="p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200">
                <div className="font-bold">Email Support</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  General: <a href="mailto:support@healthgrid.org" className="text-teal-700 font-semibold underline">support@healthgrid.org</a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Medical Disclaimer Modal */}
      {activeModal === 'disclaimer' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Clinical & Medical Disclaimer</h3>
            <div className="text-xs text-slate-600 mt-3 space-y-2 leading-relaxed">
              <p>
                HealthGrid (நலம் AI) provides assistive clinical triage and health intelligence. It is designed to aid patients and healthcare professionals in making timely decisions.
              </p>
              <p>
                The information provided is <strong>not a substitute for in-person emergency medical evaluation</strong> by a registered medical practitioner. In case of acute or life-threatening symptoms (such as severe chest pain, sudden numbness, uncontrolled bleeding, or breathing difficulty), immediately call <strong>108</strong> or proceed to the nearest emergency room.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Accessibility Modal */}
      {activeModal === 'accessibility' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Accessibility Statement</h3>
            <div className="text-xs text-slate-600 mt-3 space-y-2 leading-relaxed">
              <p>
                HealthGrid is designed to comply with WCAG 2.1 Level AA standards, ensuring universal accessibility across diverse demographic groups and disabilities.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Full vernacular Tamil and Indian English audio voice triage.</li>
                <li>Screen-reader optimized ARIA landmarks and focus management.</li>
                <li>High contrast color ratios (4.5:1 minimum on all critical text).</li>
                <li>Offline Progressive Web App (PWA) functionality for low-bandwidth rural networks.</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
