import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface TodayScheduleWidgetProps {
  onViewCalendar?: () => void;
  onSelectPatient?: (patientId: string) => void;
}

interface ScheduleRow {
  time: string;
  patientId: string;
  patientName: string;
  avatarUrl: string;
  visitType: string;
  statusDot: 'green' | 'teal' | 'amber' | 'gray';
}

export const TodayScheduleWidget: React.FC<TodayScheduleWidgetProps> = ({
  onViewCalendar,
  onSelectPatient,
}) => {
  const queue = clinicianStore.getState().queue;
  const scheduleRows: ScheduleRow[] = queue.slice(0, 6).map((q) => {
    let statusDot: 'green' | 'teal' | 'amber' | 'gray' = 'gray';
    if (q.status === 'IN_CONSULTATION') statusDot = 'green';
    else if (q.status === 'WAITING') statusDot = 'teal';
    else if (q.status === 'SCHEDULED') statusDot = 'amber';

    const visitTypeLabel =
      q.visitType === 'NEW_PATIENT'
        ? 'New Patient'
        : q.visitType === 'FOLLOW_UP'
        ? 'Follow-up'
        : 'Review Results';

    return {
      time: q.time,
      patientId: q.patientId,
      patientName: q.patient.name,
      avatarUrl: q.patient.avatarUrl,
      visitType: visitTypeLabel,
      statusDot,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-700" />
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            Today&apos;s Schedule
          </h4>
        </div>
        <button
          type="button"
          onClick={onViewCalendar || (() => clinicianStore.setActiveTab('appointments'))}
          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
        >
          <span>View Calendar</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="divide-y divide-slate-100/70 mt-2 space-y-1">
        {scheduleRows.map((row, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPatient?.(row.patientId)}
            className="py-2 px-1 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  row.statusDot === 'green'
                    ? 'bg-emerald-500'
                    : row.statusDot === 'teal'
                    ? 'bg-teal-500 ring-2 ring-teal-200'
                    : row.statusDot === 'amber'
                    ? 'bg-amber-400'
                    : 'bg-slate-300'
                }`}
              />
              <span className="text-xs font-bold text-slate-700 w-11">{row.time}</span>
              <img
                src={row.avatarUrl}
                alt={row.patientName}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-bold text-slate-900 truncate max-w-32.5">
                {row.patientName}
              </span>
            </div>

            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
              {row.visitType}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
