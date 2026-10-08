import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  MapPin,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import type { EncounterStatus } from '../../../types/clinician';

interface ConsultationsLandingViewProps {
  onOpenEncounter: (encounterId: string) => void;
  onOpenPatientChart: (patientId: string) => void;
}

type ConsultationTab = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_SIGN_OFF';

export const ConsultationsLandingView: React.FC<ConsultationsLandingViewProps> = ({
  onOpenEncounter,
  onOpenPatientChart,
}) => {
  const storeState = clinicianStore.getState();
  const [activeTab, setActiveTab] = useState<ConsultationTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisitType, setFilterVisitType] = useState<string>('ALL');

  const encounters = storeState.encounters;

  const filteredEncounters = encounters
    .filter((enc) => {
      if (activeTab === 'IN_PROGRESS') return enc.status === 'IN_PROGRESS';
      if (activeTab === 'COMPLETED') return enc.status === 'CLOSED' || enc.status === 'SIGNED';
      if (activeTab === 'NEEDS_SIGN_OFF') return enc.status === 'READY_FOR_SIGN';
      return true;
    })
    .filter((enc) => {
      if (filterVisitType !== 'ALL') {
        if (enc.visitType !== filterVisitType) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        enc.patient.name.toLowerCase().includes(q) ||
        enc.patient.uhid.toLowerCase().includes(q) ||
        enc.chiefComplaint.toLowerCase().includes(q) ||
        enc.id.toLowerCase().includes(q)
      );
    });

  const getStatusBadge = (status: EncounterStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'READY_FOR_SIGN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Needs Sign-off
          </span>
        );
      case 'SIGNED':
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Signed & Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Consultations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Actual clinical encounters, in-session patient evaluations, and signed SOAP documentations
          </p>
        </div>

        {/* Quick Launch From Queue */}
        <div className="flex items-center gap-2">
          {storeState.activeQueuePatientId && (
            <button
              onClick={() => clinicianStore.startConsultation(storeState.activeQueuePatientId!)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Start Current Patient Encounter
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100/90 text-xs font-medium text-slate-600">
            {(
              [
                { id: 'ALL', label: 'All Consultations', count: encounters.length },
                {
                  id: 'IN_PROGRESS',
                  label: 'In Progress',
                  count: encounters.filter((e) => e.status === 'IN_PROGRESS').length,
                },
                {
                  id: 'NEEDS_SIGN_OFF',
                  label: 'Needs Sign-off',
                  count: encounters.filter((e) => e.status === 'READY_FOR_SIGN').length,
                },
                {
                  id: 'COMPLETED',
                  label: 'Completed / Signed',
                  count: encounters.filter((e) => e.status === 'CLOSED' || e.status === 'SIGNED').length,
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

          {/* Visit Type Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Visit Type:
            </span>
            <select
              value={filterVisitType}
              onChange={(e) => setFilterVisitType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Types</option>
              <option value="NEW_PATIENT">New Patient</option>
              <option value="FOLLOW_UP">Follow-Up</option>
              <option value="RESULT_REVIEW">Result Review</option>
              <option value="POST_PROCEDURE">Post Procedure</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, UHID, chief complaint, or encounter ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Consultations List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredEncounters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No consultations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No active or historical clinical encounters match the specified filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Encounter ID & Time</th>
                  <th className="py-3 px-4">Visit Type & Complaint</th>
                  <th className="py-3 px-4">Facility / Room</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEncounters.map((enc) => (
                  <tr
                    key={enc.id}
                    className="hover:bg-teal-50/30 transition-colors group"
                  >
                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={enc.patient.avatarUrl}
                          alt={enc.patient.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{enc.patient.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              {enc.patient.age}y {enc.patient.gender[0]}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            UHID: {enc.patient.uhid}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {enc.date}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {enc.startTime} {enc.endTime ? `– ${enc.endTime}` : '(Ongoing)'}
                      </div>
                    </td>

                    {/* Visit Type & Complaint */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 mb-1">
                        {enc.visitType.replace('_', ' ')}
                      </span>
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {enc.chiefComplaint}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {enc.assessment || 'Assessment in progress'}
                      </div>
                    </td>

                    {/* Facility */}
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Apollo Clinic, Room 101
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Dr. Mohamed
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(enc.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenPatientChart(enc.patient.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                        >
                          Chart
                        </button>
                        <button
                          onClick={() => onOpenEncounter(enc.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition-all shadow-2xs"
                        >
                          {enc.status === 'IN_PROGRESS' ? 'Resume' : 'Open Workspace'}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
