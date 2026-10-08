import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  MapPin,
  ChevronDown,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FileText,
  Share2,
} from 'lucide-react';
import { clinicianStore } from '../../services/clinician/clinicianWorkflowStore';
import type { PatientEntity } from '../../types/clinician';

interface ClinicianTopBarProps {
  onToggleAiDrawer: () => void;
  aiDrawerOpen: boolean;
  onOpenPatientChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
}

export const ClinicianTopBar: React.FC<ClinicianTopBarProps> = ({
  onToggleAiDrawer,
  aiDrawerOpen,
  onOpenPatientChart,
  onStartConsultation,
}) => {
  const [storeState, setStoreState] = useState(clinicianStore.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = clinicianStore.subscribe(() => {
      setStoreState({ ...clinicianStore.getState() });
    });
    return unsub;
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter patients by search query
  const matchingPatients: PatientEntity[] = searchQuery.trim()
    ? storeState.patients.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.abhaId.toLowerCase().includes(q)
        );
      })
    : [];

  const activeFacility =
    storeState.facilities.find((f) => f.id === storeState.selectedFacilityId) ||
    storeState.facilities[0];

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200/90 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Global Patient Search */}
      <div className="relative w-full max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search patient by name, UHID, phone or ABHA ID..."
            className="w-full h-10 pl-10 pr-16 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
          />
          <div className="absolute right-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200/90 px-1.5 py-0.5 rounded-md shadow-2xs pointer-events-none">
            <span>Ctrl K</span>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Matching Patients ({matchingPatients.length})
            </div>
            {matchingPatients.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No patient matching &quot;{searchQuery}&quot; found in database.
              </div>
            ) : (
              <div className="space-y-1">
                {matchingPatients.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pat.avatarUrl}
                        alt={pat.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {pat.name}
                          <span className="text-xs font-normal text-slate-500">
                            {pat.age}y • {pat.gender} • {pat.bloodGroup}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          UHID: <span className="font-semibold text-slate-700">{pat.uhid}</span> • ABHA: {pat.abhaId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onMouseDown={() => {
                          onOpenPatientChart(pat.id);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        Open Chart
                      </button>
                      <button
                        type="button"
                        onMouseDown={() => {
                          onStartConsultation(pat.id);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Start Visit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-bold text-slate-900">Clinical Notifications</span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-1 max-h-72 overflow-y-auto">
                <div className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Critical Lab Result</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">
                    Meena Iyer — Serum Potassium 6.2 mmol/L
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">15 mins ago</div>
                </div>

                <div className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Unsigned Clinical Note</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">
                    Arun Prakash — Encounter #4102 needs sign-off
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">45 mins ago</div>
                </div>

                <div className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 text-teal-600 text-xs font-bold">
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Specialist Report Received</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">
                    Priya Sharma — Hematology consult report
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">2 hours ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <button
          type="button"
          onClick={() => clinicianStore.setActiveTab('messages')}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors relative"
          title="Clinical Messages"
        >
          <MessageSquare className="w-5 h-5 text-slate-500" />
        </button>

        {/* Clinician Profile */}
        <div className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/80">
          <img
            src={storeState.clinician.avatarUrl}
            alt={storeState.clinician.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {storeState.clinician.name}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 leading-none">
              {storeState.clinician.specialty}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Facility Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-sky-50/70 hover:bg-sky-100/70 text-sky-900 rounded-xl border border-sky-200/80 transition-colors text-xs font-bold"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate max-w-[150px]">{activeFacility.name}</span>
            <ChevronDown className="w-3 h-3 text-sky-600 shrink-0" />
          </button>

          {isFacilityDropdownOpen && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Facility
              </div>
              <div className="space-y-1">
                {storeState.facilities.map((fac) => (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => {
                      clinicianStore.setSelectedFacility(fac.id);
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                      fac.id === activeFacility.id
                        ? 'bg-sky-50 text-sky-950 font-bold border border-sky-200/70'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${fac.id === activeFacility.id ? 'text-sky-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold leading-snug">{fac.name}</div>
                      <div className="text-[10px] font-normal text-slate-500">{fac.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Toggle Button */}
        <button
          type="button"
          onClick={onToggleAiDrawer}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            aiDrawerOpen
              ? 'bg-teal-600 text-white shadow-xs shadow-teal-600/30'
              : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
          }`}
          title="Toggle HealthGrid AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">HealthGrid AI</span>
        </button>
      </div>
    </header>
  );
};
