import React, { useState } from 'react';
import {
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PolypharmacySafetyEvaluation } from '../../types/medicationSafety';

interface PolypharmacyShieldArtifactProps {
  data: PolypharmacySafetyEvaluation;
  onSendToChat?: (text: string) => void;
}

export const PolypharmacyShieldArtifact: React.FC<PolypharmacyShieldArtifactProps> = ({
  data,
  onSendToChat,
}) => {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(
    data.conflicts.length > 0 ? data.conflicts[0].id : null
  );

  const handleSendSummaryToChat = () => {
    if (!onSendToChat) return;
    const text = `I would like to discuss my multi-doctor medication review. HealthGrid detected ${data.conflicts.length} cross-prescription alerts across ${data.uniquePrescribingDoctorsCount} doctors with a safety score of ${data.overallRiskScore}/100. Can you explain the safest next steps?`;
    onSendToChat(text);
  };

  return (
    <div className="p-5 sm:p-6 space-y-6 text-slate-900 bg-white">
      {/* 1. TOP COCKPIT BANNER */}
      <div
        className={`p-5 rounded-2xl border ${
          data.safetyTier === 'ACTION_REQUIRED_HIGH_RISK'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : data.safetyTier === 'MONITOR'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border">
                ICMR Grounded • Multi-Doctor Shield
              </span>
              <span className="text-xs font-mono opacity-70">
                {new Date(data.evaluationTimestamp).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight">
              {data.safetyTier === 'ACTION_REQUIRED_HIGH_RISK'
                ? 'High-Risk Cross-Prescription Collision'
                : data.safetyTier === 'MONITOR'
                ? 'Prescription Duplication & Interaction Warning'
                : 'Verified Harmonious Regimen'}
            </h2>
            <p className="text-xs leading-relaxed opacity-90 max-w-xl">
              {data.plainLanguageSummaryEn}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-bold uppercase opacity-70">Safety Score</div>
            <div className="text-3xl font-black">{data.overallRiskScore}<span className="text-sm font-normal">/100</span></div>
          </div>
        </div>

        {/* 4 Stat Badges */}
        <div className="mt-4 pt-4 border-t border-current/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-white/60 rounded-xl">
            <div className="text-[10px] uppercase font-bold opacity-75">Molecules</div>
            <div className="font-black text-base">{data.totalActiveMolecules}</div>
          </div>
          <div className="p-2 bg-white/60 rounded-xl">
            <div className="text-[10px] uppercase font-bold opacity-75">Doctors</div>
            <div className="font-black text-base">{data.uniquePrescribingDoctorsCount}</div>
          </div>
          <div className="p-2 bg-white/60 rounded-xl">
            <div className="text-[10px] uppercase font-bold opacity-75">Hospitals</div>
            <div className="font-black text-base">{data.uniqueFacilitiesCount}</div>
          </div>
          <div className="p-2 bg-white/60 rounded-xl">
            <div className="text-[10px] uppercase font-bold opacity-75">Alerts</div>
            <div className="font-black text-base">{data.conflicts.length}</div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CONFLICT SELECTOR & MECHANISM VIEWER */}
      {data.conflicts.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Detected Cross-Doctor Alerts</span>
            <span className="text-[11px] text-slate-400 font-normal">Tap an alert to inspect pharmacology</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {data.conflicts.map((conflict) => {
              const isSelected = selectedConflictId === conflict.id;
              const isCritical = conflict.severity === 'CONTRAINDICATED';

              return (
                <div
                  key={conflict.id}
                  onClick={() => setSelectedConflictId(isSelected ? null : conflict.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isCritical
                        ? 'bg-rose-50 border-rose-400 shadow-sm'
                        : 'bg-amber-50 border-amber-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : conflict.severity === 'MAJOR'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {conflict.severity}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {conflict.titleEn}
                      </h4>
                    </div>
                    {isSelected ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  <div className="text-xs text-slate-600 mt-1">
                    {conflict.medicationA.brandName} ({conflict.medicationA.prescriber}) vs{' '}
                    {conflict.medicationB ? `${conflict.medicationB.brandName} (${conflict.medicationB.prescriber})` : 'Patient Context'}
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Clinical Mechanism: </span>
                        <span className="text-slate-700">{conflict.mechanismEn}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Patient Impact: </span>
                        <span className="text-rose-700 font-medium">{conflict.clinicalImpactEn}</span>
                      </div>
                      <div className="p-2.5 bg-white/90 rounded-lg border border-slate-200/70">
                        <span className="font-bold text-emerald-800">Recommendation: </span>
                        <span className="text-slate-800">{conflict.recommendedActionEn}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1">
                        Evidence Grounding: {conflict.evidenceSource}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MULTI-DOCTOR MEDICATION TIMELINE CHIPS */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Active Regimen Across Specialists ({data.reconciledMedications.length})
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
          {data.reconciledMedications.map((med) => (
            <div key={med.id} className="p-3 bg-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{med.brandName}</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {med.normalizedSalts.map((s) => s.saltName).join('+')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {med.provenance.doctorName} • {med.provenance.facilityName}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    med.patientReportedStatus === 'STILL_TAKING'
                      ? 'bg-teal-100 text-teal-800'
                      : med.patientReportedStatus === 'STOPPED'
                      ? 'bg-slate-100 text-slate-600 line-through'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  {med.patientReportedStatus ? med.patientReportedStatus.replace(/_/g, ' ') : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FOOTER ACTION */}
      {onSendToChat && (
        <div className="pt-2">
          <button
            onClick={handleSendSummaryToChat}
            className="w-full min-h-[44px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Send Polypharmacy Brief to AI Consultation</span>
          </button>
        </div>
      )}
    </div>
  );
};
