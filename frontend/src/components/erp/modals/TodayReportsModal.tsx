import React from 'react';
import { X, FileText } from 'lucide-react';
import { unifiedPatientStore, type OpdQueueItem } from '../../../services/unifiedPatientStore';

interface TodayReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TodayReportsModal: React.FC<TodayReportsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const stats = unifiedPatientStore.getStats();
  const queue = unifiedPatientStore.getOpdQueue();

  // Compute departmental distribution
  const deptCounts: Record<string, number> = {};
  const doctorCounts: Record<string, number> = {};

  queue.forEach((item: OpdQueueItem) => {
    deptCounts[item.department] = (deptCounts[item.department] || 0) + 1;
    doctorCounts[item.doctor] = (doctorCounts[item.doctor] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Today&apos;s OPD Clinical Report</h3>
              <p className="text-xs text-slate-500">Live operational audit & departmental census</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* 4 Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <div className="text-lg font-black text-blue-900">{stats.totalOpdToday}</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">Total OPD</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <div className="text-lg font-black text-amber-900">{stats.currentlyWaiting}</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">Waiting</div>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-center">
              <div className="text-lg font-black text-teal-900">{stats.inConsultation}</div>
              <div className="text-[10px] font-bold text-teal-600 uppercase mt-0.5">In Consult</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <div className="text-lg font-black text-emerald-900">{stats.completedToday}</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">Completed</div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Departmental Patient Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{dept}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (count / queue.length) * 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Load */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Doctor Consultation Workload
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(doctorCounts).map(([doc, count]) => (
                <div key={doc} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{doc}</span>
                  <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                    {count} tokens
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
