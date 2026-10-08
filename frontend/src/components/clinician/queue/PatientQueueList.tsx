import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  ArrowRight,
  MoreVertical,
  CheckSquare,
  Square,
  AlertTriangle,
  Stethoscope,
  Clock,
  UserCheck,
} from 'lucide-react';
import type { PatientQueueItem } from '../../../types/clinician';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface PatientQueueListProps {
  queueItems: PatientQueueItem[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
  onOpenChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
}

type QueueTabFilter = 'WAITING' | 'IN_CONSULTATION' | 'SCHEDULED' | 'COMPLETED';

export const PatientQueueList: React.FC<PatientQueueListProps> = ({
  queueItems,
  selectedPatientId,
  onSelectPatient,
  onOpenChart,
  onStartConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<QueueTabFilter>('WAITING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const waitingCount = queueItems.filter((q) => q.status === 'WAITING').length;
  const inConsultCount = queueItems.filter((q) => q.status === 'IN_CONSULTATION').length;
  const scheduledCount = queueItems.filter((q) => q.status === 'SCHEDULED').length;
  const completedCount = queueItems.filter((q) => q.status === 'COMPLETED').length;

  const filteredItems = queueItems
    .filter((item) => {
      if (activeTab === 'WAITING') return item.status === 'WAITING';
      if (activeTab === 'IN_CONSULTATION') return item.status === 'IN_CONSULTATION';
      if (activeTab === 'SCHEDULED') return item.status === 'SCHEDULED';
      return item.status === 'COMPLETED';
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.patient.name.toLowerCase().includes(q) ||
        item.chiefComplaint.toLowerCase().includes(q) ||
        item.time.toLowerCase().includes(q)
      );
    });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedIds(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Patient Queue
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Today Date Navigator */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-1 py-0.5 text-xs font-semibold text-slate-700">
            <button
              type="button"
              className="p-1 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2">Today</span>
            <button
              type="button"
              className="p-1 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="w-8 h-8 rounded-xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            title="Filter Queue"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
        {/* Status Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('WAITING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'WAITING'
                ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Waiting ({waitingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IN_CONSULTATION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'IN_CONSULTATION'
                ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            In Consultation ({inConsultCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCHEDULED'
                ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search Queue */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in today's queue..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200/90 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Queue List Table */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No patients currently in this queue status.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedPatientId === item.patientId;
            const isChecked = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onSelectPatient(item.patientId)}
                className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/50 border-l-4 border-teal-600'
                    : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                }`}
              >
                {/* Left check & time */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => toggleSelect(item.id, e)}
                    className="text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {item.time}
                    </div>
                    {item.waitingMinutes > 0 && (
                      <div
                        className={`text-[10px] font-bold ${
                          item.waitingMinutes > 20
                            ? 'text-rose-600'
                            : item.waitingMinutes > 10
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        Waiting {item.waitingMinutes} min
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Profile & Complaint */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pl-2">
                  <img
                    src={item.patient.avatarUrl}
                    alt={item.patient.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {item.patient.name}
                      </span>
                      {item.visitType === 'NEW_PATIENT' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800 shrink-0">
                          New Patient
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 truncate mt-0.5">
                      <span>{item.patient.age} yrs • {item.patient.gender}</span>
                      <span>•</span>
                      <span className="truncate text-slate-600 font-medium">
                        {item.chiefComplaint}
                      </span>
                      {item.criticalAlert && (
                        <span className="text-rose-600 font-bold flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{item.criticalAlert}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChart(item.patientId);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>Open Chart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Three-dot context menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item.id ? null : item.id);
                      }}
                      className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                      title="More actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-9 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-30 animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartConsultation(item.patientId);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-lg flex items-center gap-2"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Start Consultation</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clinicianStore.updateQueueStatus(item.id, 'IN_CONSULTATION');
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mark Arrived / Roomed</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clinicianStore.updateQueueStatus(item.id, 'COMPLETED');
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mark Completed</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
