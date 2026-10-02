import React, { useState } from 'react';
import { X, Building2, MapPin, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { type HospitalEntity, saveHospital, getHospitalsList } from '../data/hospitalsList';

interface RegisterHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hospital: HospitalEntity) => void;
}

export const RegisterHospitalModal: React.FC<RegisterHospitalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredHospital, setRegisteredHospital] = useState<HospitalEntity | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hospitalName.trim() || !city.trim() || !adminEmail.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const currentList = getHospitalsList();
      const nextNum = currentList.length + 1;
      const formattedNum = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
      const code = `HG-H${formattedNum}`;
      const id = `hosp-${Date.now()}`;
      const emailPrefix = adminEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const allocatedUsername = `${emailPrefix}_admin`;

      const newHospital: HospitalEntity = {
        id,
        code,
        name: hospitalName.trim(),
        city: city.trim(),
        state: 'Tamil Nadu',
        type: 'General & Multi-Specialty Care',
        totalBeds: 100,
        availableBeds: 25,
        adminName: adminEmail.split('@')[0].replace('.', ' ').toUpperCase(),
        adminEmail: adminEmail.trim(),
        username: allocatedUsername,
        password: password.trim(),
      };

      saveHospital(newHospital);
      setRegisteredHospital(newHospital);
      setIsSubmitting(false);

      setTimeout(() => {
        onSuccess(newHospital);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-none sm:rounded-[28px] shadow-2xl border-0 sm:border border-slate-100 w-full sm:max-w-lg h-full sm:h-auto max-h-none sm:max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Register New Hospital</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate sm:whitespace-normal">Quick onboarding for health facilities & clinics</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content Body */}
        {registeredHospital ? (
          <div className="p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Registration Complete!</h3>
            <p className="text-xs text-slate-600 mb-3">
              <span className="font-semibold text-slate-900">{registeredHospital.name}</span> has been issued Hospital Code{' '}
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{registeredHospital.code}</span>.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-left max-w-sm mx-auto">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Allocated Administrator Userspace:</div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Assigned Username:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{registeredHospital.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-600">Admin Email:</span>
                <span className="font-medium text-slate-800">{registeredHospital.adminEmail}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Redirecting to Hospital Portal with your new facility selected...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 safe-area-pb">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. City Health Specialty Center"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai, Coimbatore, Madurai"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrator Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@cityhealth.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5 text-slate-600 text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Further facility specifications (beds, ward allocations, NABH/CEA licenses) can be configured directly inside the portal settings.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Register Hospital'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
