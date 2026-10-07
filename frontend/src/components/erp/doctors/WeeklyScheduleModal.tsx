import React, { useState } from 'react';
import { X, Calendar, Clock, Check, Plus, Trash2 } from 'lucide-react';
import { type DoctorRecord, doctorOpdService } from '../../../services/doctorOpdService';

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  doctor: DoctorRecord | null;
  onClose: () => void;
  onScheduleUpdated: (doc: DoctorRecord) => void;
  triggerToast: (msg: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyScheduleModal: React.FC<WeeklyScheduleModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onScheduleUpdated,
  triggerToast,
}) => {
  if (!isOpen || !doctor) return null;

  const [activeDay, setActiveDay] = useState('Mon');
  const [schedule, setSchedule] = useState(() => {
    return doctor.schedule && doctor.schedule.length > 0
      ? doctor.schedule
      : DAYS.map((d) => ({
          day: d,
          active: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(d),
          slots: [
            { time: '09:00 AM - 01:00 PM', room: doctor.opd_room || 'Room 101' },
            { time: '04:00 PM - 06:00 PM', room: 'Room 102' },
          ],
        }));
  });

  const currentDayData = schedule.find((s) => s.day === activeDay) || {
    day: activeDay,
    active: true,
    slots: [{ time: '09:00 AM - 01:00 PM', room: doctor.opd_room || 'Room 101' }],
  };

  const handleToggleDay = (day: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day === day ? { ...s, active: !s.active } : s))
    );
  };

  const handleAddSlot = () => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.day === activeDay) {
          return {
            ...s,
            slots: [...s.slots, { time: '02:00 PM - 05:00 PM', room: doctor.opd_room || 'Room 101' }],
          };
        }
        return s;
      })
    );
  };

  const handleRemoveSlot = (idx: number) => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.day === activeDay) {
          return {
            ...s,
            slots: s.slots.filter((_, i) => i !== idx),
          };
        }
        return s;
      })
    );
  };

  const handleSave = async () => {
    try {
      const updated = await doctorOpdService.updateDoctor(doctor.id, {
        schedule,
      });
      if (updated) {
        triggerToast(`Updated OPD schedule for ${doctor.name}`);
        onScheduleUpdated(updated);
        onClose();
      }
    } catch (e) {
      triggerToast('Failed to save schedule');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly OPD Schedule</h2>
              <p className="text-xs text-slate-500">Configure time slots and rooms for {doctor.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Day Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Day of Week</label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {DAYS.map((d) => {
                const dayObj = schedule.find((s) => s.day === d);
                const isActive = activeDay === d;
                const isDayEnabled = dayObj?.active;

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setActiveDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : isDayEnabled
                        ? 'bg-teal-50 text-teal-800 hover:bg-teal-100/70 border border-teal-200/60'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200/70'
                    }`}
                  >
                    {d}
                    {isDayEnabled && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Day Card */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{activeDay} OPD Configuration</h4>
                <p className="text-[11px] text-slate-500">Enable day and manage consultation time blocks</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleDay(activeDay)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  currentDayData.active
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentDayData.active ? 'OPD Active' : 'Off Day'}
              </button>
            </div>

            {currentDayData.active ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Scheduled Time Slots</span>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {currentDayData.slots.map((slot, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-semibold text-slate-800">{slot.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {slot.room}
                      </span>
                      {currentDayData.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(sIdx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Doctor is not taking outpatient consultations on {activeDay}.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
