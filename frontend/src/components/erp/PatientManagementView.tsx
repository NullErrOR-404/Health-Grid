import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Stethoscope,
  CalendarDays,
  AlertTriangle,
  Droplets,
  Heart,
  Shield,
  Clock,
  ArrowRight,
  FileText,
  FileCheck,
  Pill,
} from 'lucide-react';
import {
  unifiedPatientStore,
  type UnifiedPatient,
} from '../../services/unifiedPatientStore';
import { AddPatientModal } from './modals/AddPatientModal';
import { EditClinicalInfoModal } from './modals/EditClinicalInfoModal';
import { StartConsultationModal } from './modals/StartConsultationModal';

interface PatientManagementViewProps {
  onNavigateToOpdWithPatient?: (patientId: string) => void;
  triggerToast: (msg: string) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({
  onNavigateToOpdWithPatient,
  triggerToast,
}) => {
  const [patients, setPatients] = useState<UnifiedPatient[]>(() =>
    unifiedPatientStore.getAllPatients()
  );
  const [stats, setStats] = useState(() => unifiedPatientStore.getStats());

  useEffect(() => {
    const unsub = unifiedPatientStore.subscribe(() => {
      setPatients(unifiedPatientStore.getAllPatients());
      setStats(unifiedPatientStore.getStats());
    });
    return unsub;
  }, []);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || 'pat-1245'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterPill, setActiveFilterPill] = useState<'all' | 'today' | 'new' | 'followups'>('all');
  const [selectedRightTab, setSelectedRightTab] = useState<'Overview' | 'Visits' | 'Prescriptions' | 'Reports' | 'Documents'>('Overview');

