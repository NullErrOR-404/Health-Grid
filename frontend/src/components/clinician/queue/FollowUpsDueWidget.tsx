import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface FollowUpsDueWidgetProps {
  onViewAll?: () => void;
  onSelectPatient?: (patientId: string) => void;
}

export const FollowUpsDueWidget: React.FC<FollowUpsDueWidgetProps> = ({
  onViewAll,
  onSelectPatient,
}) => {
  const followUps = clinicianStore.getState().followUps;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-700" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Follow-ups Due
            </h4>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewAll || (() => clinicianStore.setActiveTab('follow-ups'))}
          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="pt-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          This week ({followUps.length})
        </div>

        <div className="space-y-2">
          {followUps.map((fol) => {
            const isToday = fol.dueLabel.toLowerCase().includes('today');

            return (
              <div
                key={fol.id}
                onClick={() => onSelectPatient?.(fol.patientId)}
                className="p-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {fol.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {fol.patientName}
                    </div>
                    {fol.notes && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                        {fol.notes}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    isToday
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {fol.dueLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
