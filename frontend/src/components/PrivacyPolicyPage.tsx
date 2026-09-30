import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';
import type { Language } from '../types';

interface PrivacyPolicyPageProps {
  lang: Language;
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ lang, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 px-6 sm:px-10 py-10 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white transition-colors text-xs sm:text-sm font-semibold mb-6 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'en' ? 'Back to HealthGrid' : 'முகப்புக்குத் திரும்பு'}
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-teal-300">
              {lang === 'en' ? 'Legal & Compliance' : 'சட்ட & பாதுகாப்பு வழிகாட்டுதல்'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'en' ? 'Privacy Policy & Data Sovereignty' : 'தனியுரிமைக் கொள்கை & தரவு பாதுகாப்பு'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
            Effective Date: October 1, 2026 • Compliant with Google API Services User Data Policy, HIPAA, and GDPR standards.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          
          {/* Section 1: Executive Overview */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-teal-600" />
              1. Executive Overview & Purpose
            </h2>
            <p>
              HealthGrid ("we", "our", or "the Platform") is dedicated to empowering citizens with real-time autonomous emergency triage, Jan Aushadhi generic pharmaceutical transparency, and localized healthcare navigation. Protecting your personal and biometric healthcare information is central to our mission. This Privacy Policy details how we collect, handle, store, and safeguard your data when utilizing our web portal, mobile clients, and connected clinical services.
            </p>
          </div>

          {/* Section 2: Google User Data Policy & Limited Use Disclosure */}
          <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-teal-950 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-700" />
              2. Google API Services & OAuth Limited Use Disclosure
            </h2>
            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
              When you opt to sign in with your Google Account, HealthGrid strictly accesses basic identity scopes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
              <li><strong>`.../auth/userinfo.email`</strong>: Used solely to uniquely associate your personal medical vault and emergency contacts with your authorized identity.</li>
              <li><strong>`.../auth/userinfo.profile`</strong>: Used exclusively to display your name and profile avatar on your patient dashboard.</li>
              <li><strong>`openid`</strong>: Used to cryptographically authenticate your session token via Supabase Auth without storing your Google account password.</li>
            </ul>
            <div className="p-3 bg-white rounded-xl border border-teal-200 text-xs text-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Limited Use Commitment:</strong> HealthGrid's use and transfer of information received from Google APIs to any other app will adhere to the{' '}
                <a 
                  href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 underline font-semibold"
                >
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements. We never sell Google user data or transfer it to third-party advertising networks.
              </span>
            </div>
          </div>

          {/* Section 3: Data We Collect */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              3. Information We Collect and Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 mb-1 text-xs sm:text-sm">User-Provided Data</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Name, phone number, blood group, age, pre-existing chronic conditions, known allergies, and primary emergency contact numbers entered in your profile.
                </p>
              </div>
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 mb-1 text-xs sm:text-sm">Geolocation & Telemetry</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-precision browser GPS coordinates captured strictly upon your explicit authorization to calculate ambulance dispatch ETA and nearby hospital proximities.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Data Storage, Encryption & Security */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              4. Data Architecture, Encryption & Sovereignty
            </h2>
            <p className="mb-2">
              HealthGrid implements industry-standard multi-layer defense in depth:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Zero-Trust Row-Level Security (RLS):</strong> Patient medical data in our PostgreSQL database is guarded by database-level security policies; each user's records are accessible exclusively by their verified cryptographic JWT.</li>
              <li><strong>In-Transit & At-Rest Encryption:</strong> All network communication is enforced via TLS 1.3 encryption. Database storage is encrypted using AES-256.</li>
              <li><strong>Ephemeral Clinical Inferences:</strong> Triage transcripts sent to our AGI clinical reasoning engines (Groq LPU / Gemini 2.0 Flash) are processed in volatile memory and are not used to train global foundation models.</li>
            </ul>
          </div>

          {/* Section 5: Data Retention & User Rights */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              5. Your Rights & Data Deletion
            </h2>
            <p className="mb-3">
              Under international privacy frameworks, you maintain total sovereignty over your health information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Right to Access & Export:</strong> You can review, download, or export your clinical records at any time from the Profile page.</li>
              <li><strong>Right to Rectification:</strong> You may edit your allergies, emergency contacts, and personal health details instantly.</li>
              <li><strong>Right to Total Erasure (Deletion):</strong> You can request full deletion of your profile, medical vault, and session tokens by clicking "Delete Account" in your profile or emailing our Data Privacy Officer. All corresponding database records will be permanently purged within 24 hours.</li>
            </ul>
          </div>

          {/* Section 6: Contact Information */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              6. Contact & Data Protection Officer
            </h2>
            <p className="text-xs text-slate-600 mb-3">
              For any questions regarding this Privacy Policy, verification inquiries, or data access requests, please contact:
            </p>
            <div className="bg-slate-100/80 rounded-xl p-4 text-xs space-y-1 font-mono text-slate-800">
              <div>HealthGrid Data Governance Team</div>
              <div>Email: <strong>privacy@healthgrid-app.vercel.app</strong></div>
              <div>Platform Host: Vercel Edge Network • Domain: https://healthgrid-app.vercel.app</div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-100/60 px-6 sm:px-10 py-5 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">© 2026 HealthGrid Technologies. All rights reserved.</span>
          <button
            onClick={onBack}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
          >
            {lang === 'en' ? 'Back to Main Application' : 'முகப்புக்குச் செல்'}
          </button>
        </div>

      </div>
    </div>
  );
};
