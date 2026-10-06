import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Globe
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
      className="w-full relative overflow-hidden bg-[#EDF5FF] border-t border-blue-100/70 content-auto"
      style={{
        backgroundImage: `url('/user_data_trust_bg.png')`,
        backgroundPosition: 'right center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle overlay for small screens to ensure ultra-high contrast while preserving background graphics */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#EDF5FF]/95 via-[#EDF5FF]/80 to-transparent lg:hidden pointer-events-none" />

      {/* Main Content Container: Left Panel utilizes the empty space, leaving the entire robot body visible on the right */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[580px] lg:min-h-[660px]">
          
          {/* Left Transparency Panel: Clean, Concise & 100% Verifiable */}
          <div className="lg:col-span-6 xl:col-span-6 max-w-2xl bg-white/95 backdrop-blur-xl border border-blue-100 shadow-[0_10px_35px_rgba(37,99,235,0.07)] rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Header Area */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0EDFF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>{lang === 'en' ? 'User Data Transparency & Trust' : 'பயனர் தரவு வெளிப்படைத்தன்மை & நம்பிக்கை'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-[#0F172A] leading-tight">
                {lang === 'en' ? (
                  <>
                    How HealthGrid Protects <span className="text-[#2563EB] block">Your Data & Google Account</span>
                  </>
                ) : (
                  <>
                    HealthGrid எவ்வாறு பாதுகாக்கிறது <span className="text-[#2563EB] block">உங்கள் தரவு & கூகிள் கணக்கு</span>
                  </>
                )}
              </h2>

              {/* Mobile Graphic Visual Anchor: DocBot Mascot holding Security Shield */}
              <div className="lg:hidden w-full h-44 sm:h-56 rounded-2xl overflow-hidden relative shadow-sm border border-blue-200/60 bg-[#D8EAFD] my-2">
                <img
                  src="/user_data_trust_bg.png"
                  alt="DocBot with Google Security Shield"
                  className="w-full h-full object-cover object-[78%_center] filter brightness-[1.02]"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Cloud Verified Architecture</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {lang === 'en'
                  ? 'HealthGrid (நலம் AI) is an autonomous healthcare emergency network providing real-time AI triage (DocBot), 108 ambulance dispatch, Jan Aushadhi generic medicines (up to 89% savings), and hospital bed locator services across Tamil Nadu.'
                  : 'HealthGrid (நலம் AI) உடனடி AI மருத்துவ ஆலோசனை (DocBot), 108 ஆம்புலன்ஸ், மலிவு விலை மக்கள் மருந்தக மருந்துகள் (89% வரை சேமிப்பு) மற்றும் மருத்துவமனை படுக்கைகள் நிலவரத்தை வழங்கும் 24/7 அவசர சுகாதார வலையமைப்பு.'}
              </p>
            </div>

            {/* Concise 3-Point Verifiable Disclosure Items */}
            <div className="space-y-3.5 pt-1">
              
              {/* Point 1: Google OAuth Purpose */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">
                    {lang === 'en' ? '1. Purpose of Google Sign-In' : '1. கூகிள் உள்நுழைவின் நோக்கம்'}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        We request minimal identity scopes (<strong className="text-slate-800">openid</strong>, <strong className="text-slate-800">email</strong>, <strong className="text-slate-800">profile</strong>) solely to authenticate your session and link your private medical records without storing Google passwords. <span className="text-[#2563EB] font-medium">No Google Drive, Gmail, or Contact access.</span>
                      </>
                    ) : (
                      <>
                        கூகிள் கடவுச்சொல்லை சேமிக்காமல் உங்கள் அமர்வை அங்கீகரிக்கவும், மருத்துவ ஏட்டை இணைக்கவும் குறைந்தபட்ச விவரங்கள் (<strong className="text-slate-800">openid, email, profile</strong>) மட்டுமே பெறப்படுகின்றன. தனிப்பட்ட கோப்புகள் அல்லது ஜிமெயில் அணுகல் இல்லை.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Point 2: Limited Use & Zero-Ad Guarantee */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#E6F9F3] text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">
                    {lang === 'en' ? '2. Google Limited Use & Zero Ads' : '2. கூகிள் Limited Use & விளம்பரங்கள் இல்லை'}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        HealthGrid's use of Google API data strictly adheres to the <strong className="text-slate-800">Google API Services User Data Policy</strong>, including the Limited Use requirements. Your data is <span className="text-[#047857] font-medium">never sold to brokers or used for advertisements</span>.
                      </>
                    ) : (
                      <>
                        கூகிள் API தரவுகளின் பயன்பாடு <strong className="text-slate-800">Google API Services User Data Policy</strong> மற்றும் Limited Use விதிகளுக்கு உட்பட்டது. பயனர் தரவு எப்போதும் விற்கப்படாது அல்லது விளம்பரங்களுக்குப் பயன்படுத்தப்படாது.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Point 3: Public Access & Data Sovereignty */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-teal-100 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">
                    {lang === 'en' ? '3. Public Access Without Login' : '3. உள்நுழைவு இன்றியே பொது அணுகல்'}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        Core emergency services (108 Ambulance, generic medicine searches, and hospital bed locators) are <span className="text-[#059669] font-medium">completely visible and accessible without requiring login</span>. Client-side cryptographic isolation protects all consultations.
                      </>
                    ) : (
                      <>
                        108 ஆம்புலன்ஸ், பொது மருந்துகள் மற்றும் மருத்துவமனை படுக்கைகள் வழிகாட்டி ஆகியவை உள்நுழைவு இன்றியே அனைவரும் பயன்படுத்தக்கூடிய வகையில் வெளிப்படையாகக் கிடைக்கின்றன.
                      </>
                    )}
                  </p>
                </div>
              </div>

            </div>

            {/* Compliance Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF5FF] text-[#2563EB] font-semibold border border-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 fill-[#2563EB] stroke-white" />
                <span>DPDP Act 2023</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF5FF] text-[#2563EB] font-semibold border border-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 fill-[#2563EB] stroke-white" />
                <span>Google API Limited Use</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF9F2] text-[#047857] font-semibold border border-[#C6F0DF]">
                <CheckCircle2 className="w-3.5 h-3.5 fill-[#059669] stroke-white" />
                <span>Zero Ads</span>
              </span>
            </div>

            {/* Bottom Documentation & Legal Policy Links */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-medium">
                {lang === 'en'
                  ? 'Review our complete legal and patient sovereignty policies:'
                  : 'எங்களின் முழுமையான தனியுரிமைக் கொள்கையைப் படிக்கவும்:'}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <a
                  href="/privacy"
                  onClick={(e) => {
                    if (onOpenPrivacy) {
                      e.preventDefault();
                      onOpenPrivacy();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                  title="Read HealthGrid Privacy Policy"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500 ml-0.5" />
                </a>

                <a
                  href="/terms"
                  onClick={(e) => {
                    if (onOpenTerms) {
                      e.preventDefault();
                      onOpenTerms();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                  title="Read HealthGrid Terms of Service"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'en' ? 'Terms' : 'விதிமுறைகள்'}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500 ml-0.5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Intentionally left empty so the 3D DocBot with the glowing blue lock shield and Google account verification cards in the background image is 100% visible and unblocked! */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 min-h-[500px]" aria-hidden="true" />

        </div>
      </div>
    </section>
  );
};
