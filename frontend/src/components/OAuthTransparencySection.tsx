import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  EyeOff, 
  Database,
  Building2
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
      id="transparency-and-privacy" 
      aria-label="HealthGrid Data Transparency and Google OAuth Disclosure"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl shadow-slate-900/10 border border-teal-500/20 relative overflow-hidden">
        {/* Subtle Decorative Ambient Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-300 text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>{lang === 'en' ? 'User Data Transparency & Trust' : 'பயனர் தரவு வெளிப்படைத்தன்மை & நம்பிக்கை'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {lang === 'en'
                  ? 'How HealthGrid Protects Your Data & Google Account'
                  : 'HealthGrid உங்கள் தரவையும் கூகிள் கணக்கையும் எவ்வாறு பாதுகாக்கிறது'}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {lang === 'en'
                  ? 'HealthGrid (நலம் AI) is an autonomous healthcare emergency network. We believe that clinical trust requires absolute transparency regarding why data is collected, how it is safeguarded, and how third-party integrations operate.'
                  : 'HealthGrid (நலம் AI) என்பது 24/7 உடனடி அவசர சுகாதார வலையமைப்பு. பயனர் தரவு சேகரிப்பு மற்றும் கூகிள் உள்நுழைவு பாதுகாப்பு குறித்த முழு விவரங்களை இங்கே வெளிப்படையாகப் பகிர்கிறோம்.'}
              </p>
            </div>

            {/* Quick Compliance Badges */}
            <div className="flex flex-wrap md:flex-col items-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>DPDP Act 2023 Compliant</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Google API Limited Use</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero Third-Party Ads</span>
              </span>
            </div>
          </div>

          {/* 3-Column Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Application Purpose & Core Scope */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'en' ? '1. App Purpose & Features' : '1. பயன்பாட்டின் நோக்கம்'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'HealthGrid provides instant AI triage assistance (DocBot), 108 emergency ambulance coordination, Jan Aushadhi generic medicine price comparisons (up to 89% savings), and real-time hospital bed locator services across Tamil Nadu.'
                    : 'HealthGrid உடனடி AI மருத்துவ ஆலோசனை (DocBot), 108 ஆம்புலன்ஸ் ஒருங்கிணைப்பு, மலிவு விலை மக்கள் மருந்தக மருந்துகள் மற்றும் அரசு மருத்துவமனை படுக்கைகள் நிலவரத்தை வழங்குகிறது.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-teal-300 font-medium">
                {lang === 'en' ? 'Publicly accessible without login' : 'உள்நுழைவு இன்றியே அணுகலாம்'}
              </div>
            </div>

            {/* Column 2: Exact Purpose of Google User Data Collection */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'en' ? '2. Purpose of Google Sign-In' : '2. கூகிள் உள்நுழைவின் நோக்கம்'}
                </h3>
                <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    {lang === 'en'
                      ? 'When you choose to authenticate using your Google Account, we request only minimum identity scopes:'
                      : 'நீங்கள் கூகிள் மூலம் உள்நுழையும்போது, அடிப்படை அடையாள விவரங்களை மட்டுமே பெறுகிறோம்:'}
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                    <li><strong>openid:</strong> Authenticates your session securely without ever receiving or storing your Google password.</li>
                    <li><strong>email:</strong> Links your private medical vault, prescription notes, and doctor tokens to your identity.</li>
                    <li><strong>profile:</strong> Displays your name on your patient/doctor dashboard.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-blue-300 font-medium">
                {lang === 'en' ? 'No Google Drive, Gmail, or Contact access' : 'தனிப்பட்ட கோப்புகள் அல்லது ஜிமெயில் அணுகல் இல்லை'}
              </div>
            </div>

            {/* Column 3: Google Limited Use & Zero-Ad Guarantee */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'en' ? '3. Limited Use Commitment' : '3. தரவு பாதுகாப்பு உறுதி'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? "HealthGrid's use and transfer to any other app of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements."
                    : 'கூகிள் API-களிலிருந்து பெறப்படும் தரவுகளின் பயன்பாடு Google API Services User Data Policy மற்றும் Limited Use விதிகளுக்கு உட்பட்டது.'}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold pt-1">
                  <EyeOff className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Never sold to brokers or used for advertisements</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-emerald-300 font-medium">
                {lang === 'en' ? 'Strict client-side cryptographic isolation' : 'முழு குறியாக்கப்பட்ட பாதுகாப்பு'}
              </div>
            </div>

          </div>

          {/* Direct Crawlable Links to Privacy Policy & Terms of Service */}
          <div className="pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">
                  {lang === 'en' ? 'Official Documentation & Legal Policies:' : 'அதிகாரப்பூர்வ ஆவணங்கள் மற்றும் கொள்கைகள்:'}
                </span>{' '}
                {lang === 'en'
                  ? 'Review our complete legal terms, data retention lifecycle, and patient sovereignty guarantees.'
                  : 'எங்களின் முழுமையான தனியுரிமைக் கொள்கை மற்றும் விதிமுறைகளைப் படிக்கவும்.'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Crawlable standard anchor tag for Privacy Policy */}
              <a
                href="/privacy"
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                title="Read HealthGrid Privacy Policy"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>

              {/* Crawlable standard anchor tag for Terms of Service */}
              <a
                href="/terms"
                onClick={(e) => {
                  if (onOpenTerms) {
                    e.preventDefault();
                    onOpenTerms();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                title="Read HealthGrid Terms of Service"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Terms of Service' : 'விதிமுறைகள்'}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
