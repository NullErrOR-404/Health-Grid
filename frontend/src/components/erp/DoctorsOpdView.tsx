import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  FileText,
  Plus,
  Calendar,
  Building2,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  ListOrdered,
  ExternalLink,
  Edit,
  UserCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  doctorOpdService,
  type DoctorRecord,
  type DoctorOpdMetrics,
} from '../../services/doctorOpdService';
import { appointmentService } from '../../services/appointmentService';
import { AddDoctorModal } from './doctors/AddDoctorModal';
import { EditDoctorModal } from './doctors/EditDoctorModal';
import { DoctorProfileDrawer } from './doctors/DoctorProfileDrawer';
import { WeeklyScheduleModal } from './doctors/WeeklyScheduleModal';
import { ConsultationRoomsModal } from './doctors/ConsultationRoomsModal';

interface DoctorsOpdViewProps {
  triggerToast: (msg: string) => void;
  onNavigateToOpdWithPatient?: (patientId: string) => void;
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

export const DoctorsOpdView: React.FC<DoctorsOpdViewProps> = ({
  triggerToast,
  onNavigateToOpdWithPatient,
}) => {
  const [doctors, setDoctors] = useState<DoctorRecord[]>(() => doctorOpdService.getDoctors());
  const [metrics, setMetrics] = useState<DoctorOpdMetrics>(() => doctorOpdService.getMetrics());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('DOC001');
  const [selectedTab, setSelectedTab] = useState<'All' | 'In OPD' | 'On Leave'>('All');
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [opdDaysFilter, setOpdDaysFilter] = useState('All OPD Days');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedDoctorCodes, setSelectedDoctorCodes] = useState<Set<string>>(new Set());

