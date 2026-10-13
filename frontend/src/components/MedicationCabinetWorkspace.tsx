import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Pill,
  Building2,
  Stethoscope,
  Calendar,
  FileText,
  Printer,
  Copy,
  Check,
  Plus,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import {
  medicationSafetyService,
} from '../services/medicationSafetyService';
import type {
  ReconciledMedicationItem,
  PolypharmacySafetyEvaluation,
  PatientTakingStatus,
} from '../types/medicationSafety';

interface MedicationCabinetWorkspaceProps {
  patientId?: string;
  patientName?: string;
  onOpenPrescriptionScanner?: () => void;
  onOpenTeleClinic?: () => void;
  onClose?: () => void;
}

export const MedicationCabinetWorkspace: React.FC<MedicationCabinetWorkspaceProps> = ({
  patientId = 'default_citizen',
  patientName = 'Mohamed S.',
  onOpenPrescriptionScanner,
  onOpenTeleClinic,
  onClose,
}) => {
  const [cabinet, setCabinet] = useState<ReconciledMedicationItem[]>([]);
  const [evaluation, setEvaluation] = useState<PolypharmacySafetyEvaluation | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'NEEDS_REVIEW' | 'STOPPED'>('ALL');
  const [expandedConflictId, setExpandedConflictId] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);

  // New medication form states
  const [newBrand, setNewBrand] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newFreq, setNewFreq] = useState('Once daily (OD)');

  // Load cabinet and evaluate safety
  const loadAndEvaluate = () => {
    const meds = medicationSafetyService.getPatientMedicationCabinet(patientId);
    setCabinet(meds);
    const evalResult = medicationSafetyService.evaluatePolypharmacySafety(meds, {
      knownAllergies: ['Penicillin'],
      patientAge: 52,
      estimatedGfr: 68,
      hasChronicKidneyDisease: false,
    });
    setEvaluation(evalResult);
  };

  useEffect(() => {
    loadAndEvaluate();
  }, [patientId]);

  // Handle patient reporting taking status
  const handleUpdateStatus = (medId: string, newStatus: PatientTakingStatus) => {
    const updated = medicationSafetyService.updatePatientReportedStatus(patientId, medId, newStatus);
    setCabinet(updated);
    const evalResult = medicationSafetyService.evaluatePolypharmacySafety(updated, {
      knownAllergies: ['Penicillin'],
      patientAge: 52,
      estimatedGfr: 68,
      hasChronicKidneyDisease: false,
    });
    setEvaluation(evalResult);
  };

  // Add custom medication
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;

    const saltKey = medicationSafetyService.normalizeDrugNameToSalt(newBrand);
    const newItem: ReconciledMedicationItem = {
      id: `med_user_${Date.now()}`,
      brandName: newBrand.trim(),
      normalizedSalts: [
        {
          saltName: saltKey ? saltKey.charAt(0).toUpperCase() + saltKey.slice(1) : newBrand.trim(),
          strength: newDose || 'Standard',
        },
      ],
      dosageForm: 'Tablet',
      dosage: newDose || '1 tablet',
      frequency: newFreq,
      timing: 'After meals',
      provenance: {
        doctorName: newDoctor.trim() || 'Self-Reported / Clinic',
        facilityName: newFacility.trim() || 'External Pharmacy',
        prescriptionDate: new Date().toISOString().split('T')[0],
        sourceType: 'PATIENT_REPORTED',
      },
      status: 'ACTIVE',
      patientReportedStatus: 'STILL_TAKING',
      lastPatientReportedAt: new Date().toISOString(),
    };

    const updated = medicationSafetyService.addOrReconcileMedication(patientId, newItem);
    setCabinet(updated);
    const evalResult = medicationSafetyService.evaluatePolypharmacySafety(updated);
    setEvaluation(evalResult);

    setNewBrand('');
    setNewDoctor('');
    setNewFacility('');
    setNewDose('');
    setShowAddMedModal(false);
  };

  // Filtered medications
  const displayedMedications = useMemo(() => {
    if (!cabinet) return [];
    if (filterStatus === 'ALL') return cabinet;
    if (filterStatus === 'ACTIVE') return cabinet.filter((m) => m.status === 'ACTIVE' && m.patientReportedStatus !== 'STOPPED');
    if (filterStatus === 'STOPPED') return cabinet.filter((m) => m.patientReportedStatus === 'STOPPED');
    if (filterStatus === 'NEEDS_REVIEW') {
      const conflictMedIds = new Set<string>();
      evaluation?.conflicts.forEach((c) => {
        conflictMedIds.add(c.medicationA.id);
        if (c.medicationB) conflictMedIds.add(c.medicationB.id);
      });
      return cabinet.filter((m) => conflictMedIds.has(m.id));
    }
    return cabinet;
  }, [cabinet, filterStatus, evaluation]);

  // Total savings calculation
  const totalMonthlySavings = useMemo(() => {
    return cabinet.reduce((acc, med) => acc + (med.monthlySavingsInr || 0), 0);
  }, [cabinet]);

  // Doctor discussion note text
  const doctorDiscussionText = useMemo(() => {
    if (!evaluation) return '';
    return medicationSafetyService.generateDoctorDiscussionSummary(evaluation, patientName);
  }, [evaluation, patientName]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(doctorDiscussionText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
                  Safety Radar • Multi-Doctor Shield
                </span>
                <span className="text-xs text-slate-400 font-medium">v2026.1 ICMR Grounded</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Unified Medication Cabinet
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSummaryModal(true)}
              className="min-w-[44px] min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Generate summary for treating doctor"
            >
              <FileText className="w-4 h-4 text-teal-700" />
              <span className="hidden sm:inline">Doctor Discussion Brief</span>
            </button>

            {onOpenPrescriptionScanner && (
              <button
                onClick={onOpenPrescriptionScanner}
                className="min-w-[44px] min-h-[44px] px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Scan New Prescription</span>
              </button>
            )}

            {onOpenTeleClinic && (
              <button
                onClick={onOpenTeleClinic}
                className="min-w-[44px] min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                title="Consult a doctor online"
              >
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">Tele-Consult</span>
              </button>
            )}

            <button
              onClick={() => setShowAddMedModal(true)}
              className="min-w-[44px] min-h-[44px] px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              title="Add medicine manually"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add Medicine</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors flex items-center justify-center"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 1. TOP CONFLICT RADAR & SAFETY METRICS HUD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cross-Doctor Polypharmacy Evaluation
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Patient: {patientName}
                </h2>
                {evaluation?.safetyTier === 'ACTION_REQUIRED_HIGH_RISK' && (
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-extrabold flex items-center gap-1.5 animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                    High Risk Collision Detected
                  </span>
                )}
                {evaluation?.safetyTier === 'MONITOR' && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Monitoring & Duplication Advisory
                  </span>
                )}
                {evaluation?.safetyTier === 'SAFE' && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Balanced Regimen
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {evaluation?.plainLanguageSummaryEn}
              </p>
              <p className="text-xs text-slate-500 mt-1 italic max-w-2xl">
                {evaluation?.plainLanguageSummaryTa}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Active Molecules</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {evaluation?.totalActiveMolecules || 0}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Doctors & Clinics</div>
                <div className="text-2xl font-black text-teal-700 mt-0.5">
                  {evaluation?.uniquePrescribingDoctorsCount || 0}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Collisions / DDI</div>
                <div className={`text-2xl font-black mt-0.5 ${
                  (evaluation?.conflicts.length || 0) > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {evaluation?.conflicts.length || 0}
                </div>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <div className="text-[11px] font-bold text-emerald-700 uppercase">Generic Savings</div>
                <div className="text-2xl font-black text-emerald-800 mt-0.5">
                  ₹{Math.round(totalMonthlySavings)}<span className="text-xs font-normal">/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                HealthGrid cross-references active salts across all scanned prescriptions. Updating your taking status updates clinical alerts without deleting your doctor's official orders.
              </span>
            </div>
            <button
              onClick={loadAndEvaluate}
              className="min-w-[44px] min-h-[44px] px-3 py-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Conflict Engine</span>
            </button>
          </div>
        </div>

        {/* 2. HIGH RISK CLINICAL CONFLICT CARDS (IF PRESENT) */}
        {evaluation && evaluation.conflicts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Detected Prescribing Collisions ({evaluation.conflicts.length})</span>
              </div>
              <span className="text-xs text-slate-400">Review before combining medications</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {evaluation.conflicts.map((conflict) => {
                const isExpanded = expandedConflictId === conflict.id;
                const isContraindicated = conflict.severity === 'CONTRAINDICATED';

                return (
                  <div
                    key={conflict.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      isContraindicated
                        ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                        : conflict.severity === 'MAJOR'
                        ? 'bg-amber-50/70 border-amber-200 shadow-xs'
                        : 'bg-blue-50/70 border-blue-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isContraindicated
                                ? 'bg-rose-600 text-white'
                                : conflict.severity === 'MAJOR'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {conflict.severity.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {conflict.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {conflict.titleEn}
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {conflict.descriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-start">
                        <button
                          onClick={() => setExpandedConflictId(isExpanded ? null : conflict.id)}
                          className="min-w-[44px] min-h-[44px] px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Pharmacological Evidence'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Prescriber Collision Details */}
                    <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white/90 rounded-xl border border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Prescription 1</div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          {conflict.medicationA.brandName} ({conflict.medicationA.saltName})
                        </div>
                        <div className="text-slate-600 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>{conflict.medicationA.prescriber}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{conflict.medicationA.facility} • {conflict.medicationA.date}</span>
                        </div>
                      </div>

                      {conflict.medicationB ? (
                        <div className="p-3 bg-white/90 rounded-xl border border-slate-100 space-y-1">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Prescription 2</div>
                          <div className="font-extrabold text-slate-900 text-sm">
                            {conflict.medicationB.brandName} ({conflict.medicationB.saltName})
                          </div>
                          <div className="text-slate-600 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                            <span>{conflict.medicationB.prescriber}</span>
                          </div>
                          <div className="text-slate-500 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{conflict.medicationB.facility} • {conflict.medicationB.date}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-white/90 rounded-xl border border-slate-100 space-y-1">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Patient Safety Context</div>
                          <div className="font-extrabold text-slate-900 text-sm">Individual Vulnerability</div>
                          <div className="text-slate-600">Cross-referenced against verified patient allergy & organ profile.</div>
                        </div>
                      )}
                    </div>

                    {/* Expandable Pharmacology Evidence & Guidance */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3 text-xs bg-white/80 p-4 rounded-xl">
                        <div>
                          <div className="font-bold text-slate-900 mb-0.5">Biological Mechanism:</div>
                          <p className="text-slate-600 leading-relaxed">{conflict.mechanismEn}</p>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 mb-0.5">Potential Clinical Impact:</div>
                          <p className="text-rose-700 leading-relaxed font-medium">{conflict.clinicalImpactEn}</p>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 mb-0.5">Recommended Clinical Action:</div>
                          <p className="text-emerald-800 leading-relaxed font-semibold">{conflict.recommendedActionEn}</p>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Authoritative Source: {conflict.evidenceSource}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. RECONCILED MEDICATIONS LIST & TAKING STATUS CONTROLS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Current Cross-Doctor Medication List ({cabinet.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm your actual daily use below so doctors see your true regimen at your next appointment.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({cabinet.length})
              </button>
              <button
                onClick={() => setFilterStatus('ACTIVE')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'ACTIVE' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('NEEDS_REVIEW')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'NEEDS_REVIEW' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Conflict ({evaluation?.conflicts.length || 0})
              </button>
              <button
                onClick={() => setFilterStatus('STOPPED')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'STOPPED' ? 'bg-white text-slate-500 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stopped
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
            {displayedMedications.map((med) => {
              const hasConflict = evaluation?.conflicts.some(
                (c) => c.medicationA.id === med.id || c.medicationB?.id === med.id
              );

              return (
                <div
                  key={med.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    hasConflict ? 'bg-rose-50/20' : 'bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Drug Details & Salt Normalization */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900">
                          {med.brandName}
                        </span>
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
                          {med.normalizedSalts.map((s) => `${s.saltName} ${s.strength}`).join(' + ')}
                        </span>
                        {hasConflict && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-rose-100 text-rose-800">
                            Conflict Flagged
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          {med.dosageForm}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-4 flex-wrap">
                        <span><strong>Schedule:</strong> {med.dosage} • {med.frequency} • {med.timing}</span>
                        {med.duration && <span><strong>Duration:</strong> {med.duration}</span>}
                        {med.purposeEn && <span><strong>Indication:</strong> {med.purposeEn}</span>}
                      </div>

                      {/* Doctor & Facility Provenance */}
                      <div className="pt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-semibold text-slate-700">{med.provenance.doctorName}</span>
                          {med.provenance.specialty && (
                            <span className="text-slate-400">({med.provenance.specialty})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{med.provenance.facilityName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prescribed on {med.provenance.prescriptionDate}</span>
                        </div>
                      </div>

                      {/* Jan Aushadhi PMBJP Price Equivalency */}
                      {med.isGenericAvailable && (
                        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs flex items-center justify-between gap-3 max-w-lg mt-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
                            <div>
                              <span className="font-bold text-emerald-900">PMBJP Generic Available: </span>
                              <span className="text-emerald-800">{med.genericEquivalentName}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-emerald-900 font-black">₹{med.janAushadhiPriceInr}</span>
                            <span className="text-slate-400 line-through ml-1.5">₹{med.brandedPriceInr}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Patient-Reported Taking Status Pills */}
                    <div className="space-y-2 shrink-0 lg:max-w-xs">
                      <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                        Patient Actual Use:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(med.id, 'STILL_TAKING')}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            med.patientReportedStatus === 'STILL_TAKING'
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Still Taking
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(med.id, 'STOPPED')}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            med.patientReportedStatus === 'STOPPED'
                              ? 'bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Stopped
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(med.id, 'TAKING_DIFFERENTLY')}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            med.patientReportedStatus === 'TAKING_DIFFERENTLY'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Different Dose
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(med.id, 'DISCUSS_WITH_DOCTOR')}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            med.patientReportedStatus === 'DISCUSS_WITH_DOCTOR'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Ask Doctor
                        </button>
                      </div>
                      {med.lastPatientReportedAt && (
                        <div className="text-[10px] text-slate-400 text-right">
                          Last confirmed: {new Date(med.lastPatientReportedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. DOCTOR DISCUSSION BRIEF MODAL */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Doctor Discussion Summary (SBAR Format)
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to show your physician at GMCH, Apollo, or any clinic.
                </p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="min-w-[44px] min-h-[44px] p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs bg-slate-50 text-slate-800 whitespace-pre-wrap leading-relaxed select-all border-b border-slate-200">
              {doctorDiscussionText}
            </div>

            <div className="p-4 bg-white flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Printed brief complies with ICMR / DPDP Act 2023.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="min-w-[44px] min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="min-w-[44px] min-h-[44px] px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Brief</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD MANUAL MEDICATION MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Add Active Medication
                </h3>
                <p className="text-xs text-slate-500">
                  Include OTC drugs or medicines from another clinic to check conflicts.
                </p>
              </div>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="min-w-[44px] min-h-[44px] p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Medicine / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="e.g. Dolo 650, Atorva 10, Combiflam"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dosage / Strength
                  </label>
                  <input
                    type="text"
                    value={newDose}
                    onChange={(e) => setNewDose(e.target.value)}
                    placeholder="e.g. 650 mg, 10 mg"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs"
                  >
                    <option value="Once daily (OD)">Once daily (OD)</option>
                    <option value="Twice daily (BD)">Twice daily (BD)</option>
                    <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prescribing Doctor (Optional)
                </label>
                <input
                  type="text"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  placeholder="e.g. Dr. K. Sharma (Neurology)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hospital / Clinic (Optional)
                </label>
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="e.g. City Care Hospital, Chennai"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="min-w-[44px] min-h-[44px] px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-w-[44px] min-h-[44px] px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  Add & Check Conflicts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
