import React, { useState } from 'react';
import { ShieldCheck, KeyRound, AlertTriangle, X, Lock } from 'lucide-react';
import { authService } from '../../services/authService';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  factorId?: string;
  isEnrollment?: boolean;
}

export const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  factorId,
  isEnrollment = false,
}) => {
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [activeFactorId, setActiveFactorId] = useState<string | undefined>(factorId);

  React.useEffect(() => {
    if (isOpen && isEnrollment) {
      setIsLoading(true);
      authService
        .enrollTotp()
        .then((res) => {
          setActiveFactorId(res.id);
          setQrUri(res.qr_code);
          setSecret(res.secret);
          setIsLoading(false);
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to initiate 2FA enrollment.');
          setIsLoading(false);
        });
    }
  }, [isOpen, isEnrollment]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      setErrorMsg('Please enter a 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (activeFactorId) {
        await authService.verifyTotp(activeFactorId, totpCode);
        onSuccess();
        onClose();
      } else {
        setErrorMsg('No active 2FA factor found. Please try re-enrolling.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid 2FA code. Please check your Authenticator app.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full uppercase">
              Admin & Doctor 2FA
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {isEnrollment ? 'Setup Two-Factor Auth' : 'Security Verification'}
            </h3>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isEnrollment && qrUri && (
          <div className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Scan this QR code in Google Authenticator or Microsoft Authenticator:
            </p>
            <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-slate-200">
              <img src={qrUri} alt="2FA QR Code" className="w-36 h-36 mx-auto" />
            </div>
            {secret && (
              <p className="text-[11px] font-mono text-slate-500 break-all">
                Manual Key: <span className="font-bold text-slate-700">{secret}</span>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Enter 6-Digit Authenticator Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-center text-xl font-mono tracking-widest font-black text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6}
              className="flex-1 py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify Code</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-[11px] text-center text-slate-400">
          Enforced under ISO 27001 & DPDP Act 2023 for clinical and administrative workspaces.
        </p>
      </div>
    </div>
  );
};
