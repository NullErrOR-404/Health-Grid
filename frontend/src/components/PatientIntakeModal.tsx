import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Clock,
  AlertTriangle,
  Activity,
  User,
  ShieldCheck,
  Video,
  FileText,
  ArrowRight,
  Siren,
  Phone
} from 'lucide-react';
import type { Language } from '../types';
import {
  hisService,
  type PatientToken,
  type HealthGridCvData,
  type PatientIntakeInput
} from '../services/hisService';
import { authService } from '../services/authService';
import { familyMemberService, type FamilyMember } from '../services/familyMemberService';
import { ConsultationBeneficiaryModal } from './ConsultationBeneficiaryModal';

interface PatientIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenAmbulance?: () => void;
  onJoinConsultation?: (token: PatientToken) => void;
}

const COMMON_SYMPTOMS_EN = [
  'High Fever',
  'Chest Tightness',
  'Severe Headache',
  'Abdominal Pain',
  'Breathing Difficulty',
  'Skin Rash / Redness',
  'Persistent Cough',
  'Vomiting / Diarrhea'
];

const COMMON_SYMPTOMS_TA = [
  'அதிக காய்ச்சல்',
  'மார்பு இறுக்கம் / வலி',
  'கடுமையான தலைவலி',
  'வயிற்று வலி',
  'மூச்சுத்திணறல்',
  'தோல் வெடிப்பு / அரிப்பு',
  'தொடர் இருமல்',
  'வாந்தி / பேதி'
];