  // Right Panel Subtabs
  const [rightSubTab, setRightSubTab] = useState<'OPD Schedule' | "Today's Patients" | 'Consultation Rooms' | 'Leaves'>('OPD Schedule');
  const [previewDay, setPreviewDay] = useState('Mon');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isWeeklyScheduleOpen, setIsWeeklyScheduleOpen] = useState(false);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<DoctorRecord | null>(null);
  const [actionMenuDoctorId, setActionMenuDoctorId] = useState<string | null>(null);

  // Subscribe to real-time doctor updates
  useEffect(() => {
    const refreshData = () => {
      setDoctors(doctorOpdService.getDoctors());
      setMetrics(doctorOpdService.getMetrics());
    };
    const unsubscribeDoctors = doctorOpdService.subscribe(refreshData);
    const unsubscribeAppointments = appointmentService.subscribe(refreshData);

    // Initial fetch from Supabase
    doctorOpdService.fetchDoctors().then(refreshData);

    return () => {
      unsubscribeDoctors();
      unsubscribeAppointments();
    };
  }, []);

  // Currently selected doctor object
  const selectedDoctor = useMemo(() => {
    return (
      doctors.find((d) => d.doctor_code === selectedDoctorId || d.id === selectedDoctorId) ||
      doctors[0] ||
      null
    );
  }, [doctors, selectedDoctorId]);

  // Today's patients for the selected doctor
  const todayPatients = useMemo(() => {
    if (!selectedDoctor) return [];
    return doctorOpdService.getTodayPatientsForDoctor(selectedDoctor.id, selectedDoctor.name);
  }, [selectedDoctor, doctors]);

  // Unique lists for filter dropdowns
  const departments = useMemo(() => {
    const list = Array.from(new Set(doctors.map((d) => d.department))).filter(Boolean);
    return ['All Departments', ...list];
  }, [doctors]);

  const opdDaysList = useMemo(() => {
    const list = Array.from(new Set(doctors.map((d) => d.opd_days))).filter(Boolean);
    return ['All OPD Days', ...list];
  }, [doctors]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // Main Tab Filter
      if (selectedTab === 'In OPD' && doc.status !== 'In OPD') return false;
      if (selectedTab === 'On Leave' && doc.status !== 'On Leave') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchDept = doc.department.toLowerCase().includes(q);
        const matchSpec = (doc.specialization || '').toLowerCase().includes(q);
        const matchCode = doc.doctor_code.toLowerCase().includes(q);
        if (!matchName && !matchDept && !matchSpec && !matchCode) return false;
      }

      // Department Filter
      if (departmentFilter !== 'All Departments' && doc.department !== departmentFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'All Status' && doc.status !== statusFilter) {
        return false;
      }

      // OPD Days Filter
      if (opdDaysFilter !== 'All OPD Days' && doc.opd_days !== opdDaysFilter) {
        return false;
      }

      return true;
    });
  }, [doctors, selectedTab, searchQuery, departmentFilter, statusFilter, opdDaysFilter]);

  // Paginated Doctors
  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [filteredDoctors, currentPage, pageSize]);

  // Checkbox select all
  const handleToggleSelectAll = () => {
    if (selectedDoctorCodes.size === paginatedDoctors.length) {
      setSelectedDoctorCodes(new Set());
    } else {
      setSelectedDoctorCodes(new Set(paginatedDoctors.map((d) => d.doctor_code)));
    }
  };

  const handleToggleSelectDoctor = (code: string) => {
    const next = new Set(selectedDoctorCodes);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelectedDoctorCodes(next);
  };

  const handleStartNextConsultation = async () => {
    if (!todayPatients.length) {
      triggerToast('No patients currently queued for this doctor.');
      return;
    }
    const nextWaiting = todayPatients.find((p) => p.status === 'Waiting') || todayPatients[0];
    if (nextWaiting) {
      await doctorOpdService.startNextConsultation(nextWaiting.id);
      triggerToast(`Started consultation for ${nextWaiting.patient_name} (${nextWaiting.patient_health_id})`);
      if (onNavigateToOpdWithPatient) {
        onNavigateToOpdWithPatient(nextWaiting.patient_health_id);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      {/* 1. TOP HEADER & PRIMARY CTAs */}
      <div className="p-4 lg:p-6 pb-2 border-b border-slate-200/80 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctors &amp; OPD</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage doctor profiles, OPD schedules, consultation rooms and patient flow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddDoctorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>

          <button
            onClick={() => {
              if (selectedDoctor) {
                setDoctorToEdit(selectedDoctor);
                setIsWeeklyScheduleOpen(true);
              } else {
                triggerToast('Select a doctor first to manage schedule');
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>OPD Schedule</span>
          </button>

          <button
            onClick={() => setIsRoomsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Consultation Rooms</span>
          </button>
        </div>
      </div>

      {/* 2. 4 TOP KPI METRIC CARDS */}
      <div className="p-4 lg:p-6 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Doctors */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Total Doctors</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalDoctors}</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ 9% vs last month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Currently in OPD */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Currently in OPD</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics.currentlyInOpd}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">Active in consultation suites</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Total OPD Consultations */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Total OPD Consultations</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalOpdConsultations}</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ 14% today</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Avg. Consultation Time */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Avg. Consultation Time</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics.avgConsultationTime} mins</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>↓ 8% vs last month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: TABLE (LEFT) + SELECTED DOCTOR PANEL (RIGHT) */}
      <div className="p-4 lg:p-6 pt-0 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: TABS + FILTERS + DOCTORS TABLE (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'All', label: `All Doctors (${metrics.totalDoctors})` },
              { id: 'In OPD', label: `In OPD (${metrics.currentlyInOpd})` },
              { id: 'On Leave', label: `On Leave (${metrics.onLeave})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTab === tab.id
                    ? 'bg-teal-50 text-teal-700 shadow-2xs border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Dropdown Filters */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by doctor name, department, or specialization..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  showMoreFilters
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>More Filters</span>
              </button>
            </div>

            {/* Quick Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All Status">All Status</option>
                <option value="In OPD">In OPD</option>
                <option value="Available">Available</option>
                <option value="On Leave">On Leave</option>
              </select>

              <select
                value={opdDaysFilter}
                onChange={(e) => {
                  setOpdDaysFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {opdDaysList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DOCTORS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedDoctors.length > 0 &&
                          selectedDoctorCodes.size === paginatedDoctors.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Specialization</th>
                    <th className="py-3 px-3">OPD Days</th>
                    <th className="py-3 px-3">Today&apos;s Slots</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedDoctors.map((doc) => {
                    const isSelected =
                      selectedDoctor?.doctor_code === doc.doctor_code ||
                      selectedDoctor?.id === doc.id;
                    const isChecked = selectedDoctorCodes.has(doc.doctor_code);

                    return (
                      <tr
                        key={doc.id || doc.doctor_code}
                        onClick={() => setSelectedDoctorId(doc.doctor_code)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isSelected ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectDoctor(doc.doctor_code)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>

                        {/* Doctor Avatar + Name + Code */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                doc.avatar_url ||
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120'
                              }
                              alt={doc.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getFallbackAvatar(doc.name);
                              }}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 hover:text-teal-700 transition-colors">
                                {doc.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {doc.doctor_code}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {doc.department}
                        </td>

                        {/* Specialization */}
                        <td className="py-3 px-3 text-slate-500">
                          {doc.specialization}
                        </td>

                        {/* OPD Days */}
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {doc.opd_days}
                        </td>

                        {/* Today's Slots */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">
                            {doc.booked_slots} / {doc.total_slots}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.status === 'In OPD'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : doc.status === 'Available'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>

                        {/* Actions Menu */}
                        <td className="py-3 px-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              setActionMenuDoctorId(actionMenuDoctorId === doc.id ? null : doc.id)
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {actionMenuDoctorId === doc.id && (
                            <div className="absolute right-3 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-left animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => {
                                  setSelectedDoctorId(doc.doctor_code);
                                  setIsProfileDrawerOpen(true);
                                  setActionMenuDoctorId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Profile</span>
                              </button>
                              <button
                                onClick={() => {
                                  setDoctorToEdit(doc);
                                  setIsEditDoctorOpen(true);
                                  setActionMenuDoctorId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Details</span>
                              </button>
                              <button
                                onClick={() => {
                                  setDoctorToEdit(doc);
                                  setIsWeeklyScheduleOpen(true);
                                  setActionMenuDoctorId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Manage Schedule</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={async () => {
                                  const newStatus = doc.status === 'In OPD' ? 'Available' : 'In OPD';
                                  await doctorOpdService.updateDoctor(doc.id, { status: newStatus });
                                  triggerToast(`Status changed to ${newStatus}`);
                                  setActionMenuDoctorId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-teal-700 hover:bg-teal-50 flex items-center gap-2 font-semibold"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Toggle Status</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {Math.min(filteredDoctors.length, (currentPage - 1) * pageSize + 1)}-
                {Math.min(filteredDoctors.length, currentPage * pageSize)} of {filteredDoctors.length} doctors
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === idx + 1
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED DOCTOR DETAIL INSPECTOR (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          {selectedDoctor ? (
            <>
              {/* Doctor Header Card */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedDoctor.avatar_url ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={selectedDoctor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackAvatar(selectedDoctor.name);
                      }}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">{selectedDoctor.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedDoctor.status === 'In OPD'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : selectedDoctor.status === 'Available'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {selectedDoctor.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {selectedDoctor.designation}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{selectedDoctor.doctor_code}</span> | Reg. No.:{' '}
                        {selectedDoctor.reg_no}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {selectedDoctor.experience_years} years experience
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDoctorToEdit(selectedDoctor);
                      setIsEditDoctorOpen(true);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile & Edit Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setDoctorToEdit(selectedDoctor);
                      setIsEditDoctorOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-teal-500/40 text-xs font-semibold text-teal-700 hover:bg-teal-50/50 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-teal-600" />
                    <span>Edit Details</span>
                  </button>
                </div>

                {/* Sub-tabs: OPD Schedule | Today's Patients | Consultation Rooms | Leaves */}
                <div className="flex items-center border-b border-slate-200/80 gap-1 overflow-x-auto text-xs pb-1">
                  {[
                    { id: 'OPD Schedule', label: 'OPD Schedule' },
                    { id: "Today's Patients", label: "Today's Patients" },
                    { id: 'Consultation Rooms', label: 'Consultation Rooms' },
                    { id: 'Leaves', label: 'Leaves' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setRightSubTab(sub.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
                        rightSubTab === sub.id
                          ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* SUBTAB 1: OPD SCHEDULE (Matching UI reference) */}
                {rightSubTab === 'OPD Schedule' && (
                  <div className="space-y-4">
                    {/* Weekly Schedule Header & Edit link */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Weekly OPD Schedule</span>
                      <button
                        onClick={() => {
                          setDoctorToEdit(selectedDoctor);
                          setIsWeeklyScheduleOpen(true);
                        }}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Edit Schedule
                      </button>
                    </div>

                    {/* Day selector pills */}
                    <div className="flex items-center gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const isScheduled =
                          selectedDoctor.opd_days.includes(day) ||
                          selectedDoctor.opd_days.includes('Mon - Sat') ||
                          selectedDoctor.opd_days.includes('Mon - Sun');
                        const isSelectedDay = previewDay === day;

                        return (
                          <button
                            key={day}
                            onClick={() => setPreviewDay(day)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                              isSelectedDay
                                ? 'bg-teal-600 text-white shadow-2xs'
                                : isScheduled
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-slate-50 text-slate-300'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>09:00 AM – 01:00 PM</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                          {selectedDoctor.opd_room || 'Room 101'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>04:00 PM – 06:00 PM</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                          Room 102
                        </span>
                      </div>
                    </div>

                    {/* Today's Patients Queue Header */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          Today&apos;s Patients ({selectedDoctor.booked_slots} / {selectedDoctor.total_slots})
                        </span>
                      </div>
                      <button
                        onClick={() => setRightSubTab("Today's Patients")}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Patient Queue List (Numbered Badges 1-5) */}
                    <div className="space-y-2">
                      {todayPatients.slice(0, 5).map((pat, idx) => (
                        <div
                          key={pat.id || idx}
                          className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Numbered badge */}
                            <div className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </div>
                            <img
                              src={
                                pat.patient_avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                              }
                              alt={pat.patient_name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {pat.patient_name}
                              </div>
                              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                UHID: {pat.patient_health_id} | {pat.patient_age} {pat.patient_gender}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] font-mono text-slate-500 mb-0.5">
                              {pat.appointment_time}
                            </div>
                            <span
                              className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                pat.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : pat.status === 'In Consultation'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : pat.status === 'Waiting'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {pat.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: TODAY'S PATIENTS FULL LIST */}
                {rightSubTab === "Today's Patients" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-900">
                      All Appointments for {selectedDoctor.name} ({todayPatients.length})
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {todayPatients.map((pat, idx) => (
                        <div
                          key={pat.id || idx}
                          className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{pat.patient_name}</div>
                              <div className="text-[10px] text-slate-400">
                                {pat.patient_health_id} • {pat.appointment_time}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              pat.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pat.status === 'In Consultation'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pat.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: CONSULTATION ROOMS */}
                {rightSubTab === 'Consultation Rooms' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <div className="text-xs font-bold text-teal-900">Primary Consultation Suite</div>
                      <div className="text-base font-black text-teal-700 mt-1">{selectedDoctor.opd_room}</div>
                      <div className="text-[11px] text-teal-800 mt-1">
                        Equipped with examination bed, digital stethoscope, and telemedicine video terminal.
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRoomsModalOpen(true)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      View All Hospital Rooms
                    </button>
                  </div>
                )}

                {/* SUBTAB 4: LEAVES */}
                {rightSubTab === 'Leaves' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Casual Leave Remaining:</span>
                        <span className="font-bold text-slate-900">8 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Medical Leave:</span>
                        <span className="font-bold text-slate-900">12 days</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const next = selectedDoctor.status === 'On Leave' ? 'Available' : 'On Leave';
                        await doctorOpdService.updateDoctor(selectedDoctor.id, { status: next });
                        triggerToast(`Marked ${selectedDoctor.name} as ${next}`);
                      }}
                      className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      {selectedDoctor.status === 'On Leave' ? 'Mark Back on Duty' : 'Mark on Leave'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom CTAs: Start Next Consultation | View Full Queue */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleStartNextConsultation}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 transition-all cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Start Next Consultation</span>
                </button>

                <button
                  onClick={() => setRightSubTab("Today's Patients")}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ListOrdered className="w-4 h-4 text-slate-500" />
                  <span>View Full Queue</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs italic">
              Select a doctor from the roster to inspect OPD schedule and patient queue.
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AddDoctorModal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        onDoctorAdded={(newDoc) => {
          setSelectedDoctorId(newDoc.doctor_code);
          setDoctors(doctorOpdService.getDoctors());
        }}
        triggerToast={triggerToast}
      />

      <EditDoctorModal
        isOpen={isEditDoctorOpen}
        doctor={doctorToEdit}
        onClose={() => {
          setIsEditDoctorOpen(false);
          setDoctorToEdit(null);
        }}
        onDoctorUpdated={(_updated) => {
          setDoctors(doctorOpdService.getDoctors());
        }}
        onDoctorDeleted={() => {
          setDoctors(doctorOpdService.getDoctors());
        }}
        triggerToast={triggerToast}
      />

      <DoctorProfileDrawer
        isOpen={isProfileDrawerOpen}
        doctor={selectedDoctor}
        onClose={() => setIsProfileDrawerOpen(false)}
        onEdit={(doc) => {
          setDoctorToEdit(doc);
          setIsEditDoctorOpen(true);
        }}
      />

      <WeeklyScheduleModal
        isOpen={isWeeklyScheduleOpen}
        doctor={doctorToEdit || selectedDoctor}
        onClose={() => {
          setIsWeeklyScheduleOpen(false);
          setDoctorToEdit(null);
        }}
        onScheduleUpdated={() => {
          setDoctors(doctorOpdService.getDoctors());
        }}
        triggerToast={triggerToast}
      />

      <ConsultationRoomsModal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        triggerToast={triggerToast}
      />
    </div>
  );
};
