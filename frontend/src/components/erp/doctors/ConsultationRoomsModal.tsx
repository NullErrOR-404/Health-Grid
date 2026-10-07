import React, { useState } from 'react';
import { X, Building2, User, Clock, Search, Filter } from 'lucide-react';
import { doctorOpdService, type ConsultationRoomInfo } from '../../../services/doctorOpdService';

interface ConsultationRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerToast?: (msg: string) => void;
}

export const ConsultationRoomsModal: React.FC<ConsultationRoomsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const rooms: ConsultationRoomInfo[] = doctorOpdService.getConsultationRooms();

  if (!isOpen) return null;

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.room.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      (r.doctorName && r.doctorName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hospital Consultation Rooms</h2>
              <p className="text-xs text-slate-500">Live room occupancy, doctor assignments, and active patient flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by room number, department, or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {['All', 'Occupied', 'Available', 'Maintenance'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Consultation Rooms */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filtered.map((room) => {
            const isOccupied = room.status === 'Occupied';
            const isAvailable = room.status === 'Available';

            return (
              <div
                key={room.room}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {room.room}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOccupied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isAvailable
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800">{room.department}</div>
                  {room.doctorName && (
                    <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      <span>{room.doctorName}</span>
                    </div>
                  )}

                  {room.timeSlot && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{room.timeSlot}</span>
                    </div>
                  )}
                </div>

                {room.currentPatient && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">In consult:</span>
                    <span className="font-bold text-slate-800">{room.currentPatient}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {rooms.length} active consultation suites
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
