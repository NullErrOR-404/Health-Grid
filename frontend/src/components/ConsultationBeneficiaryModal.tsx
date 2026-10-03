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
  Sparkles
} from 'lucide-react';
import type { Language } from '../types';
import {
  familyMemberService,
  type FamilyMember,
  type FamilyRelationship
} from '../services/familyMemberService';

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
  { key: 'Sibling', labelEn: 'Sibling', labelTa: 'உடன்பிறப்பு' },
  { key: 'Grandparent', labelEn: 'Grandparent', labelTa: 'தாத்தா/பாட்டி' },
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

  // Minimal 2-Field Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('Mother');
  const [age, setAge] = useState<number>(55);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMembers(familyMemberService.getFamilyMembers());
      setActiveBeneficiary(familyMemberService.getActiveBeneficiary());
      setIsAddingNew(false);
      setErrorMsg(null);
      setName('');
      // Background sync from cloud if logged in
      familyMemberService.syncFamilyMembers().then((data) => {
        if (data) setMembers(data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selfProfile = familyMemberService.getSelfProfile();
  const isSelfActive = activeBeneficiary === null;

  const handleSelect = (member: FamilyMember | null) => {
    familyMemberService.setActiveBeneficiary(member);
    setActiveBeneficiary(member);
    onSelectBeneficiary?.(member);
    onClose();
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

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await familyMemberService.addFamilyMember({
        name: name.trim(),
        relationship,
        age: Number(age),
        gender,
      });

      setMembers(familyMemberService.getFamilyMembers());
      setIsAddingNew(false);
      setName('');
      // Immediately select this newly added member and proceed
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
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh]"
        data-lenis-prevent="true"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'en' ? 'Who is this consultation for?' : 'மருத்துவ ஆலோசனை யாருக்கு?'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {lang === 'en'
                  ? 'Select a profile to calibrate AI triage, questions, and dosages'
                  : 'சரியான மருத்துவ சிகிச்சை பெற சுயவிவரத்தை தேர்ந்தெடுக்கவும்'}
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* List of Beneficiaries & Self */}
          {!isAddingNew ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {lang === 'en' ? 'Available Profiles' : 'பதிவுசெய்யப்பட்ட நபர்கள்'}
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
                        {lang === 'en' ? 'Account Holder' : 'முதன்மை பயனர்'}
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
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{member.age}y • {member.gender}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-teal-700 font-semibold">{member.healthId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMember(e, member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Remove' : 'நீக்கு'}
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
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/50 text-teal-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-teal-600 stroke-[3]" />
                <span>
                  {lang === 'en'
                    ? '+ Add Family Member / Relative'
                    : '+ குடும்ப உறுப்பினர் அல்லது உறவினரைச் சேர்'}
                </span>
              </button>
            </div>
          ) : (
            /* Minimal 2-Field Quick Intake Form */
            <form onSubmit={handleCreateMember} className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>{lang === 'en' ? 'New Family Profile (Instant Intake)' : 'புதிய உறுப்பினர் பதிவு'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
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
                  placeholder={lang === 'en' ? 'e.g., Lakshmi Sundaram (Mom)' : 'எ.கா., லட்சுமி சுந்தரம் (அம்மா)'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900"
                  autoFocus
                />
              </div>

              {/* Relationship Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'en' ? 'Relationship to Account Owner' : 'உங்களுடனான உறவு'}
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
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{lang === 'en' ? 'Save & Start Consultation' : 'சேமித்து ஆலோசனையைத் தொடங்கு'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Modal Bottom Footer Guarantee */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>ABDM Beneficiary Standard (Data Sovereignty)</span>
          </div>
          <span>Ayushman Bharat</span>
        </div>
      </div>
    </div>
  );
};