export const PatientIntakeModal: React.FC<PatientIntakeModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenAmbulance,
  onJoinConsultation
}) => {
  const [activeStep, setActiveStep] = useState<'INTAKE' | 'QUEUE_WAITING'>('INTAKE');

  // Form Fields
  const [patientName, setPatientName] = useState(() => authService.getCurrentUser()?.name || '');
  const [age, setAge] = useState<number | ''>(() => authService.getCurrentUser()?.age || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState(() => authService.getCurrentUser()?.bloodGroup || 'B Positive');
  const [phone, setPhone] = useState(() => authService.getCurrentUser()?.phone || '');

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [onsetTimeline, setOnsetTimeline] = useState('');
  const [conditionProgression, setConditionProgression] = useState('');
  const [painScale, setPainScale] = useState(5);

  const [activeToken, setActiveToken] = useState<PatientToken | null>(null);
  const [redFlagNotice, setRedFlagNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Beneficiary & Family Member Multi-Profile State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<FamilyMember | null>(null);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);

  const handleSelectBeneficiary = (member: FamilyMember | null) => {
    setSelectedBeneficiary(member);
    if (member) {
      setPatientName(member.name);
      setAge(member.age);
      setGender(member.gender);
      if (member.bloodGroup) setBloodGroup(member.bloodGroup);
    } else {
      const currentUser = authService.getCurrentUser();
      setPatientName(currentUser?.name || '');
      setAge(currentUser?.age || '');
      if (currentUser?.bloodGroup) setBloodGroup(currentUser.bloodGroup);
      setPhone(currentUser?.phone || '');
    }
  };

  // Initialize with current user profile or active family beneficiary if available
  useEffect(() => {
    if (isOpen) {
      const members = familyMemberService.getFamilyMembers();
      setFamilyMembers(members);

      const active = familyMemberService.getActiveBeneficiary();
      if (active) {
        setSelectedBeneficiary(active);
        setPatientName(active.name);
        setAge(active.age);
        setGender(active.gender);
        if (active.bloodGroup) setBloodGroup(active.bloodGroup);
      } else {
        setSelectedBeneficiary(null);
        const currentUser = authService.getCurrentUser();
        setPatientName(currentUser?.name || '');
        setAge(currentUser?.age || '');
        if (currentUser?.bloodGroup) setBloodGroup(currentUser.bloodGroup);
        setPhone(currentUser?.phone || '');
      }

      // Check if user already has an active waiting token
      const existingToken = hisService.getCurrentPatientToken();
      if (existingToken && (existingToken.status === 'WAITING' || existingToken.status === 'IN_CONSULTATION')) {
        setActiveToken(existingToken);
        setActiveStep('QUEUE_WAITING');
      } else {
        setActiveStep('INTAKE');
      }
    }
  }, [isOpen]);

  // Subscribe to live queue changes
  useEffect(() => {
    const unsubscribe = hisService.subscribe(() => {
      const current = hisService.getCurrentPatientToken();
      if (current) {
        setActiveToken(current);
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setRedFlagNotice(null);

    if (!patientName.trim()) {
      setValidationError(lang === 'en' ? 'Please provide the patient name.' : 'தயவுசெய்து நோயாளியின் பெயரை உள்ளிடவும்.');
      return;
    }
    if (!chiefComplaint.trim() && selectedSymptoms.length === 0) {
      setValidationError(
        lang === 'en'
          ? 'Please enter your chief symptoms or select from the symptom chips.'
          : 'தயவுசெய்து உங்கள் முக்கிய அறிகுறிகளை உள்ளிடவும்.'
      );
      return;
    }
    if (!onsetTimeline.trim()) {
      setValidationError(
        lang === 'en'
          ? 'Please specify when the condition started (e.g., 2 hours ago, yesterday).'
          : 'பிரச்சனை எப்போது தொடங்கியது என்பதைக் குறிப்பிடவும்.'
      );
      return;
    }

    const currentUser = authService.getCurrentUser();
    const patientHealthId = selectedBeneficiary
      ? selectedBeneficiary.healthId
      : (currentUser?.healthId || `HG-PAT-${Math.floor(1000 + Math.random() * 9000)}`);

    const resolvedAgeNum = typeof age === 'number' ? age : (parseInt(String(age), 10) || 0);

    const cv: HealthGridCvData = {
      patientId: patientHealthId,
      fullName: patientName,
      age: resolvedAgeNum,
      gender,
      bloodGroup,
      contactPhone: phone,
      abhaId: `${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      chronicConditions: (selectedBeneficiary?.chronicConditions && selectedBeneficiary.chronicConditions.length > 0)
        ? selectedBeneficiary.chronicConditions
        : ['Type 2 Diabetes (5 yrs)', 'Mild Hypertension'],
      allergies: (selectedBeneficiary?.allergies && selectedBeneficiary.allergies.length > 0)
        ? selectedBeneficiary.allergies
        : ['Penicillin (Moderate Rash)'],
      currentMedications: ['Metformin 500mg', 'Telmisartan 40mg'],
      lastVitals: {
        bp: '122/82 mmHg',
        heartRate: 78,
        spo2: 98,
        tempF: selectedSymptoms.some((s) => s.toLowerCase().includes('fever')) ? '101.6°F' : '98.6°F',
        recordedAt: 'Today'
      }
    };

    const combinedComplaint = chiefComplaint || selectedSymptoms.join(', ');

    const intake: PatientIntakeInput = {
      patientName,
      age: resolvedAgeNum,
      gender,
      bloodGroup,
      phone,
      chiefComplaint: combinedComplaint,
      onsetTimeline,
      conditionProgression: conditionProgression || (lang === 'en' ? 'Moderate discomfort, seeking clinical guidance' : 'மருத்துவ ஆலோசனை தேவைப்படுகிறது'),
      painScale,
      associatedSymptoms: selectedSymptoms,
      healthGridCv: cv
    };

    const result = hisService.requestConsultationToken(intake);

    setActiveToken(result.token);
    setActiveStep('QUEUE_WAITING');

    if (result.isEmergencyRedFlag) {
      setRedFlagNotice(result.redFlagReason || 'Emergency Red-Flag detected. Immediate casualty dispatch recommended.');
    }
  };

  const getEstimatedWaitMins = (token: PatientToken) => {
    const allWaiting = hisService.getWaitingTokens();
    const index = allWaiting.findIndex((t) => t.tokenId === token.tokenId);
    const ahead = index >= 0 ? index : 0;
    return Math.max(2, ahead * 4);
  };

  const getAheadCount = (token: PatientToken) => {
    const allWaiting = hisService.getWaitingTokens();
    const index = allWaiting.findIndex((t) => t.tokenId === token.tokenId);
    return index >= 0 ? index : 0;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="w-full sm:max-w-2xl bg-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-100 flex flex-col h-full sm:h-auto sm:max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300 flex-shrink-0">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg truncate">
                  {lang === 'en' ? 'Clinical OPD Consultation & Triage Token' : 'மருத்துவ ஆலோசனைக் கூடம் & டோக்கன்'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 flex-shrink-0">
                  {lang === 'en' ? 'First-Come' : 'வரிசை முறை'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-teal-100/80 truncate sm:whitespace-normal">
                {lang === 'en'
                  ? 'Screening intake generates your consultation token & shares HealthGrid CV with on-duty physician'
                  : 'மருத்துவரிடம் ஆலோசனை பெற டோக்கன் மற்றும் ஹெல்த்கிரிட் குறிப்பு உருவாக்கப்படுகிறது'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 safe-area-pb">
          {activeStep === 'INTAKE' ? (
            <form onSubmit={handleSubmitIntake} className="space-y-5">
              {validationError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Patient Basic Identity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                {/* Beneficiary Quick Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{lang === 'en' ? 'Who is this consultation for?' : 'யாருக்கு இந்த ஆலோசனை?'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSelectBeneficiary(null)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedBeneficiary === null
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {lang === 'en' ? 'Myself' : 'எனக்கு'}
                    </button>
                    {familyMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectBeneficiary(m)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          selectedBeneficiary?.id === m.id
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {m.relationship}: {m.name.split(' ')[0]}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsBeneficiaryModalOpen(true)}
                      className="px-2.5 py-1 rounded-full text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                    >
                      + {lang === 'en' ? 'Add Family' : 'சேர்'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    {lang === 'en' ? 'Patient Identification' : 'நோயாளி விவரங்கள்'}
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold border border-teal-200">
                    {lang === 'en' ? 'HealthGrid CV Attached' : 'மருத்துவக் குறிப்பு இணைக்கப்பட்டது'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {lang === 'en' ? 'Full Name' : 'முழு பெயர்'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. S. Ramanathan"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {lang === 'en' ? 'Mobile Phone' : 'கைபேசி எண்'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9840123456"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {lang === 'en' ? 'Age' : 'வயது'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={110}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || '')}
                      placeholder="e.g. 35"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {lang === 'en' ? 'Gender' : 'பாலினம்'}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="Male">{lang === 'en' ? 'Male' : 'ஆண்'}</option>
                      <option value="Female">{lang === 'en' ? 'Female' : 'பெண்'}</option>
                      <option value="Other">{lang === 'en' ? 'Other' : 'மற்றவை'}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2.5 max-w-xs">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {lang === 'en' ? 'Blood Group' : 'இரத்த வகை'}
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="B Positive">B Positive (B+)</option>
                    <option value="O Positive">O Positive (O+)</option>
                    <option value="A Positive">A Positive (A+)</option>
                    <option value="AB Positive">AB Positive (AB+)</option>
                    <option value="O Negative">O Negative (O-)</option>
                    <option value="A Negative">A Negative (A-)</option>
                    <option value="B Negative">B Negative (B-)</option>
                    <option value="AB Negative">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              {/* Quick Symptom Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {lang === 'en' ? 'Common Symptoms (Select all that apply)' : 'பொதுவான அறிகுறிகள் (பொருந்துவதை தேர்வு செய்யவும்)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(lang === 'en' ? COMMON_SYMPTOMS_EN : COMMON_SYMPTOMS_TA).map((sym, idx) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chief Complaint Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {lang === 'en' ? 'Chief Complaint & What Happened' : 'உங்களுக்கு என்ன பிரச்சனை / எப்படி ஏற்பட்டது?'} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g. Sudden severe headache and fever with chills after returning from travel...'
                      : 'எ.கா. பயணம் முடிந்து வந்ததில் இருந்து கடுமையான தலைவலியும், நடுக்கத்துடன் காய்ச்சலும்...'
                  }
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white leading-relaxed"
                />
              </div>

              {/* Timeline & Progression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {lang === 'en' ? 'When did it start?' : 'எப்போது தொடங்கியது?'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={onsetTimeline}
                    onChange={(e) => setOnsetTimeline(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. 2 days ago / this morning' : 'எ.கா. 2 நாட்களுக்கு முன்'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {lang === 'en' ? 'How is the condition now?' : 'இப்போது நிலைமை எப்படி உள்ளது?'}
                  </label>
                  <input
                    type="text"
                    value={conditionProgression}
                    onChange={(e) => setConditionProgression(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Getting worse, sharp pain' : 'எ.கா. வலி அதிகரித்துள்ளது'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Pain Scale Slider (1 to 10) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'en' ? 'Pain / Discomfort Severity Scale (1 - 10)' : 'வலி / அசௌகரியத்தின் அளவு (1 - 10)'}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      painScale >= 8
                        ? 'bg-rose-600 text-white'
                        : painScale >= 5
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    Level {painScale}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={painScale}
                  onChange={(e) => setPainScale(parseInt(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>1 (Mild / லேசானது)</span>
                  <span>5 (Moderate / நடுத்தர)</span>
                  <span>10 (Severe / தாங்க முடியாதது)</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>
                    {lang === 'en' ? 'Submit Intake & Generate Consultation Token' : 'விவரங்களைச் சமர்ப்பித்து டோக்கன் பெறவும்'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          ) : (
            /* Queue Waiting Room & Active Token Card */
            activeToken && (
              <div className="space-y-6">
                {redFlagNotice && (
                  <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-sm space-y-2.5 animate-in shake duration-300">
                    <div className="flex items-center gap-2.5 text-rose-800 font-bold text-sm">
                      <Siren className="w-5 h-5 text-rose-600 animate-pulse" />
                      <span>{lang === 'en' ? 'Emergency Red Flag Triage' : 'அவசர சிகிச்சை எச்சரிக்கை'}</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">{redFlagNotice}</p>
                    {onOpenAmbulance && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAmbulance();
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Dispatch 108 Ambulance Now' : '108 ஆம்புலன்ஸ் வரவழைக்கவும்'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Main Token Ticket Display */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Activity className="w-48 h-48 text-teal-300" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-teal-300 uppercase">
                        {lang === 'en' ? 'Official HealthGrid OPD Token' : 'ஹெல்த்கிரிட் ஆலோசனைக் குறிப்பு'}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          activeToken.triageUrgency === 'RED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : activeToken.triageUrgency === 'AMBER'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {activeToken.triageUrgency} Priority
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-2">
                      <div>
                        <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                          #{activeToken.tokenId}
                        </div>
                        <p className="text-xs text-teal-200/80 mt-1">
                          {activeToken.patientName} ({activeToken.age} yrs • {activeToken.bloodGroup})
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-300">
                          {lang === 'en' ? 'Patients Ahead' : 'முந்தைய நோயாளிகள்'}
                        </div>
                        <div className="text-2xl font-bold text-teal-300">
                          {getAheadCount(activeToken)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {lang === 'en' ? 'Estimated Wait' : 'உத்தேச காத்திருப்பு'}
                        </span>
                        <span className="font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          ~{getEstimatedWaitMins(activeToken)} mins
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {lang === 'en' ? 'Queue Status' : 'வரிசை நிலை'}
                        </span>
                        <span className="font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activeToken.status === 'IN_CONSULTATION'
                                ? 'bg-emerald-400 animate-ping'
                                : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          {activeToken.status === 'IN_CONSULTATION'
                            ? (lang === 'en' ? 'Now Calling You!' : 'உங்களை அழைக்கிறார்!')
                            : (lang === 'en' ? 'In Active Queue' : 'வரிசையில் உள்ளது')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Ready Call-to-Action */}
                {activeToken.status === 'IN_CONSULTATION' ? (
                  <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 shadow-md text-emerald-950 space-y-3 animate-in bounce-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {lang === 'en'
                            ? `${activeToken.assignedDoctor?.doctorName || 'Dr. R. Meenakshi'} is ready for your consultation!`
                            : 'மருத்துவர் ஆலோசனைக்கு தயாராக உள்ளார்!'}
                        </h4>
                        <p className="text-xs text-emerald-700">
                          {lang === 'en'
                            ? 'Your HealthGrid CV and symptoms have been received in the consultation room.'
                            : 'உங்கள் மருத்துவக் குறிப்பு பெறப்பட்டுள்ளது.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onJoinConsultation) {
                          onJoinConsultation(activeToken);
                        }
                      }}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Video className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Enter Live Doctor Consultation Room' : 'மருத்துவ ஆலோசனைக் கூடத்தில் இணையவும்'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>{lang === 'en' ? 'Live Queue Telemetry Active' : 'நேரலை வரிசை கண்காணிப்பு'}</span>
                    </div>
                    <p className="leading-relaxed">
                      {lang === 'en'
                        ? 'Please keep this window open or stay connected. When your token is called by the consulting physician, an instant video chime will ring on your device.'
                        : 'மருத்துவர் உங்கள் டோக்கனை அழைக்கும் வரை காத்திருக்கவும். அழைப்பு வரும்போது ஒலி எழுப்பப்படும்.'}
                    </p>
                  </div>
                )}

                {/* HealthGrid CV Summary Preview */}
                <div className="p-4 rounded-2xl border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      {lang === 'en' ? 'HealthGrid CV Transmitted to Doctor' : 'மருத்துவருக்கு அனுப்பப்பட்ட குறிப்பு'}
                    </span>
                    <span className="text-[11px] text-slate-500">ABHA: {activeToken.healthGridCv.abhaId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">Allergies:</span>
                      <span className="font-semibold text-rose-700">
                        {activeToken.healthGridCv.allergies.join(', ') || 'NKDA'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Chronic Conditions:</span>
                      <span className="font-semibold text-slate-800">
                        {activeToken.healthGridCv.chronicConditions.join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-slate-400 block">Chief Complaint:</span>
                      <span className="font-medium text-slate-800">{activeToken.chiefComplaint}</span>
                    </div>
                  </div>
                </div>

                {/* Back / Reset Action */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep('INTAKE')}
                    className="text-xs text-teal-700 hover:underline font-semibold py-2.5 cursor-pointer"
                  >
                    {lang === 'en' ? '← Edit Intake Symptoms' : '← விவரங்களைத் திருத்த'}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {lang === 'en' ? 'Close & Keep Position' : 'மூடு (வரிசையில் தொடர்க)'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Family Member Add & Select Modal */}
      <ConsultationBeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setIsBeneficiaryModalOpen(false)}
        lang={lang}
        onSelectBeneficiary={(member) => {
          setFamilyMembers(familyMemberService.getFamilyMembers());
          handleSelectBeneficiary(member);
        }}
      />
    </div>
  );
};
