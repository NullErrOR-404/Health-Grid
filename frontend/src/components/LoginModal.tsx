import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Building2,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  CalendarDays,
  FileText,
  HeartPulse,
  HelpCircle,
  Mail,
} from 'lucide-react';
import type { Language } from '../types';
import { authService, type UserRole, type AuthUser } from '../services/authService';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker, calculateAgeFromDob } from './CustomDatePicker';

const BLOOD_GROUP_OPTIONS = [
  { value: 'B Positive', label: 'B Positive (B+)', badge: 'B+' },
  { value: 'O Positive', label: 'O Positive (O+)', badge: 'O+' },
  { value: 'A Positive', label: 'A Positive (A+)', badge: 'A+' },
  { value: 'AB Positive', label: 'AB Positive (AB+)', badge: 'AB+' },
  { value: 'O Negative', label: 'O Negative (O-)', badge: 'O-' },
  { value: 'A Negative', label: 'A Negative (A-)', badge: 'A-' },
  { value: 'B Negative', label: 'B Negative (B-)', badge: 'B-' },
  { value: 'AB Negative', label: 'AB Negative (AB-)', badge: 'AB-' },
];

type ModalViewMode = 'PERSONA_SELECT' | 'LOGIN_FORM';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenDoctorHandover?: () => void;
  onNavigateHis?: () => void;
  contextNotice?: string | null;
  onSuccess?: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenDoctorHandover,
  onNavigateHis,
  contextNotice,
  onSuccess,
}) => {
  const [viewMode, setViewMode] = useState<ModalViewMode>('PERSONA_SELECT');
  const [role, setRole] = useState<UserRole>('PERSONAL');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number>(0);
  const [bloodGroup, setBloodGroup] = useState('B Positive');
  const [isLoading, setIsLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setInfoToast(msg);
    setTimeout(() => setInfoToast(null), 3500);
  };

  const handleSelectPersona = (selectedRole: UserRole | 'HOSPITAL') => {
    if (selectedRole === 'HEALTHCARE_PROFESSIONAL' || selectedRole === 'HOSPITAL') {
      showNotification('Doctor & Hospital ERP portals are configuring. Continuing in Personal Account mode for now.');
      setRole('PERSONAL');
      setViewMode('LOGIN_FORM');
      setIsRegisterMode(false);
      return;
    }
    setRole('PERSONAL');
    setViewMode('LOGIN_FORM');
    setIsRegisterMode(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage(lang === 'en' ? 'Please fill in both email/mobile and password.' : 'மின்னஞ்சல்/கைபேசி மற்றும் கடவுச்சொல்லை நிரப்பவும்.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      let user: AuthUser;
      if (isRegisterMode) {
        user = await authService.register({
          fullName: fullName || (identifier.includes('@') ? identifier.split('@')[0] : 'Citizen User'),
          identifier,
          password,
          role,
          dob: dob || undefined,
          age: age || undefined,
          bloodGroup,
        });
      } else {
        user = await authService.loginWithCredentials(identifier, password, role);
      }

      setSuccessToast(
        lang === 'en'
          ? `Welcome, ${user.name}! Access granted.`
          : `வரவேற்கிறோம், ${user.name}! உள்நுழைவு வெற்றிகரமானது.`
      );

      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess(user);
        }
        onClose();
        if (role === 'HEALTHCARE_PROFESSIONAL') {
          if (onNavigateHis) {
            onNavigateHis();
          } else if (onOpenDoctorHandover) {
            onOpenDoctorHandover();
          }
        }
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication error occurred. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { error } = await authService.loginWithGoogle(role);
    if (error) {
      setIsLoading(false);
      setErrorMessage(
        error.includes('provider is not enabled')
          ? (lang === 'en'
              ? 'Google OAuth provider is not yet toggled ON in Supabase Dashboard (Auth > Providers). Please enable it with your Client ID or use Email/Password below.'
              : 'Google உள்நுழைவு வசதி இன்னும் Supabase Dashboard-ல் இயக்கப்படவில்லை. கீழே மின்னஞ்சல் வழியே உள்நுழையலாம்.')
          : error
      );
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { error } = await authService.loginWithApple(role);
    if (error) {
      setIsLoading(false);
      setErrorMessage(
        error.includes('provider is not enabled')
          ? (lang === 'en'
              ? 'Apple OAuth provider is not yet toggled ON in Supabase Dashboard. Please enable Apple or use Email/Password.'
              : 'Apple உள்நுழைவு வசதி இன்னும் இயக்கப்படவில்லை.')
          : error
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Toast Notifications */}
      {successToast && (
        <div className="fixed top-5 z-[70] bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {infoToast && (
        <div className="fixed top-5 z-[70] bg-sky-700 text-white font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 text-xs sm:text-sm max-w-md">
          <AlertCircle className="w-5 h-5 text-sky-200 flex-shrink-0" />
          <span>{infoToast}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100/90 w-full max-w-[1020px] overflow-hidden relative my-auto">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-xs"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: PERSONA SELECTOR UI                                               */}
        {/* ========================================================================= */}
        {viewMode === 'PERSONA_SELECT' && (
          <div className="flex flex-col lg:flex-row min-h-[660px]">
            {/* Left Column: Hospital Atrium with DocBot & Value Pillars */}
            <div
              className="w-full lg:w-[49%] relative p-8 lg:p-10 flex flex-col justify-between overflow-hidden bg-no-repeat"
              style={{
                backgroundImage: "url('/login-persona-bg.png')",
                backgroundPosition: "left bottom",
                backgroundSize: "cover",
                backgroundColor: '#e0f2fe',
              }}
            >
              {/* Soft readability gradient mask */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent pointer-events-none"></div>

              {/* Top Row: Logo & Trust Shield Badge */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#009688] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 tracking-tight leading-none">HealthGrid</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1">Your Health. Our Priority.</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-50/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-200/70 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span className="text-[11px] font-semibold text-emerald-800">Trusted by Hospitals Across India</span>
                </div>
              </div>

              {/* Main Headline & Subtitle */}
              <div className="relative z-10 my-auto pt-6 pb-4">
                <div className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">
                  SAFE • SMART • CONNECTED
                </div>
                <h1 className="text-3xl lg:text-[42px] font-black text-slate-900 leading-[1.12] tracking-tight">
                  One Platform<br />
                  for a <span className="text-[#0284c7]">Healthier</span><br />
                  Tomorrow
                </h1>
                <p className="text-xs lg:text-sm text-slate-600 leading-relaxed mt-3.5 max-w-sm font-normal">
                  Access personalized care, professional tools and hospital management — all in one secure healthcare platform.
                </p>

                {/* DocBot Speech Bubble & Feature Pills */}
                <div className="mt-8 flex flex-col items-end pr-2">
                  {/* Mascot Speech Bubble with Left Tail */}
                  <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-3.5 px-4 shadow-lg border border-slate-100 w-full max-w-[215px] mb-3">
                    <div className="absolute -left-2 top-4 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent"></div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-slate-900">Welcome to HealthGrid!</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#0284c7] fill-[#0284c7]" />
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">Choose how you want to continue.</p>
                  </div>

                  {/* 3 Pillar Cards */}
                  <div className="space-y-2.5 w-full max-w-[230px]">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 px-3 border border-white/80 shadow-xs flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        Better Care<br />for Patients
                      </span>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 px-3 border border-white/80 shadow-xs flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        Empowering<br />Healthcare Professionals
                      </span>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 px-3 border border-white/80 shadow-xs flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        Smarter Operations<br />for Hospitals
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Line */}
              <div className="relative z-10 pt-4 border-t border-slate-200/50 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                <span>Trusted</span>
                <span className="text-slate-300">|</span>
                <span>Secure</span>
                <span className="text-slate-300">|</span>
                <span>HIPAA-Ready</span>
                <span className="text-slate-300">|</span>
                <span>India&apos;s Healthcare Network</span>
              </div>
            </div>

            {/* Right Column: Persona Account Type Selection */}
            <div className="w-full lg:w-[51%] p-8 lg:p-12 flex flex-col justify-center bg-white">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-[28px] font-extrabold text-slate-900 tracking-tight">
                  Welcome to HealthGrid
                </h2>
                <p className="text-xs lg:text-sm text-slate-500 mt-1.5 font-normal">
                  Please select your account type to continue
                </p>
              </div>

              {/* Persona Cards */}
              <div className="space-y-4">
                {/* 1. Personal */}
                <button
                  onClick={() => handleSelectPersona('PERSONAL')}
                  className="group w-full p-4 lg:p-4.5 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] hover:border-teal-400 hover:shadow-md transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#cffafe] flex items-center justify-center text-teal-600 flex-shrink-0 shadow-xs">
                      <User className="w-6 h-6 text-teal-600 fill-teal-600/30" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        Personal
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Manage your health, book appointments, view reports and more.
                      </p>
                      <span className="inline-block bg-[#e6fffa] text-teal-700 border border-teal-200/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2">
                        For Patients &amp; Families
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-teal-100/70 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-all ml-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* 2. Healthcare Professional */}
                <button
                  onClick={() => handleSelectPersona('HEALTHCARE_PROFESSIONAL')}
                  className="group w-full p-4 lg:p-4.5 rounded-2xl bg-[#f0f9ff] border border-sky-100 hover:border-sky-400 hover:shadow-md transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-sky-600 flex-shrink-0 shadow-xs">
                      <Stethoscope className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        Healthcare Professional
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Access patient records, manage consultations, prescriptions and professional tools.
                      </p>
                      <span className="inline-block bg-sky-100/80 text-sky-700 border border-sky-200/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2">
                        For Doctors, Nurses &amp; Allied Staff
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-sky-100/70 text-sky-600 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-all ml-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* 3. Hospital */}
                <button
                  onClick={() => handleSelectPersona('HOSPITAL')}
                  className="group w-full p-4 lg:p-4.5 rounded-2xl bg-[#faf5ff] border border-purple-100 hover:border-purple-400 hover:shadow-md transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#f3e8ff] flex items-center justify-center text-purple-600 flex-shrink-0 shadow-xs">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        Hospital
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Access ERP tools to manage operations, staff, inventory, billing and more.
                      </p>
                      <span className="inline-block bg-purple-100/80 text-purple-700 border border-purple-200/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2">
                        For Hospital Administrators &amp; Staff
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all ml-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {/* Divider & Create Account Button */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-slate-400 font-medium">New to HealthGrid?</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setRole('PERSONAL');
                    setIsRegisterMode(true);
                    setViewMode('LOGIN_FORM');
                  }}
                  className="px-8 py-2.5 rounded-full border border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold text-xs transition-colors"
                >
                  Create an Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ACTIVE PERSONAL LOGIN / REGISTRATION FORM                         */}
        {/* ========================================================================= */}
        {viewMode === 'LOGIN_FORM' && (
          <div className="flex flex-col lg:flex-row min-h-[660px]">
            {/* Left Column: Personal Background with Woman, Mascot & Feature Badges */}
            <div
              className="w-full lg:w-[49%] relative p-8 lg:p-10 flex flex-col justify-between overflow-hidden bg-no-repeat"
              style={{
                backgroundImage: "url('/personal-login-bg.png')",
                backgroundPosition: "82% center",
                backgroundSize: "cover",
                backgroundColor: '#eff6ff',
              }}
            >
              {/* Soft readability gradient mask */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent pointer-events-none"></div>

              {/* Top Row: Logo & 500+ Hospitals Trust Badge */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#009688] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 tracking-tight leading-none">HealthGrid</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1">Your Health. Our Priority.</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-50/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-200/70 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span className="text-[11px] font-semibold text-emerald-800">Trusted by 500+ Hospitals Across India</span>
                </div>
              </div>

              {/* Main Headline & Subtitle */}
              <div className="relative z-10 my-auto pt-6 pb-2">
                <h1 className="text-3xl lg:text-[42px] font-black text-slate-900 leading-[1.12] tracking-tight">
                  Your Health<br />
                  in <span className="text-[#0284c7]">Your</span> Hands
                </h1>
                <p className="text-xs lg:text-sm text-slate-600 leading-relaxed mt-3 max-w-sm font-normal">
                  Book appointments, access your health records, consult with specialists and take charge of your wellbeing — all in one place.
                </p>

                {/* 3 Left-Aligned Feature Pills */}
                <div className="mt-6 space-y-3 max-w-[285px]">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-white/90 shadow-xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Easy Appointments</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Book online with top doctors across trusted hospitals.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-white/90 shadow-xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Your Health Records</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Access lab reports, prescriptions and medical history securely.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-white/90 shadow-xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Personalized Care</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Get reminders, follow-ups and health insights tailored for you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Trusted Pill Badge */}
              <div className="relative z-10 pt-4 flex items-center">
                <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-full py-2 px-3.5 shadow-md border border-slate-100 w-fit">
                  <div className="flex -space-x-2">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Citizen User"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Citizen User"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                      alt="Citizen User"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">Trusted by millions</div>
                    <div className="text-[10px] text-slate-500 leading-tight">Patients across India</div>
                  </div>
                  <div className="flex items-center gap-1 ml-1 text-cyan-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Credentials Input Form */}
            <div className="w-full lg:w-[51%] p-8 lg:p-12 flex flex-col justify-center bg-white relative">
              {/* Back to Personas & Need Help Bar */}
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('PERSONA_SELECT');
                    setIsRegisterMode(false);
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change account type</span>
                </button>

                <button
                  type="button"
                  onClick={() => showNotification('Support Desk: Contact care@healthgrid.in or call 1800-200-GRID for quick access.')}
                  className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Need help?</span>
                </button>
              </div>

              {/* Persona Center Avatar & Title */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#cffafe] flex items-center justify-center text-teal-600 mb-3 shadow-xs">
                  <User className="w-7 h-7 text-teal-600 fill-teal-600/30" />
                </div>
                <h2 className="text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight">
                  {isRegisterMode ? 'Create Personal Account' : 'Personal Account'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isRegisterMode
                    ? 'Register for your secure personal health record'
                    : 'Login to access your health dashboard'}
                </p>
              </div>

              {/* Context Notice / Error Banner */}
              {contextNotice && !errorMessage && (
                <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{contextNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Full Name in Register Mode */}
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        required={isRegisterMode}
                      />
                    </div>
                  </div>
                )}

                {/* Email or Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your email or mobile number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* DOB & Blood Group in Register Mode */}
                {isRegisterMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Date of Birth {age > 0 && <span className="text-teal-600 font-normal">({age} yrs)</span>}
                      </label>
                      <CustomDatePicker
                        value={dob}
                        onChange={(val) => {
                          setDob(val);
                          setAge(calculateAgeFromDob(val) ?? 0);
                        }}
                        placeholder="YYYY-MM-DD"
                        size="sm"
                        rounded="xl"
                        triggerClassName="!py-2.5 !rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Blood Group
                      </label>
                      <CustomSelect
                        value={bloodGroup}
                        onChange={(val) => setBloodGroup(val)}
                        options={BLOOD_GROUP_OPTIONS}
                        placeholder="Select Blood Group"
                        size="xs"
                        rounded="xl"
                        triggerClassName="!py-2.5 !rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={() => showNotification('Password reset link sent to your registered email/phone.')}
                        className="text-xs text-sky-600 hover:text-sky-700 font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                {!isRegisterMode && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#009688] focus:ring-[#009688]/30 accent-[#009688] cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#009688] hover:bg-[#00897b] active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>
                    {isLoading
                      ? 'Authenticating...'
                      : isRegisterMode
                      ? 'Create Account'
                      : 'Login to HealthGrid'}
                  </span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Social Login Options */}
              {!isRegisterMode && (
                <>
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                      OR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="truncate">Continue with Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppleLogin}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
                    >
                      <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.88-9.04-10.36-19.34-13.43-30.89-3.08-11.55-4.62-22.37-4.62-32.48 0-14.58 3.73-26.69 11.19-36.32 7.46-9.63 16.9-14.52 28.32-14.67 4.9 0 10.42 1.25 16.56 3.75 6.14 2.5 10.02 3.86 11.63 4.08 2.07-.33 6.08-1.74 12.04-4.24 5.96-2.5 11.24-3.65 15.84-3.45 13.93.65 24.83 5.49 32.7 14.52-12.18 7.39-18.15 17.51-17.9 30.34.25 10.22 4.19 18.76 11.83 25.62 7.64 6.86 16.59 10.66 26.85 11.41-2.18 6.53-4.79 13.1-7.83 19.72zM119.22 33.72c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 11.97-10.46 19.89-12.21.33 1.09.49 2.18.49 3.27 0 7.39-2.73 14.39-8.19 21-5.46 6.61-12.25 10.62-20.36 12.04-.22-1.09-.34-2.23-.34-3.43z" />
                      </svg>
                      <span className="truncate">Continue with Apple</span>
                    </button>
                  </div>
                </>
              )}

              {/* Mode Toggle Footer */}
              <div className="text-center mt-6">
                {isRegisterMode ? (
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    New to HealthGrid?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
