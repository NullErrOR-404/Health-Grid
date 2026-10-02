import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  EyeOff, 
  Globe,
  LayoutGrid
} from 'lucide-react';
import type { Language } from '../types';

interface OAuthTransparencySectionProps {
  lang: Language;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const OAuthTransparencySection: React.FC<OAuthTransparencySectionProps> = ({
  lang,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <section 
      id="transparency-and-trust" 
      aria-label="HealthGrid User Data Transparency and Trust"
      className="w-full relative overflow-hidden bg-[#EDF5FF]"
      style={{
        backgroundImage: `url('/user_data_trust_bg.png')`,
        backgroundPosition: 'top center',
        backgroundSize: '1672px auto',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Container matching 1672px reference canvas */}
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-12 sm:pb-16 relative">
        
        {/* Top Hero Row: Left Text, Center-Right Robot Space (from bg), Far-Right 3 Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[320px] lg:min-h-[380px]">
          
          {/* Left Text Block (Spans 5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4 z-10 bg-white/70 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none rounded-3xl p-4 sm:p-0">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0EDFF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>{lang === 'en' ? 'User Data Transparency & Trust' : 'பயனர் தரவு வெளிப்படைத்தன்மை & நம்பிக்கை'}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.12]">
              <span className="text-[#0F172A] block">
                {lang === 'en' ? 'How HealthGrid Protects' : 'HealthGrid எவ்வாறு பாதுகாக்கிறது'}
              </span>
              <span className="text-[#2563EB] block">
                {lang === 'en' ? 'Your Data & Google Account' : 'உங்கள் தரவு & கூகிள் கணக்கு'}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal max-w-xl">
              {lang === 'en' ? (
                <>
                  HealthGrid (நலம் AI) is an autonomous healthcare emergency network. We believe that clinical trust requires absolute transparency regarding why data is collected, how it is safeguarded, and how third-party integrations operate.
                </>
              ) : (
                <>
                  HealthGrid (நலம் AI) என்பது 24/7 உடனடி அவசர சுகாதார வலையமைப்பு. பயனர் தரவு ஏன் சேகரிக்கப்படுகிறது, எவ்வாறு பாதுகாக்கப்படுகிறது மற்றும் மூன்றாம் தரப்பு இணைப்புகள் எவ்வாறு செயல்படுகின்றன என்பதை வெளிப்படையாகப் பகிர்கிறோம்.
                </>
              )}
            </p>
          </div>

          {/* Center Space (Spans 4 cols on lg): Kept transparent so the 3D DocBot & Google Cards in background are fully visible! */}
          <div className="hidden lg:block lg:col-span-4 min-h-[320px] pointer-events-none" aria-hidden="true" />

          {/* Right Column (Spans 3 cols on lg): Stack of 3 White Pill Badges */}
          <div className="lg:col-span-3 flex flex-col gap-3.5 sm:gap-4 lg:items-end z-10">
            <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_2px_12px_rgba(37,99,235,0.06)] text-slate-800 text-sm font-semibold w-full sm:w-auto">
              <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0 fill-[#2563EB] stroke-white" />
              <span>{lang === 'en' ? 'DPDP Act 2023 Compliant' : 'DPDP சட்டம் 2023 இணக்கமானது'}</span>
            </div>

            <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_2px_12px_rgba(37,99,235,0.06)] text-slate-800 text-sm font-semibold w-full sm:w-auto">
              <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0 fill-[#2563EB] stroke-white" />
              <span>{lang === 'en' ? 'Google API Limited Use' : 'Google API Limited Use'}</span>
            </div>

            <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_2px_12px_rgba(37,99,235,0.06)] text-slate-800 text-sm font-semibold w-full sm:w-auto">
              <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0 fill-[#2563EB] stroke-white" />
              <span>{lang === 'en' ? 'Zero Third-Party Ads' : 'விளம்பரங்கள் இல்லை'}</span>
            </div>
          </div>

        </div>

        {/* 3 Main White Cards Grid matching User Data Transparency & Trust Redesign ref.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 mt-8 sm:mt-12 z-10 relative">
          
          {/* Card 1: 1. App Purpose & Features */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F1FF] flex items-center justify-center text-[#2563EB]">
                <LayoutGrid className="w-5 h-5" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lang === 'en' ? '1. App Purpose & Features' : '1. பயன்பாட்டின் நோக்கம் & வசதிகள்'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'en'
                  ? 'HealthGrid provides instant AI triage assistance (DocBot), 108 emergency ambulance coordination, Jan Aushadhi generic medicine price comparisons (up to 89% savings), and real-time hospital bed locator services across Tamil Nadu.'
                  : 'HealthGrid உடனடி AI மருத்துவ ஆலோசனை (DocBot), 108 அவசர ஆம்புலன்ஸ் ஒருங்கிணைப்பு, மலிவு விலை மக்கள் மருந்தக மருந்துகள் (89% வரை சேமிப்பு) மற்றும் மருத்துவமனை படுக்கைகள் நிலவரத்தை வழங்குகிறது.'}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#059669]">
              <Globe className="w-4 h-4 text-[#059669] flex-shrink-0" />
              <span>{lang === 'en' ? 'Publicly accessible without login' : 'உள்நுழைவு இன்றியே அணுகலாம்'}</span>
            </div>
          </div>

          {/* Card 2: 2. Purpose of Google Sign-In */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                <User className="w-5 h-5" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lang === 'en' ? '2. Purpose of Google Sign-In' : '2. கூகிள் உள்நுழைவின் நோக்கம்'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'en'
                  ? 'When you choose to authenticate using your Google Account, we request only minimum identity scopes:'
                  : 'நீங்கள் கூகிள் கணக்கு மூலம் உள்நுழையும் போது, குறைந்தபட்ச அடையாள விவரங்களை மட்டுமே பெறுகிறோம்:'}
              </p>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">openid:</strong>{' '}
                    {lang === 'en'
                      ? 'Authenticates your session securely without ever receiving or storing your Google password.'
                      : 'கூகிள் கடவுச்சொல்லை சேமிக்காமல் உங்கள் அமர்வைப் பாதுகாப்பாக அங்கீகரிக்கிறது.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">email:</strong>{' '}
                    {lang === 'en'
                      ? 'Links your private medical vault, prescription notes, and doctor tokens to your identity.'
                      : 'உங்கள் தனிப்பட்ட மருத்துவ ஏடு, மருந்துச் சீட்டு மற்றும் டோக்கன்களை உங்கள் கணக்குடன் இணைக்கிறது.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">profile:</strong>{' '}
                    {lang === 'en'
                      ? 'Displays your name on your patient/doctor dashboard.'
                      : 'உங்கள் பெயரை நோயாளி/மருத்துவர் முகப்பில் காண்பிக்கிறது.'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <EyeOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                {lang === 'en' ? (
                  <>No Google Drive, Gmail, or Contact <span className="text-[#2563EB]">access</span></>
                ) : (
                  <>கூகிள் டிரைவ், ஜிமெயில் அல்லது தொடர்புகள் அணுகல் இல்லை</>
                )}
              </span>
            </div>
          </div>

          {/* Card 3: 3. Limited Use Commitment */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F9F3] flex items-center justify-center text-[#059669]">
                <Lock className="w-5 h-5" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lang === 'en' ? '3. Limited Use Commitment' : '3. கட்டுப்படுத்தப்பட்ட பயன்பாட்டு உறுதி'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'en'
                  ? "HealthGrid's use and transfer to any other app of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements."
                  : 'கூகிள் API-களிலிருந்து பெறப்படும் தகவல்களின் பயன்பாடு Google API Services User Data Policy மற்றும் Limited Use விதிகளுக்கு உட்பட்டது.'}
              </p>

              {/* Callout box matching reference screenshot */}
              <div className="bg-[#EAF9F2] border border-[#C6F0DF] rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  ✓
                </div>
                <span className="text-xs font-semibold text-[#047857]">
                  {lang === 'en' ? 'Never sold to brokers or used for advertisements' : 'தரவு தரகர்களுக்கு விற்கப்படாது அல்லது விளம்பரங்களுக்குப் பயன்படுத்தப்படாது'}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
              <span>{lang === 'en' ? 'Strict client-side cryptographic isolation' : 'முழு குறியாக்கப்பட்ட தரவுப் பாதுகாப்பு'}</span>
            </div>
          </div>

        </div>

        {/* Bottom Documentation & Legal Policies Bar matching reference */}
        <div className="mt-6 sm:mt-8 z-10 relative">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left Text with Icon */}
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {lang === 'en' ? 'Official Documentation & Legal Policies:' : 'அதிகாரப்பூர்வ ஆவணங்கள் & சட்டக் கொள்கைகள்:'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Review our complete legal terms, data retention lifecycle, and patient sovereignty guarantees.'
                    : 'எங்களின் முழுமையான தனியுரிமைக் கொள்கை மற்றும் சேவை விதிமுறைகளைப் படிக்கவும்.'}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <a
                href="/privacy"
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/70 text-blue-600 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                title="Read HealthGrid Privacy Policy"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
              </a>

              <a
                href="/terms"
                onClick={(e) => {
                  if (onOpenTerms) {
                    e.preventDefault();
                    onOpenTerms();
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/70 text-blue-600 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                title="Read HealthGrid Terms of Service"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{lang === 'en' ? 'Terms of Service' : 'விதிமுறைகள்'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
