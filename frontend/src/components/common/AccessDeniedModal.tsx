import React, { useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Home,
  UserCheck,
  AlertOctagon,
  X,
  Stethoscope,
  Building2,
  User,
} from 'lucide-react';
import type { Language } from '../../types';
import type { AuthUser } from '../../services/authService';

export type RestrictedPortalType = 'CLINICIAN' | 'HOSPITAL_ERP' | 'PROFILE';

interface AccessDeniedModalProps {
  isOpen: boolean;
  portalType: RestrictedPortalType;
  currentUser: AuthUser | null;
  lang: Language;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  portalType,
  currentUser,
  lang,
  onClose,
  onOpenLogin,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isClinician = portalType === 'CLINICIAN';
  const isHospital = portalType === 'HOSPITAL_ERP';

  const portalTitle = isClinician
    ? lang === 'en'
      ? 'Clinician Operating System'
      : 'மருத்துவர் பணிமனை'
    : isHospital
    ? lang === 'en'
      ? 'Hospital ERP Enterprise Portal'
      : 'மருத்துவமனை ஈஆர்பி தளம்'
    : lang === 'en'
    ? 'Patient Medical Vault'
    : 'தனிப்பட்ட மருத்துவ ஏடு';

  const requiredRoleBadge = isClinician
    ? 'DOCTOR / HEALTHCARE PROFESSIONAL'
    : isHospital
    ? 'HOSPITAL STAFF / ENTERPRISE ADMIN'
    : 'AUTHENTICATED PATIENT ACCOUNT';

  const currentRoleLabel = currentUser
    ? currentUser.role === 'DOCTOR' || currentUser.role === 'HEALTHCARE_PROFESSIONAL'
      ? 'Healthcare Professional'
      : currentUser.role === 'HOSPITAL_STAFF' || currentUser.role === 'SUPER_ADMIN'
      ? 'Hospital Staff'
      : 'Personal Citizen Account'
    : lang === 'en'
    ? 'Unauthenticated Guest'
    : 'உள்நுழையாத பயனர்';

  const currentEmailOrIdentifier = currentUser
    ? currentUser.email || currentUser.name
    : lang === 'en'
    ? 'No Active Session'
    : 'அமர்வு இல்லை';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-denied-title"
    >
      {/* Frosted Security Card Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Warning Banner Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />

        {/* Close / Return Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Return to Home"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header Icon & Shield Pill */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-100/80 text-rose-800 border border-rose-300/80">
                <Lock className="w-3 h-3 text-rose-700" />
                <span>403 Access Restricted • RBAC Enforced</span>
              </div>
              <h2
                id="access-denied-title"
                className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug"
              >
                {lang === 'en'
                  ? `Access to ${portalTitle} is Restricted`
                  : `${portalTitle}-க்கான அனுமதி கட்டுப்படுத்தப்பட்டுள்ளது`}
              </h2>
            </div>
          </div>

          {/* Context Explanation */}
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'en'
              ? 'Under DPDP Act 2023 & Clinical Establishment Act guidelines, this clinical workspace is strictly isolated. Each role has a dedicated userspace to prevent unauthorized clinical or patient record access.'
              : 'தனியுரிமை மற்றும் மருத்துவ சட்ட விதிமுறைகளின்படி, இந்த பகுதி உரிய அங்கீகாரம் பெற்றவர்களுக்கு மட்டுமே ஒதுக்கப்பட்டுள்ளது.'}
          </p>

          {/* Identity vs Required Role Inspection Card */}
          <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 space-y-3 text-xs">
            {/* Required Role */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                {isClinician ? (
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                ) : isHospital ? (
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>Required Role:</span>
              </span>
              <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-slate-900 text-white shadow-2xs">
                {requiredRoleBadge}
              </span>
            </div>

            {/* Current Account */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                <span>Current Account:</span>
              </span>
              <div className="text-right">
                <div className="font-bold text-slate-800 text-[11px] flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{currentRoleLabel}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono max-w-48 truncate" title={currentEmailOrIdentifier}>
                  {currentEmailOrIdentifier}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {lang === 'en'
                  ? 'Switch / Login with Authorized Account'
                  : 'அங்கீகரிக்கப்பட்ட கணக்கில் உள்நுழையவும்'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'en' ? 'Return to Citizen Home' : 'முகப்புப் பக்கத்திற்குத் திரும்பு'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
