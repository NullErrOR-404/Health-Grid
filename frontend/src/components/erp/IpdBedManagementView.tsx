import React, { useState, useEffect, useMemo } from 'react';
import {
  BedDouble,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Calendar,
  Building,
  User,
  Clock,
  Edit2,
  Check,
  X,
  FileText,
  Printer,
  ClipboardList,
  Wrench,
  Phone,
  CheckCircle2
} from 'lucide-react';
import {
  ipdBedService,
  type IpdWard,
  type IpdBed,
  type IpdAdmission,
  type IpdClinicalNote,
  type IpdDoctorOrder,
  type IpdBedTransfer,
  type IpdMetrics
} from '../../services/ipdBedService';
import { AdmitPatientModal } from './ipd/AdmitPatientModal';
import { BedAllocationModal } from './ipd/BedAllocationModal';
import { TransferPatientModal } from './ipd/TransferPatientModal';
import { DischargePatientModal } from './ipd/DischargePatientModal';
import { UpdateBedModal } from './ipd/UpdateBedModal';
import { AddClinicalNotesModal } from './ipd/AddClinicalNotesModal';
import { ViewOrdersModal } from './ipd/ViewOrdersModal';
import { PrintSummaryModal } from './ipd/PrintSummaryModal';

interface IpdBedManagementViewProps {
  triggerToast: (msg: string) => void;
  onNavigateToPatientProfile?: (healthId: string) => void;
}

