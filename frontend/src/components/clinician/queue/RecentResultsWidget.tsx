import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface RecentResultsWidgetProps {
  onViewAll?: () => void;
  onSelectResult?: (resultId: string) => void;
}

export const RecentResultsWidget: React.FC<RecentResultsWidgetProps> = ({
  onViewAll,
  onSelectResult,
}) => {
  const results = clinicianStore.getState().results;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-700" />
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            Recent Results to Review
          </h4>
        </div>
        <button
          type="button"
          onClick={onViewAll || (() => clinicianStore.setActiveTab('inbox'))}
          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="divide-y divide-slate-100/70 mt-2 space-y-1">
        {results.slice(0, 4).map((res) => (
          <div
            key={res.id}
            onClick={() => onSelectResult?.(res.id)}
            className="py-2 px-1 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  res.isCritical
                    ? 'bg-rose-500 ring-2 ring-rose-200'
                    : res.isAbnormal
                    ? 'bg-amber-400'
                    : 'bg-sky-400'
                }`}
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {res.patientName}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <span>{res.testName}</span>
                  {res.isCritical && (
                    <span className="font-bold text-rose-600">
                      {res.value} {res.unit}
                    </span>
                  )}
                  {!res.isCritical && res.isAbnormal && (
                    <span className="font-bold text-amber-600">
                      {res.value} {res.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {res.isCritical ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700">
                  Critical
                </span>
              ) : res.isAbnormal ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                  Abnormal
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800">
                  New
                </span>
              )}

              <span className="text-[10px] font-semibold text-slate-400">
                {res.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
