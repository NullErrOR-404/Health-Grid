import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  FileText,
  Users,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import { PatientQueueList } from './PatientQueueList';
import { NextPatientBriefCard } from './NextPatientBriefCard';
import { TodayScheduleWidget } from './TodayScheduleWidget';
import { FollowUpsDueWidget } from './FollowUpsDueWidget';
import { RecentResultsWidget } from './RecentResultsWidget';

interface MyQueueViewProps {
  onOpenPatientChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
}

export const MyQueueView: React.FC<MyQueueViewProps> = ({
  onOpenPatientChart,
  onStartConsultation,
}) => {
  const [storeState, setStoreState] = useState(clinicianStore.getState());

  useEffect(() => {
    const unsub = clinicianStore.subscribe(() => {
      setStoreState({ ...clinicianStore.getState() });
    });
    return unsub;
  }, []);

  const activePatient =
    storeState.patients.find((p) => p.id === storeState.activeQueuePatientId) ||
    storeState.patients[0];

  const activeQueueItem = storeState.queue.find(
    (q) => q.patientId === activePatient?.id
  );

  // Dynamic Date & Greeting
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const currentHour = new Date().getHours();
  const greetingTimeOfDay =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = currentHour < 18 ? '☀️' : '🌙';
  const doctorDisplayName = storeState.clinician?.name || 'Doctor';

  // Dynamic Queue Status Counters
  const totalPatientsToday = storeState.queue.length;
  const waitingPatientsCount = storeState.queue.filter((q) => q.status === 'WAITING').length;
  const inConsultationPatientsCount = storeState.queue.filter((q) => q.status === 'IN_CONSULTATION').length;
  const scheduledLaterCount = storeState.queue.filter((q) => q.status === 'SCHEDULED').length;

  // Dynamic Attention Counters
  const abnormalResultsCount = storeState.results.filter((r) => r.isAbnormal || r.isCritical).length;
  const unsignedNotesCount = storeState.encounters.filter((e) => e.status === 'IN_PROGRESS' || e.status === 'READY_FOR_SIGN').length;
  const referralUpdatesCount = storeState.referrals.filter((r) => r.status === 'REPORT_RECEIVED' || r.status === 'SENT').length;
  const followUpsDueCount = storeState.followUps.filter((f) => f.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Greeting & "Needs Your Attention" Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Greeting & Headline */}
        <div>
          <div className="text-xs font-semibold text-slate-400">
            {currentDateFormatted}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            <span>{greetingTimeOfDay}, {doctorDisplayName}</span>
            <span className="text-amber-500">{greetingEmoji}</span>
          </h1>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
            <span className="font-semibold text-slate-700">{totalPatientsToday} patients today</span>
            <span>•</span>
            <span className="text-teal-700 font-semibold">{waitingPatientsCount} waiting</span>
            <span>•</span>
            <span className="text-sky-700 font-semibold">{inConsultationPatientsCount} in consultation</span>
            <span>•</span>
            <span>{scheduledLaterCount} scheduled later</span>
          </div>
        </div>

        {/* Right: Needs Your Attention Component */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="px-1 text-xs font-bold text-slate-900 flex items-center gap-1">
            <span>Needs Your Attention</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Abnormal Results */}
            <button
              type="button"
              onClick={() => clinicianStore.setActiveTab('inbox')}
              className="p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 flex items-center gap-2 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-rose-950">{abnormalResultsCount}</div>
                <div className="text-[10px] text-rose-700 font-medium">Abnormal results</div>
              </div>
            </button>

            {/* Unsigned Notes */}
            <button
              type="button"
              onClick={() => clinicianStore.setActiveTab('inbox')}
              className="p-2 rounded-xl bg-sky-50/70 hover:bg-sky-100/70 border border-sky-100 flex items-center gap-2 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-sky-950">{unsignedNotesCount}</div>
                <div className="text-[10px] text-sky-700 font-medium">Unsigned notes</div>
              </div>
            </button>

            {/* Referral Update */}
            <button
              type="button"
              onClick={() => clinicianStore.setActiveTab('referrals')}
              className="p-2 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-100 flex items-center gap-2 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-teal-950">{referralUpdatesCount}</div>
                <div className="text-[10px] text-teal-700 font-medium">Referral updates</div>
              </div>
            </button>

            {/* Follow-ups Due */}
            <button
              type="button"
              onClick={() => clinicianStore.setActiveTab('follow-ups')}
              className="p-2 rounded-xl bg-sky-50/70 hover:bg-sky-100/70 border border-sky-100 flex items-center gap-2 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-sky-950">{followUpsDueCount}</div>
                <div className="text-[10px] text-sky-700 font-medium">Follow-ups due</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Workspace: Patient Queue (Left) & Next Patient Pre-Visit Brief (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Patient Queue Table (approx 7 columns) */}
        <div className="xl:col-span-7">
          <PatientQueueList
            queueItems={storeState.queue}
            selectedPatientId={storeState.activeQueuePatientId}
            onSelectPatient={(pid) => clinicianStore.selectQueuePatient(pid)}
            onOpenChart={onOpenPatientChart}
            onStartConsultation={onStartConsultation}
          />
        </div>

        {/* Right: Next Patient Pre-Visit Brief Card (approx 5 columns) */}
        <div className="xl:col-span-5">
          <NextPatientBriefCard
            patient={activePatient}
            waitingMinutes={activeQueueItem?.waitingMinutes || 12}
            onOpenFullChart={onOpenPatientChart}
            onStartConsultation={onStartConsultation}
          />
        </div>
      </div>

      {/* Bottom 3-Card Clinical Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TodayScheduleWidget
          onSelectPatient={(pid) => {
            clinicianStore.selectQueuePatient(pid);
            onOpenPatientChart(pid);
          }}
        />

        <FollowUpsDueWidget
          onSelectPatient={(pid) => {
            clinicianStore.selectQueuePatient(pid);
            onOpenPatientChart(pid);
          }}
        />

        <RecentResultsWidget
          onSelectResult={() => {
            clinicianStore.setActiveTab('inbox');
          }}
        />
      </div>
    </div>
  );
};
