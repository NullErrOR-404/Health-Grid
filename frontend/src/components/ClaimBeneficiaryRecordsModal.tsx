import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  UserCheck,
  Lock,
  RefreshCw,
  Sparkles,
  Link2,
} from 'lucide-react';
import type { Language } from '../types';
import {
  familyMemberService,
  type FamilyMember,
  type LinkedHistoricalAlias,
} from '../services/familyMemberService';
import { authService } from '../services/authService';

interface ClaimBeneficiaryRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: (alias: LinkedHistoricalAlias) => void;
}

export const ClaimBeneficiaryRecordsModal: React.FC<ClaimBeneficiaryRecordsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedBeneficiaries, setMatchedBeneficiaries] = useState<
    Array<{
      member: FamilyMember;
      caregiverName: string;
      caregiverPhone?: string;
      recordsCount: number;
      tokensCount: number;
    }>
  >([]);
  const [selectedMatch, setSelectedMatch] = useState<{
    member: FamilyMember;
    caregiverName: string;
    caregiverPhone?: string;
    recordsCount: number;
    tokensCount: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [claimedAlias, setClaimedAlias] = useState<LinkedHistoricalAlias | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!q.trim()) return;

    setErrorMsg(null);
    setHasSearched(true);
    const results = familyMemberService.searchBeneficiaryRecords(q);
    setMatchedBeneficiaries(results);
    if (results.length > 0) {
      setSelectedMatch(results[0]);
    } else {
      setSelectedMatch(null);
    }
  };

  const handleAutoFillDemo = () => {
    setSearchQuery('HG-FAM-8492');
    handleSearch('HG-FAM-8492');
  };

  const handleAuthorizeTransfer = async () => {
    if (!selectedMatch) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const user = authService.getCurrentUser();
      const currentHealthId = user?.healthId || 'HG-NEW-SOVEREIGN';
      const currentUserId = user?.id || 'guest';
      const currentUserName = user?.name || selectedMatch.member.name;

      const result = await familyMemberService.claimBeneficiaryRecords({
        beneficiaryHealthId: selectedMatch.member.healthId,
        targetUserId: currentUserId,
        targetUserHealthId: currentHealthId,
        targetUserName: currentUserName,
      });

      if (result.success && result.alias) {
        setClaimedAlias(result.alias);
        onSuccess(result.alias);
      } else {
        setErrorMsg(result.message || 'Could not port records. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing ABDM record transfer protocol.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setSearchQuery('');
    setHasSearched(false);
    setMatchedBeneficiaries([]);
    setSelectedMatch(null);
    setClaimedAlias(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-records-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-teal-50/60 via-white to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 flex-shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="claim-records-modal-title" className="font-bold text-base sm:text-lg text-slate-900">
                  {lang === 'en'
                    ? 'Claim Prior Caregiver Records'
                    : 'முந்தைய பராமரிப்பாளர் மருத்துவ பதிவுகளை இணைக்கவும்'}
                </h3>
                <span className="text-[10px] bg-teal-100/80 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-700" />
                  <span>ABDM R-Port</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'en'
                  ? 'Unify past records from when family consulted on your behalf into your new account.'
                  : 'உங்கள் மகன் அல்லது உறவினர் உங்களுக்காக முன்பதிவு செய்த மருத்துவ பதிவுகளை இணைக்கவும்.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Screen */}
          {claimedAlias ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-lg text-slate-900">
                  {lang === 'en' ? 'Records Successfully Ported & Unified!' : 'மருத்துவ பதிவுகள் வெற்றிகரமாக இணைக்கப்பட்டன!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {lang === 'en'
                    ? `Historical Beneficiary ID ${claimedAlias.historicalHealthId} is now linked to your sovereign account as a verified lifetime alias.`
                    : `பழைய அடையாள எண் ${claimedAlias.historicalHealthId} உங்கள் புதிய கணக்குடன் வெற்றிகரமாக இணைக்கப்பட்டது.`}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Verified Historical Alias:</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                    {claimedAlias.historicalHealthId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Original Caregiver:</span>
                  <span className="font-bold text-slate-800">{claimedAlias.caregiverName}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Ported Prescriptions & Tokens:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {claimedAlias.transferredRecordsCount} Verified Clinical Records
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Caregiver Access Level:</span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-full border border-teal-200">
                    Delegated Co-Caregiver (Active)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="w-full sm:w-auto px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {lang === 'en' ? 'Done & View Unified Vault' : 'முடிந்தது • பெட்டகத்தைக் காண்க'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Search Form */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  {lang === 'en'
                    ? 'Enter Prior Beneficiary Health ID or Caregiver Contact'
                    : 'பழைய அடையாள எண் (HG-FAM-XXXX) அல்லது உறவினர் தொலைபேசி'}
                </label>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g. HG-FAM-8492 or Lakshmi or +91 98765..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium bg-slate-50/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Search' : 'தேடு'}</span>
                  </button>
                </div>

                {/* Quick Auto-Fill Demo Trigger */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Demo:</span>
                  <button
                    type="button"
                    onClick={handleAutoFillDemo}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>Auto-Fill: HG-FAM-8492 (Lakshmi Sundaram)</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Search Results / Match Preview */}
              {hasSearched && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>{lang === 'en' ? 'Discovered Beneficiary Profile' : 'கண்டறியப்பட்ட மருத்துவ விவரம்'}</span>
                    <span className="text-[11px] text-slate-500 lowercase font-normal">
                      {matchedBeneficiaries.length} {lang === 'en' ? 'match found' : 'பொருத்தம்'}
                    </span>
                  </div>

                  {matchedBeneficiaries.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>No Beneficiary Records Found</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        We could not find an unlinked beneficiary with ID "{searchQuery}". Please check the ID or try the quick demo button above.
                      </p>
                    </div>
                  ) : (
                    selectedMatch && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-slate-200/90 space-y-3.5">
                        
                        {/* Member Identity Card */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xl shadow-2xs">
                              {selectedMatch.member.gender === 'Female' ? '👩' : '👨'}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900">
                                {selectedMatch.member.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                <span>{selectedMatch.member.age} yrs • {selectedMatch.member.gender}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-700">{selectedMatch.member.bloodGroup || 'Blood: Set'}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-1 font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-flex">
                                <ShieldCheck className="w-3 h-3 text-teal-600" />
                                <span>{selectedMatch.member.healthId}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Caregiver</span>
                            <span className="text-xs font-bold text-slate-800 block">{selectedMatch.caregiverName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{selectedMatch.caregiverPhone || ''}</span>
                          </div>
                        </div>

                        {/* Clinical Records Breakdown */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Conditions & Prescriptions</div>
                            <div className="font-bold text-slate-800 text-xs mt-0.5">
                              {selectedMatch.member.chronicConditions?.join(', ') || 'Hypertension, Diabetes'}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Records Provenance</div>
                            <div className="font-bold text-emerald-700 text-xs mt-0.5">
                              {selectedMatch.recordsCount} Historical Clinical Records
                            </div>
                          </div>
                        </div>

                        {/* ABDM Guarantees Callout */}
                        <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-teal-900">
                            <Lock className="w-3 h-3 text-teal-700" />
                            <span>ABDM Data Sovereignty & Provenance Guarantees:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] pl-1">
                            <li>Your new HealthGrid ID remains your primary sovereign identifier.</li>
                            <li><strong>{selectedMatch.member.healthId}</strong> will be stored as an immutable <strong>Historical Record Alias</strong> for lifetime query resolution.</li>
                            <li>Past prescriptions will retain provenance: <em>"Consulted via Caregiver {selectedMatch.caregiverName}"</em>.</li>
                            <li>Your caregiver will receive delegated co-caregiver rights, which you can pause or revoke anytime.</li>
                          </ul>
                        </div>

                        {/* Step 3: Action Buttons */}
                        <div className="pt-1 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleAuthorizeTransfer}
                            disabled={isProcessing}
                            className="flex-1 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying & Porting Records...</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4" />
                                <span>{lang === 'en' ? 'Authorize & Unify Records' : 'அங்கீகரித்து இணைக்கவும்'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>DPDP Act 2023 & ABDM Compliant Portability</span>
          </div>

          <button
            type="button"
            onClick={resetModal}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'மூடு'}
          </button>
        </div>
      </div>
    </div>
  );
};
