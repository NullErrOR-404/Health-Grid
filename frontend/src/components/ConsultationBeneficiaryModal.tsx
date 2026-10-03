import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  Plus,
  Check,
  ShieldCheck,
  Heart,
  Trash2,
  ArrowRight,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { Language } from '../types';
import {
  familyMemberService,
  type FamilyMember,
  type FamilyRelationship,
  MAX_BENEFICIARIES
} from '../services/familyMemberService';
import { authService } from '../services/authService';

interface ConsultationBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectBeneficiary?: (member: FamilyMember | null) => void;
}

const RELATIONSHIP_OPTIONS: Array<{ key: FamilyRelationship; labelEn: string; labelTa: string }> = [
  { key: 'Mother', labelEn: 'Mother', labelTa: 'தாய்' },
  { key: 'Father', labelEn: 'Father', labelTa: 'தந்தை' },
  { key: 'Spouse', labelEn: 'Spouse', labelTa: 'துணைவர்' },
  { key: 'Child', labelEn: 'Child', labelTa: 'குழந்தை' },
  { key: 'Son', labelEn: 'Son', labelTa: 'மகன்' },
  { key: 'Daughter', labelEn: 'Daughter', labelTa: 'மகள்' },
  { key: 'Brother', labelEn: 'Brother', labelTa: 'சகோதரன்' },
  { key: 'Sister', labelEn: 'Sister', labelTa: 'சகோதரி' },
  { key: 'Sibling', labelEn: 'Sibling', labelTa: 'உடன்பிறப்பு' },
  { key: 'Grandparent', labelEn: 'Grandparent', labelTa: 'தாத்தா/பாட்டி' },
  { key: 'Relative', labelEn: 'Relative', labelTa: 'உறவினர்' },
  { key: 'Guardian', labelEn: 'Guardian', labelTa: 'பாதுகாவலர்' },
  { key: 'Friend', labelEn: 'Friend', labelTa: 'நண்பர்' },
  { key: 'Other', labelEn: 'Other', labelTa: 'மற்றவர்' },
];

