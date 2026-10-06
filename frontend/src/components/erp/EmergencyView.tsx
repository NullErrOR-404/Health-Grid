import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Users,
  Activity,
  Clock,
  Plus,
  FileText,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Printer,
  Edit3,
  RefreshCw,
  Heart,
  FlaskConical,
  Bed,
  UserPlus,
  LogOut,
  Phone,
  AlertCircle,
  X,
  Stethoscope,
} from 'lucide-react';

import {
  emergencyService,
  type EmergencyCase,
  type EmergencyTriageLevel,
  type EmergencyStatus,
  type EmergencyMetrics,
} from '../../services/emergencyService';

import { RegisterEmergencyModal } from './emergency/RegisterEmergencyModal';
import { TriageSettingsModal } from './emergency/TriageSettingsModal';
import { ShiftReportModal } from './emergency/ShiftReportModal';
import { PrintWristbandModal } from './emergency/PrintWristbandModal';
import { UpdateStatusModal } from './emergency/UpdateStatusModal';
import { AddVitalsModal } from './emergency/AddVitalsModal';
import { RequestTestsModal } from './emergency/RequestTestsModal';
import { AdmitToIpdModal } from './emergency/AdmitToIpdModal';
import { ReferSpecialistModal } from './emergency/ReferSpecialistModal';
import { DischargeEmergencyModal } from './emergency/DischargeEmergencyModal';
import { CallFamilyModal } from './emergency/CallFamilyModal';