  // Modals
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [editField, setEditField] = useState<'allergies' | 'bloodGroup' | 'chronicConditions' | 'insurance' | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Filter patients based on search and active pill
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.healthId.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.lastVisit.department.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilterPill === 'today') {
      return p.lastVisit.date === '29 Sep 2025' || p.lastVisit.date === 'Today' || p.status === 'Checked In';
    }
    if (activeFilterPill === 'new') {
      return p.registeredDate === 'Today' || p.registeredDate === '15 Jan 2025';
    }
    if (activeFilterPill === 'followups') {
      return p.status === 'Follow-up' || p.nextVisit !== null;
    }
    return true;
  });

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Checked In') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Checked In
        </span>
      );
    }
    if (status === 'Follow-up') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
          Follow-up
        </span>
      );
    }
    if (status === 'In Consultation') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          In Consultation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
        Consultation
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] overflow-y-auto">
      {/* Top Main Section Header */}
      <div className="p-4 lg:px-7 lg:pt-6 lg:pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Patient Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register, manage and view patient records, visits, and history.
          </p>
        </div>

        <button
          onClick={() => setIsAddPatientOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* 4 STAT CARDS ROW */}
      <div className="px-4 lg:px-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Patients</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalPatients.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span>↑ 12%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today's Visits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Today&apos;s Visits</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.todayVisits}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span>↑ 8%</span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: New Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">New Patients</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.newPatientsToday}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span>↑ 27%</span>
              <span className="text-slate-400 font-normal">today</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Follow-ups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Active Follow-ups</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.activeFollowUps}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span>↑ 5%</span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: TABLE (LEFT) + RIGHT DETAIL PANEL (RIGHT) */}
      <div className="px-4 lg:px-7 pb-6 grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* LEFT COLUMN: PATIENT LIST TABLE */}
        <div className="xl:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* SEARCH & FILTERS HEADER */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, Patient ID, phone number or visit reason..."
                className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
              <button className="absolute right-3 text-slate-400 hover:text-slate-600 p-1">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveFilterPill('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeFilterPill === 'all'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All Patients ({stats.totalPatients})</span>
                </button>

                <button
                  onClick={() => setActiveFilterPill('today')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilterPill === 'today'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Today ({stats.todayVisits})
                </button>

                <button
                  onClick={() => setActiveFilterPill('new')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilterPill === 'new'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  New ({stats.newPatientsToday})
                </button>

                <button
                  onClick={() => setActiveFilterPill('followups')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilterPill === 'followups'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Follow-ups ({stats.activeFollowUps})
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100">
                <span>More Filters</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-3.5 w-10">
                    <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                  </th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Patient ID</th>
                  <th className="py-3 px-3">Age / Gender</th>
                  <th className="py-3 px-3">Last Visit</th>
                  <th className="py-3 px-3">Next Visit</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => {
                  const isSelected = patient.id === selectedPatientId;
                  const initials = getInitials(patient.name);

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-50/50 hover:bg-teal-50/80 font-medium'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-3.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedPatientId(patient.id)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{patient.name}</div>
                            <div className="text-[11px] text-slate-500">{patient.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {patient.healthId}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {patient.age} / {patient.gender[0]}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{patient.lastVisit.date}</div>
                        <div className="text-[10px] text-slate-500">{patient.lastVisit.department}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {patient.nextVisit || '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        {getStatusBadge(patient.status)}
                      </td>
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TABLE PAGINATION FOOTER */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
            <span>
              Showing 1-{Math.min(filteredPatients.length, 8)} of {stats.totalPatients} patients
            </span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </button>
              <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center">
                3
              </button>
              <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center">
                4
              </button>
              <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center">
                5
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center">
                156
              </button>
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PATIENT DETAIL INSPECTOR PANEL */}
        {selectedPatient && (
          <div className="xl:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* INSPECTOR HEADER */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm">
                    {getInitials(selectedPatient.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        {selectedPatient.name}
                      </h3>
                      {getStatusBadge(selectedPatient.status)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Patient ID: <span className="font-semibold text-slate-700">{selectedPatient.healthId}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Phone: <span className="font-semibold text-slate-700">{selectedPatient.phone}</span> • Age: {selectedPatient.age} • {selectedPatient.gender}
                    </div>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* TABS HEADER */}
              <div className="flex items-center gap-4 mt-4 border-b border-slate-100 text-xs font-bold text-slate-500">
                {(['Overview', 'Visits', 'Prescriptions', 'Reports', 'Documents'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedRightTab(tab)}
                    className={`pb-2.5 transition-colors relative ${
                      selectedRightTab === tab
                        ? 'text-teal-700 font-extrabold'
                        : 'hover:text-slate-800'
                    }`}
                  >
                    {tab}
                    {selectedRightTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* INSPECTOR BODY */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* TAB 1: OVERVIEW */}
              {selectedRightTab === 'Overview' && (
                <>
                  {/* Today's Visit Card */}
                  {selectedPatient.todayVisit ? (
                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                          <CalendarDays className="w-4 h-4 text-emerald-600" />
                          <span>Today&apos;s Visit</span>
                        </div>
                        {onNavigateToOpdWithPatient && (
                          <button
                            onClick={() => onNavigateToOpdWithPatient(selectedPatient.id)}
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                          >
                            <span>View Visit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500">Date & Time</span>
                          <div className="font-bold text-slate-800">
                            {selectedPatient.todayVisit.date}, {selectedPatient.todayVisit.time}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">Department</span>
                          <div className="font-bold text-slate-800">
                            {selectedPatient.todayVisit.department}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">Doctor</span>
                          <div className="font-bold text-slate-800">
                            {selectedPatient.todayVisit.doctor}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">Status</span>
                          <div>{getStatusBadge(selectedPatient.todayVisit.status)}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-500">
                      No visit scheduled for today.
                    </div>
                  )}

                  {/* 2x2 INFO GRID: Allergies, Blood Group, Chronic Conditions, Insurance */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Allergies Badge */}
                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Allergies</span>
                        </div>
                        <button
                          onClick={() => setEditField('allergies')}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">
                        {selectedPatient.allergies.join(', ')}
                      </div>
                    </div>

                    {/* Blood Group Badge */}
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                          <Droplets className="w-3.5 h-3.5 text-blue-600" />
                          <span>Blood Group</span>
                        </div>
                        <button
                          onClick={() => setEditField('bloodGroup')}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs font-black text-slate-900 mt-1">
                        {selectedPatient.bloodGroup}
                      </div>
                    </div>

                    {/* Chronic Conditions Badge */}
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <Heart className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Chronic Conditions</span>
                        </div>
                        <button
                          onClick={() => setEditField('chronicConditions')}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">
                        {selectedPatient.chronicConditions.join(', ')}
                      </div>
                    </div>

                    {/* Insurance Badge */}
                    <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                          <Shield className="w-3.5 h-3.5 text-sky-600" />
                          <span>Insurance</span>
                        </div>
                        <button
                          onClick={() => setEditField('insurance')}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                        >
                          {selectedPatient.insurance.status === 'Active' ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {selectedPatient.insurance.provider}
                      </div>
                    </div>
                  </div>

                  {/* RECENT VISITS CHRONOLOGICAL LIST */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Recent Visits</span>
                      </div>
                      <button
                        onClick={() => setSelectedRightTab('Visits')}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {selectedPatient.visitsHistory.slice(0, 3).map((v) => (
                        <div
                          key={v.id}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{v.date}</div>
                            <div className="text-[11px] text-slate-500">{v.department}</div>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 text-right">
                            {v.doctor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: VISITS */}
              {selectedRightTab === 'Visits' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Complete Visit History
                  </h4>
                  {selectedPatient.visitsHistory.map((v) => (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{v.visitId} • {v.date}</span>
                        {getStatusBadge(v.status)}
                      </div>
                      <div className="text-slate-600">
                        Dept: <span className="font-semibold text-slate-800">{v.department}</span> • Doctor: <span className="font-semibold text-slate-800">{v.doctor}</span>
                      </div>
                      {v.diagnosis && (
                        <div className="text-teal-800 bg-teal-50 p-1.5 rounded-lg text-[11px] font-semibold">
                          Diagnosis: {v.diagnosis}
                        </div>
                      )}
                      {v.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-1">{v.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: PRESCRIPTIONS */}
              {selectedRightTab === 'Prescriptions' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Prescribed Formulations
                  </h4>
                  {selectedPatient.todayVisit?.prescriptions && selectedPatient.todayVisit.prescriptions.length > 0 ? (
                    selectedPatient.todayVisit.prescriptions.map((rx, idx) => (
                      <div key={idx} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs space-y-1">
                        <div className="font-bold text-teal-900 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-600" />
                          <span>{rx.drug}</span>
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          Dosage: {rx.dosage} • Freq: {rx.freq} • Duration: {rx.duration}
                        </div>
                        <div className="text-slate-500 text-[11px] italic">
                          {rx.instructions}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                      No active prescriptions logged for today&apos;s visit.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: REPORTS */}
              {selectedRightTab === 'Reports' && (
                <div className="space-y-2.5 text-xs">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Laboratory & Diagnostic Reports ({selectedPatient.reportsCount})
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-bold text-slate-800">Complete Blood Count (CBC)</div>
                        <div className="text-[10px] text-slate-500">29 Sep 2025 • Verified by Pathologist</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Normal
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-bold text-slate-800">Fasting Blood Sugar (FBS)</div>
                        <div className="text-[10px] text-slate-500">29 Sep 2025 • Lab Token #42</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      94 mg/dL
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENTS */}
              {selectedRightTab === 'Documents' && (
                <div className="space-y-2.5 text-xs">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Sovereign ABDM Health Vault ({selectedPatient.documentsCount})
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-bold text-slate-800">ABDM Health Card.pdf</div>
                        <div className="text-[10px] text-slate-500">Linked UHID: {selectedPatient.healthId}</div>
                      </div>
                    </div>
                    <button className="text-teal-700 font-bold hover:underline">Download</button>
                  </div>
                </div>
              )}
            </div>

            {/* INSPECTOR BOTTOM ACTION BUTTONS */}
            <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2.5 bg-slate-50/50">
              <button
                onClick={() => setIsConsultationModalOpen(true)}
                className="py-2.5 px-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Start Consultation</span>
              </button>

              <button
                onClick={() => {
                  triggerToast(`Appointment creation scheduled for ${selectedPatient.name}`);
                }}
                className="py-2.5 px-3 bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <CalendarDays className="w-4 h-4 text-teal-600" />
                <span>Create Appointment</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={(newPatient) => {
          setSelectedPatientId(newPatient.id);
          triggerToast(`New patient registered successfully with HealthID: ${newPatient.healthId}`);
        }}
      />

      {editField && selectedPatient && (
        <EditClinicalInfoModal
          isOpen={true}
          patient={selectedPatient}
          field={editField}
          onClose={() => setEditField(null)}
          onSaved={() => triggerToast('Clinical records updated successfully')}
        />
      )}

      {isConsultationModalOpen && selectedPatient && (
        <StartConsultationModal
          isOpen={true}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          department={selectedPatient.lastVisit.department}
          onClose={() => setIsConsultationModalOpen(false)}
          onCompleted={() => triggerToast(`Consultation completed for ${selectedPatient.name}`)}
        />
      )}
    </div>
  );
};
