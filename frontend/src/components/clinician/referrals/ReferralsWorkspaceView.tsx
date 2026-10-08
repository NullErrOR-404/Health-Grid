import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Building,
  X,
  Send,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';
import type { ReferralItem } from '../../../types/clinician';

interface ReferralsWorkspaceViewProps {
  onOpenPatientChart: (patientId: string) => void;
}

type ReferralTab = 'ALL' | 'ACTIVE' | 'REPORTS_RECEIVED' | 'CLOSED';

export const ReferralsWorkspaceView: React.FC<ReferralsWorkspaceViewProps> = ({
  onOpenPatientChart,
}) => {
  const storeState = clinicianStore.getState();
  const [activeTab, setActiveTab] = useState<ReferralTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [referralsList, setReferralsList] = useState<ReferralItem[]>(storeState.referrals);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New referral form state
  const [selectedPatientId, setSelectedPatientId] = useState(storeState.patients[0]?.id || '');
  const [targetSpecialty, setTargetSpecialty] = useState('Cardiology');
  const [targetDoctorName, setTargetDoctorName] = useState('Dr. Suresh Rao');
  const [referralReason, setReferralReason] = useState('Evaluation of exertional dyspnea & ECG changes');
  const [clinicalSummary, setClinicalSummary] = useState('Patient has T2DM and mild hypertension with newly reported dyspnea on exertion.');
  const [priority, setPriority] = useState<'ROUTINE' | 'URGENT'>('ROUTINE');

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = storeState.patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    const newRef: ReferralItem = {
      id: `ref_${Date.now()}`,
      patientId: pat.id,
      patientName: pat.name,
      referringDoctor: storeState.clinician.name,
      targetSpecialty,
      targetDoctorName,
      reason: referralReason,
      priority,
      clinicalSummary,
      status: 'SENT',
      requestedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setReferralsList((prev) => [newRef, ...prev]);
    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: ReferralItem['status']) => {
    switch (status) {
      case 'REPORT_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Report Received
          </span>
        );
      case 'SPECIALIST_SEEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            Specialist Seen
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Accepted
          </span>
        );
      case 'SENT':
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Sent / Pending
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            Closed
          </span>
        );
    }
  };

  const filteredReferrals = referralsList
    .filter((r) => {
      if (activeTab === 'ACTIVE') return r.status === 'SENT' || r.status === 'ACCEPTED' || r.status === 'SPECIALIST_SEEN';
      if (activeTab === 'REPORTS_RECEIVED') return r.status === 'REPORT_RECEIVED';
      if (activeTab === 'CLOSED') return r.status === 'CLOSED';
      return true;
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.targetSpecialty.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        (r.targetDoctorName && r.targetDoctorName.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Referrals Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-specialty consult dispatches, specialist feedback loops, and consultation report integration
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Specialist Referral
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100/90 text-xs font-medium text-slate-600">
            {(
              [
                { id: 'ALL', label: 'All Referrals', count: referralsList.length },
                {
                  id: 'ACTIVE',
                  label: 'Active Dispatches',
                  count: referralsList.filter((r) => r.status === 'SENT' || r.status === 'ACCEPTED' || r.status === 'SPECIALIST_SEEN').length,
                },
                {
                  id: 'REPORTS_RECEIVED',
                  label: 'Reports Received',
                  count: referralsList.filter((r) => r.status === 'REPORT_RECEIVED').length,
                },
                {
                  id: 'CLOSED',
                  label: 'Closed',
                  count: referralsList.filter((r) => r.status === 'CLOSED').length,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === t.id
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === t.id ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search referrals by patient, target specialty, doctor, or referral reason..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Referrals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReferrals.map((ref) => (
          <div
            key={ref.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-teal-200 transition-all space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{ref.patientName}</span>
                  {ref.priority === 'URGENT' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-teal-700 mt-0.5 flex items-center gap-1">
                  <Building className="w-3 h-3 text-teal-600" />
                  <span>{ref.targetSpecialty}</span>
                  {ref.targetDoctorName && (
                    <span className="text-slate-500 font-normal">({ref.targetDoctorName})</span>
                  )}
                </div>
              </div>

              <div>{getStatusBadge(ref.status)}</div>
            </div>

            {/* Reason */}
            <div className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Reason:</span> {ref.reason}
            </div>

            {/* Clinical summary */}
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-700">Clinical Summary:</span> {ref.clinicalSummary}
            </div>

            {/* Specialist Report if available */}
            {ref.reportNotes && (
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <FileText className="w-3.5 h-3.5" />
                  Specialist Consultation Report:
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {ref.reportNotes}
                </p>
              </div>
            )}

            {/* Footer row */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Dispatched: {ref.requestedDate}</span>
              <button
                onClick={() => onOpenPatientChart(ref.patientId)}
                className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 text-xs"
              >
                <span>View Longitudinal Chart</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Referral Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Create Cross-Provider Clinical Referral
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {storeState.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (UHID: {p.uhid}) - {p.age}y {p.gender[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Specialty
                  </label>
                  <select
                    value={targetSpecialty}
                    onChange={(e) => setTargetSpecialty(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Physiotherapy">Physiotherapy & Rehab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="ROUTINE">Routine Consult</option>
                    <option value="URGENT">Urgent (Within 48h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Doctor / Consultant (Optional)
                </label>
                <input
                  type="text"
                  value={targetDoctorName}
                  onChange={(e) => setTargetDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Suresh Rao, Apollo Heart Institute"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Referral
                </label>
                <input
                  type="text"
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  placeholder="Specific clinical question or objective"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Summary & Pertinent History
                </label>
                <textarea
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
