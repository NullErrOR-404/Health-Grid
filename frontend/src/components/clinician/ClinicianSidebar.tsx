import React from 'react';
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Share2,
  Inbox,
  MessageSquare,
  BookOpen,
  Layers,
  FileCheck2,
  Settings,
  HelpCircle,
  Activity,
  HeartPulse,
  LogOut,
} from 'lucide-react';
import type { ClinicianPortalTab } from '../../types/clinician';
import { clinicianStore } from '../../services/clinician/clinicianWorkflowStore';

interface ClinicianSidebarProps {
  activeTab: ClinicianPortalTab;
  onSelectTab: (tab: ClinicianPortalTab) => void;
  onExitPortal?: () => void;
}

export const ClinicianSidebar: React.FC<ClinicianSidebarProps> = ({
  activeTab,
  onSelectTab,
  onExitPortal,
}) => {
  const storeState = clinicianStore.getState();
  const unreadInboxCount = storeState.inbox.filter((i) => !i.isRead).length;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none h-screen sticky top-0">
      {/* Top Brand */}
      <div>
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                HealthGrid
              </div>
              <span className="text-[11px] font-semibold text-teal-700 tracking-wide uppercase">
                Clinician Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* MY WORK */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              My Work
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => onSelectTab('my-queue')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'my-queue'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className={`w-4 h-4 ${activeTab === 'my-queue' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>My Queue</span>
                </div>
                <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-teal-100/80 text-teal-800">
                  4
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('appointments')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'appointments'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className={`w-4 h-4 ${activeTab === 'appointments' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Appointments</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('patients')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'patients'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === 'patients' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>My Patients</span>
              </button>
            </div>
          </div>

          {/* CLINICAL */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Clinical
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => onSelectTab('consultations')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'consultations'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'consultations' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Consultations</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('follow-ups')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'follow-ups'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className={`w-4 h-4 ${activeTab === 'follow-ups' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>Follow-ups</span>
                </div>
                <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800">
                  2 due
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('referrals')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'referrals'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Share2 className={`w-4 h-4 ${activeTab === 'referrals' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Referrals</span>
              </button>
            </div>
          </div>

          {/* COMMUNICATION */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Communication
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => onSelectTab('inbox')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className={`w-4 h-4 ${activeTab === 'inbox' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>Inbox</span>
                </div>
                {unreadInboxCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {unreadInboxCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('messages')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className={`w-4 h-4 ${activeTab === 'messages' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Messages</span>
              </button>
            </div>
          </div>

          {/* TOOLS */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Tools
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => onSelectTab('templates')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'templates'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileCheck2 className={`w-4 h-4 ${activeTab === 'templates' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Templates</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('order-sets')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'order-sets'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'order-sets' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Order Sets</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('guidelines')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'guidelines'
                    ? 'bg-teal-50 text-teal-800 shadow-xs border-l-3 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeTab === 'guidelines' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Clinical Guidelines</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Pinned Items */}
      <div className="p-3 border-t border-slate-100 bg-white space-y-1">
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings' ? 'text-teal-700 bg-teal-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('help')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'help' ? 'text-teal-700 bg-teal-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        {onExitPortal && (
          <button
            type="button"
            onClick={onExitPortal}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all mt-1"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Exit to Patient App</span>
          </button>
        )}
      </div>
    </aside>
  );
};
