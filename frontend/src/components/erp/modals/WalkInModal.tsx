import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, CheckCircle2, ArrowRight, Smartphone, Copy, Check, Sparkles } from 'lucide-react';
import { unifiedPatientStore, type OpdQueueItem, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (queueItem: OpdQueueItem) => void;
  onPatientCreated?: (patient: UnifiedPatient) => void;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  onPatientCreated,
}) => {
  // Steps: 1: Details -> 2: OTP -> 3: Created Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [email, setEmail] = useState('');

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Registered Patient Output
  const [createdPatient, setCreatedPatient] = useState<UnifiedPatient | null>(null);
  const [copiedHealthId, setCopiedHealthId] = useState(false);

  // Optional e-Chart preparation after registration
  const [department, setDepartment] = useState('General Medicine');
  const [doctor, setDoctor] = useState('Dr. Mohamed');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !age) return;
    setOtpError(null);
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setOtpError('Please enter the 6-digit OTP sent to the patient phone.');
      return;
    }

    // Register patient with sovereign Health ID generated
    const newPatient = unifiedPatientStore.registerNewPatient({
      name: name.trim(),
      phone: phone.trim(),
      age: parseInt(age, 10) || 30,
      gender,
      bloodGroup,
      email: email.trim() || undefined,
    });

    setCreatedPatient(newPatient);
    if (onPatientCreated) {
      onPatientCreated(newPatient);
    }
    setStep(3);
  };

  const handleCopyHealthId = () => {
    if (createdPatient?.healthId) {
      navigator.clipboard.writeText(createdPatient.healthId);
      setCopiedHealthId(true);
      setTimeout(() => setCopiedHealthId(false), 2000);
    }
  };

  const handleIssueOpdToken = () => {
    if (!createdPatient) return;
    const queueItem = unifiedPatientStore.addExistingPatientToOpd(
      createdPatient.id,
      department,
      doctor,
      'General OPD'
    );
    if (queueItem) {
      onRegistered(queueItem);
    }
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setPhone('');
    setAge('');
    setEmail('');
    setOtp('');
    setCreatedPatient(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">New Patient Registration</h3>
              <p className="text-xs text-slate-500">
                {step === 1 && 'Desk onboarding & sovereign HealthGrid ID creation'}
                {step === 2 && 'Mobile OTP identity verification'}
                {step === 3 && 'Account provisioned successfully'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Patient Identity & Contact */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="p-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Gmail / Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-teal-700">Auto-links on Google login</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@gmail.com"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700 flex items-center gap-1.5 transition-all"
              >
                <span>Send OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Mobile OTP Verification */}
        {step === 2 && (
          <div className="p-5 space-y-4">
            <div className="p-3.5 bg-teal-50 border border-teal-200/80 rounded-xl flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-teal-900">OTP Sent to +91 {phone}</div>
                <div className="text-[11px] text-teal-700">
                  Ask patient for the 6-digit verification code.
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Enter 6-Digit OTP *
                </label>
                <button
                  type="button"
                  onClick={() => setOtp('849201')}
                  className="text-[10px] font-bold text-teal-700 bg-teal-100/60 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
                >
                  Quick Fill (849201)
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/[^0-9]/g, ''));
                  if (otpError) setOtpError(null);
                }}
                placeholder="849201"
                className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                autoFocus
              />
              {otpError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5">{otpError}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-700 font-bold"
              >
                &larr; Back to Details
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700 flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify &amp; Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Created Success & Sovereign Health ID */}
        {step === 3 && createdPatient && (
          <div className="p-5 space-y-4">
            <div className="text-center py-2 space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">HealthGrid Account Created!</h4>
              <p className="text-xs text-slate-500">
                Sovereign national health identity registered in Supabase
              </p>
            </div>

            {/* Health ID Badge */}
            <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Unique HealthGrid ID</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyHealthId}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  {copiedHealthId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center py-1">
                <span className="text-2xl font-mono font-black text-teal-900 tracking-wider">
                  {createdPatient.healthId}
                </span>
              </div>

              <div className="pt-2 border-t border-teal-200/60 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Patient</span>
                  <span className="font-bold text-slate-900">{createdPatient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Phone</span>
                  <span className="font-semibold text-slate-900">{createdPatient.phone}</span>
                </div>
              </div>
            </div>

            {/* Optional e-Chart & OPD Token Assignment */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Prepare e-Chart &amp; OPD Consultation (Optional)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block uppercase font-bold mb-0.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Diabetology">Diabetology</option>
                    <option value="Orthopaedics">Orthopaedics</option>
                    <option value="Paediatrics">Paediatrics</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block uppercase font-bold mb-0.5">
                    Specialist Doctor
                  </label>
                  <select
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Dr. Mohamed">Dr. Mohamed</option>
                    <option value="Dr. Revathi">Dr. Revathi</option>
                    <option value="Dr. Arjun">Dr. Arjun</option>
                    <option value="Dr. Priya">Dr. Priya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close (Save Only)
              </button>
              <button
                type="button"
                onClick={handleIssueOpdToken}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue OPD Token</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
