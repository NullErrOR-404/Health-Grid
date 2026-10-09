import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2, Scale, AlertTriangle, Stethoscope, Siren, HeartHandshake } from 'lucide-react';
import type { Language } from '../types';

interface PrivacyPolicyPageProps {
  lang: Language;
  onBack: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  lang,
  onBack,
  defaultTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  useEffect(() => {
    // Check if URL hash indicates terms
    if (window.location.hash.toLowerCase().includes('terms') || window.location.pathname.toLowerCase().includes('terms')) {
      setActiveTab('terms');
    }
  }, []);

  useEffect(() => {
    document.title = activeTab === 'privacy'
      ? (lang === 'en' ? 'Privacy Policy & Data Sovereignty | HealthGrid' : 'தனியுரிமைக் கொள்கை | HealthGrid')
      : (lang === 'en' ? 'Terms & Conditions of Service | HealthGrid' : 'விதிமுறைகள் & நிபந்தனைகள் | HealthGrid');
  }, [activeTab, lang]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-linear-to-r from-teal-700 via-teal-800 to-slate-900 px-6 sm:px-10 py-8 sm:py-10 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white transition-colors text-xs sm:text-sm font-semibold mb-6 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'en' ? 'Back to HealthGrid' : 'முகப்புக்குத் திரும்பு'}
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center">
              {activeTab === 'privacy' ? (
                <ShieldCheck className="w-6 h-6 text-teal-300" />
              ) : (
                <Scale className="w-6 h-6 text-teal-300" />
              )}
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-teal-300">
              {lang === 'en' ? 'Legal, Compliance & Clinical Ethics' : 'சட்ட, பாதுகாப்பு & மருத்துவ நெறிமுறைகள்'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {activeTab === 'privacy'
              ? (lang === 'en' ? 'Privacy Policy & Data Sovereignty' : 'தனியுரிமைக் கொள்கை & தரவு பாதுகாப்பு')
              : (lang === 'en' ? 'Terms & Conditions of Service' : 'சேவை விதிமுறைகள் & நிபந்தனைகள்')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
            {lang === 'en'
              ? 'Effective Date: October 2026 • Compliant with Indian DPDP Act 2023, DISHA, NMC Telemedicine Guidelines, and Google API Policies.'
              : 'நடைமுறை தேதி: அக்டோபர் 2026 • இந்திய DPDP சட்டம் 2023, DISHA மற்றும் தேசிய மருத்துவ ஆணைய (NMC) விதிகளுக்கு உட்பட்டது.'}
          </p>

          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-teal-600/40">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-teal-900 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-teal-900 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Terms & Conditions' : 'விதிமுறைகள் & நிபந்தனைகள்'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          
          {activeTab === 'privacy' ? (
            <>
              {/* Privacy Policy Section 1 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  1. Executive Overview & Purpose
                </h2>
                <p>
                  HealthGrid ("we", "our", or "the Platform") is dedicated to empowering citizens with real-time autonomous emergency triage, Jan Aushadhi generic pharmaceutical transparency, and localized healthcare navigation. Protecting your personal and biometric healthcare information is central to our mission. This Privacy Policy details how we collect, handle, store, and safeguard your data when utilizing our web portal, mobile clients, and connected clinical services.
                </p>
              </div>

              {/* Privacy Policy Section 2 */}
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-5 space-y-3">
                <h2 className="text-base font-bold text-teal-950 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-teal-700" />
                  2. Google API Services & OAuth Limited Use Disclosure
                </h2>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                  When you opt to sign in with your Google Account, HealthGrid strictly accesses basic identity scopes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li><strong>.../auth/userinfo.email</strong>: Used solely to uniquely associate your personal medical vault and emergency contacts with your authorized identity.</li>
                  <li><strong>.../auth/userinfo.profile</strong>: Used exclusively to display your name and profile avatar on your patient dashboard.</li>
                  <li><strong>openid</strong>: Used to cryptographically authenticate your session token via Supabase Auth without storing your Google account password.</li>
                </ul>
                <div className="pt-2 text-xs font-semibold text-teal-900">
                  HealthGrid's use and transfer to any other app of information received from Google APIs adheres to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements.
                </div>
              </div>

              {/* Privacy Policy Section 3 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  3. Clinical Data Sovereignty & Zero-Disk Architecture
                </h2>
                <p className="mb-3">
                  Unlike traditional consumer health applications, HealthGrid enforces an uncompromising clinical privacy architecture:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                  <li><strong>No Third-Party Ad Trackers:</strong> HealthGrid does not sell, license, or monetize your medical history, symptoms, or personal data to advertisers, insurance brokers, or data aggregators.</li>
                  <li><strong>Row-Level Security (RLS) Isolation:</strong> Every consultation log, vital reading, and medical document stored in our Supabase PostgreSQL infrastructure is protected by cryptographically isolated tenant policies. Only you and authorized clinical personnel with explicit handover tokens can query your vault.</li>
                  <li><strong>Ephemeral In-Memory Reasoning:</strong> Camera vision frames and audio snippets captured during Live Tele-Clinic consultations are evaluated ephemerally in-memory and discarded immediately after generating your clinical summary.</li>
                </ul>
              </div>

              {/* Privacy Policy Section 4 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  4. Your Rights & Permanent Data Erasure
                </h2>
                <p className="mb-3">
                  In compliance with the Digital Personal Data Protection (DPDP) Act of India and international standards:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li><strong>Instant Data Export:</strong> You can export your clinical consultation history and vital memory at any time.</li>
                  <li><strong>One-Tap Total Purge:</strong> When you delete your account or choose "Reset Vault", all associated sessions, vitals, and records are permanently wiped from all servers.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Terms Section 1 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  1. Clinical Scope & Medical Disclaimer
                </h2>
                <p className="mb-3">
                  HealthGrid operates as an intelligent healthcare navigation, clinical decision support, and generic pharmaceutical price discovery platform. DocBot AI is designed by clinical informaticians to provide grounded preliminary triage, health education, and first-aid recommendations based on the Indian Pharmacopoeia and ICMR protocols.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Non-Emergency Notice</span>
                  </div>
                  <p>
                    DocBot AI does not replace formal emergency room diagnosis, surgical interventions, or intensive care treatment. If you or someone near you is experiencing severe life-threatening symptoms (crushing central chest pain, acute hemiparesis, breathing cessation, major haemorrhage), immediately trigger our 108 Emergency Dispatch button or contact the nearest hospital emergency casualty.
                  </p>
                </div>
              </div>

              {/* Terms Section 2 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Siren className="w-5 h-5 text-teal-600" />
                  2. 108 Emergency Telemetry & Dispatch Terms
                </h2>
                <p>
                  HealthGrid facilitates coordinated dispatch with official Tamil Nadu emergency medical infrastructure. Users agree to utilize the 108 SOS dispatch feature solely for genuine medical crises. Malicious, frivolous, or fraudulent emergency alerts disrupt emergency response teams and violate civil public safety statutes.
                </p>
              </div>

              {/* Terms Section 3 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <HeartHandshake className="w-5 h-5 text-teal-600" />
                  3. PMBJP Jan Aushadhi & Generic Medicine Pricing Transparency
                </h2>
                <p>
                  Generic pharmaceutical equivalents and pricing displayed on HealthGrid are synchronized from the official Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) price schedule. While we strive for 100% price integrity, local stock availability at individual community Jan Aushadhi Kendras may fluctuate. Always confirm with the dispensing registered pharmacist.
                </p>
              </div>

              {/* Terms Section 4 */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Scale className="w-5 h-5 text-teal-600" />
                  4. Telemedicine Practice Compliance (NMC Guidelines)
                </h2>
                <p>
                  Any clinical consult conducted via HealthGrid complies with the National Medical Commission (NMC) Telemedicine Practice Guidelines. Doctor handover tokens and clinical summaries generated by DocBot are advisory records intended to assist consulting physicians in in-person or remote consultations.
                </p>
              </div>
            </>
          )}

          {/* Contact Box */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Legal & Compliance Contact
            </h2>
            <div className="bg-slate-100/80 rounded-2xl p-4 text-xs space-y-1 font-mono text-slate-800">
              <div>HealthGrid Governance & Compliance Office</div>
              <div>Contact: <strong>legal@healthgrid-app.vercel.app</strong></div>
              <div>Platform Host: Vercel Edge Network • SSL 256-bit AES Encryption</div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-100/60 px-6 sm:px-10 py-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-slate-500">© 2026 HealthGrid Technologies. All rights reserved.</span>
          <button
            onClick={onBack}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20 cursor-pointer"
          >
            {lang === 'en' ? 'Back to Main Application' : 'முகப்புக்குச் செல்'}
          </button>
        </div>

      </div>
    </div>
  );
};
