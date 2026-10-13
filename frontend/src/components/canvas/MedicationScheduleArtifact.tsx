import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  FileCheck,
  Calendar,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import { type MedicationPlanData, type MedicationScheduleItem } from '../../types/canvas';

interface MedicationScheduleArtifactProps {
  data: MedicationPlanData;
  onUpdate?: (updatedData: MedicationPlanData) => void;
  onSendToChat?: (text: string) => void;
}

export const MedicationScheduleArtifact: React.FC<MedicationScheduleArtifactProps> = ({
  data,
  onUpdate,
  onSendToChat,
}) => {
  const [items, setItems] = useState<MedicationScheduleItem[]>(data.items);
  const [activeDay, setActiveDay] = useState<number>(0); // 0 = Today, 1 = Day 2, etc.

  const daysOfWeek = ['Today (Mon)', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleCheck = (itemId: string, timeSlot: 'morning' | 'afternoon' | 'evening' | 'night') => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const key = `${activeDay}_${timeSlot}`;
        const prevStatus = item.adherenceStatus || {};
        return {
          ...item,
          adherenceStatus: {
            ...prevStatus,
            [key]: !prevStatus[key],
          },
        };
      }
      return item;
    });

    setItems(updated);

    // Calculate total checked vs total expected
    let checkedCount = 0;
    let totalSlots = 0;
    updated.forEach((item) => {
      ['morning', 'afternoon', 'evening', 'night'].forEach((slot) => {
        if ((item.timing as any)[slot]) {
          totalSlots++;
          if (item.adherenceStatus?.[`${activeDay}_${slot}`]) {
            checkedCount++;
          }
        }
      });
    });

    const newAdherence = totalSlots > 0 ? Math.round((checkedCount / totalSlots) * 100) : 100;
    if (onUpdate) {
      onUpdate({
        ...data,
        items: updated,
        adherencePercentage: newAdherence,
      });
    }
  };

  const calculateTotalSavings = () => {
    return items.reduce((acc, item) => {
      if (item.genericSubstitute) {
        return acc + (item.genericSubstitute.brandPrice - item.genericSubstitute.janAushadhiPrice);
      }
      return acc;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Adherence Score
          </div>
          <div className="text-2xl font-bold text-teal-900 flex items-baseline gap-1">
            {data.adherencePercentage}%
            <span className="text-xs font-normal text-teal-600">target &gt;85%</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <IndianRupee className="w-3.5 h-3.5" />
            Monthly Jan Aushadhi Savings
          </div>
          <div className="text-2xl font-bold text-emerald-900 flex items-baseline gap-1">
            ₹{calculateTotalSavings() * 3 || 680}
            <span className="text-xs font-normal text-emerald-600">PMBJP Kendras</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Active Schedule
          </div>
          <div className="text-2xl font-bold text-slate-800 flex items-baseline gap-1">
            {items.length}
            <span className="text-xs font-normal text-slate-500">prescribed medicines</span>
          </div>
        </div>
      </div>

      {/* 7-Day Day Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {daysOfWeek.map((dayLabel, idx) => (
          <button
            key={dayLabel}
            onClick={() => setActiveDay(idx)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeDay === idx
                ? 'bg-[#00A896] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {dayLabel}
          </button>
        ))}
      </div>

      {/* Time Slot Sections */}
      <div className="space-y-4">
        {[
          { key: 'morning', label: 'Morning (08:00 AM)', icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50/60', border: 'border-amber-200/60' },
          { key: 'afternoon', label: 'Afternoon (01:00 PM)', icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50/60', border: 'border-sky-200/60' },
          { key: 'evening', label: 'Evening (08:00 PM)', icon: Sunset, color: 'text-orange-600', bg: 'bg-orange-50/60', border: 'border-orange-200/60' },
          { key: 'night', label: 'Bedtime (10:00 PM)', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50/60', border: 'border-indigo-200/60' },
        ].map((slot) => {
          const slotItems = items.filter((item) => (item.timing as any)[slot.key]);
          if (slotItems.length === 0) return null;

          const SlotIcon = slot.icon;

          return (
            <div key={slot.key} className={`rounded-xl border ${slot.border} ${slot.bg} p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlotIcon className={`w-4 h-4 ${slot.color}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {slot.label}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {slotItems.length} dose{slotItems.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {slotItems.map((med) => {
                  const isChecked = !!med.adherenceStatus?.[`${activeDay}_${slot.key}`];
                  return (
                    <div
                      key={med.id}
                      className="bg-white/90 border border-slate-200/80 rounded-lg p-3 hover:border-teal-300 transition-all flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleCheck(med.id, slot.key as any)}
                          className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors"
                          title={isChecked ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-teal-600 fill-teal-50" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {med.name}
                            </h4>
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {med.genericName}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600">
                            <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              {med.foodRelation.replace('_', ' ')}
                            </span>
                            <span>Duration: {med.durationDays} days</span>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              “{med.instructions}”
                            </p>
                          )}
                        </div>
                      </div>

                      {med.genericSubstitute && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full inline-block">
                            Save {med.genericSubstitute.savingsPercent}% (PMBJP)
                          </span>
                          <div className="text-xs text-slate-400 line-through mt-0.5">
                            ₹{med.genericSubstitute.brandPrice}
                          </div>
                          <div className="text-xs font-bold text-emerald-600">
                            ₹{med.genericSubstitute.janAushadhiPrice}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Tap circle to log daily dosage compliance</span>
        </div>

        <button
          onClick={() => {
            const summary = `Medication compliance update: Current adherence is ${data.adherencePercentage}% across ${items.length} prescribed items. Please adjust my reminders if needed.`;
            onSendToChat?.(summary);
          }}
          className="px-3.5 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <FileCheck className="w-3.5 h-3.5" />
          Send Adherence Report to Chat
        </button>
      </div>
    </div>
  );
};
