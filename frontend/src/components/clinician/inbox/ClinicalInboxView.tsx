import React, { useState } from 'react';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import type { ClinicalInboxItem } from '../../../types/clinician';

interface ClinicalInboxViewProps {
  onOpenPatientChart: (patientId: string) => void;
}

type InboxCategory = 'ALL' | 'RESULTS' | 'NOTES' | 'REFERRALS' | 'FOLLOW_UPS' | 'PRESCRIPTIONS' | 'MESSAGES';

export const ClinicalInboxView: React.FC<ClinicalInboxViewProps> = ({ onOpenPatientChart }) => {
  const storeState = clinicianStore.getState();
  const [selectedCategory, setSelectedCategory] = useState<InboxCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = storeState.inbox
    .filter((item) => (selectedCategory === 'ALL' ? true : item.type === selectedCategory))
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    });

  const handleActionItem = (item: ClinicalInboxItem) => {
    if (item.type === 'RESULTS' && item.relatedId) {
      clinicianStore.acknowledgeResult(item.relatedId, 'Acknowledged and signed via Clinical Inbox.');
    } else {
      clinicianStore.markInboxItemRead(item.id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Inbox
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Actionable clinical work queue: lab results, unsigned charts, specialist reports, and pharmacy requests.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clinical tasks..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200/90 rounded-xl focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Tasks (${storeState.inbox.length})` },
          { id: 'RESULTS', label: 'Lab Results' },
          { id: 'NOTES', label: 'Unsigned Notes' },
          { id: 'REFERRALS', label: 'Referrals' },
          { id: 'FOLLOW_UPS', label: 'Follow-ups' },
          { id: 'PRESCRIPTIONS', label: 'Rx Refills' },
          { id: 'MESSAGES', label: 'Messages' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id as InboxCategory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === tab.id
                ? 'bg-teal-600 text-white shadow-2xs shadow-teal-600/30'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inbox Items List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            All clinical tasks in this category have been acknowledged and resolved.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                !item.isRead ? 'bg-sky-50/30' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.patientAvatar}
                  alt={item.patientName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                />

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{item.patientName}</span>
                    {item.priority === 'CRITICAL' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>CRITICAL</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 mt-1">{item.title}</div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.summary}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenPatientChart(item.patientId)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Open Chart
                </button>

                <button
                  type="button"
                  onClick={() => handleActionItem(item)}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge & Sign</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