interface EmergencyViewProps {
  triggerToast: (msg: string) => void;
  onNavigateToIpdBed?: (bedNumber: string) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  triggerToast,
  onNavigateToIpdBed,
}) => {
  // Service Cases & Metrics
  const [cases, setCases] = useState<EmergencyCase[]>(() => emergencyService.getCases());
  const [metrics, setMetrics] = useState<EmergencyMetrics>(() => emergencyService.getMetrics());

  // Selected Case for Inspector Panel
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  // Top Tabs: 'All Patients' | 'Waiting' | 'In Treatment' | 'Observation' | 'Discharged'
  const [activeTab, setActiveTab] = useState<'All Patients' | 'Waiting' | 'In Treatment' | 'Observation' | 'Discharged'>('All Patients');

  // Filter Bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All Doctors');
  const [timeFilter, setTimeFilter] = useState<string>('All Today');

  // Checkbox selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Right Inspector Tab: 'Overview' | 'Vitals' | 'Orders' | 'Notes' | 'Timeline'
  const [inspectorTab, setInspectorTab] = useState<'Overview' | 'Vitals' | 'Orders' | 'Notes' | 'Timeline'>('Overview');

  // Active Row 3-dot dropdown menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTriageSettingsOpen, setIsTriageSettingsOpen] = useState(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState(false);
  const [isPrintWristbandOpen, setIsPrintWristbandOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isAddVitalsOpen, setIsAddVitalsOpen] = useState(false);
  const [isRequestTestsOpen, setIsRequestTestsOpen] = useState(false);
  const [isAdmitToIpdOpen, setIsAdmitToIpdOpen] = useState(false);
  const [isReferSpecialistOpen, setIsReferSpecialistOpen] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [isCallFamilyOpen, setIsCallFamilyOpen] = useState(false);

  // Targeted case for modal operations
  const [modalTargetCase, setModalTargetCase] = useState<EmergencyCase | null>(null);

  // Quick Inline Note form inside Inspector
  const [inlineNoteText, setInlineNoteText] = useState('');

  // Subscribe to real-time service updates
  useEffect(() => {
    const unsubscribe = emergencyService.subscribe(() => {
      setCases([...emergencyService.getCases()]);
      setMetrics(emergencyService.getMetrics());
    });
    // Trigger initial fetch
    emergencyService.fetchCases();
    return () => unsubscribe();
  }, []);

  // Set default selected case when cases load
  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  // Selected case object
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  // Distinct doctors for filter
  const doctorOptions = useMemo(() => {
    const docs = Array.from(new Set(cases.map((c) => c.assigned_doctor_name).filter(Boolean)));
    return ['All Doctors', ...docs];
  }, [cases]);

  // Tab counters
  const tabCounts = useMemo(() => {
    const activePatients = cases.filter((c) => c.status !== 'Discharged');
    return {
      all: activePatients.length,
      waiting: cases.filter((c) => c.status === 'Waiting').length,
      inTreatment: cases.filter((c) => c.status === 'In Treatment').length,
      observation: cases.filter((c) => c.status === 'Observation').length,
      discharged: cases.filter((c) => c.status === 'Discharged').length,
    };
  }, [cases]);

  // Filtered cases list
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Tab Filter
      if (activeTab === 'All Patients' && c.status === 'Discharged') return false;
      if (activeTab === 'Waiting' && c.status !== 'Waiting') return false;
      if (activeTab === 'In Treatment' && c.status !== 'In Treatment') return false;
      if (activeTab === 'Observation' && c.status !== 'Observation') return false;
      if (activeTab === 'Discharged' && c.status !== 'Discharged') return false;

      // 2. Triage Level Filter
      if (triageFilter !== 'All' && c.triage_level !== triageFilter) return false;

      // 3. Status Filter
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;

      // 4. Doctor Filter
      if (doctorFilter !== 'All Doctors' && c.assigned_doctor_name !== doctorFilter) return false;

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.patient_name.toLowerCase().includes(q);
        const matchHealthId = c.patient_health_id.toLowerCase().includes(q);
        const matchCase = c.case_number.toLowerCase().includes(q);
        const matchComplaint = c.chief_complaint.toLowerCase().includes(q);
        const matchLocation = c.er_location.toLowerCase().includes(q);
        if (!matchName && !matchHealthId && !matchCase && !matchComplaint && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [cases, activeTab, triageFilter, statusFilter, doctorFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / itemsPerPage));
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(start, start + itemsPerPage);
  }, [filteredCases, currentPage]);

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedCases.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Helper for Triage Badges
  const renderTriageBadge = (level: EmergencyTriageLevel) => {
    switch (level) {
      case 'Red':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            Red - Critical
          </span>
        );
      case 'Yellow':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Yellow - Urgent
          </span>
        );
      case 'Green':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Green - Non-urgent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {level}
          </span>
        );
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status: EmergencyStatus) => {
    switch (status) {
      case 'In Treatment':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            In Treatment
          </span>
        );
      case 'Waiting':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Waiting
          </span>
        );
      case 'Observation':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Observation
          </span>
        );
      case 'Discharged':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Discharged
          </span>
        );
      case 'Transferred':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Transferred
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Helper to calculate elapsed time in ER
  const getElapsedWaitTime = (arrivalTimeStr: string) => {
    const arrival = new Date(arrivalTimeStr).getTime();
    const now = Date.now();
    const diffMins = Math.max(1, Math.floor((now - arrival) / (1000 * 60)));
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  // Inline Note Submit Handler
  const handleAddInlineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !inlineNoteText.trim()) return;
    try {
      await emergencyService.addClinicalNote(selectedCase.id, {
        author: 'Dr. Priya',
        role: 'Emergency Medical Officer',
        content: inlineNoteText.trim(),
      });
      setInlineNoteText('');
      triggerToast('Casualty note recorded!');
    } catch (err: any) {
      triggerToast('Failed to add note');
    }
  };

  // Code Red Critical Patients for Shift Report
  const criticalRedCases = useMemo(() => {
    return cases.filter((c) => c.triage_level === 'Red' && c.status !== 'Discharged');
  }, [cases]);

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-7 space-y-6 bg-slate-50/50">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight">
              Emergency Department
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Real-time triage and patient status monitoring across casualty bays
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsShiftReportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Shift Report</span>
          </button>

          <button
            onClick={() => setIsTriageSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Triage Settings</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Emergency Patient</span>
          </button>
        </div>
      </div>

      {/* 2. 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total ER Patients */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total ER Patients</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalActive}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              ↑ 18% <span className="text-slate-400 font-normal">from last shift</span>
            </span>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>

        {/* Card 2: Critical (Red) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Critical (Red)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{metrics.criticalRed}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-rose-600">Immediate attention required</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          </div>
        </div>

        {/* Card 3: In Treatment */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">In Treatment</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.inTreatment}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">
              Avg time: <strong className="text-slate-700">{metrics.avgTreatmentMins} mins</strong>
            </span>
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
          </div>
        </div>

        {/* Card 4: Waiting */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Waiting</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.waiting}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-amber-600">
              Longest wait: <strong>{metrics.longestWaitMins} mins</strong>
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'All Patients', label: `All Patients (${tabCounts.all})` },
          { id: 'Waiting', label: `Waiting (${tabCounts.waiting})` },
          { id: 'In Treatment', label: `In Treatment (${tabCounts.inTreatment})` },
          { id: 'Observation', label: `Observation (${tabCounts.observation})` },
          { id: 'Discharged', label: `Discharged (${tabCounts.discharged})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. FILTERS ROW */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name, ID, chief complaint, location..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Triage Level */}
            <select
              value={triageFilter}
              onChange={(e) => {
                setTriageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Triage Levels</option>
              <option value="Red">Red (Critical)</option>
              <option value="Yellow">Yellow (Urgent)</option>
              <option value="Green">Green (Non-urgent)</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="In Treatment">In Treatment</option>
              <option value="Observation">Observation</option>
              <option value="Discharged">Discharged</option>
              <option value="Transferred">Transferred</option>
            </select>

            {/* Time Range */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="All Today">All Today</option>
              <option value="Last 1 Hour">Last 1 Hour</option>
              <option value="Last 4 Hours">Last 4 Hours</option>
              <option value="Last 8 Hours">Last 8 Hours</option>
              <option value="This Shift">This Shift (Day Shift)</option>
            </select>

            {/* Doctors */}
            <select
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              {doctorOptions.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>

            {/* Clear / Reset Filters */}
            {(triageFilter !== 'All' || statusFilter !== 'All' || doctorFilter !== 'All Doctors' || searchQuery) && (
              <button
                onClick={() => {
                  setTriageFilter('All');
                  setStatusFilter('All');
                  setDoctorFilter('All Doctors');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MAIN 2-COLUMN WORKSPACE: Patient Table + Right Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT / CENTER: CASUALTY PATIENT TABLE (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={
                        paginatedCases.length > 0 &&
                        paginatedCases.every((c) => selectedIds.has(c.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">PATIENT</th>
                  <th className="py-3 px-3">TRIAGE</th>
                  <th className="py-3 px-3">CHIEF COMPLAINT</th>
                  <th className="py-3 px-3">LOCATION & DOCTOR</th>
                  <th className="py-3 px-3 text-center">WAIT / TIME</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-500">No emergency cases matching criteria</span>
                        <button
                          onClick={() => {
                            setTriageFilter('All');
                            setStatusFilter('All');
                            setDoctorFilter('All Doctors');
                            setSearchQuery('');
                          }}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          Reset filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCases.map((c) => {
                    const isSelected = selectedCase?.id === c.id;
                    const isChecked = selectedIds.has(c.id);

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCaseId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-50/40 border-l-4 border-l-rose-600'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-3 px-3.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(c.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>

                        {/* Patient info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {c.patient_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {c.patient_name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {c.patient_age}y • {c.patient_gender} • <span className="font-mono text-teal-600 font-bold">{c.patient_health_id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Triage Level */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderTriageBadge(c.triage_level)}
                        </td>

                        {/* Chief complaint & arrival mode */}
                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="text-slate-800 font-medium truncate" title={c.chief_complaint}>
                            {c.chief_complaint}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-slate-600">{c.mode_of_arrival}</span>
                            <span>•</span>
                            <span>{new Date(c.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>

                        {/* Location & Doctor */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-[11px]">{c.er_location}</div>
                          <div className="text-[10px] text-slate-500">{c.assigned_doctor_name}</div>
                        </td>

                        {/* Wait / ER Time */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {getElapsedWaitTime(c.arrival_time)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(c.status)}
                        </td>

                        {/* Actions 3-dot dropdown */}
                        <td
                          className="py-3 px-3 text-right relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === c.id && (
                            <div className="absolute right-3 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-left text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setSelectedCaseId(c.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                                  <span>View in Inspector</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsUpdateStatusOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Update Status</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsAddVitalsOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Add Vitals</span>
                                </button>
                              </div>

                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsRequestTestsOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Request STAT Tests</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsAdmitToIpdOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <Bed className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Admit to IPD Bed</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsReferSpecialistOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Refer Specialist</span>
                                </button>
                              </div>

                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsPrintWristbandOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Print Wristband</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsCallFamilyOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Call Family</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalTargetCase(c);
                                    setIsDischargeOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-rose-600 flex items-center gap-2 font-medium"
                                >
                                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Authorize Discharge</span>
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
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing{' '}
              <strong className="text-slate-800">
                {filteredCases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredCases.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredCases.length}</strong> patients
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent text-slate-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'border border-slate-200 hover:bg-white text-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent text-slate-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: PERSISTENT PATIENT INSPECTOR PANEL (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5 sticky top-4">
          {selectedCase ? (
            <>
              {/* Inspector Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 text-slate-800 font-black text-lg flex items-center justify-center shrink-0">
                    {selectedCase.patient_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-tight">
                      {selectedCase.patient_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono font-bold text-teal-700">
                        {selectedCase.patient_health_id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedCase.case_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Quick Action Header Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    title="Print Wristband"
                    onClick={() => {
                      setModalTargetCase(selectedCase);
                      setIsPrintWristbandOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    title="Update Status"
                    onClick={() => {
                      setModalTargetCase(selectedCase);
                      setIsUpdateStatusOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    title="Call Family"
                    onClick={() => {
                      setModalTargetCase(selectedCase);
                      setIsCallFamilyOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Triage Alert Pill */}
              <div className="flex items-center justify-between">
                <div>{renderTriageBadge(selectedCase.triage_level)}</div>
                <div className="text-xs font-semibold text-slate-500">
                  Status: <strong className="text-slate-800">{selectedCase.status}</strong>
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-100 pb-2 text-xs">
                {(['Overview', 'Vitals', 'Orders', 'Notes', 'Timeline'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInspectorTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      inspectorTab === tab
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {inspectorTab === 'Overview' && (
                <div className="space-y-4">
                  {/* Demographics & Clinical Information Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {selectedCase.patient_age} yrs • {selectedCase.patient_gender}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Arrival Time & Mode
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 block truncate">
                        {selectedCase.mode_of_arrival} ({new Date(selectedCase.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Location
                      </span>
                      <span className="font-bold text-rose-700 mt-0.5 block truncate">
                        {selectedCase.er_location}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Attending Doctor
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 block truncate">
                        {selectedCase.assigned_doctor_name}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Accompanied By
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 block truncate">
                        {selectedCase.accompanied_by || 'Self / EMS'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Allergies
                      </span>
                      <span
                        className={`font-bold mt-0.5 block truncate ${
                          selectedCase.allergies && selectedCase.allergies !== 'No known allergies'
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {selectedCase.allergies || 'No known allergies'}
                      </span>
                    </div>
                  </div>

                  {/* Chief Complaint Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Chief Complaint & Clinical Presentation
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {selectedCase.chief_complaint}
                    </p>
                  </div>

                  {/* Latest Vitals Bar (4 mini gauge cards) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-600" />
                        Latest Telemetry Vitals
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedCase.latest_vitals.time || 'Current'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block">BP</span>
                        <span className="text-xs font-black text-slate-900 mt-0.5 block">
                          {selectedCase.latest_vitals.bp}
                        </span>
                        <span className="text-[9px] text-slate-400">mmHg</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block">HR</span>
                        <span
                          className={`text-xs font-black mt-0.5 block ${
                            selectedCase.latest_vitals.hr > 110 ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {selectedCase.latest_vitals.hr}
                        </span>
                        <span className="text-[9px] text-slate-400">bpm</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block">SpO2</span>
                        <span
                          className={`text-xs font-black mt-0.5 block ${
                            selectedCase.latest_vitals.spo2 < 93 ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {selectedCase.latest_vitals.spo2}%
                        </span>
                        <span className="text-[9px] text-slate-400">room air</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block">Temp</span>
                        <span className="text-xs font-black text-slate-900 mt-0.5 block">
                          {selectedCase.latest_vitals.temp}°C
                        </span>
                        <span className="text-[9px] text-slate-400">tympanic</span>
                      </div>
                    </div>
                  </div>

                  {/* 6 QUICK CLINICAL ACTIONS GRID */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Clinical Quick Actions
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setModalTargetCase(selectedCase);
                          setIsUpdateStatusOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Update Status</span>
                      </button>

                      <button
                        onClick={() => {
                          setModalTargetCase(selectedCase);
                          setIsAddVitalsOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Add Vitals</span>
                      </button>

                      <button
                        onClick={() => {
                          setModalTargetCase(selectedCase);
                          setIsRequestTestsOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Request Tests</span>
                      </button>

                      <button
                        onClick={() => {
                          setModalTargetCase(selectedCase);
                          setIsAdmitToIpdOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <Bed className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Admit to IPD</span>
                      </button>

                      <button
                        onClick={() => {
                          setModalTargetCase(selectedCase);
                          setIsReferSpecialistOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Refer Specialist</span>
                      </button>

                      <button
                        onClick={() => {
                          setModalTargetCase(selectedCase);
                          setIsDischargeOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 text-rose-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Discharge</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VITALS HISTORY */}
              {inspectorTab === 'Vitals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Vitals History ({selectedCase.vitals_history?.length || 0} Records)
                    </h3>
                    <button
                      onClick={() => {
                        setModalTargetCase(selectedCase);
                        setIsAddVitalsOpen(true);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log New</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {selectedCase.vitals_history && selectedCase.vitals_history.length > 0 ? (
                      selectedCase.vitals_history.map((vh, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>{new Date(vh.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-slate-400 font-normal">{vh.recorded_by || 'ER Staff'}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-slate-200">
                            <div>BP: <strong className="text-slate-900">{vh.bp}</strong></div>
                            <div>HR: <strong className="text-slate-900">{vh.hr}</strong></div>
                            <div>SpO2: <strong className="text-slate-900">{vh.spo2}%</strong></div>
                            <div>Temp: <strong className="text-slate-900">{vh.temp}°C</strong></div>
                          </div>
                          {vh.notes && (
                            <p className="text-[10px] text-slate-500 italic mt-1">{vh.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No previous vital signs logged.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS & INVESTIGATIONS */}
              {inspectorTab === 'Orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      STAT Investigations & Orders
                    </h3>
                    <button
                      onClick={() => {
                        setModalTargetCase(selectedCase);
                        setIsRequestTestsOpen(true);
                      }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Order Tests</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {selectedCase.investigations_ordered && selectedCase.investigations_ordered.length > 0 ? (
                      selectedCase.investigations_ordered.map((inv, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{inv.test_name}</div>
                            <div className="text-[10px] text-slate-500">
                              {inv.category} • <span className="text-rose-600 font-semibold">{inv.priority}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {inv.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No active lab or radiology investigations ordered.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CLINICAL NOTES */}
              {inspectorTab === 'Notes' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Casualty Clinical Notes
                  </h3>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedCase.clinical_notes && selectedCase.clinical_notes.length > 0 ? (
                      selectedCase.clinical_notes.map((cn, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>{cn.author} ({cn.role})</span>
                            <span>{new Date(cn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-800 font-medium leading-relaxed">{cn.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        No clinical notes recorded yet.
                      </div>
                    )}
                  </div>

                  {/* Add note form */}
                  <form onSubmit={handleAddInlineNote} className="space-y-2 pt-2 border-t border-slate-100">
                    <textarea
                      rows={2}
                      value={inlineNoteText}
                      onChange={(e) => setInlineNoteText(e.target.value)}
                      placeholder="Add quick casualty observation or handover note..."
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!inlineNoteText.trim()}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                      >
                        Post Note
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: TIMELINE */}
              {inspectorTab === 'Timeline' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Patient ER Journey Timeline
                  </h3>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                      <div className="font-bold text-slate-900">Arrived at Casualty</div>
                      <div className="text-[10px] text-slate-500">
                        Via {selectedCase.mode_of_arrival} at {new Date(selectedCase.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
                      <div className="font-bold text-slate-900">Triage Assessment Completed</div>
                      <div className="text-[10px] text-slate-500">
                        Assigned Code {selectedCase.triage_level} • Bed: {selectedCase.er_location}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                      <div className="font-bold text-slate-900">Physician Examination</div>
                      <div className="text-[10px] text-slate-500">
                        {selectedCase.assigned_doctor_name} attending
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
                      <div className="font-bold text-slate-900">Current Status: {selectedCase.status}</div>
                      <div className="text-[10px] text-slate-500">
                        Ongoing monitoring in {selectedCase.er_location}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-500">Select an emergency patient to inspect</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. ALL 11 CLINICAL MODALS */}
      <RegisterEmergencyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        triggerToast={triggerToast}
      />

      <TriageSettingsModal
        isOpen={isTriageSettingsOpen}
        onClose={() => setIsTriageSettingsOpen(false)}
        triggerToast={triggerToast}
      />

      <ShiftReportModal
        isOpen={isShiftReportOpen}
        onClose={() => setIsShiftReportOpen(false)}
        metrics={metrics}
        criticalCases={criticalRedCases}
        triggerToast={triggerToast}
      />

      <PrintWristbandModal
        isOpen={isPrintWristbandOpen}
        onClose={() => setIsPrintWristbandOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />

      <UpdateStatusModal
        isOpen={isUpdateStatusOpen}
        onClose={() => setIsUpdateStatusOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />

      <AddVitalsModal
        isOpen={isAddVitalsOpen}
        onClose={() => setIsAddVitalsOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />

      <RequestTestsModal
        isOpen={isRequestTestsOpen}
        onClose={() => setIsRequestTestsOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />

      <AdmitToIpdModal
        isOpen={isAdmitToIpdOpen}
        onClose={() => setIsAdmitToIpdOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
        onNavigateToIpdBed={onNavigateToIpdBed}
      />

      <ReferSpecialistModal
        isOpen={isReferSpecialistOpen}
        onClose={() => setIsReferSpecialistOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />

      <DischargeEmergencyModal
        isOpen={isDischargeOpen}
        onClose={() => setIsDischargeOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />

      <CallFamilyModal
        isOpen={isCallFamilyOpen}
        onClose={() => setIsCallFamilyOpen(false)}
        patient={modalTargetCase || selectedCase}
        triggerToast={triggerToast}
      />
    </main>
  );
};
