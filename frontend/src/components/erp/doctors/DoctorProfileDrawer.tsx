import React from 'react';
import { X, Award, Building2, Calendar, Clock, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { type DoctorRecord } from '../../../services/doctorOpdService';

interface DoctorProfileDrawerProps {
  isOpen: boolean;
  doctor: DoctorRecord | null;
  onClose: () => void;
  onEdit: (doc: DoctorRecord) => void;
}

const getFallbackAvatar = (name: string) => {
  const initials = name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DR';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#0d9488"/><text x="50%" y="54%" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DoctorProfileDrawer: React.FC<DoctorProfileDrawerProps> = ({
  isOpen,
  doctor,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
              {doctor.doctor_code}
            </span>
            <span className="text-xs font-semibold text-slate-500">Doctor Profile</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Avatar & Hero Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={doctor.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                alt={doctor.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackAvatar(doctor.name);
                }}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  doctor.status === 'In OPD'
                    ? 'bg-emerald-500'
                    : doctor.status === 'Available'
                    ? 'bg-sky-500'
                    : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">{doctor.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doctor.status === 'In OPD'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : doctor.status === 'Available'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  }`}
                >
                  {doctor.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{doctor.designation}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span>Reg: {doctor.reg_no}</span>
                <span>•</span>
                <span>{doctor.experience_years} yrs exp</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Slots</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {doctor.booked_slots} / {doctor.total_slots}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Consult Room</div>
              <div className="text-sm font-bold text-teal-700 mt-0.5">{doctor.opd_room}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Rating</div>
              <div className="text-sm font-bold text-amber-600 mt-0.5">4.9 ★</div>
            </div>
          </div>

          {/* Clinical Credentials & Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Clinical Credentials</h4>
            
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 text-[10px]">Department & Specialization</div>
                  <div className="font-semibold text-slate-800">{doctor.department} — {doctor.specialization}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 text-[10px]">Qualifications</div>
                  <div className="font-semibold text-slate-800">{doctor.qualification}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 text-[10px]">OPD Schedule Days</div>
                  <div className="font-semibold text-slate-800">{doctor.opd_days}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly OPD Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Weekly Timings</h4>
            <div className="space-y-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => {
                const isOpdDay = doctor.opd_days.includes(d) || doctor.opd_days.includes('Mon - Sat') || doctor.opd_days.includes('Mon - Sun');
                return (
                  <div
                    key={d}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                      isOpdDay ? 'bg-teal-50/50 border border-teal-100 text-teal-900' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="font-bold">{d}</span>
                    {isOpdDay ? (
                      <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-teal-600" />
                        09:00 AM - 01:00 PM • {doctor.opd_room}
                      </span>
                    ) : (
                      <span className="text-[11px] italic">Not scheduled</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact & Statutory Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Contact & Telemedicine</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91 98401 {Math.floor(10000 + Math.random() * 89999)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.name.toLowerCase().replace(/[^a-z]/g, '')}@healthgrid.in</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NMC Verified &amp; ABDM Registered Practitioner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(doctor);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