export const ConsultationBeneficiaryModal: React.FC<ConsultationBeneficiaryModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectBeneficiary,
}) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeBeneficiary, setActiveBeneficiary] = useState<FamilyMember | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('Mother');
  const [age, setAge] = useState<number>(55);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [phone, setPhone] = useState('');
  const [useCaregiverPhone, setUseCaregiverPhone] = useState(false);
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);

  // OTP Verification State
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMembers(familyMemberService.getFamilyMembers());
      setActiveBeneficiary(familyMemberService.getActiveBeneficiary());
      setIsAddingNew(false);
      resetForm();
      // Background sync from cloud if logged in
      familyMemberService.syncFamilyMembers().then((data) => {
        if (data) setMembers(data);
      });
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  const resetForm = () => {
    setName('');
    setRelationship('Mother');
    setAge(55);
    setGender('Female');
    setPhone('');
    setUseCaregiverPhone(false);
    setIsEmergencyContact(false);
    setIsOtpSent(false);
    setOtpCode('');
    setIsOtpVerified(false);
    setOtpTimer(0);
    setTestOtpNotice(null);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  const selfProfile = familyMemberService.getSelfProfile();
  const isSelfActive = activeBeneficiary === null;
  const isCapReached = members.length >= MAX_BENEFICIARIES;

  const handleSelect = (member: FamilyMember | null) => {
    familyMemberService.setActiveBeneficiary(member);
    setActiveBeneficiary(member);
    onSelectBeneficiary?.(member);
    onClose();
  };

  const handleToggleCaregiverPhone = (checked: boolean) => {
    setUseCaregiverPhone(checked);
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpCode('');
    setTestOtpNotice(null);

    if (checked) {
      const caregiver = authService.getCurrentUser();
      const caregiverPhone = caregiver?.phone?.replace(/[^0-9]/g, '').slice(-10) || '9876543210';
      setPhone(caregiverPhone);
    } else {
      setPhone('');
    }
  };

  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid 10-digit mobile number' : 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்');
      return;
    }

    setErrorMsg(null);
    setIsSendingOtp(true);

    try {
      const res = familyMemberService.requestOtpForPhone(cleanPhone);
      if (res.success) {
        setIsOtpSent(true);
        setTestOtpNotice(res.testOtp);
        setOtpTimer(45);
      } else {
        setErrorMsg(res.message);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to dispatch OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otpCode.trim()) {
      setErrorMsg(lang === 'en' ? 'Please enter the 6-digit OTP' : '6 இலக்க OTP குறியீட்டை உள்ளிடவும்');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMsg(null);

    try {
      const res = familyMemberService.verifyOtpForPhone(phone, otpCode);
      if (res.success) {
        setIsOtpVerified(true);
        setTestOtpNotice(null);
      } else {
        setErrorMsg(res.message);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'OTP verification failed');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(lang === 'en' ? 'Please enter the patient’s name.' : 'தயவுசெய்து நோயாளியின் பெயரை உள்ளிடவும்.');
      return;
    }
    if (age <= 0 || age > 125) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid age (1-120).' : 'சரியான வயதை உள்ளிடவும் (1-120).');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.');
      return;
    }

    if (!isOtpVerified) {
      setErrorMsg(
        lang === 'en'
          ? 'Mobile number verification is mandatory. Please verify via OTP.'
          : 'மொபைல் எண் சரிபார்ப்பு கட்டாயமாகும். தயவுசெய்து OTP மூலம் சரிபார்க்கவும்.'
      );
      return;
    }

    if (members.length >= MAX_BENEFICIARIES) {
      setErrorMsg(`Maximum limit of ${MAX_BENEFICIARIES} beneficiaries reached per account under ABDM.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await familyMemberService.addFamilyMember({
        name: name.trim(),
        relationship,
        age: Number(age),
        gender,
        phone: cleanPhone,
        isPhoneVerified: true,
        isEmergencyContact,
        proxyPhoneUsed: useCaregiverPhone,
      });

      // Synchronize into local Emergency Contacts list if toggled
      if (isEmergencyContact && typeof window !== 'undefined') {
        try {
          const user = authService.getCurrentUser();
          const key = `healthgrid_emergency_contacts_${user?.id || 'guest'}`;
          const raw = localStorage.getItem(key);
          const currentContacts = raw ? JSON.parse(raw) : [];
          if (!currentContacts.some((c: any) => c.phone === cleanPhone || c.id === `ec-beneficiary-${created.id}`)) {
            currentContacts.push({
              id: `ec-beneficiary-${created.id}`,
              name: created.name,
              relation: created.relationship,
              phone: cleanPhone,
              isActive: true,
              isPrimary: currentContacts.length === 0,
            });
            localStorage.setItem(key, JSON.stringify(currentContacts));
          }
        } catch (err) {
          console.warn('Emergency contact sync error:', err);
        }
      }

      setMembers(familyMemberService.getFamilyMembers());
      setIsAddingNew(false);
      resetForm();
      handleSelect(created);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    if (window.confirm(lang === 'en' ? 'Remove this family profile?' : 'இந்த சுயவிவரத்தை நீக்கவா?')) {
      await familyMemberService.deleteFamilyMember(memberId);
      
      // Also remove from emergency contacts
      if (typeof window !== 'undefined') {
        try {
          const user = authService.getCurrentUser();
          const key = `healthgrid_emergency_contacts_${user?.id || 'guest'}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const currentContacts = JSON.parse(raw);
            const filtered = currentContacts.filter((c: any) => c.id !== `ec-beneficiary-${memberId}`);
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {}
      }

      setMembers(familyMemberService.getFamilyMembers());
      if (activeBeneficiary?.id === memberId) {
        setActiveBeneficiary(null);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]"
        data-lenis-prevent="true"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {lang === 'en' ? 'Manage Beneficiaries' : 'பயனாளிகள் மேலாண்மை'}
                </h2>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {members.length}/{MAX_BENEFICIARIES} slots
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {lang === 'en'
                  ? 'Add up to 7 dependents with verified mobile numbers and emergency tags'
                  : 'அதிகபட்சம் 7 குடும்ப உறுப்பினர்களை சரிபார்க்கப்பட்ட எண்ணுடன் சேர்க்கலாம்'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4" data-lenis-prevent="true">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* List of Beneficiaries & Self */}
          {!isAddingNew ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                <span>{lang === 'en' ? 'Active Profiles' : 'சுயவிவரங்கள்'}</span>
                <span className="text-[11px] text-teal-700 font-semibold normal-case">
                  {MAX_BENEFICIARIES - members.length} {lang === 'en' ? 'slots remaining' : 'இடங்கள் உள்ளன'}
                </span>
              </div>

              {/* 1. Primary Account Holder (Self) */}
              <div
                onClick={() => handleSelect(null)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelfActive
                    ? 'border-teal-500 bg-teal-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isSelfActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {selfProfile.name || (lang === 'en' ? 'Myself' : 'எனக்கு')}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {lang === 'en' ? 'Primary' : 'முதன்மை'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{selfProfile.age}y • {selfProfile.gender}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-teal-700 font-semibold">{selfProfile.healthId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSelfActive && (
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Registered Family Members */}
              {members.map((member) => {
                const isSelected = activeBeneficiary?.id === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => handleSelect(member)}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {member.gender === 'Female' ? '👩' : '👨'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {member.name}
                          </span>
                          <span className="text-[10px] bg-teal-100/70 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                            {member.relationship}
                          </span>
                          {member.isEmergencyContact && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                              <span>🚨 108 SOS</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{member.age}y • {member.gender}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-teal-700 font-semibold">{member.healthId}</span>
                          {member.phone && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px] text-slate-600 flex items-center gap-0.5">
                                <Phone className="w-2.5 h-2.5 text-teal-600" />
                                <span>{member.phone}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMember(e, member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Family Member Trigger Button */}
              {isCapReached ? (
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Beneficiary Limit Reached (7/7)' : 'அதிகபட்ச வரம்பு அடைந்தது (7/7)'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'en'
                      ? 'You have reached the maximum allowed limit of 7 beneficiaries under ABDM guidelines. Remove an existing profile to add a new one.'
                      : 'அதிகபட்சம் 7 நபர்களை மட்டுமே சேர்க்க முடியும். புதியவரைச் சேர்க்க பழைய சுயவிவரத்தை நீக்கவும்.'}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsAddingNew(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/50 text-teal-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-600 stroke-[3]" />
                  <span>
                    {lang === 'en'
                      ? `+ Add Beneficiary (${members.length}/7 Used)`
                      : `+ புதிய பயனாளி சேர் (${members.length}/7)`}
                  </span>
                </button>
              )}
            </div>
          ) : (
            /* Minimal Setup Form with Mobile & OTP Verification */
            <form onSubmit={handleCreateMember} className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-teal-600" />
                  <span>{lang === 'en' ? 'Add New Beneficiary Profile' : 'புதிய பயனாளி பதிவு'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'ரத்து'}
                </button>
              </div>

              {/* Field 1: Patient Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Patient Full Name *' : 'நோயாளியின் முழுப் பெயர் *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g., Lakshmi Sundaram' : 'எ.கா., லட்சுமி சுந்தரம்'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900"
                  autoFocus
                />
              </div>

              {/* Relationship Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'en' ? 'Relationship to Account Owner *' : 'உங்களுடனான உறவு *'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setRelationship(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        relationship === opt.key
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {lang === 'en' ? opt.labelEn : opt.labelTa}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Age and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Age (Years) *' : 'வயது *'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Gender *' : 'பாலினம் *'}
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                    {(['Female', 'Male', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          gender === g ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {g === 'Female' ? (lang === 'en' ? 'Female' : 'பெண்') : g === 'Male' ? (lang === 'en' ? 'Male' : 'ஆண்') : (lang === 'en' ? 'Other' : 'மற்றவை')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Mobile Number & OTP Verification */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{lang === 'en' ? 'Beneficiary Mobile Number *' : 'பயனாளி மொபைல் எண் *'}</span>
                  </label>
                  {isOtpVerified && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{lang === 'en' ? 'Verified' : 'சரிபார்க்கப்பட்டது'}</span>
                    </span>
                  )}
                </div>

                {/* Proxy Caregiver Phone Option for Young Children / Elderly */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={useCaregiverPhone}
                    onChange={(e) => handleToggleCaregiverPhone(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    {lang === 'en'
                      ? 'Dependent has no personal phone (Verify using Caregiver phone)'
                      : 'பயனாளியிடம் தனி போன் இல்லை (பராமரிப்பாளர் எண் மூலம் சரிபார்க்கவும்)'}
                  </span>
                </label>

                {/* Phone Input & Send OTP Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      disabled={isOtpVerified}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^0-9]/g, ''));
                        setIsOtpSent(false);
                        setIsOtpVerified(false);
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={phone.length !== 10 || isSendingOtp || otpTimer > 0}
                      className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {isSendingOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>{isOtpSent ? (otpTimer > 0 ? `${otpTimer}s` : 'Resend') : 'Send OTP'}</span>
                      )}
                    </button>
                  )}
                </div>

                {/* OTP Input Drawer */}
                {isOtpSent && !isOtpVerified && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2 animate-in fade-in">
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Enter 6-digit verification code:</span>
                      {testOtpNotice && (
                        <button
                          type="button"
                          onClick={() => setOtpCode(testOtpNotice)}
                          className="font-mono text-[10px] text-teal-700 bg-teal-100/70 hover:bg-teal-100 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                        >
                          Auto-Fill Demo: {testOtpNotice}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 123456"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-center tracking-widest font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length < 4 || isVerifyingOtp}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Field 4: Emergency Contact Toggle Switch */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {lang === 'en' ? 'Add as Emergency Contact' : 'அவசரகால தொடர்பாளராகவும் சேர்'}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {lang === 'en'
                        ? 'Auto-syncs to 108 Emergency Ambulance dispatch'
                        : '108 ஆம்புலன்ஸ் அவசரகால பட்டியலில் தானாக சேர்க்கப்படும்'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEmergencyContact(!isEmergencyContact)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                    isEmergencyContact ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                  aria-pressed={isEmergencyContact}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEmergencyContact ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Caregiver Natural Conversation Note */}
              <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-teal-800 text-[11px] leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  {lang === 'en'
                    ? 'No need to enter chronic conditions or allergies now. The AI Doctor will naturally ask you about their medical history during consultation.'
                    : 'தற்போது நோய்கள் அல்லது ஒவ்வாமைகளை உள்ளிட வேண்டியதில்லை. உரையாடலின் போது மருத்துவர் தானாகக் கேட்டுக்கொள்வார்.'}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isOtpVerified}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{lang === 'en' ? 'Save Beneficiary & Proceed' : 'பயனாளியைச் சேமித்து தொடரவும்'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Modal Bottom Footer Guarantee */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>ABDM Beneficiary Standard (Cap: 7 Dependents)</span>
          </div>
          <span className="font-semibold text-slate-600">Ayushman Bharat</span>
        </div>
      </div>
    </div>
  );
};
