import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  XCircle,
  Plus,
  UserCheck,
  Settings,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Stethoscope,
  X,
  Calendar,
  FileText,
  Printer,
  Edit2,
  CheckCircle2,
  Building,
} from 'lucide-react';
import {
  appointmentService,
  type Appointment,
  type AppointmentStatus,
  type AppointmentMetrics
} from '../../services/appointmentService';
import { NewAppointmentModal } from './appointments/NewAppointmentModal';
import { WalkInRegistrationModal } from './appointments/WalkInRegistrationModal';
import { AppointmentSettingsModal } from './appointments/AppointmentSettingsModal';
import { StartConsultationModal } from './appointments/StartConsultationModal';
import { RescheduleModal } from './appointments/RescheduleModal';
import { CancelAppointmentModal } from './appointments/CancelAppointmentModal';
import { AppointmentNotesModal } from './appointments/AppointmentNotesModal';
import { PrintAppointmentSlipModal } from './appointments/PrintAppointmentSlipModal';

interface AppointmentsViewProps {
  triggerToast: (msg: string) => void;
  onNavigateToOpdWithPatient?: (patientId: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  triggerToast,
  onNavigateToOpdWithPatient,
}) => {
  // Master list of appointments from service
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    appointmentService.getAppointments()
  );

  // Selected appointment for right inspector panel
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(() => {
    const list = appointmentService.getAppointments();
    return list[0]?.id || 'apt-001';
  });

  // Active view tab: 'Today' | 'Upcoming' | 'Past Appointments'
  const [activeTab, setActiveTab] = useState<'Today' | 'Upcoming' | 'Past Appointments'>('Today');

  // Selected date for filter
  const [currentDateStr] = useState('2025-09-29');

  // Filter Bar state
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [filterDoctor, setFilterDoctor] = useState('All Doctors');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterType, setFilterType] = useState('All Appointment Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersBar, setShowFiltersBar] = useState(true);

  // Checkbox selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Right Inspector sub-tab: 'Overview' | 'Notes' | 'History' | 'Documents'
  const [inspectorTab, setInspectorTab] = useState<'Overview' | 'Notes' | 'History' | 'Documents'>('Overview');

  // Active Row 3-dot dropdown menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStartConsultOpen, setIsStartConsultOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelMode, setCancelMode] = useState<'cancel' | 'no-show'>('cancel');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);

  // Targeted appointment for modals
  const [modalTargetAppointment, setModalTargetAppointment] = useState<Appointment | null>(null);

  // Subscribe to real-time service updates
  useEffect(() => {
    const unsubscribe = appointmentService.subscribe(() => {
      setAppointments([...appointmentService.getAppointments()]);
    });
    return () => unsubscribe();
  }, []);

  // Compute Metrics
  const metrics: AppointmentMetrics = useMemo(() => {
    return appointmentService.calculateMetrics(appointments);
  }, [appointments]);

  // Selected Appointment
  const selectedAppointment = useMemo(() => {
    return (
      appointments.find((a) => a.id === selectedAppointmentId || a.appointment_id === selectedAppointmentId) ||
      appointments[0] ||
      null
    );
  }, [appointments, selectedAppointmentId]);

  // Unique lists for filter dropdowns
  const departmentsList = useMemo(() => {
    const set = new Set(appointments.map((a) => a.department).filter(Boolean));
    return ['All Departments', ...Array.from(set)];
  }, [appointments]);

  const doctorsList = useMemo(() => {
    const set = new Set(appointments.map((a) => a.doctor_name).filter(Boolean));
    return ['All Doctors', ...Array.from(set)];
  }, [appointments]);

  const statusesList = [
    'All Status',
    'Scheduled',
    'Confirmed',
    'Checked In',
    'Waiting',
    'In Consultation',
    'Completed',
    'Cancelled',
    'No Show'
  ];

  const typesList = ['All Appointment Types', 'Consultation', 'Follow-up', 'Routine', 'Emergency'];

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. Tab filtering
      if (activeTab === 'Today') {
        if (apt.appointment_date !== '2025-09-29' && apt.appointment_date !== currentDateStr) {
          // If neither reference date nor selected date, check if today
          // We include 2025-09-29 for strict reference fidelity
        }
      } else if (activeTab === 'Upcoming') {
        if (apt.appointment_date <= '2025-09-29' && apt.status === 'Completed') return false;
      } else if (activeTab === 'Past Appointments') {
        if (apt.status !== 'Completed' && apt.status !== 'Cancelled' && apt.status !== 'No Show') {
          // allow view
        }
      }

      // 2. Department filter
      if (filterDepartment !== 'All Departments' && apt.department !== filterDepartment) return false;

      // 3. Doctor filter
      if (filterDoctor !== 'All Doctors' && apt.doctor_name !== filterDoctor) return false;

      // 4. Status filter
      if (filterStatus !== 'All Status' && apt.status !== filterStatus) return false;

      // 5. Type filter
      if (filterType !== 'All Appointment Types' && apt.appointment_type !== filterType) return false;

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.patient_name.toLowerCase().includes(q);
        const matchesHealthId = apt.patient_health_id.toLowerCase().includes(q);
        const matchesPhone = apt.patient_phone.includes(q);
        const matchesDoc = apt.doctor_name.toLowerCase().includes(q);
        const matchesAptId = apt.appointment_id.toLowerCase().includes(q);
        if (!matchesName && !matchesHealthId && !matchesPhone && !matchesDoc && !matchesAptId) {
          return false;
        }
      }

      return true;
    });
  }, [
    appointments,
    activeTab,
    currentDateStr,
    filterDepartment,
    filterDoctor,
    filterStatus,
    filterType,
    searchQuery,
  ]);

  // Pagination slice
  const totalItems = filteredAppointments.length;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Checkbox toggle handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedAppointments.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Checked In':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Checked In
          </span>
        );
      case 'Waiting':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            Waiting
          </span>
        );
      case 'In Consultation':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
            In Consultation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
            Confirmed
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
            Scheduled
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            Cancelled
          </span>
        );
      case 'No Show':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            No Show
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-7 space-y-6">
      {/* 1. TOP HEADER & PRIMARY CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight">
            Appointments
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            View, schedule and manage patient appointments across departments and doctors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* + New Appointment Button */}
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>

          {/* Walk-in Registration Button */}
          <button
            type="button"
            onClick={() => setIsWalkInModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Walk-in Registration</span>
          </button>

          {/* Appointment Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Appointment Settings</span>
          </button>
        </div>
      </div>

      {/* 2. TOP 4 METRIC CARDS WITH GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Appointments */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">Total Appointments</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{metrics.total}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="font-bold">↑ 12%</span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Checked In (69%) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">Checked In</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{metrics.checkedIn}</div>
            <div className="text-[11px] text-slate-400 font-medium">
              Ready for doctor triage
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-500 transition-all duration-700 ease-out"
                strokeDasharray={`${metrics.checkedInPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-slate-800">
              {metrics.checkedInPercentage}%
            </span>
          </div>
        </div>

        {/* Card 3: Waiting (19%) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">Waiting</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{metrics.waiting}</div>
            <div className="text-[11px] text-slate-400 font-medium">
              In lobby / waiting lounge
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 transition-all duration-700 ease-out"
                strokeDasharray={`${metrics.waitingPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-slate-800">
              {metrics.waitingPercentage}%
            </span>
          </div>
        </div>

        {/* Card 4: Cancelled / No Show (12%) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">Cancelled / No Show</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{metrics.cancelledNoShow}</div>
            <div className="text-[11px] text-slate-400 font-medium">
              Released consultation slots
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-rose-500 transition-all duration-700 ease-out"
                strokeDasharray={`${metrics.cancelledNoShowPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-slate-800">
              {metrics.cancelledNoShowPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABS & DATE PICKER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6">
          {(['Today', 'Upcoming', 'Past Appointments'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`text-xs font-bold transition-all relative pb-2.5 cursor-pointer ${
                activeTab === tab
                  ? 'text-teal-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Date Selector & Filters Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs text-xs font-semibold text-slate-700 gap-2">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Mon, 29 Sep 2025</span>
            <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5 text-slate-400">
              <button
                type="button"
                onClick={() => triggerToast('Previous day loaded')}
                className="hover:text-slate-800 p-0.5 rounded cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Next day loaded')}
                className="hover:text-slate-800 p-0.5 rounded cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFiltersBar(!showFiltersBar)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              showFiltersBar
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 4. FILTER BAR */}
      {showFiltersBar && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Department */}
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-700"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div>
            <select
              value={filterDoctor}
              onChange={(e) => {
                setFilterDoctor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-700"
            >
              {doctorsList.map((doc) => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-700"
            >
              {statusesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-700"
            >
              {typesList.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name, UHID or phone..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* 5. MAIN CONTENT LAYOUT: TABLE (LEFT) + INSPECTOR (RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: APPOINTMENTS TABLE (8 COLS) */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={
                        paginatedAppointments.length > 0 &&
                        paginatedAppointments.every((a) => selectedIds.has(a.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                  </th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Patient Details</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No appointments matching current filters or search query.
                    </td>
                  </tr>
                ) : (
                  paginatedAppointments.map((apt) => {
                    const isSelected = selectedAppointment?.id === apt.id;
                    const isChecked = selectedIds.has(apt.id);
                    const initials = apt.patient_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    return (
                      <tr
                        key={apt.id}
                        onClick={() => setSelectedAppointmentId(apt.id)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-3.5 px-3.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(apt.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {apt.appointment_time}
                        </td>

                        {/* Patient Details */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {apt.patient_avatar ? (
                              <img
                                src={apt.patient_avatar}
                                alt={apt.patient_name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                                {initials}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {apt.patient_name}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                UHID: {apt.patient_health_id} · {apt.patient_age} / {apt.patient_gender[0]}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                          {apt.department}
                        </td>

                        {/* Doctor */}
                        <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {apt.doctor_name}
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {apt.appointment_type}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getStatusBadge(apt.status)}
                        </td>

                        {/* Actions (3-dots) */}
                        <td className="py-3.5 px-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === apt.id ? null : apt.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Row Actions Menu */}
                          {activeMenuId === apt.id && (
                            <div className="absolute right-3 top-10 z-20 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 divide-y divide-slate-100 text-left text-xs animate-in zoom-in-95">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    appointmentService.updateStatus(apt.id, 'Checked In');
                                    triggerToast(`${apt.patient_name} checked in`);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark Checked In</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setModalTargetAppointment(apt);
                                    setIsStartConsultOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Start Consultation</span>
                                </button>
                              </div>
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setModalTargetAppointment(apt);
                                    setIsRescheduleOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Reschedule Slot</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setModalTargetAppointment(apt);
                                    setIsNotesModalOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Add Notes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setModalTargetAppointment(apt);
                                    setIsPrintSlipOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Print Pass Slip</span>
                                </button>
                              </div>
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setModalTargetAppointment(apt);
                                    setCancelMode('cancel');
                                    setIsCancelOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Cancel Appointment</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalItems)} of {metrics.total} appointments
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === num
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}

              {totalPages > 5 && (
                <>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold"
                  >
                    15
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: INSPECTOR PANEL (4 COLS) */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5">
          {selectedAppointment ? (
            <>
              {/* Header with Title and Actions */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Appointment Details</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsRescheduleOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsNotesModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient Profile Card Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                {selectedAppointment.patient_avatar ? (
                  <img
                    src={selectedAppointment.patient_avatar}
                    alt={selectedAppointment.patient_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/20 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center shadow-xs">
                    {selectedAppointment.patient_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {selectedAppointment.patient_name}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    UHID: {selectedAppointment.patient_health_id}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Age: {selectedAppointment.patient_age} | {selectedAppointment.patient_gender}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">
                    {selectedAppointment.patient_phone}
                  </div>
                </div>
              </div>

              {/* Inspector Sub-tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 text-xs">
                {(['Overview', 'Notes', 'History', 'Documents'] as const).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setInspectorTab(sub)}
                    className={`pb-2 font-semibold transition-colors relative cursor-pointer ${
                      inspectorTab === sub
                        ? 'text-teal-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Inspector Tab Content */}
              {inspectorTab === 'Overview' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      Appointment ID
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedAppointment.appointment_id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Date & Time
                    </span>
                    <span className="font-semibold text-slate-800">
                      29 Sep 2025, {selectedAppointment.appointment_time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Department
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedAppointment.department}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      Doctor
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedAppointment.doctor_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Appointment Type
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedAppointment.appointment_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Status</span>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Checked In At
                    </span>
                    <span className="font-semibold text-slate-700">
                      {selectedAppointment.checked_in_at
                        ? new Date(selectedAppointment.checked_in_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '08:52 AM'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Source</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAppointment.source}
                    </span>
                  </div>
                </div>
              )}

              {inspectorTab === 'Notes' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {selectedAppointment.notes || 'No notes added yet for this appointment.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsNotesModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    + Append Note
                  </button>
                </div>
              )}

              {inspectorTab === 'History' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-800">29 Sep 2025 · 09:00 AM</div>
                    <div className="text-[11px] text-slate-500">General OPD · Dr. Mohamed</div>
                    <div className="text-[11px] text-teal-600 font-semibold mt-0.5">Active Slot</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-800">12 Aug 2025 · 11:30 AM</div>
                    <div className="text-[11px] text-slate-500">Cardiology Screening · Dr. Revathi</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Completed</div>
                  </div>
                </div>
              )}

              {inspectorTab === 'Documents' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">CBC_Blood_Panel.pdf</div>
                      <div className="text-[10px] text-slate-400">28 Sep 2025 · 1.2 MB</div>
                    </div>
                    <span className="text-[11px] text-teal-600 font-semibold cursor-pointer">View</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Chest_XRay_Digital.png</div>
                      <div className="text-[10px] text-slate-400">15 Aug 2025 · 3.4 MB</div>
                    </div>
                    <span className="text-[11px] text-teal-600 font-semibold cursor-pointer">View</span>
                  </div>
                </div>
              )}

              {/* QUICK ACTIONS GRID */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Quick Actions
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Start Consultation */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsStartConsultOpen(true);
                    }}
                    className="px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Start Consultation</span>
                  </button>

                  {/* Mark as No Show */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setCancelMode('no-show');
                      setIsCancelOpen(true);
                    }}
                    className="px-3 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Mark as No Show</span>
                  </button>

                  {/* Reschedule */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsRescheduleOpen(true);
                    }}
                    className="px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reschedule</span>
                  </button>

                  {/* Cancel Appointment */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setCancelMode('cancel');
                      setIsCancelOpen(true);
                    }}
                    className="px-3 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cancel Appointment</span>
                  </button>

                  {/* Add Notes */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsNotesModalOpen(true);
                    }}
                    className="px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Add Notes</span>
                  </button>

                  {/* Print Slip */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetAppointment(selectedAppointment);
                      setIsPrintSlipOpen(true);
                    }}
                    className="px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Slip</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an appointment from the table to view details.
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <WalkInRegistrationModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <AppointmentSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <StartConsultationModal
        isOpen={isStartConsultOpen}
        appointment={modalTargetAppointment || selectedAppointment}
        onClose={() => setIsStartConsultOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
        onNavigateToOpd={onNavigateToOpdWithPatient}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        appointment={modalTargetAppointment || selectedAppointment}
        onClose={() => setIsRescheduleOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <CancelAppointmentModal
        isOpen={isCancelOpen}
        appointment={modalTargetAppointment || selectedAppointment}
        mode={cancelMode}
        onClose={() => setIsCancelOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <AppointmentNotesModal
        isOpen={isNotesModalOpen}
        appointment={modalTargetAppointment || selectedAppointment}
        onClose={() => setIsNotesModalOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <PrintAppointmentSlipModal
        isOpen={isPrintSlipOpen}
        appointment={modalTargetAppointment || selectedAppointment}
        onClose={() => setIsPrintSlipOpen(false)}
      />
    </div>
  );
};
