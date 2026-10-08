import React, { useState } from 'react';
import {
  ArrowLeft,
  Stethoscope,
  Activity,
  FileText,
  Pill,
  ShieldAlert,
  CheckCircle2,
  Plus,
  History,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface PatientChartWorkspaceProps {
  patientId: string;
  onBack: () => void;
  onStartConsultation: (patientId: string) => void;
}

type ChartTab =
  | 'overview'
  | 'timeline'
  | 'encounters'
  | 'problems'
  | 'medications'
  | 'allergies'
  | 'results'
  | 'orders'
  | 'referrals'
  | 'documents'
  | 'vitals'
  | 'histories'
  | 'care-team'
  | 'care-gaps';

export const PatientChartWorkspace: React.FC<PatientChartWorkspaceProps> = ({
  patientId,
  onBack,
  onStartConsultation,
}) => {
  const storeState = clinicianStore.getState();
  const patient = storeState.patients.find((p) => p.id === patientId) || storeState.patients[0];
  const [activeTab, setActiveTab] = useState<ChartTab>('overview');

  const encounters = storeState.encounters.filter((e) => e.patientId === patient.id);
  const results = storeState.results.filter((r) => r.patientId === patient.id);
  const referrals = storeState.referrals.filter((r) => r.patientId === patient.id);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Queue</span>
        </button>

        <button
          type="button"
          onClick={() => onStartConsultation(patient.id)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs shadow-teal-600/30"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Start Consultation for {patient.name.split(' ')[0]}</span>
        </button>
      </div>

      {/* Patient Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {patient.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">
                  {patient.age} yrs • {patient.gender} • {patient.bloodGroup}
                </span>
                {patient.allergies.length > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-rose-100 text-rose-800 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Allergies: {patient.allergies.map((a) => a.allergen).join(', ')}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span>UHID: <strong className="text-slate-700">{patient.uhid}</strong></span>
                <span>•</span>
                <span>ABHA ID: <strong className="text-slate-700">{patient.abhaId}</strong></span>
                <span>•</span>
                <span>Phone: <strong className="text-slate-700">{patient.phone}</strong></span>
                <span>•</span>
                <span>Address: <span className="text-slate-600">{patient.address}</span></span>
              </div>
            </div>
          </div>

          {/* Quick Vitals Summary Pill */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-3 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">BP</div>
              <div className="font-bold text-slate-900">{patient.vitals.bpSystolic || 120}/{patient.vitals.bpDiastolic || 80}</div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Pulse</div>
              <div className="font-bold text-slate-900">{patient.vitals.pulseBpm || 72} bpm</div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Temp</div>
              <div className="font-bold text-slate-900">{patient.vitals.tempF || 98.6}°F</div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">SpO2</div>
              <div className="font-bold text-slate-900">{patient.vitals.spo2Percent || 98}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'encounters', label: `Encounters (${encounters.length})` },
            { id: 'problems', label: `Problems (${patient.problems.length})` },
            { id: 'medications', label: `Medications (${patient.medications.length})` },
            { id: 'allergies', label: `Allergies (${patient.allergies.length})` },
            { id: 'results', label: `Results (${results.length})` },
            { id: 'orders', label: 'Orders' },
            { id: 'referrals', label: `Referrals (${referrals.length})` },
            { id: 'vitals', label: 'Vitals Trend' },
            { id: 'care-gaps', label: `Care Gaps (${patient.careGaps.length})` },
            { id: 'care-team', label: 'Care Team' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ChartTab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Safety & Red Flags */}
              <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Clinical Profile & Summary</span>
                  </div>
                  <p className="text-xs text-sky-900 leading-relaxed">
                    Patient currently presenting with: <strong>{patient.primaryProblem}</strong>.
                    {patient.problems.length > 0 && ` Active medical history includes: ${patient.problems.map((p) => p.name).join(', ')}.`}
                  </p>
                </div>
              </div>

              {/* 3-Column Split: Active Problems, Current Meds, Allergies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Active Problems */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                      <span>Active Problems</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {patient.problems.length}
                    </span>
                  </div>
                  {patient.problems.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No chronic problems documented.</div>
                  ) : (
                    <div className="space-y-2">
                      {patient.problems.map((prob) => (
                        <div key={prob.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                          <div className="font-bold text-slate-900">{prob.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">ICD-10: {prob.code} • Since {prob.onsetDate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Medications */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      <span>Current Medications</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {patient.medications.length}
                    </span>
                  </div>
                  {patient.medications.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No active regular medications.</div>
                  ) : (
                    <div className="space-y-2">
                      {patient.medications.map((med) => (
                        <div key={med.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span>{med.name}</span>
                            <span className="text-[10px] font-normal text-slate-500">{med.dosage}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{med.frequency} • {med.instructions}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Allergies & Safety */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Allergies</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {patient.allergies.length}
                    </span>
                  </div>
                  {patient.allergies.length === 0 ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>No known drug or environmental allergies (NKDA)</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {patient.allergies.map((alg) => (
                        <div key={alg.id} className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-200 text-xs text-rose-950 shadow-2xs">
                          <div className="font-bold">{alg.allergen} ({alg.severity})</div>
                          <div className="text-[10px] text-rose-700 mt-0.5">{alg.reaction}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Investigations & Past Encounters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Recent Diagnostic Investigations</span>
                  </div>
                  {patient.investigations.length === 0 ? (
                    <div className="text-xs text-slate-400">No lab reports found.</div>
                  ) : (
                    <div className="space-y-2">
                      {patient.investigations.map((inv) => (
                        <div key={inv.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{inv.testName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{inv.summary}</div>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white border border-slate-200 text-slate-700">
                            {inv.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <History className="w-3.5 h-3.5 text-teal-600" />
                    <span>Previous Clinical Encounters</span>
                  </div>
                  {patient.pastVisits.length === 0 ? (
                    <div className="text-xs text-slate-400">First documented visit today.</div>
                  ) : (
                    <div className="space-y-2">
                      {patient.pastVisits.map((vis) => (
                        <div key={vis.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{vis.reason}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{vis.date}</span>
                          </div>
                          <div className="text-[11px] text-slate-600">{vis.summary}</div>
                          <div className="text-[10px] text-teal-700 font-semibold">{vis.provider} • {vis.facility}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Longitudinal Patient Chronology
              </div>

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                {/* Event 1: Today */}
                <div className="relative pl-6">
                  <div className="w-3 h-3 rounded-full bg-teal-600 absolute -left-[7px] top-1 ring-4 ring-white" />
                  <div className="text-xs font-bold text-teal-800">Today • 09:18 AM</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Encounter Started — Nurse Vitals Triage</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Checked in for acute consultation. Vitals recorded: Temp 99.1°F, HR 98, BP 118/76 mmHg.
                  </div>
                </div>

                {/* Event 2: Lab */}
                {patient.investigations.map((inv, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="w-3 h-3 rounded-full bg-sky-500 absolute -left-[7px] top-1 ring-4 ring-white" />
                    <div className="text-xs font-semibold text-slate-400">{inv.date}</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{inv.testName}</div>
                    <div className="text-xs text-slate-600 mt-1">{inv.summary}</div>
                  </div>
                ))}

                {/* Event 3: Past Encounters */}
                {patient.pastVisits.map((vis, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="w-3 h-3 rounded-full bg-slate-400 absolute -left-[7px] top-1 ring-4 ring-white" />
                    <div className="text-xs font-semibold text-slate-400">{vis.date}</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">Consultation: {vis.reason}</div>
                    <div className="text-xs text-slate-600 mt-1">{vis.summary}</div>
                    <div className="text-[11px] text-teal-700 font-medium mt-1">{vis.provider}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Active & Resolved Problem List</span>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Problem</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
                {patient.problems.map((prob) => (
                  <div key={prob.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{prob.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Category: {prob.category} • Onset: {prob.onsetDate}
                      </div>
                      {prob.notes && <div className="text-xs text-slate-600 mt-1 italic">{prob.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-100 text-teal-800">
                        {prob.code}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700">
                        {prob.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDICATIONS */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Active Regimen & Medication Reconciliation</span>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              {patient.medications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No active prescription medications recorded.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
                  {patient.medications.map((med) => (
                    <div key={med.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{med.name} ({med.dosage})</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {med.frequency} • {med.route} • Started: {med.startDate}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">{med.instructions}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {med.isJanAushadhiAvailable && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                            PMBJP Generic (-{med.genericSavingsPercent}%)
                          </span>
                        )}
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800">
                          {med.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900">Diagnostic Results History</div>
              <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
                {results.map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{res.testName}</span>
                        {res.isCritical && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{res.interpretation}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{res.date} • Category: {res.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">{res.value} {res.unit}</div>
                      <div className="text-[10px] text-slate-400">Ref: {res.referenceRange || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs fallback */}
          {['encounters', 'allergies', 'orders', 'referrals', 'vitals', 'care-gaps', 'care-team'].includes(activeTab) && (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2">
              <div className="font-bold text-slate-800">Longitudinal Clinical Tab: {activeTab.toUpperCase()}</div>
              <div>Connected to live patient record for {patient.name} (UHID: {patient.uhid}).</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
