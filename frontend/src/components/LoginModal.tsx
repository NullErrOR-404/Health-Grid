import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  MessageSquareText,
  ShieldCheck,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle
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
  const [role, setRole] = useState<UserRole>('PERSONAL');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number>(0);
  const [bloodGroup, setBloodGroup] = useState('B Positive');
  const [isLoading, setIsLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

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
          ? `Welcome, ${user.name}! ${role === 'HEALTHCARE_PROFESSIONAL' ? '(Clinician Verified)' : ''}`
          : `வரவேற்கிறோம், ${user.name}! ${role === 'HEALTHCARE_PROFESSIONAL' ? '(மருத்துவர் கணக்கு)' : ''}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="fixed top-5 z-[60] bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Container: Split Desktop / Stacked Mobile */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-slate-200/90 w-full max-w-5xl overflow-hidden relative my-auto">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row min-h-[640px]">
          
          {/* ========================================================= */}
          {/* DESKTOP LEFT COLUMN / MOBILE HERO BANNER                  */}
          {/* ========================================================= */}
          
          {/* Desktop Left Panel (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:w-[56%] relative p-10 xl:p-12 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#E6FAF4] via-[#EEFBF7] to-[#D5F5ED]">
            {/* Soft Ambient Glow Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-0 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Brand Header */}
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/Logo.png"
                  alt="HealthGrid நலம் AI"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="w-12 h-1 bg-[#0B7A75] rounded-full mt-2.5"></div>

              {/* Main Headline */}
              <h1 className="text-[40px] xl:text-[44px] font-black text-slate-900 tracking-tight leading-[1.12] mt-8">
                Your Health<br />Companion<br />Always Here
              </h1>

              <p className="text-slate-600 text-sm leading-relaxed mt-4 max-w-sm">
                Get instant answers, trusted health information, find nearby hospitals, call an ambulance and more, all in one place.
              </p>

              {/* 4 Feature Highlights */}
              <div className="space-y-4 mt-8 max-w-xs relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm text-[#0B7A75] border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">AI Health Assistant</h4>
                    <p className="text-[11px] text-slate-500">24/7 support in simple language</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm text-[#0B7A75] border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Trusted Information</h4>
                    <p className="text-[11px] text-slate-500">Doctor-verified medical facts</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm text-[#0B7A75] border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Emergency Support</h4>
                    <p className="text-[11px] text-slate-500">Find nearby hospitals & call ambulance</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm text-[#0B7A75] border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">For Your Family</h4>
                    <p className="text-[11px] text-slate-500">Care for everyone, always</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Hero Illustration Overlay */}
            <div className="absolute right-[-40px] bottom-12 w-[380px] xl:w-[440px] pointer-events-none select-none z-0">
              <img
                src="/login_hero_desktop.png"
                alt="DocBot Mascot & Floating Health Icons"
                className="w-full h-auto object-contain filter drop-shadow-2xl"
              />
            </div>

            {/* Bottom Handwritten Signature */}
            <div className="pt-6 relative z-10">
              <div className="flex items-center gap-1.5 font-serif italic text-slate-800 font-bold text-base tracking-wide">
                <span>“A Healthier You, A Happier Tomorrow”</span>
                <span className="text-[#0B7A75] not-italic ml-1">♡</span>
              </div>
              <div className="w-28 h-0.5 bg-[#0B7A75] rounded-full mt-1"></div>
            </div>
          </div>

          {/* Mobile Top Navigation & Hero Banner (Visible only on < lg) */}
          <div className="lg:hidden w-full bg-gradient-to-b from-[#E6FAF4] to-[#C9F3E9] pt-5 pb-8 px-5 relative overflow-hidden">
            {/* Mobile Top Bar */}
            <div className="flex items-center justify-between">
              <img
                src="/Logo.png"
                alt="HealthGrid நலம் AI"
                className="h-8 w-auto object-contain"
              />

              <div className="flex items-center gap-2 pr-8">
                <span className="text-xs text-slate-500 font-medium">New here?</span>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs font-bold text-slate-800 border border-slate-300 bg-white/80 hover:bg-white px-3 py-1 rounded-xl transition-all shadow-2xs"
                >
                  {isRegisterMode ? 'Sign In' : 'Create Account'}
                </button>
              </div>
            </div>

            {/* Mobile Hero Illustration */}
            <div className="flex justify-center mt-3 select-none">
              <img
                src="/login_hero_mobile.png"
                alt="DocBot Mobile Companion"
                className="w-full max-w-[320px] h-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (DESKTOP) / ELEVATED BOTTOM SHEET (MOBILE)    */}
          {/* ========================================================= */}
          <div className="lg:w-[44%] bg-white p-6 sm:p-10 lg:p-10 xl:p-12 flex flex-col justify-between relative -mt-6 lg:mt-0 rounded-t-[32px] lg:rounded-none shadow-xl lg:shadow-none z-10">
            
            {/* Top Right: "New here? [ Create an Account ]" on Desktop */}
            <div className="hidden lg:flex items-center justify-end gap-2 text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">
                {isRegisterMode ? 'Already have an account?' : 'New here?'}
              </span>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="font-semibold text-slate-800 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
              >
                {isRegisterMode ? 'Sign In' : 'Create an Account'}
              </button>
            </div>

            {/* Form Container */}
            <div className="my-auto py-2">
              
              {/* Context Notice Banner (when prompted by chat or scanner action) */}
              {contextNotice && (
                <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-teal-50 border border-teal-200/90 text-[#00695C] text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-in fade-in slide-in-from-top-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <span className="leading-snug">{contextNotice}</span>
                </div>
              )}

              {/* Form Title & Subtitle */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  {isRegisterMode
                    ? 'Register your profile to access your health vault'
                    : 'Login to continue to HealthGrid'}
                </p>
              </div>

              {/* Segmented Control Role Tabs */}
              <div className="mt-5 p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setRole('PERSONAL')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'PERSONAL'
                      ? 'bg-white shadow-sm text-slate-900 border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User className={`w-4 h-4 ${role === 'PERSONAL' ? 'text-[#0B7A75]' : 'text-slate-400'}`} />
                  <span>Personal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('HEALTHCARE_PROFESSIONAL')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'HEALTHCARE_PROFESSIONAL'
                      ? 'bg-white shadow-sm text-slate-900 border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Stethoscope className={`w-4 h-4 ${role === 'HEALTHCARE_PROFESSIONAL' ? 'text-[#0B7A75]' : 'text-slate-400'}`} />
                  <span>Healthcare Professional</span>
                </button>
              </div>

              {/* Clinician Badge when Healthcare Professional is active */}
              {role === 'HEALTHCARE_PROFESSIONAL' && (
                <div className="mt-3 p-2 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Verified Doctor, Nurse & 108 Paramedic Portal Access</span>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{errorMessage}</div>
                </div>
              )}

              {/* Login / Register Form */}
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                
                {/* Additional Full Name field if in Register mode */}
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g. Priya R.' : 'எ.கா: பிரியா ஆர்.'}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B7A75] focus:ring-2 focus:ring-teal-100 transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Field 1: Email or Mobile Number (or Clinician License) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {role === 'HEALTHCARE_PROFESSIONAL'
                      ? 'Medical Reg No. / Hospital Email'
                      : 'Email or Mobile Number'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        role === 'HEALTHCARE_PROFESSIONAL'
                          ? 'Enter NMC license (e.g. TN-MC-84920) or hospital email'
                          : 'Enter your email or mobile number'
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B7A75] focus:ring-2 focus:ring-teal-100 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={() => alert(lang === 'en' ? 'Password reset link sent to your registered mobile/email.' : 'கடவுச்சொல் மீட்டெடுப்பு இணைப்பு உங்கள் மொபைலுக்கு அனுப்பப்பட்டது.')}
                        className="text-xs font-semibold text-[#0B7A75] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B7A75] focus:ring-2 focus:ring-teal-100 transition-all bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* DOB, Auto-Calculated Age, and Blood Group if Registering */}
                {isRegisterMode && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                        <CustomDatePicker
                          value={dob}
                          onChange={(newDob) => {
                            setDob(newDob);
                            const calculated = calculateAgeFromDob(newDob);
                            setAge(calculated !== null ? calculated : 0);
                          }}
                          placeholder="Select Birth Date"
                          size="sm"
                          rounded="2xl"
                          triggerClassName="!py-2.5 !rounded-2xl"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">Age (Years)</label>
                          <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-teal-600" />
                            <span>Auto-Calculated</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-600 cursor-not-allowed select-none flex items-center justify-between shadow-inner">
                          <span>{age > 0 ? `${age} years old` : 'Select DOB'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Locked</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                      <CustomSelect
                        value={bloodGroup}
                        onChange={(val) => setBloodGroup(val)}
                        options={BLOOD_GROUP_OPTIONS}
                        placeholder="Select Blood Group"
                        size="xs"
                        rounded="2xl"
                        triggerClassName="!py-2.5 !rounded-2xl"
                      />
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#0B7A75] hover:bg-[#08635F] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying...' : isRegisterMode ? 'Complete Registration' : 'Login'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Divider: "or continue with" */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                  or continue with
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold transition-all shadow-2xs"
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

                {/* Apple Sign-In */}
                <button
                  type="button"
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold transition-all shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.88-9.04-10.36-19.34-13.43-30.89-3.08-11.55-4.62-22.37-4.62-32.48 0-14.58 3.73-26.69 11.19-36.32 7.46-9.63 16.9-14.52 28.32-14.67 4.9 0 10.42 1.25 16.56 3.75 6.14 2.5 10.02 3.86 11.63 4.08 2.07-.33 6.08-1.74 12.04-4.24 5.96-2.5 11.24-3.65 15.84-3.45 13.93.65 24.83 5.49 32.7 14.52-12.18 7.39-18.15 17.51-17.9 30.34.25 10.22 4.19 18.76 11.83 25.62 7.64 6.86 16.59 10.66 26.85 11.41-2.18 6.53-4.79 13.1-7.83 19.72zM119.22 33.72c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 11.97-10.46 19.89-12.21.33 1.09.49 2.18.49 3.27 0 7.39-2.73 14.39-8.19 21-5.46 6.61-12.25 10.62-20.36 12.04-.22-1.09-.34-2.23-.34-3.43z" />
                  </svg>
                  <span className="truncate">Continue with Apple</span>
                </button>
              </div>

              {/* Legal Footer Agreement */}
              <p className="text-center text-[11px] sm:text-xs text-slate-500 mt-6 leading-relaxed">
                By logging in, you agree to our{' '}
                <a href="#" className="text-[#0B7A75] font-semibold underline hover:text-teal-900">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#0B7A75] font-semibold underline hover:text-teal-900">
                  Privacy Policy
                </a>.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
