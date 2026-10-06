import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Search,
  Bell,
  ChevronDown,
  CalendarDays,
  Plus,
  Users,
  Bed,
  FlaskConical,
  Pill,
  IndianRupee,
  LayoutDashboard,
  UserCheck,
  Stethoscope,
  AlertTriangle,
  Activity,
  Syringe,
  Microscope,
  Radiation,
  Scissors,
  Droplets,
  CreditCard,
  Shield,
  ShoppingCart,
  Boxes,
  Wrench,
  UserCog,
  BarChart3,
  Settings,
  ShieldAlert,
  ArrowUpRight,
  LogOut,
  X,
  CheckCircle2,
  Sparkles,
  Menu,
} from 'lucide-react';
import { type HospitalEntity, getHospitalsList } from '../../data/hospitalsList';
import {
  getHospitalUserspace,
  registerPatientInUserspace,
  bookAppointmentInUserspace,
  admitPatientInUserspace,
  type HospitalUserspaceData,
} from '../../services/hospitalUserspaceService';
import { PatientManagementView } from './PatientManagementView';
import { OpdManagementView } from './OpdManagementView';

interface HospitalErpDashboardProps {
  initialHospital?: HospitalEntity;
  adminName?: string;
  onExit: () => void;
}

export const HospitalErpDashboard: React.FC<HospitalErpDashboardProps> = ({
  initialHospital,
  adminName = 'Admin Ravi',
  onExit,
}) => {
  const hospitals = getHospitalsList();
  const [currentHospital, setCurrentHospital] = useState<HospitalEntity>(
    initialHospital || hospitals[0] || {
      id: 'hosp-1',
      code: 'HG-H001',
      name: 'City Care Hospital',
      city: 'Chennai',
      state: 'Tamil Nadu',
      type: 'Multi-Specialty Tertiary Hospital',
      totalBeds: 120,
      availableBeds: 24,
      adminName: 'Admin Ravi',
      adminEmail: 'ravi.admin@citycare.in',
    }
  );

  const [userspace, setUserspace] = useState<HospitalUserspaceData>(() =>
    getHospitalUserspace(
      currentHospital.code,
      currentHospital.name,
      currentHospital.totalBeds,
      currentHospital.availableBeds
    )
  );

  useEffect(() => {
    setUserspace(
      getHospitalUserspace(
        currentHospital.code,
        currentHospital.name,
        currentHospital.totalBeds,
        currentHospital.availableBeds
      )
    );
  }, [currentHospital.code, currentHospital.name, currentHospital.totalBeds, currentHospital.availableBeds]);

  const [activeMenu, setActiveMenu] = useState('Patient Management');
  const [selectedOpdPatientId, setSelectedOpdPatientId] = useState<string | undefined>(undefined);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isHospitalSwitcherOpen, setIsHospitalSwitcherOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);
  const [qaPatientName, setQaPatientName] = useState('');
  const [qaPatientPhone, setQaPatientPhone] = useState('');
  const [qaPatientDept, setQaPatientDept] = useState('');
  const [qaPatientDoctor, setQaPatientDoctor] = useState('');
  const [qaPatientAge, setQaPatientAge] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navSections = [
    {
      category: 'MAIN',
      items: [{ id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      category: 'PATIENT CARE',
      items: [
        { id: 'Patient Management', label: 'Patient Management', icon: Users },
        { id: 'OPD Management', label: 'OPD Management', icon: UserCheck },
        { id: 'IPD & Bed Management', label: 'IPD & Bed Management', icon: Bed },
        { id: 'Appointments', label: 'Appointments', icon: CalendarDays },
        { id: 'Emergency', label: 'Emergency', icon: AlertTriangle },
      ],
    },
    {
      category: 'CLINICAL',
      items: [
        { id: 'Doctors & OPD', label: 'Doctors & OPD', icon: Stethoscope },
        { id: 'Nursing', label: 'Nursing', icon: Syringe },
        { id: 'Laboratory (LIS)', label: 'Laboratory (LIS)', icon: Microscope },
        { id: 'Radiology (RIS)', label: 'Radiology (RIS)', icon: Radiation },
        { id: 'Pharmacy', label: 'Pharmacy', icon: Pill },
        { id: 'Operation Theatre', label: 'Operation Theatre', icon: Scissors },
        { id: 'Blood Bank', label: 'Blood Bank', icon: Droplets },
      ],
    },
    {
      category: 'FINANCE & OPERATIONS',
      items: [
        { id: 'Billing & Payments', label: 'Billing & Payments', icon: CreditCard },
        { id: 'Insurance & TPA', label: 'Insurance & TPA', icon: Shield },
        { id: 'Procurement', label: 'Procurement', icon: ShoppingCart },
        { id: 'Inventory & Stores', label: 'Inventory & Stores', icon: Boxes },
        { id: 'Assets & Maintenance', label: 'Assets & Maintenance', icon: Wrench },
        { id: 'HR & Staff Management', label: 'HR & Staff Management', icon: UserCog },
        { id: 'Reports & Analytics', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      category: 'ADMINISTRATION',
      items: [
        { id: 'Hospital Settings', label: 'Hospital Settings', icon: Settings },
        { id: 'Audit Logs', label: 'Audit Logs', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[200] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APP BAR */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Logo & Brand & Mobile Nav Toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 cursor-pointer"
            aria-label="Open ERP Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30 flex-shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none block">
                HealthGrid
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-none block mt-0.5">
                Hospital Management
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, staff, appointments, or menu..."
              className="w-full pl-10 pr-12 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300/60">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right Action Icons & Profiles */}
        <div className="flex items-center gap-2.5">
          {/* Live Date & Time Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
            <span>Mon, 29 Sep 2025 | 10:24 AM</span>
          </div>

          {/* Notifications */}
          <button
            onClick={() => triggerToast('1 new emergency alert: Trauma triage in casualty.')}
            className="relative w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              1
            </span>
          </button>

          {/* Dr. Mohamed / Hospital Switcher Profile Chip */}
          <div className="relative">
            <button
              onClick={() => setIsHospitalSwitcherOpen(!isHospitalSwitcherOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-left transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                DM
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Dr. Mohamed
                </div>
                <div className="text-[10px] text-slate-500 leading-none">
                  {currentHospital.name}, {currentHospital.city}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isHospitalSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Partner Facilities &amp; Hospitals
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {hospitals.map((hosp) => (
                    <button
                      key={hosp.id}
                      onClick={() => {
                        setCurrentHospital(hosp);
                        setIsHospitalSwitcherOpen(false);
                        triggerToast(`Switched active view to ${hosp.name}`);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 transition-colors ${
                        hosp.id === currentHospital.id ? 'bg-teal-50/70' : ''
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{hosp.name}</div>
                        <div className="text-[10px] text-slate-400">{hosp.city}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded">
                        {hosp.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SOS Ambulance Button */}
          <button
            onClick={() => triggerToast('Emergency 108 Ambulance alert dispatched to nearest PHC/Casualty.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl text-xs font-black shadow-sm shadow-rose-500/30 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOS Ambulance</span>
          </button>

          {/* Exit / Return to Citizen Portal */}
          <button
            onClick={onExit}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Return to HealthGrid Home"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER & BACKDROP */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-sm text-slate-900 leading-none block">ERP Menu</span>
                  <span className="text-[10px] text-slate-400 font-mono">{currentHospital.code}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav sections list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 safe-area-pb">
              {navSections.map((sec, secIdx) => (
                <div key={secIdx}>
                  {sec.category !== 'MAIN' && (
                    <div className="px-3 mb-1 text-[10px] font-extrabold text-slate-400 tracking-wider">
                      {sec.category}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenu === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveMenu(item.id);
                            setIsMobileNavOpen(false);
                            if (item.id !== 'Dashboard') {
                              triggerToast(`Switched workspace tab to: ${item.label}`);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-teal-50 text-teal-700 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT: SIDEBAR + DASHBOARD CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between hidden md:flex overflow-y-auto">
          <div className="p-3 space-y-6">
            {navSections.map((sec, secIdx) => (
              <div key={secIdx}>
                {sec.category !== 'MAIN' && (
                  <div className="px-3 mb-1.5 text-[10px] font-extrabold text-slate-400 tracking-wider">
                    {sec.category}
                  </div>
                )}
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenu(item.id);
                          if (item.id !== 'Dashboard') {
                            triggerToast(`Switched workspace tab to: ${item.label}`);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-teal-50 text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onExit}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-slate-400" />
                Return to HealthGrid Home
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </aside>

        {/* CONDITIONAL WORKSPACE BODY */}
        {activeMenu === 'Patient Management' ? (
          <PatientManagementView
            onNavigateToOpdWithPatient={(patId) => {
              setSelectedOpdPatientId(patId);
              setActiveMenu('OPD Management');
            }}
            triggerToast={triggerToast}
          />
        ) : activeMenu === 'OPD Management' || activeMenu === 'OPD / Consultations' ? (
          <OpdManagementView
            initialPatientId={selectedOpdPatientId}
            triggerToast={triggerToast}
          />
        ) : (
          <main className="flex-1 overflow-y-auto p-4 lg:p-7 space-y-6">
          {/* Header Row: Greeting & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight">
                Good Morning, {adminName.split(' ')[1] || adminName}
              </h1>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Here&apos;s what&apos;s happening at <span className="font-semibold text-slate-700">{currentHospital.name}</span> today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Pill */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                <CalendarDays className="w-4 h-4 text-teal-600" />
                <span>Mon, 02 Oct 2026</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setQuickActionModal('register')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Patient</span>
              </button>

              <button
                onClick={() => setQuickActionModal('appointment')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={() => setQuickActionModal('admit')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Admit Patient</span>
              </button>
            </div>
          </div>

          {/* 6 TOP KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Card 1: OPD Visits */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">OPD Visits</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{userspace.metrics.todayOpd}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 12% <span className="text-slate-400 font-normal">vs yesterday</span>
                </span>
                <svg className="w-12 h-4 text-sky-500" viewBox="0 0 50 16" fill="none">
                  <path d="M1 12 C10 15, 20 2, 35 8 C42 12, 47 4, 49 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: IPD Patients */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">IPD Patients</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Bed className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{userspace.metrics.ipdPatients}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-0.5">
                  ↑ 5% <span className="text-slate-400 font-normal">vs yesterday</span>
                </span>
                <svg className="w-12 h-4 text-rose-400" viewBox="0 0 50 16" fill="none">
                  <path d="M1 14 C12 6, 25 15, 38 7 C44 3, 47 6, 49 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Available Beds */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Available Beds</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Bed className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {userspace.metrics.availableBeds} <span className="text-xs font-medium text-slate-400">/ {userspace.metrics.totalBeds}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${userspace.metrics.occupancyPercentage}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-1">
                  <span>{userspace.metrics.occupancyPercentage}% Occupancy</span>
                </div>
              </div>
            </div>

            {/* Card 4: Lab Orders */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Lab Orders</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{userspace.metrics.labOrdersTotal}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>
                  <strong className="text-slate-800">{userspace.metrics.labOrdersPending}</strong> pending • <strong className="text-emerald-600">{userspace.metrics.labOrdersCompleted}</strong> done
                </span>
                <div className="flex items-end gap-1 h-3">
                  <div className="w-1 bg-purple-300 h-1.5 rounded-t"></div>
                  <div className="w-1 bg-purple-400 h-2.5 rounded-t"></div>
                  <div className="w-1 bg-purple-600 h-3 rounded-t"></div>
                </div>
              </div>
            </div>

            {/* Card 5: Pharmacy Stock Alerts */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Pharmacy Alerts</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{userspace.metrics.pharmacyAlerts}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-amber-600">
                <span>Low stock items</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              </div>
            </div>

            {/* Card 6: Today's Revenue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Today&apos;s Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{userspace.metrics.todayRevenue}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-emerald-600">
                  {userspace.metrics.revenueVsYesterday}
                </span>
                <div className="flex items-end gap-1 h-3">
                  <div className="w-1 bg-emerald-300 h-2 rounded-t"></div>
                  <div className="w-1 bg-emerald-400 h-2.5 rounded-t"></div>
                  <div className="w-1 bg-emerald-600 h-3 rounded-t"></div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE 3-PANEL GRID: Appointments, Bed Occupancy, Department Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* PANEL 1: Today's Appointments (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Today&apos;s Appointments</h2>
                <button
                  onClick={() => triggerToast('Viewing all 42 registered appointments')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {userspace.appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-medium text-slate-400 w-16">
                        {appt.time}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {appt.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{appt.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {appt.dept} • <span className="font-medium text-slate-700">{appt.doctor}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${appt.statusColor}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL 2: Bed Occupancy Donut (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-900">Bed Occupancy</h2>
                <button
                  onClick={() => triggerToast(`Ward bed map: ${userspace.metrics.availableBeds} available of ${userspace.metrics.totalBeds} total beds`)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View Details →
                </button>
              </div>

              {/* Donut Chart Simulation */}
              <div className="my-auto py-2 flex flex-col items-center justify-center relative">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  {/* Occupied Slice (Coral / Red) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#f87171"
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - userspace.metrics.occupancyPercentage / 100)}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Available Slice (Teal) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#2dd4bf"
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (userspace.metrics.occupancyPercentage / 100)}
                    fill="none"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{userspace.metrics.occupancyPercentage}%</span>
                  <span className="text-[10px] font-semibold text-slate-400">Occupied</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Occupied
                  </span>
                  <strong className="text-slate-900 text-xs">{userspace.metrics.totalBeds - userspace.metrics.availableBeds}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> Available
                  </span>
                  <strong className="text-slate-900 text-xs">{userspace.metrics.availableBeds}</strong>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>Total Facility Beds</span>
                  <span>{userspace.metrics.totalBeds}</span>
                </div>
              </div>
            </div>

            {/* PANEL 3: Department Activity (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Department Activity</h2>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <span>Today</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'General Medicine', count: 42, pct: 85, icon: Stethoscope },
                  { name: 'Pediatrics', count: 28, pct: 60, icon: Users },
                  { name: 'Orthopedics', count: 18, pct: 40, icon: Activity },
                  { name: 'Gynecology & Obs', count: 25, pct: 55, icon: HeartPulse },
                  { name: 'Cardiology', count: 20, pct: 45, icon: HeartPulse },
                  { name: 'Dermatology', count: 15, pct: 35, icon: Sparkles },
                  { name: 'ENT', count: 12, pct: 28, icon: Activity },
                  { name: 'Others', count: 28, pct: 60, icon: Users },
                ].map((dept, idx) => {
                  const DeptIcon = dept.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <DeptIcon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="w-36 text-slate-700 font-medium truncate">{dept.name}</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full"
                          style={{ width: `${dept.pct}%` }}
                        ></div>
                      </div>
                      <span className="w-6 text-right font-bold text-slate-800 text-[11px]">
                        {dept.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LOWER SECTION: Patient Flow Chart & Revenue Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Patient Flow Curve (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold text-slate-900">Patient Flow</h2>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span> OPD
                    </span>
                    <span className="flex items-center gap-1.5 text-teal-600">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span> IPD
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <span>Today</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Patient Flow SVG Line Chart */}
              <div className="h-44 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                  {/* OPD Line (Blue) */}
                  <path
                    d="M 10 90 Q 60 70 120 40 T 220 30 T 320 60 T 400 35 T 480 80"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* IPD Line (Teal) */}
                  <path
                    d="M 10 100 Q 60 90 120 75 T 220 70 T 320 85 T 400 70 T 480 95"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                  <span>8 AM</span>
                  <span>10 AM</span>
                  <span>12 PM</span>
                  <span>2 PM</span>
                  <span>4 PM</span>
                  <span>6 PM</span>
                  <span>8 PM</span>
                </div>
              </div>
            </div>

            {/* Revenue Overview (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ↑ 8% vs yesterday
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 mb-3">{userspace.metrics.todayRevenue}</div>

              <div className="space-y-2 text-xs">
                {userspace.metrics.revenueBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                      {item.label}
                    </span>
                    <strong className="text-slate-900 font-mono">{item.amount}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM 3-PANEL GRID: Pending Tasks, Recent Admissions, Critical Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Pending Tasks (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Pending Tasks</h2>
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {userspace.tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => triggerToast(`Viewing all ${userspace.tasks.length} operational work orders`)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2.5">
                {userspace.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-[10px] text-slate-400">{task.dept}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.color}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Admissions (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Recent Admissions</h2>
                <button
                  onClick={() => triggerToast(`Inpatient roster: ${userspace.admissions.length} active bed admissions`)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase">
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Age/Gen</th>
                      <th className="pb-2">Department</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {userspace.admissions.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-slate-900">{row.name}</td>
                        <td className="py-2.5 text-slate-500 font-mono text-[11px]">{row.age}</td>
                        <td className="py-2.5 text-slate-600">{row.dept}</td>
                        <td className="py-2.5 text-slate-400 font-mono text-[11px]">{row.time}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              row.status === 'In OT'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Critical Alerts (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Critical Alerts</h2>
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {userspace.alerts.length}
                  </span>
                </div>
                <button
                  onClick={() => triggerToast('Emergency incident response active')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {userspace.alerts.map((alert) => {
                  let AlertIcon = AlertTriangle;
                  let colorClass = 'text-rose-600 bg-rose-50';
                  if (alert.type === 'biomedical') {
                    AlertIcon = Wrench;
                    colorClass = 'text-amber-600 bg-amber-50';
                  } else if (alert.type === 'pharmacy') {
                    AlertIcon = Pill;
                    colorClass = 'text-rose-600 bg-rose-50';
                  } else if (alert.type === 'lab') {
                    AlertIcon = Microscope;
                    colorClass = 'text-amber-600 bg-amber-50';
                  }

                  return (
                    <div key={alert.id} className="flex items-start gap-2.5 text-xs">
                      <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0 mt-0.5`}>
                        <AlertIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 leading-snug">{alert.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{alert.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          </main>
        )}
      </div>

      {/* QUICK ACTION MODAL SIMULATOR */}
      {quickActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-none sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-md h-full sm:h-auto max-h-none sm:max-h-[92vh] flex flex-col overflow-y-auto shadow-2xl border-0 sm:border border-slate-100 animate-in zoom-in-95 safe-area-pb">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {quickActionModal === 'register' && 'Register New Patient'}
                {quickActionModal === 'appointment' && 'Book OPD Appointment'}
                {quickActionModal === 'admit' && 'Admit Inpatient to Ward'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setQuickActionModal(null);
                  setQaPatientName('');
                  setQaPatientPhone('');
                }}
                className="w-10 h-10 sm:w-7 sm:h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer flex-shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Operating in facility context: <strong className="text-slate-900">{currentHospital.name}</strong> ({currentHospital.code}).
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={qaPatientName}
                  onChange={(e) => setQaPatientName(e.target.value)}
                  placeholder="e.g. Anandha Kumar"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {quickActionModal === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone / HealthGrid ID</label>
                  <input
                    type="tel"
                    value={qaPatientPhone}
                    onChange={(e) => setQaPatientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {quickActionModal === 'appointment' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Specialty Department</label>
                    <input
                      type="text"
                      value={qaPatientDept}
                      onChange={(e) => setQaPatientDept(e.target.value)}
                      placeholder="e.g. OPD - Cardiology"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Doctor</label>
                    <input
                      type="text"
                      value={qaPatientDoctor}
                      onChange={(e) => setQaPatientDoctor(e.target.value)}
                      placeholder={currentHospital.code === 'HG-H002' ? 'Dr. K. Srinivasan' : 'Dr. Arjun Mehta'}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </>
              )}

              {quickActionModal === 'admit' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Age & Gender</label>
                    <input
                      type="text"
                      value={qaPatientAge}
                      onChange={(e) => setQaPatientAge(e.target.value)}
                      placeholder="e.g. 48 / M"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admitting Ward / Department</label>
                    <input
                      type="text"
                      value={qaPatientDept}
                      onChange={(e) => setQaPatientDept(e.target.value)}
                      placeholder="e.g. General Medicine Ward"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2.5 mt-5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setQuickActionModal(null);
                  setQaPatientName('');
                  setQaPatientPhone('');
                }}
                className="px-4 py-2 min-h-[44px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetName = qaPatientName.trim() || 'New Patient';
                  if (quickActionModal === 'register') {
                    const updated = registerPatientInUserspace(currentHospital.code, targetName);
                    setUserspace(updated);
                    triggerToast(`Patient "${targetName}" registered in ${currentHospital.name} registry.`);
                  } else if (quickActionModal === 'appointment') {
                    const dept = qaPatientDept.trim() || 'OPD - General Medicine';
                    const doc = qaPatientDoctor.trim() || (currentHospital.code === 'HG-H002' ? 'Dr. K. Srinivasan' : 'Dr. Arjun Mehta');
                    const updated = bookAppointmentInUserspace(currentHospital.code, targetName, dept, doc);
                    setUserspace(updated);
                    triggerToast(`Appointment booked for "${targetName}" with ${doc}.`);
                  } else if (quickActionModal === 'admit') {
                    const age = qaPatientAge.trim() || '45 / M';
                    const dept = qaPatientDept.trim() || 'Inpatient General Ward';
                    const updated = admitPatientInUserspace(currentHospital.code, targetName, age, dept);
                    setUserspace(updated);
                    triggerToast(`Patient "${targetName}" admitted to ${dept}. Bed allocated.`);
                  }
                  setQuickActionModal(null);
                  setQaPatientName('');
                  setQaPatientPhone('');
                  setQaPatientDept('');
                  setQaPatientDoctor('');
                  setQaPatientAge('');
                }}
                className="px-5 py-2 min-h-[44px] bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
