import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Clock,
  AlertTriangle,
  Pill,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface PatientsDirectoryViewProps {
  onOpenPatientChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
}

type DirectoryFilterTab = 'ALL' | 'RECENT' | 'FOLLOW_UPS_DUE' | 'NEEDS_ATTENTION';

export const PatientsDirectoryView: React.FC<PatientsDirectoryViewProps> = ({
  onOpenPatientChart,
  onStartConsultation,
}) => {
  const storeState = clinicianStore.getState();
  const [activeTab, setActiveTab] = useState<DirectoryFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const patients = storeState.patients;

  const filteredPatients = patients
    .filter((pat) => {
      if (activeTab === 'RECENT') {
        return pat.pastVisits.length > 0;
      }
      if (activeTab === 'FOLLOW_UPS_DUE') {
        return storeState.followUps.some((f) => f.patientId === pat.id);
      }
      if (activeTab === 'NEEDS_ATTENTION') {
        const hasCriticalResult = storeState.results.some(
          (r) => r.patientId === pat.id && (r.isCritical || r.isAbnormal)
        );
        const hasCareGap = pat.careGaps.some((cg) => cg.status === 'OVERDUE');
        return hasCriticalResult || hasCareGap || pat.allergies.some((a) => a.severity === 'SEVERE');
      }
      return true;
    })
    .filter((pat) => {
      if (selectedCategory !== 'ALL') {
        if (!pat.primaryProblem.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        pat.name.toLowerCase().includes(q) ||
        pat.uhid.toLowerCase().includes(q) ||
        pat.phone.includes(q) ||
        pat.abhaId.toLowerCase().includes(q) ||
        pat.primaryProblem.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Patient Registry & Longitudinal Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Longitudinal patient panels, active chronic conditions, care gaps, and complete chart navigation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
            Total Panel: <span className="font-bold text-slate-900">{patients.length} active patients</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Segment Filter Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100/90 text-xs font-medium text-slate-600">
            {(
              [
                { id: 'ALL', label: 'All Patients', count: patients.length },
                {
                  id: 'RECENT',
                  label: 'Recently Seen',
                  count: patients.filter((p) => p.pastVisits.length > 0).length,
                },
                {
                  id: 'FOLLOW_UPS_DUE',
                  label: 'Follow-ups Due',
                  count: patients.filter((p) => storeState.followUps.some((f) => f.patientId === p.id)).length,
                },
                {
                  id: 'NEEDS_ATTENTION',
                  label: 'Needs Attention',
                  count: patients.filter(
                    (p) =>
                      storeState.results.some((r) => r.patientId === p.id && r.isCritical) ||
                      p.careGaps.some((cg) => cg.status === 'OVERDUE')
                  ).length,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === t.id
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === t.id ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Condition Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Condition:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Conditions</option>
              <option value="Diabetes">Diabetes Mellitus</option>
              <option value="Hypertension">Hypertension</option>
              <option value="Fever">Febrile / Infection</option>
              <option value="Potassium">Hyperkalemia / CKD</option>
              <option value="Osteoarthritis">Osteoarthritis</option>
            </select>
          </div>
        </div>

        {/* Global Multi-field Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search longitudinal panel by Name, UHID, Phone number, ABHA ID, or Primary Condition..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Patients Longitudinal Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient Identity</th>
                <th className="py-3 px-4">ABHA & Contact</th>
                <th className="py-3 px-4">Primary Problem & Condition</th>
                <th className="py-3 px-4">Active Meds & Safety</th>
                <th className="py-3 px-4">Last Encounter</th>
                <th className="py-3 px-4">Care Gaps / Next Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPatients.map((pat) => {
                const hasOverdueGap = pat.careGaps.some((cg) => cg.status === 'OVERDUE');
                const lastVisit = pat.pastVisits[0];
                const criticalResult = storeState.results.find(
                  (r) => r.patientId === pat.id && r.isCritical
                );

                return (
                  <tr
                    key={pat.id}
                    className="hover:bg-teal-50/20 transition-colors group"
                  >
                    {/* Patient Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={pat.avatarUrl}
                          alt={pat.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{pat.name}</span>
                            <span className="text-[11px] font-normal text-slate-400">
                              ({pat.age}y, {pat.gender})
                            </span>
                          </div>
                          <div className="text-[11px] text-teal-700 font-mono font-medium">
                            UHID: {pat.uhid}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ABHA & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-700">
                        {pat.abhaId}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {pat.phone}
                      </div>
                    </td>

                    {/* Primary Problem */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-xs">
                        {pat.primaryProblem}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {pat.problems.length} recorded problem{pat.problems.length > 1 ? 's' : ''}
                      </div>
                    </td>

                    {/* Medications & Safety */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        <span>{pat.medications.length} active meds</span>
                      </div>
                      {pat.allergies.length > 0 ? (
                        <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                          <ShieldAlert className="w-3 h-3 text-rose-500" />
                          <span>Allergic: {pat.allergies.map((a) => a.allergen).join(', ')}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                          No known drug allergies
                        </div>
                      )}
                    </td>

                    {/* Last Encounter */}
                    <td className="py-3.5 px-4 text-[11px]">
                      {lastVisit ? (
                        <>
                          <div className="font-medium text-slate-800">
                            {lastVisit.date}
                          </div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[130px]">
                            {lastVisit.reason}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No past encounters</span>
                      )}
                    </td>

                    {/* Care Gaps / Alerts */}
                    <td className="py-3.5 px-4">
                      {criticalResult ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Critical: {criticalResult.testName} ({criticalResult.value})
                        </span>
                      ) : hasOverdueGap ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Care Gap Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Up to date
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartConsultation(pat.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          Encounter
                        </button>
                        <button
                          onClick={() => onOpenPatientChart(pat.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition-all shadow-2xs"
                        >
                          <span>Open Chart</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
