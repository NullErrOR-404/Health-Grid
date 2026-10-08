import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import type { VisitType } from '../../../types/clinician';

interface ClinicianAppointmentsViewProps {
  onOpenPatientChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
}

interface AppointmentSlot {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  uhid: string;
  ageGender: string;
  time: string;
  durationMinutes: number;
  visitType: VisitType;
  modality: 'IN_PERSON' | 'TELEHEALTH';
  reason: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  room?: string;
}

export const ClinicianAppointmentsView: React.FC<ClinicianAppointmentsViewProps> = ({
  onOpenPatientChart,
  onStartConsultation,
}) => {
  const storeState = clinicianStore.getState();
  const [filterModality, setFilterModality] = useState<'ALL' | 'IN_PERSON' | 'TELEHEALTH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // New appointment form state
  const [selectedPatientId, setSelectedPatientId] = useState(storeState.patients[0]?.id || '');
  const [newTime, setNewTime] = useState('11:30 AM');
  const [newVisitType, setNewVisitType] = useState<VisitType>('FOLLOW_UP');
  const [newModality, setNewModality] = useState<'IN_PERSON' | 'TELEHEALTH'>('IN_PERSON');
  const [newReason, setNewReason] = useState('Hypertension follow-up & BP check');

  // Initial appointments data
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([
    {
      id: 'apt_101',
      patientId: 'pat_priya_sharma',
      patientName: 'Priya Sharma',
      patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      uhid: 'AP001982',
      ageGender: '28y F',
      time: '09:00 AM',
      durationMinutes: 20,
      visitType: 'NEW_PATIENT',
      modality: 'IN_PERSON',
      reason: 'Acute fever with severe myalgia x 2 days',
      status: 'CHECKED_IN',
      room: 'Room 101',
    },
    {
      id: 'apt_102',
      patientId: 'pat_arun_prakash',
      patientName: 'Arun Prakash',
      patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      uhid: 'AP001429',
      ageGender: '45y M',
      time: '09:30 AM',
      durationMinutes: 20,
      visitType: 'FOLLOW_UP',
      modality: 'IN_PERSON',
      reason: 'Type 2 Diabetes mellitus routine review & HbA1c',
      status: 'CHECKED_IN',
      room: 'Room 102',
    },
    {
      id: 'apt_103',
      patientId: 'pat_meena_iyer',
      patientName: 'Meena Iyer',
      patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      uhid: 'AP002341',
      ageGender: '62y F',
      time: '10:00 AM',
      durationMinutes: 30,
      visitType: 'RESULT_REVIEW',
      modality: 'IN_PERSON',
      reason: 'Abnormal potassium (6.2) & Renal profile evaluation',
      status: 'CONFIRMED',
      room: 'Room 101',
    },
    {
      id: 'apt_104',
      patientId: 'pat_sathish_n',
      patientName: 'Sathish N',
      patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      uhid: 'AP001890',
      ageGender: '35y M',
      time: '10:30 AM',
      durationMinutes: 15,
      visitType: 'NEW_PATIENT',
      modality: 'TELEHEALTH',
      reason: 'Allergic rhinitis and seasonal sneezing',
      status: 'CONFIRMED',
    },
    {
      id: 'apt_105',
      patientId: 'pat_ramesh_kumar',
      patientName: 'Ramesh Kumar',
      patientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      uhid: 'AP003112',
      ageGender: '52y M',
      time: '11:00 AM',
      durationMinutes: 20,
      visitType: 'FOLLOW_UP',
      modality: 'IN_PERSON',
      reason: 'Suboptimal HbA1c (8.1%) pharmacotherapy adjustment',
      status: 'CONFIRMED',
      room: 'Room 103',
    },
    {
      id: 'apt_106',
      patientId: 'pat_lakshmi_devi',
      patientName: 'Lakshmi Devi',
      patientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      uhid: 'AP002877',
      ageGender: '58y F',
      time: '02:00 PM',
      durationMinutes: 20,
      visitType: 'FOLLOW_UP',
      modality: 'IN_PERSON',
      reason: 'Knee osteoarthritis rehabilitation and NSAID assessment',
      status: 'CONFIRMED',
      room: 'Room 101',
    },
  ]);

  const handleCheckIn = (aptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: 'CHECKED_IN' } : a))
    );
    const apt = appointments.find((a) => a.id === aptId);
    if (apt) {
      // Add or update to queue in store
      clinicianStore.selectQueuePatient(apt.patientId);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = storeState.patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    const newApt: AppointmentSlot = {
      id: `apt_${Date.now()}`,
      patientId: pat.id,
      patientName: pat.name,
      patientAvatar: pat.avatarUrl,
      uhid: pat.uhid,
      ageGender: `${pat.age}y ${pat.gender[0]}`,
      time: newTime,
      durationMinutes: 20,
      visitType: newVisitType,
      modality: newModality,
      reason: newReason,
      status: 'CONFIRMED',
      room: newModality === 'IN_PERSON' ? 'Room 101' : undefined,
    };

    setAppointments((prev) => [...prev, newApt]);
    setIsBookModalOpen(false);
  };

  const filteredAppointments = appointments
    .filter((a) => (filterModality === 'ALL' ? true : a.modality === filterModality))
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.uhid.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinician Appointments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Planned clinical schedule, consultation slots, patient check-in gate, and room allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Book Clinical Appointment
          </button>
        </div>
      </div>

      {/* Date Navigation & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Day Navigation */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 font-semibold text-xs text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Monday, 29 September 2025</span>
              <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                Today
              </span>
            </div>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Modality Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Modality:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
              <button
                onClick={() => setFilterModality('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filterModality === 'ALL' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setFilterModality('IN_PERSON')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filterModality === 'IN_PERSON' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                In-Person (5)
              </button>
              <button
                onClick={() => setFilterModality('TELEHEALTH')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filterModality === 'TELEHEALTH' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Telehealth (1)
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheduled patients by name, UHID, or visit reason..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Appointments Grid / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Type & Modality</th>
                <th className="py-3 px-4">Reason for Visit</th>
                <th className="py-3 px-4">Status & Room</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-teal-50/20 transition-colors group">
                  {/* Time */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {apt.time}
                    </div>
                    <div className="text-[10px] text-slate-400 ml-5">
                      {apt.durationMinutes} mins slot
                    </div>
                  </td>

                  {/* Patient */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={apt.patientAvatar}
                        alt={apt.patientName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{apt.patientName}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {apt.ageGender}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          UHID: {apt.uhid}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Visit Type & Modality */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700">
                        {apt.visitType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      {apt.modality === 'TELEHEALTH' ? (
                        <>
                          <Video className="w-3 h-3 text-indigo-500" />
                          <span className="text-indigo-700 font-medium">Telehealth</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>In-Person Clinic</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-xs font-medium text-slate-900 truncate">
                      {apt.reason}
                    </div>
                  </td>

                  {/* Status & Room */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      {apt.status === 'CHECKED_IN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          Confirmed
                        </span>
                      )}
                      {apt.room && (
                        <span className="text-[10px] font-medium text-slate-500">
                          {apt.room}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenPatientChart(apt.patientId)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                      >
                        Chart
                      </button>

                      {apt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          Check In
                        </button>
                      )}

                      <button
                        onClick={() => onStartConsultation(apt.patientId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition-all shadow-2xs"
                      >
                        <span>Start Visit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Book Clinical Appointment
                </h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="mt-4 space-y-4">
              {/* Patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {storeState.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (UHID: {p.uhid}) - {p.age}y {p.gender[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot & Modality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modality
                  </label>
                  <select
                    value={newModality}
                    onChange={(e) => setNewModality(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="IN_PERSON">In-Person Clinic</option>
                    <option value="TELEHEALTH">Telehealth Video</option>
                  </select>
                </div>
              </div>

              {/* Visit Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visit Type
                </label>
                <select
                  value={newVisitType}
                  onChange={(e) => setNewVisitType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="NEW_PATIENT">New Patient</option>
                  <option value="FOLLOW_UP">Follow-Up Visit</option>
                  <option value="RESULT_REVIEW">Lab / Diagnostic Review</option>
                  <option value="POST_PROCEDURE">Post-Procedure Review</option>
                </select>
              </div>

              {/* Chief Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chief Complaint / Reason
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