export const IpdBedManagementView: React.FC<IpdBedManagementViewProps> = ({
  triggerToast,
  onNavigateToPatientProfile,
}) => {
  // Primary Tabs
  const [activeTab, setActiveTab] = useState<
    'Bed Overview' | 'Patient List' | 'Admissions' | 'Discharges' | 'Transfer Requests'
  >('Bed Overview');

  // Inspector Sub-tabs
  const [inspectorTab, setInspectorTab] = useState<
    'Overview' | 'Clinical Details' | 'Vitals' | 'Notes' | 'History'
  >('Overview');

  // View switch: Grid vs List
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');

  // Filters & Search
  const [wardFilter, setWardFilter] = useState('All');
  const [bedTypeFilter, setBedTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion expanded states (Ward codes)
  const [expandedWards, setExpandedWards] = useState<Record<string, boolean>>({
    GEN: true,
    SEMI: true,
    PRIV: true,
    ICU: false,
    HDU: false,
  });

  // Data State
  const [wards, setWards] = useState<IpdWard[]>([]);
  const [beds, setBeds] = useState<IpdBed[]>([]);
  const [admissions, setAdmissions] = useState<IpdAdmission[]>([]);
  const [transfers, setTransfers] = useState<IpdBedTransfer[]>([]);
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>('G-02');
  const [activeAdmission, setActiveAdmission] = useState<IpdAdmission | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<IpdClinicalNote[]>([]);
  const [doctorOrders, setDoctorOrders] = useState<IpdDoctorOrder[]>([]);

  // Inline Diagnosis Edit State
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);
  const [tempDiagnosis, setTempDiagnosis] = useState('');

  // Modals state
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isUpdateBedModalOpen, setIsUpdateBedModalOpen] = useState(false);
  const [isAddNotesModalOpen, setIsAddNotesModalOpen] = useState(false);
  const [isViewOrdersModalOpen, setIsViewOrdersModalOpen] = useState(false);
  const [isPrintSummaryModalOpen, setIsPrintSummaryModalOpen] = useState(false);

  // Modal target bed
  const [targetBedForUpdate, setTargetBedForUpdate] = useState<IpdBed | null>(null);

  // Load Data
  const refreshData = async () => {
    const [w, b, a, t] = await Promise.all([
      ipdBedService.getWards(),
      ipdBedService.getBeds(),
      ipdBedService.getAdmissions(),
      ipdBedService.getTransferRequests(),
    ]);
    setWards(w);
    setBeds(b);
    setAdmissions(a);
    setTransfers(t);

    // If bed selected, fetch its admission
    if (selectedBedNumber) {
      const currentAdm = await ipdBedService.getAdmissionForBed(selectedBedNumber);
      setActiveAdmission(currentAdm);
      if (currentAdm) {
        setTempDiagnosis(currentAdm.diagnosis);
        const [notes, orders] = await Promise.all([
          ipdBedService.getClinicalNotes(currentAdm.id, currentAdm.patient_health_id),
          ipdBedService.getDoctorOrders(currentAdm.id, currentAdm.patient_health_id),
        ]);
        setClinicalNotes(notes);
        setDoctorOrders(orders);
      } else {
        setClinicalNotes([]);
        setDoctorOrders([]);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = ipdBedService.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [selectedBedNumber]);

  // Handle Bed selection
  const handleSelectBed = async (bedNumber: string) => {
    setSelectedBedNumber(bedNumber);
    const adm = await ipdBedService.getAdmissionForBed(bedNumber);
    setActiveAdmission(adm);
    if (adm) {
      setTempDiagnosis(adm.diagnosis);
      const [notes, orders] = await Promise.all([
        ipdBedService.getClinicalNotes(adm.id, adm.patient_health_id),
        ipdBedService.getDoctorOrders(adm.id, adm.patient_health_id),
      ]);
      setClinicalNotes(notes);
      setDoctorOrders(orders);
    } else {
      setClinicalNotes([]);
      setDoctorOrders([]);
    }
  };

  // Toggle Ward Accordion
  const toggleWard = (code: string) => {
    setExpandedWards((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Calculate Metrics
  const metrics: IpdMetrics = useMemo(() => {
    return ipdBedService.calculateMetrics(beds);
  }, [beds]);

  // Filtered Beds
  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      if (wardFilter !== 'All' && b.ward_code !== wardFilter) return false;
      if (bedTypeFilter !== 'All' && b.bed_type !== bedTypeFilter) return false;
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesBed = b.bed_number.toLowerCase().includes(query);
        const matchesPatient = (b.current_patient_name || '').toLowerCase().includes(query);
        const matchesHealthId = (b.current_patient_health_id || '').toLowerCase().includes(query);
        if (!matchesBed && !matchesPatient && !matchesHealthId) return false;
      }
      return true;
    });
  }, [beds, wardFilter, bedTypeFilter, statusFilter, searchQuery]);

  // Selected Bed Object
  const selectedBed = useMemo(() => {
    return beds.find((b) => b.bed_number === selectedBedNumber) || beds[0] || null;
  }, [beds, selectedBedNumber]);

  // Update Diagnosis
  const handleSaveDiagnosis = async () => {
    if (!activeAdmission || !tempDiagnosis.trim()) return;
    const ok = await ipdBedService.updateDiagnosis(activeAdmission.id, tempDiagnosis.trim());
    if (ok) {
      setActiveAdmission({ ...activeAdmission, diagnosis: tempDiagnosis.trim() });
      setIsEditingDiagnosis(false);
      triggerToast('Patient clinical diagnosis updated successfully.');
    }
  };

  // SVG Circular Gauge Component
  const CircularGauge: React.FC<{ percentage: number; colorClass: string; strokeClass: string }> = ({
    percentage,
    colorClass,
    strokeClass,
  }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-slate-100"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${strokeClass} transition-all duration-700 ease-out`}
            fill="transparent"
          />
        </svg>
        <span className={`absolute text-[11px] font-black ${colorClass}`}>{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            IPD & Bed Management
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track admissions, manage beds, monitor patient care and discharge processes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsAdmitModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Admit Patient</span>
          </button>

          <button
            onClick={() => setIsAllocateModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <BedDouble className="w-4 h-4 text-teal-600" />
            <span>Bed Allocation</span>
          </button>

          <button
            onClick={() => {
              if (activeAdmission) {
                setIsDischargeModalOpen(true);
              } else {
                triggerToast('Please select an occupied bed to discharge the patient.');
              }
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Discharge Patient</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 flex-1 min-w-0">
        {/* 2. FOUR KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Beds */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Total Beds</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1 block">
                  {metrics.totalBeds}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Occupied Beds */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Occupied Beds</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1 block">
                  {metrics.occupiedBeds}
                </span>
              </div>
            </div>
            <CircularGauge
              percentage={metrics.occupiedPercentage}
              colorClass="text-rose-600"
              strokeClass="text-rose-500"
            />
          </div>

          {/* Card 3: Available Beds */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Available Beds</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1 block">
                  {metrics.availableBeds}
                </span>
              </div>
            </div>
            <CircularGauge
              percentage={metrics.availablePercentage}
              colorClass="text-emerald-600"
              strokeClass="text-emerald-500"
            />
          </div>

          {/* Card 4: Maintenance */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Maintenance</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1 block">
                  {metrics.maintenanceBeds}
                </span>
              </div>
            </div>
            <CircularGauge
              percentage={metrics.maintenancePercentage}
              colorClass="text-amber-600"
              strokeClass="text-amber-500"
            />
          </div>
        </div>

        {/* 3. TABS & FILTER TOOLBAR */}
        <div className="space-y-4">
          {/* Top Tab Bar */}
          <div className="border-b border-slate-200/80 flex items-center gap-6 overflow-x-auto scrollbar-none">
            {(['Bed Overview', 'Patient List', 'Admissions', 'Discharges', 'Transfer Requests'] as const).map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-bold transition-all whitespace-nowrap relative cursor-pointer ${
                      isActive ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full animate-in fade-in" />
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Ward Filter */}
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Wards</option>
                {wards.map((w) => (
                  <option key={w.ward_code} value={w.ward_code}>
                    {w.name}
                  </option>
                ))}
              </select>

              {/* Bed Type Filter */}
              <select
                value={bedTypeFilter}
                onChange={(e) => setBedTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Bed Types</option>
                <option value="General Ward">General Ward</option>
                <option value="Semi-Private">Semi-Private</option>
                <option value="Private Room">Private Room</option>
                <option value="Critical Care">Critical Care</option>
                <option value="Step-Down Care">Step-Down Care</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
              </select>

              {/* Search by patient or UHID */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name or UHID..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end lg:self-auto">
              <span className="text-[11px] font-bold text-slate-500 px-2">View:</span>
              <button
                onClick={() => setViewMode('Grid')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'Grid'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('List')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'List'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. MAIN BODY WORKSPACE (Bed Overview vs Other Tabs) */}
        {activeTab === 'Bed Overview' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER: WARD ACCORDIONS & BED GRIDS (8 cols) */}
            <div className="xl:col-span-8 space-y-4">
              {wards
                .filter((w) => wardFilter === 'All' || w.ward_code === wardFilter)
                .map((ward) => {
                  const isExpanded = !!expandedWards[ward.ward_code];
                  const wardBeds = filteredBeds.filter((b) => b.ward_code === ward.ward_code);
                  const occupiedCount = beds.filter(
                    (b) => b.ward_code === ward.ward_code && b.status === 'Occupied'
                  ).length;
                  const availableCount = beds.filter(
                    (b) => b.ward_code === ward.ward_code && (b.status === 'Available' || b.status === 'Cleaning')
                  ).length;
                  const maintCount = beds.filter(
                    (b) => b.ward_code === ward.ward_code && b.status === 'Maintenance'
                  ).length;

                  return (
                    <div
                      key={ward.ward_code}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleWard(ward.ward_code)}
                        className="w-full px-5 py-3.5 bg-white hover:bg-slate-50/80 flex items-center justify-between border-b border-slate-100 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-sm font-black text-slate-900">
                            {ward.name} ({ward.total_beds} beds)
                          </span>
                        </div>

                        {/* Counts Pill Badges */}
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="text-slate-600">
                            Occupied <strong className="text-slate-900 font-extrabold">{occupiedCount}</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                            Available <strong className="font-extrabold">{availableCount}</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                            Maintenance <strong className="font-extrabold">{maintCount}</strong>
                          </span>
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5">
                          {wardBeds.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                              No beds match the current filter in {ward.name}.
                            </div>
                          ) : viewMode === 'Grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {wardBeds.map((bed) => {
                                const isSelected = selectedBedNumber === bed.bed_number;
                                const isOccupied = bed.status === 'Occupied';
                                const isMaintenance = bed.status === 'Maintenance';
                                const isAvailable = bed.status === 'Available' || bed.status === 'Cleaning';

                                return (
                                  <div
                                    key={bed.bed_number}
                                    onClick={() => handleSelectBed(bed.bed_number)}
                                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[115px] select-none ${
                                      isSelected
                                        ? 'ring-2 ring-teal-500 border-teal-400 shadow-md bg-white'
                                        : isOccupied
                                        ? 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                                        : isMaintenance
                                        ? 'bg-amber-50/40 border-amber-200/70 hover:bg-amber-50/70'
                                        : 'bg-emerald-50/40 border-emerald-200/70 hover:bg-emerald-50/70'
                                    }`}
                                  >
                                    {/* Card Top: Bed Code + Menu */}
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`text-xs font-black tracking-tight ${
                                          isMaintenance
                                            ? 'text-amber-800'
                                            : isAvailable
                                            ? 'text-emerald-800'
                                            : 'text-slate-800'
                                        }`}
                                      >
                                        {bed.bed_number}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTargetBedForUpdate(bed);
                                          setIsUpdateBedModalOpen(true);
                                        }}
                                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                                        title="Bed Options"
                                      >
                                        <MoreVertical className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Card Body */}
                                    {isOccupied ? (
                                      <div className="flex items-center gap-2 mt-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-300">
                                          {bed.current_patient_name ? (
                                            bed.current_patient_name.slice(0, 2).toUpperCase()
                                          ) : (
                                            <User className="w-4 h-4 text-slate-400" />
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-black text-slate-900 truncate">
                                            {bed.current_patient_name || 'Patient'}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono truncate">
                                            UHID: {bed.current_patient_health_id || 'HG000000'}
                                          </div>
                                        </div>
                                      </div>
                                    ) : isMaintenance ? (
                                      <div className="flex flex-col items-center justify-center my-auto text-amber-600">
                                        <Wrench className="w-5 h-5 mb-1" />
                                        <span className="text-[11px] font-bold">Maintenance</span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center my-auto text-emerald-600">
                                        <BedDouble className="w-5 h-5 mb-1" />
                                        <span className="text-[11px] font-bold">Available</span>
                                      </div>
                                    )}

                                    {/* Bottom indicator if cleaning */}
                                    {bed.status === 'Cleaning' && (
                                      <span className="text-[9px] font-bold text-cyan-700 bg-cyan-100/70 px-1.5 py-0.5 rounded self-center mt-1">
                                        Cleaning
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* List View for Wards */
                            <div className="divide-y divide-slate-100">
                              {wardBeds.map((bed) => (
                                <div
                                  key={bed.bed_number}
                                  onClick={() => handleSelectBed(bed.bed_number)}
                                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                    selectedBedNumber === bed.bed_number ? 'bg-teal-50' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-extrabold text-slate-900 w-16">{bed.bed_number}</span>
                                    <span className="text-slate-500 font-medium">{bed.bed_type}</span>
                                    {bed.current_patient_name && (
                                      <span className="text-slate-800 font-bold ml-2">
                                        {bed.current_patient_name}{' '}
                                        <span className="text-slate-400 font-mono text-[10px]">
                                          ({bed.current_patient_health_id})
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        bed.status === 'Occupied'
                                          ? 'bg-blue-100 text-blue-800'
                                          : bed.status === 'Available'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {bed.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* RIGHT: INSPECTOR PANEL (4 cols) */}
            <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden sticky top-24">
              {/* Inspector Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Bed {selectedBed ? selectedBed.bed_number : 'G-02'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      selectedBed?.status === 'Occupied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedBed?.status === 'Available'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedBed ? selectedBed.status : 'Occupied'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (selectedBed) {
                      setTargetBedForUpdate(selectedBed);
                      setIsUpdateBedModalOpen(true);
                    }
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                  title="Bed settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Patient Banner */}
              {activeAdmission ? (
                <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-sm font-black text-slate-700 border border-slate-300">
                        {activeAdmission.patient_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {activeAdmission.patient_name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          UHID: {activeAdmission.patient_health_id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          Age: {activeAdmission.patient_age || 20} | {activeAdmission.patient_gender || 'Male'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{activeAdmission.patient_phone || '+91 98765 43210'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToPatientProfile) {
                          onNavigateToPatientProfile(activeAdmission.patient_health_id);
                        } else {
                          triggerToast(
                            `Viewing full Health Vault for Sovereign HealthID ${activeAdmission.patient_health_id}`
                          );
                        }
                      }}
                      className="px-2.5 py-1 text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      View Full Profile
                    </button>
                  </div>

                  {/* Sub-tabs inside Inspector */}
                  <div className="border-b border-slate-100 flex items-center gap-4 text-xs font-bold overflow-x-auto">
                    {(['Overview', 'Clinical Details', 'Vitals', 'Notes', 'History'] as const).map((t) => {
                      const isActive = inspectorTab === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setInspectorTab(t)}
                          className={`pb-2 transition-all whitespace-nowrap relative cursor-pointer ${
                            isActive ? 'text-teal-700' : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {t}
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Inspector Sub-tab Content */}
                  {inspectorTab === 'Overview' && (
                    <div className="space-y-4">
                      {/* Admission Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Admission Date
                            </span>
                            <span className="font-semibold text-slate-800">
                              {new Date(activeAdmission.admission_date).toLocaleDateString([], {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                              ,{' '}
                              {new Date(activeAdmission.admission_date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                            <span className="font-semibold text-slate-800">{activeAdmission.department}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Consultant Doctor
                            </span>
                            <span className="font-semibold text-slate-800">{activeAdmission.doctor_name}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <BedDouble className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Bed Type</span>
                            <span className="font-semibold text-slate-800">{activeAdmission.ward_name}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Expected Discharge
                            </span>
                            <span className="font-semibold text-slate-800">
                              {activeAdmission.expected_discharge
                                ? new Date(activeAdmission.expected_discharge).toLocaleDateString([], {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '02 Oct 2025'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                            <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              {activeAdmission.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Current Diagnosis with Edit */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700">Current Diagnosis</span>
                          {isEditingDiagnosis ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={handleSaveDiagnosis}
                                className="text-teal-600 hover:text-teal-800 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                onClick={() => setIsEditingDiagnosis(false)}
                                className="text-slate-400 hover:text-slate-600 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditingDiagnosis(true)}
                              className="text-teal-600 hover:text-teal-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>

                        {isEditingDiagnosis ? (
                          <input
                            type="text"
                            value={tempDiagnosis}
                            onChange={(e) => setTempDiagnosis(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-500 bg-white font-medium focus:outline-none"
                          />
                        ) : (
                          <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {activeAdmission.diagnosis}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {inspectorTab === 'Clinical Details' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Complaints</span>
                        <p className="text-slate-700 mt-0.5">{activeAdmission.chief_complaint || 'None recorded'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Admission Type</span>
                        <p className="text-slate-700 mt-0.5">{activeAdmission.admission_type}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Orders Count</span>
                        <p className="text-slate-700 mt-0.5">{doctorOrders.length} orders currently active</p>
                      </div>
                    </div>
                  )}

                  {inspectorTab === 'Vitals' && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</span>
                          <strong className="text-slate-900 block font-mono text-sm">118 / 78 mmHg</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate</span>
                          <strong className="text-slate-900 block font-mono text-sm">72 bpm</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">SpO2 Oxygen</span>
                          <strong className="text-emerald-700 block font-mono text-sm">99% Room Air</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Temperature</span>
                          <strong className="text-slate-900 block font-mono text-sm">98.4 °F</strong>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 block text-right">
                        Last logged: Today 06:00 AM by Nurse Shanthi
                      </span>
                    </div>
                  )}

                  {inspectorTab === 'Notes' && (
                    <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                      {clinicalNotes.length === 0 ? (
                        <div className="text-slate-400 text-center py-4">No notes recorded yet.</div>
                      ) : (
                        clinicalNotes.map((n) => (
                          <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span className="font-bold text-slate-800">{n.author_name} ({n.author_role})</span>
                              <span>{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-700 font-medium">{n.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {inspectorTab === 'History' && (
                    <div className="space-y-2 text-xs">
                      <div className="text-[11px] text-slate-500">
                        Patient admitted to Bed {activeAdmission.bed_number} on{' '}
                        {new Date(activeAdmission.admission_date).toLocaleString()}.
                      </div>
                    </div>
                  )}

                  {/* QUICK ACTIONS 3x2 GRID */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 block">Quick Actions</span>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Update Bed */}
                      <button
                        onClick={() => {
                          if (selectedBed) {
                            setTargetBedForUpdate(selectedBed);
                            setIsUpdateBedModalOpen(true);
                          }
                        }}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <BedDouble className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Update Bed</span>
                      </button>

                      {/* Transfer Patient */}
                      <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Transfer Patient</span>
                      </button>

                      {/* Discharge */}
                      <button
                        onClick={() => setIsDischargeModalOpen(true)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>Discharge</span>
                      </button>

                      {/* Add Notes */}
                      <button
                        onClick={() => setIsAddNotesModalOpen(true)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>Add Notes</span>
                      </button>

                      {/* View Orders */}
                      <button
                        onClick={() => setIsViewOrdersModalOpen(true)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>View Orders</span>
                      </button>

                      {/* Print Summary */}
                      <button
                        onClick={() => setIsPrintSummaryModalOpen(true)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>Print Summary</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty / Available Bed Details */
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <BedDouble className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Bed {selectedBed ? selectedBed.bed_number : 'G-01'} is {selectedBed?.status || 'Available'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      No active inpatient is assigned to this bed currently.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsAdmitModalOpen(true)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Admit Patient into this Bed</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'Patient List' ? (
          /* TAB 2: INPATIENT PATIENT LIST */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Active Inpatient Census ({admissions.filter((a) => a.status === 'Active').length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Bed & Ward</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Sovereign HealthID</th>
                    <th className="py-3 px-4">Consultant</th>
                    <th className="py-3 px-4">Diagnosis</th>
                    <th className="py-3 px-4">Admission Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissions
                    .filter((a) => a.status === 'Active')
                    .map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-teal-800">
                          Bed {adm.bed_number}
                          <span className="text-[10px] text-slate-400 font-normal block">{adm.ward_name}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {adm.patient_name}
                          <span className="text-[10px] text-slate-400 font-normal block">
                            {adm.patient_age}y / {adm.patient_gender}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">{adm.patient_health_id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{adm.doctor_name}</td>
                        <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">{adm.diagnosis}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(adm.admission_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {adm.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedBedNumber(adm.bed_number);
                              setActiveTab('Bed Overview');
                            }}
                            className="text-teal-700 hover:text-teal-900 font-bold text-xs"
                          >
                            Inspect Bed
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'Admissions' ? (
          /* TAB 3: ADMISSIONS LOG */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Hospital Admissions Registry</h3>
              <button
                onClick={() => setIsAdmitModalOpen(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
              >
                + New Admission
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Adm Number</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">HealthID</th>
                    <th className="py-3 px-4">Bed Assigned</th>
                    <th className="py-3 px-4">Admission Type</th>
                    <th className="py-3 px-4">Consultant</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{adm.admission_number}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{adm.patient_name}</td>
                      <td className="py-3 px-4 font-mono text-teal-700">{adm.patient_health_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">Bed {adm.bed_number}</td>
                      <td className="py-3 px-4 text-slate-600">{adm.admission_type}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{adm.doctor_name}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(adm.admission_date).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {adm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'Discharges' ? (
          /* TAB 4: DISCHARGES LOG */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Discharged Inpatients Archive</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">HealthID</th>
                    <th className="py-3 px-4">Bed Released</th>
                    <th className="py-3 px-4">Admission Date</th>
                    <th className="py-3 px-4">Discharge Date</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Billing Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissions
                    .filter((a) => a.status === 'Discharged')
                    .map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{adm.patient_name}</td>
                        <td className="py-3 px-4 font-mono text-teal-700">{adm.patient_health_id}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">Bed {adm.bed_number}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(adm.admission_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">
                          {adm.actual_discharge
                            ? new Date(adm.actual_discharge).toLocaleDateString()
                            : 'Discharged'}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-semibold">
                          {adm.discharge_summary?.dischargeCondition || 'Clinically Improved'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cleared
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {admissions.filter((a) => a.status === 'Discharged').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No patients discharged in the current session yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 5: TRANSFER REQUESTS */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Inpatient Bed Transfers History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">HealthID</th>
                    <th className="py-3 px-4">From Bed</th>
                    <th className="py-3 px-4">To Bed</th>
                    <th className="py-3 px-4">Clinical Reason</th>
                    <th className="py-3 px-4">Authorized By</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{tr.patient_name}</td>
                      <td className="py-3 px-4 font-mono text-teal-700">{tr.patient_health_id}</td>
                      <td className="py-3 px-4 font-bold text-rose-700">Bed {tr.from_bed_number}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">Bed {tr.to_bed_number}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{tr.transfer_reason}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{tr.authorized_by}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(tr.transferred_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {tr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transfers.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No transfer requests logged yet. Use Transfer Patient quick action to move patient beds.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AdmitPatientModal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
        defaultBedNumber={selectedBedNumber}
      />

      <BedAllocationModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
      />

      <TransferPatientModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
        admission={activeAdmission}
      />

      <DischargePatientModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
        admission={activeAdmission}
      />

      <UpdateBedModal
        isOpen={isUpdateBedModalOpen}
        onClose={() => {
          setIsUpdateBedModalOpen(false);
          setTargetBedForUpdate(null);
        }}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
        bed={targetBedForUpdate || selectedBed}
      />

      <AddClinicalNotesModal
        isOpen={isAddNotesModalOpen}
        onClose={() => setIsAddNotesModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
        admission={activeAdmission}
      />

      <ViewOrdersModal
        isOpen={isViewOrdersModalOpen}
        onClose={() => setIsViewOrdersModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg);
          refreshData();
        }}
        admission={activeAdmission}
      />

      <PrintSummaryModal
        isOpen={isPrintSummaryModalOpen}
        onClose={() => setIsPrintSummaryModalOpen(false)}
        admission={activeAdmission}
      />
    </div>
  );
};
