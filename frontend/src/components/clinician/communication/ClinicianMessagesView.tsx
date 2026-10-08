import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface ClinicianMessagesViewProps {
  onOpenPatientChart: (patientId: string) => void;
}

interface ThreadMessage {
  id: string;
  senderName: string;
  senderRole: 'PATIENT' | 'CLINICIAN' | 'NURSE' | 'PHARMACIST';
  avatarUrl: string;
  content: string;
  timestamp: string;
  isRecordDocumented?: boolean;
}

interface MessageThread {
  id: string;
  patientId: string;
  patientName: string;
  uhid: string;
  subject: string;
  category: 'PATIENT_INQUIRY' | 'CARE_TEAM' | 'PHARMACY' | 'LAB';
  lastUpdated: string;
  unreadCount: number;
  messages: ThreadMessage[];
}

export const ClinicianMessagesView: React.FC<ClinicianMessagesViewProps> = ({
  onOpenPatientChart,
}) => {
  const storeState = clinicianStore.getState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState('th_1');
  const [replyText, setReplyText] = useState('');
  const [recordInChart, setRecordInChart] = useState(true);

  const [threads, setThreads] = useState<MessageThread[]>([
    {
      id: 'th_1',
      patientId: 'pat_priya_sharma',
      patientName: 'Priya Sharma',
      uhid: 'AP001982',
      subject: 'Fever recurrence post-paracetamol intake',
      category: 'PATIENT_INQUIRY',
      lastUpdated: '10 mins ago',
      unreadCount: 1,
      messages: [
        {
          id: 'm1',
          senderName: 'Priya Sharma',
          senderRole: 'PATIENT',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          content: 'Hello Dr. Mohamed, my fever spiked to 100.4°F again 4 hours after taking the paracetamol tablet. I am also having persistent eye pain and body ache.',
          timestamp: '09:10 AM',
        },
      ],
    },
    {
      id: 'th_2',
      patientId: 'pat_meena_iyer',
      patientName: 'Meena Iyer',
      uhid: 'AP002341',
      subject: 'Urgent: Potassium 6.2 confirmation & Enalapril hold',
      category: 'CARE_TEAM',
      lastUpdated: '25 mins ago',
      unreadCount: 0,
      messages: [
        {
          id: 'm2',
          senderName: 'Nurse Deepa (Triage)',
          senderRole: 'NURSE',
          avatarUrl: 'https://images.unsplash.com/photo-1594824813511-20703f269a8b?auto=format&fit=crop&w=120&q=80',
          content: 'Dr. Mohamed, patient Meena Iyer was called regarding her lab critical K+ 6.2. She is asymptomatic but was advised to withhold Enalapril until your consultation today.',
          timestamp: '08:55 AM',
        },
        {
          id: 'm3',
          senderName: 'Dr. Mohamed',
          senderRole: 'CLINICIAN',
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
          content: 'Noted. I have put an immediate stop order on both Enalapril & Spironolactone in her medication reconciliation workspace.',
          timestamp: '09:02 AM',
          isRecordDocumented: true,
        },
      ],
    },
    {
      id: 'th_3',
      patientId: 'pat_arun_prakash',
      patientName: 'Arun Prakash',
      uhid: 'AP001429',
      subject: 'Jan Aushadhi Generic Substitution query for Glimepiride',
      category: 'PHARMACY',
      lastUpdated: 'Yesterday',
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          senderName: 'Apollo Clinical Pharmacist',
          senderRole: 'PHARMACIST',
          avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=120&q=80',
          content: 'Dr. Mohamed, patient Arun Prakash requested if his Glimepiride 1mg brand can be dispensed as PMBJP generic formulation (₹12 vs ₹140). Please approve if acceptable.',
          timestamp: 'Yesterday 04:30 PM',
        },
        {
          id: 'm5',
          senderName: 'Dr. Mohamed',
          senderRole: 'CLINICIAN',
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
          content: 'Generic substitution approved. Bioequivalent generic is appropriate.',
          timestamp: 'Yesterday 04:45 PM',
          isRecordDocumented: true,
        },
      ],
    },
  ]);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newMsg: ThreadMessage = {
      id: `m_${Date.now()}`,
      senderName: storeState.clinician.name,
      senderRole: 'CLINICIAN',
      avatarUrl: storeState.clinician.avatarUrl,
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRecordDocumented: recordInChart,
    };

    setThreads((prev) =>
      prev.map((th) =>
        th.id === activeThread.id
          ? {
              ...th,
              messages: [...th.messages, newMsg],
              lastUpdated: 'Just now',
              unreadCount: 0,
            }
          : th
      )
    );

    setReplyText('');
  };

  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.patientName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.uhid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Communication & Messages
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinically contextual communications with patients, hospital triage, pharmacy, and interdisciplinary care teams
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
          Contextual Medical Records: <span className="font-bold text-teal-700">Audit Enabled</span>
        </div>
      </div>

      {/* Main Two-Column Messenger Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[500px]">
        {/* Left Column: Thread List */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0">
          {/* Thread Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Threads */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeThread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                    isSelected ? 'bg-teal-50/50 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {thread.patientName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {thread.lastUpdated}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-700 truncate">
                    {thread.subject}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span className="font-mono text-teal-700">UHID: {thread.uhid}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 font-medium text-slate-600">
                      {thread.category.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Conversation */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/40">
          {/* Conversation Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                {activeThread.patientName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>{activeThread.patientName}</span>
                  <span className="text-[10px] text-teal-700 font-mono bg-teal-50 px-1.5 py-0.5 rounded">
                    UHID: {activeThread.uhid}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-md">
                  Subject: {activeThread.subject}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPatientChart(activeThread.patientId)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:text-teal-700 hover:bg-teal-50 transition-colors"
            >
              <span>Patient Chart</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeThread.messages.map((msg) => {
              const isDoctor = msg.senderRole === 'CLINICIAN';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-xl ${
                    isDoctor ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <img
                    src={msg.avatarUrl}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200"
                  />
                  <div>
                    <div
                      className={`text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1.5 ${
                        isDoctor ? 'justify-end' : ''
                      }`}
                    >
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isDoctor
                          ? 'bg-teal-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.isRecordDocumented && (
                      <div
                        className={`text-[9px] font-semibold text-teal-700 flex items-center gap-1 mt-1 ${
                          isDoctor ? 'justify-end' : ''
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-teal-600" />
                        <span>Documented into Patient Clinical Record</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input & Action Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordInChart}
                  onChange={(e) => setRecordInChart(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-700">
                  Append response to patient longitudinal chart
                </span>
              </label>

              <span className="text-[10px] text-slate-400">
                Encrypted & HIPAA/ABDM Compliant
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type clinical advice or response..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
