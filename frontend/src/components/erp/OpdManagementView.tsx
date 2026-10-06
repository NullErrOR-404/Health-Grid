import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Stethoscope,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Footprints,
  FileText,
  Activity,
  Pill,
  CreditCard,
  AlertTriangle,
  Droplets,
  Heart,
  Calendar,
  Check,
} from 'lucide-react';
import {
  unifiedPatientStore,
  type OpdQueueItem,
  type UnifiedPatient,
} from '../../services/unifiedPatientStore';
import { OpdRegistrationModal } from './modals/OpdRegistrationModal';
import { WalkInModal } from './modals/WalkInModal';
import { TodayReportsModal } from './modals/TodayReportsModal';
import { AddVitalsModal } from './modals/AddVitalsModal';
import { AddPrescriptionModal } from './modals/AddPrescriptionModal';
import { GenerateBillModal } from './modals/GenerateBillModal';
import { StartConsultationModal } from './modals/StartConsultationModal';
import { EditClinicalInfoModal } from './modals/EditClinicalInfoModal';

interface OpdManagementViewProps {
  initialPatientId?: string;
  triggerToast: (msg: string) => void;
}

export const OpdManagementView: React.FC<OpdManagementViewProps> = ({
  initialPatientId,
  triggerToast,
}) => {
  const [queue, setQueue] = useState<OpdQueueItem[]>(() =>
    unifiedPatientStore.getOpdQueue()
  );
  const [stats, setStats] = useState(() => unifiedPatientStore.getStats());

  useEffect(() => {
    const unsub = unifiedPatientStore.subscribe(() => {
      setQueue(unifiedPatientStore.getOpdQueue());
      setStats(unifiedPatientStore.getStats());
    });
    return unsub;
  }, []);

  const [selectedToken, setSelectedToken] = useState<number>(() => {
    if (initialPatientId) {
      const q = unifiedPatientStore.getOpdQueue().find((item) => item.patientId === initialPatientId);
      if (q) return q.token;
    }
    return 1;
  });

  const [activeQueueTab, setActiveQueueTab] = useState<'today' | 'consultation' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortBy, setSortBy] = useState('token');
  const [selectedRightTab, setSelectedRightTab] = useState<'Overview' | 'Consultation' | 'Prescriptions' | 'Reports' | 'History'>('Overview');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modals
  const [isNewRegistrationOpen, setIsNewRegistrationOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isTodayReportsOpen, setIsTodayReportsOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [editClinicalField, setEditClinicalField] = useState<'allergies' | 'bloodGroup' | 'chronicConditions' | null>(null);

  // Filtered Queue
  const filteredQueue = queue
    .filter((item) => {
      // Tab filter
      if (activeQueueTab === 'consultation' && item.status !== 'In Consultation') return false;
      if (activeQueueTab === 'completed' && item.status !== 'Completed') return false;

      // Search query
      const q = searchQuery.toLowerCase();
      if (
        q &&
        !item.patientName.toLowerCase().includes(q) &&
        !item.uhid.toLowerCase().includes(q) &&
        !item.phone.includes(q) &&
        !item.tokenDisplay.includes(q)
      ) {
        return false;
      }

      // Dropdown filters
      if (selectedDept !== 'All Departments' && item.department !== selectedDept) return false;
      if (selectedDoctor !== 'All Doctors' && item.doctor !== selectedDoctor) return false;
      if (selectedStatus !== 'All Status' && item.status !== selectedStatus) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'wait') return b.waitingTimeMinutes - a.waitingTimeMinutes;
      if (sortBy === 'name') return a.patientName.localeCompare(b.patientName);
      return a.token - b.token;
    });

  const selectedQueueItem =
    queue.find((q) => q.token === selectedToken) || queue[0];
  const selectedPatient: UnifiedPatient | undefined = selectedQueueItem
    ? unifiedPatientStore.getPatientById(selectedQueueItem.patientId)
    : undefined;

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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Checked In
        </span>
      );
    }
    if (status === 'Waiting') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          Waiting
        </span>
      );
    }
    if (status === 'In Consultation') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          In Consultation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        Completed
      </span>
    );
  };

  const handleUpdateStatus = (newStatus: 'Checked In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled') => {
    if (!selectedQueueItem) return;
    unifiedPatientStore.updateOpdStatus(selectedQueueItem.token, newStatus);
    setIsStatusDropdownOpen(false);
    triggerToast(`Updated token #${selectedQueueItem.tokenDisplay} status to: ${newStatus}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] overflow-y-auto">
      {/* SECTION HEADER WITH ACTION BUTTONS */}
      <div className="p-4 lg:px-7 lg:pt-6 lg:pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            OPD Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage today&apos;s OPD patients, queue, consultations and prescriptions in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* New OPD Registration (Primary Teal) */}
          <button
            onClick={() => setIsNewRegistrationOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#007f6e] hover:bg-[#00695b] text-white rounded-xl text-xs font-black shadow-md shadow-teal-700/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New OPD Registration</span>
          </button>

          {/* Walk-in Patient (Outline) */}
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Footprints className="w-4 h-4 text-slate-500" />
            <span>Walk-in Patient</span>
          </button>

          {/* Today's Reports (Outline) */}
          <button
            onClick={() => setIsTodayReportsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Today&apos;s Reports</span>
          </button>
        </div>
      </div>

      {/* 4 DYNAMIC STAT CARDS */}
      <div className="px-4 lg:px-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Total OPD Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total OPD Patients</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalOpdToday}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span>↑ 12%</span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Currently Waiting */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Currently Waiting</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.currentlyWaiting}</div>
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Avg. wait 28 mins</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: In Consultation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">In Consultation</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.inConsultation}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Completed Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Completed Today</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.completedToday}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span>↑ 8%</span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: QUEUE TABLE (LEFT) + QUEUE INSPECTOR (RIGHT) */}
      <div className="px-4 lg:px-7 pb-6 grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* LEFT COLUMN: OPD QUEUE TABLE */}
        <div className="xl:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* QUEUE STATUS TABS HEADER */}
          <div className="px-5 pt-4 border-b border-slate-100 flex items-center gap-6 text-xs font-bold text-slate-500">
            <button
              onClick={() => setActiveQueueTab('today')}
              className={`pb-3 transition-colors relative ${
                activeQueueTab === 'today'
                  ? 'text-teal-700 font-black'
                  : 'hover:text-slate-800'
              }`}
            >
              Today&apos;s Queue ({queue.length})
              {activeQueueTab === 'today' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveQueueTab('consultation')}
              className={`pb-3 transition-colors relative ${
                activeQueueTab === 'consultation'
                  ? 'text-teal-700 font-black'
                  : 'hover:text-slate-800'
              }`}
            >
              In Consultation ({stats.inConsultation})
              {activeQueueTab === 'consultation' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveQueueTab('completed')}
              className={`pb-3 transition-colors relative ${
                activeQueueTab === 'completed'
                  ? 'text-teal-700 font-black'
                  : 'hover:text-slate-800'
              }`}
            >
              Completed ({stats.completedToday})
              {activeQueueTab === 'completed' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          </div>

          {/* FILTER CONTROLS BAR */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, UHID, phone, token number..."
                className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
              <button className="absolute right-3 text-slate-400 hover:text-slate-600 p-1">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Granular Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Departments">All Departments</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Gynaecology">Gynaecology</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Nephrology">Nephrology</option>
              </select>

              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Doctors">All Doctors</option>
                <option value="Dr. Mohamed">Dr. Mohamed</option>
                <option value="Dr. Revathi">Dr. Revathi</option>
                <option value="Dr. Arjun">Dr. Arjun</option>
                <option value="Dr. Priya">Dr. Priya</option>
                <option value="Dr. Karthik">Dr. Karthik</option>
                <option value="Dr. Nivetha">Dr. Nivetha</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Status">All Status</option>
                <option value="Checked In">Checked In</option>
                <option value="Waiting">Waiting</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="token">Sort by Token No.</option>
                <option value="wait">Sort by Wait Time</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* TABLE VIEW */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-3.5 w-10">
                    <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                  </th>
                  <th className="py-3 px-3 w-16">Token</th>
                  <th className="py-3 px-3">Patient Details</th>
                  <th className="py-3 px-3">Age / Gender</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 w-10 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item) => {
                  const isSelected = item.token === selectedToken;
                  const initials = getInitials(item.patientName);

                  return (
                    <tr
                      key={item.token}
                      onClick={() => setSelectedToken(item.token)}
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
                          onChange={() => setSelectedToken(item.token)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-black text-xs px-2 py-1 rounded-md ${
                            item.token === 1
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.tokenDisplay}
                        </span>
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
                            <div className="font-bold text-slate-900">{item.patientName}</div>
                            <div className="text-[11px] text-slate-500">UHID: {item.uhid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {item.age} / {item.gender}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {item.department}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {item.doctor}
                      </td>
                      <td className="py-3.5 px-3">
                        {getStatusBadge(item.status)}
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
              Showing 1-{Math.min(filteredQueue.length, 8)} of {queue.length} patients
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
                9
              </button>
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OPD PATIENT QUEUE INSPECTOR */}
        {selectedQueueItem && (
          <div className="xl:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* INSPECTOR HEADER */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm">
                    {getInitials(selectedQueueItem.patientName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        {selectedQueueItem.patientName}
                      </h3>
                      {getStatusBadge(selectedQueueItem.status)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      UHID: <span className="font-semibold text-slate-700">{selectedQueueItem.uhid}</span> | {selectedQueueItem.visitNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Phone: <span className="font-semibold text-slate-700">{selectedQueueItem.phone}</span> | Age: {selectedQueueItem.age} | {selectedQueueItem.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* TABS HEADER */}
              <div className="flex items-center gap-4 mt-4 border-b border-slate-100 text-xs font-bold text-slate-500">
                {(['Overview', 'Consultation', 'Prescriptions', 'Reports', 'History'] as const).map((tab) => (
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
              {/* CURRENT VISIT CARD */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Current Visit</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Token No.</span>
                    <div className="text-base font-black text-teal-800">{selectedQueueItem.tokenDisplay}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Check-in Time</span>
                    <div className="font-bold text-slate-800">{selectedQueueItem.checkInTime}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Waiting Time</span>
                    <div className="font-bold text-amber-700">{selectedQueueItem.waitingTimeMinutes} mins</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-emerald-100/80">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Department</span>
                    <div className="font-bold text-slate-800 truncate">{selectedQueueItem.department}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Consulting Doctor</span>
                    <div className="font-bold text-slate-800 truncate">{selectedQueueItem.doctor}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Visit Type</span>
                    <div className="font-bold text-slate-800 truncate">{selectedQueueItem.visitType}</div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS SECTION */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Quick Actions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Start Consultation button */}
                  <button
                    onClick={() => setIsConsultationModalOpen(true)}
                    className="py-2.5 px-3 bg-[#007f6e] hover:bg-[#00695b] text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Start Consultation</span>
                  </button>

                  {/* Update Status Dropdown button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="w-full py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-colors shadow-xs"
                    >
                      <span>Update Status</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {isStatusDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-xs">
                        {(['Checked In', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(st)}
                            className="w-full text-left px-3 py-1.5 hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between"
                          >
                            <span>{st}</span>
                            {selectedQueueItem.status === st && <Check className="w-3.5 h-3.5 text-teal-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 Action Mini Buttons: Add Vitals, Add Prescription, Generate Bill */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => setIsVitalsModalOpen(true)}
                    className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-[11px] font-bold text-slate-700 hover:text-teal-800 flex items-center justify-center gap-1 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Add Vitals</span>
                  </button>

                  <button
                    onClick={() => setIsPrescriptionModalOpen(true)}
                    className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-[11px] font-bold text-slate-700 hover:text-teal-800 flex items-center justify-center gap-1 transition-all"
                  >
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>Add Prescription</span>
                  </button>

                  <button
                    onClick={() => setIsBillModalOpen(true)}
                    className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-[11px] font-bold text-slate-700 hover:text-teal-800 flex items-center justify-center gap-1 transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                    <span>Generate Bill</span>
                  </button>
                </div>
              </div>

              {/* PATIENT ALERTS */}
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Patient Alerts</span>
                  </div>
                  <button
                    onClick={() => setEditClinicalField('allergies')}
                    className="text-[11px] font-bold text-rose-700 hover:underline"
                  >
                    + Add
                  </button>
                </div>
                <div className="text-xs text-slate-700 font-semibold">
                  {selectedPatient?.allergies.join(', ') || 'No known allergies'}
                </div>
              </div>

              {/* 2 MINI BADGES: Blood Group & Chronic Conditions */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Blood Group</div>
                      <div className="text-xs font-black text-slate-900">{selectedPatient?.bloodGroup || 'B+'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditClinicalField('bloodGroup')}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Chronic Conditions</div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
                        {selectedPatient?.chronicConditions.join(', ') || 'None reported'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditClinicalField('chronicConditions')}
                    className="text-[11px] font-bold text-teal-700 hover:underline"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <OpdRegistrationModal
        isOpen={isNewRegistrationOpen}
        onClose={() => setIsNewRegistrationOpen(false)}
        onRegistered={(newItem) => {
          setSelectedToken(newItem.token);
          triggerToast(`Registered OPD token #${newItem.tokenDisplay} for ${newItem.patientName}`);
        }}
      />

      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onRegistered={(newItem) => {
          setSelectedToken(newItem.token);
          triggerToast(`Walk-in Token #${newItem.tokenDisplay} issued for ${newItem.patientName}`);
        }}
      />

      <TodayReportsModal
        isOpen={isTodayReportsOpen}
        onClose={() => setIsTodayReportsOpen(false)}
      />

      {isVitalsModalOpen && selectedPatient && (
        <AddVitalsModal
          isOpen={true}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onClose={() => setIsVitalsModalOpen(false)}
          onVitalsSaved={() => triggerToast(`Vitals recorded & synced to ${selectedPatient.name}'s health memory`)}
        />
      )}

      {isPrescriptionModalOpen && selectedPatient && (
        <AddPrescriptionModal
          isOpen={true}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSaved={() => triggerToast(`Prescription logged & forwarded to hospital dispensary`)}
        />
      )}

      {isBillModalOpen && selectedPatient && (
        <GenerateBillModal
          isOpen={true}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onClose={() => setIsBillModalOpen(false)}
          onBilled={() => triggerToast(`Invoice generated & hospital revenue updated`)}
        />
      )}

      {isConsultationModalOpen && selectedPatient && selectedQueueItem && (
        <StartConsultationModal
          isOpen={true}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          department={selectedQueueItem.department}
          token={selectedQueueItem.token}
          onClose={() => setIsConsultationModalOpen(false)}
          onCompleted={() => triggerToast(`Consultation finished & token #${selectedQueueItem.tokenDisplay} marked completed`)}
        />
      )}

      {editClinicalField && selectedPatient && (
        <EditClinicalInfoModal
          isOpen={true}
          patient={selectedPatient}
          field={editClinicalField}
          onClose={() => setEditClinicalField(null)}
          onSaved={() => triggerToast('Clinical records updated')}
        />
      )}
    </div>
  );
};
