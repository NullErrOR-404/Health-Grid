import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Check,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import type { FollowUpItem } from '../../../types/clinician';

interface FollowUpsWorkspaceViewProps {
  onOpenPatientChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
}

type FollowUpFilter = 'ALL' | 'DUE_TODAY' | 'UPCOMING' | 'COMPLETED';

export const FollowUpsWorkspaceView: React.FC<FollowUpsWorkspaceViewProps> = ({
  onOpenPatientChart,
  onStartConsultation,
}) => {
  const storeState = clinicianStore.getState();
  const [activeFilter, setActiveFilter] = useState<FollowUpFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [followUpsList, setFollowUpsList] = useState<FollowUpItem[]>(storeState.followUps);

  const handleMarkComplete = (id: string) => {
    setFollowUpsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'COMPLETED' } : item))
    );
  };

  const filteredFollowUps = followUpsList
    .filter((f) => {
      if (activeFilter === 'DUE_TODAY') return f.dueLabel === 'Today' && f.status !== 'COMPLETED';
      if (activeFilter === 'UPCOMING') return f.dueLabel !== 'Today' && f.status !== 'COMPLETED';
      if (activeFilter === 'COMPLETED') return f.status === 'COMPLETED';
      return true;
    })
    .filter((f) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.patientName.toLowerCase().includes(q) ||
        f.reason.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Follow-Ups Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Future clinical actions linked to originating encounters, lab re-evaluations, and surveillance intervals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
            Pending Tasks:{' '}
            <span className="font-bold text-teal-700">
              {followUpsList.filter((f) => f.status !== 'COMPLETED').length} active
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100/90 text-xs font-medium text-slate-600">
            {(
              [
                { id: 'ALL', label: 'All Follow-ups', count: followUpsList.length },
                {
                  id: 'DUE_TODAY',
                  label: 'Due Today',
                  count: followUpsList.filter((f) => f.dueLabel === 'Today' && f.status !== 'COMPLETED').length,
                },
                {
                  id: 'UPCOMING',
                  label: 'Upcoming',
                  count: followUpsList.filter((f) => f.dueLabel !== 'Today' && f.status !== 'COMPLETED').length,
                },
                {
                  id: 'COMPLETED',
                  label: 'Completed',
                  count: followUpsList.filter((f) => f.status === 'COMPLETED').length,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === t.id
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === t.id ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search follow-ups by patient name, clinical reason, or instruction..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredFollowUps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No follow-ups in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All planned surveillance intervals and callback tasks are fully up to date.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFollowUps.map((item) => {
              const isDueToday = item.dueLabel === 'Today';
              const isDone = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isDone ? 'bg-slate-50/40 opacity-70' : 'hover:bg-teal-50/20'
                  }`}
                >
                  {/* Left: Patient Info & Follow-up Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-slate-100 text-slate-400'
                          : isDueToday
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-50 text-teal-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.patientName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDone
                              ? 'bg-slate-100 text-slate-500'
                              : isDueToday
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Due: {item.dueLabel}
                        </span>
                        {item.priority === 'HIGH' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            High Priority
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-800 mt-1">
                        {item.reason}
                      </div>

                      {item.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5 italic">
                          "{item.notes}"
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Due Date: {item.dueDate}</span>
                        <span>•</span>
                        <span>Assigned to: Dr. Mohamed</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    {!isDone ? (
                      <>
                        <button
                          onClick={() => handleMarkComplete(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                        <button
                          onClick={() => onOpenPatientChart(item.patientId)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                        >
                          Chart
                        </button>
                        <button
                          onClick={() => onStartConsultation(item.patientId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs"
                        >
                          <span>Encounter</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
