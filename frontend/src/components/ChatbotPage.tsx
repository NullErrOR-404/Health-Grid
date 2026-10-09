import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  MessageSquare,
  Pill,
  ChevronDown,
  User,
  CheckCircle2,
  Stethoscope,
  Building2,
  ShieldAlert,
  Paperclip,
  Mic,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Pin,
  Edit2,
  Archive,
  Trash2,
  MoreVertical,
  Check,
  Sparkles,
  AlertCircle,
  X,
  Search,
  MapPin,
  Activity,
  FileText,
  Tag,
  HeartHandshake,
  FileUp,
  Video,
  Clock,
  CalendarCheck,
  Square,
  CheckSquare,
  ArrowRight,
  ChevronLeft,
  Camera,
  Heart,
  Thermometer,
  Droplets,
  Printer,
  PhoneCall,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Star,
  QrCode,
  ShieldCheck,
  Users,
  RefreshCw,
  Navigation,
  BellRing,
  XCircle,
  CalendarClock,
  Radio
} from 'lucide-react';
import type { Language } from '../types';
import { speechEngine, TanglishNormalizer } from '../services/speechService';
import {
  agiService,
  type InteractiveOptions,
  type TriageWizard,
  type TriageWizardStep,
  type TriageWizardOption,
} from '../services/aiService';
import {
  agenticTools,
  type AgentToolCall,
  type JanAushadhiResult,
  type VisualModulePreview,
  type AgentActionConfirmation,
} from '../services/agenticToolsService';
import { type PrescriptionAnalysisResult } from '../services/prescriptionAiService';
import { careLoopService, type CareLoopFollowUp } from '../services/careLoopService';
import { type LiveConsultationSummary } from '../services/liveVisionDoctorService';
import { medicalRecordService } from '../services/medicalRecordService';
import { healthMemoryService } from '../services/healthMemoryService';
import { supabase } from '../services/supabaseClient';
import { authService, type AuthUser } from '../services/authService';
import { appointmentService, type Appointment } from '../services/appointmentService';
import { doctorOpdService } from '../services/doctorOpdService';
import { medicineStoreService, type MedicineItem, INITIAL_CACHE_CATALOG } from '../services/medicineStoreService';
import { INITIAL_HOSPITALS } from '../data/hospitalsList';
import { PrintAppointmentSlipModal } from './erp/appointments/PrintAppointmentSlipModal';
import { LoginModal } from './LoginModal';
import { LiveVisionDoctorModal } from './LiveVisionDoctorModal';
import { VitalsTelemetryModal } from './VitalsTelemetryModal';
import { ConsultationBeneficiaryModal } from './ConsultationBeneficiaryModal';
import { familyMemberService, type FamilyMember } from '../services/familyMemberService';
import {
  type EsiTriageResult,
  type JanAushadhiSavingsCard,
  type SbarHandoverBrief,
  type ClinicalSafetyCheckResult,
} from '../services/clinicalChatEngine';
import { markItDownService } from '../services/markItDownService';
import { NlpBookingParser } from '../services/nlpBookingParser';
import { unifiedPatientStore } from '../services/unifiedPatientStore';

export interface StagedClinicalAttachment {
  file: File;
  fileName: string;
  fileSize: string;
  fileType: 'prescription' | 'lab_report' | 'photo' | 'document';
  dataUrl?: string;
  parsedMarkdown?: string;
  tokenEstimate?: number;
}

export interface AppointmentStepperData {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientType: 'myself' | 'family';
  beneficiaryName?: string;
  department: string;
  condition: string;
  preferredDate: string; // YYYY-MM-DD
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  isSubmitted?: boolean;
}

export interface DoctorSlotCard {
  id: string;
  doctorCode: string;
  name: string;
  department: string;
  specialization: string;
  qualification: string;
  opdRoom: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatarUrl: string;
  availableSlots: string[];
  selectedSlot?: string;
}

export interface DoctorCarouselData {
  department: string;
  date: string;
  timeSlot: string;
  hospitalName: string;
  doctors: DoctorSlotCard[];
  selectedDoctorId?: string;
  selectedSlot?: string;
}

export interface RescheduleCardData {
  id: string;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  department: string;
  currentDate: string;
  currentTime: string;
  availableDates: Array<{ label: string; date: string }>;
  selectedDate: string;
  selectedTimeSlot: 'Morning' | 'Afternoon' | 'Evening';
  availableSlots: string[];
  selectedSlot: string;
  isSubmitted?: boolean;
}

export interface CancelCardData {
  id: string;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  selectedReason: string;
  availableReasons: string[];
  isSubmitted?: boolean;
}

export interface LiveQueueTrackerData {
  id: string;
  appointmentId: string;
  tokenNumber: number;
  tokenDisplay: string;
  patientName: string;
  doctorName: string;
  department: string;
  opdRoom: string;
  hospitalName: string;
  currentServingToken: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  queueStatus: 'Active' | 'Delayed' | 'Calling' | 'In Consultation';
  lastUpdated: string;
  alertPingActive?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  liked?: boolean;
  disliked?: boolean;
  usageMeta?: {
    latencyMs: number;
    totalTokens: number;
    modelName: string;
  };
  emotionalState?: string;
  executedTools?: AgentToolCall[];
  genericMedicines?: JanAushadhiResult[];
  attachmentName?: string;
  imageDataUrl?: string;
  prescriptionAnalysis?: PrescriptionAnalysisResult;
  suggestedOptions?: InteractiveOptions;
  triageWizard?: TriageWizard;
  // Unique Clinical Intelligence Differentiators (ADR-037)
  esiTriage?: EsiTriageResult | null;
  janAushadhiSavingsCard?: JanAushadhiSavingsCard | null;
  sbarHandover?: SbarHandoverBrief | null;
  safetyCheck?: ClinicalSafetyCheckResult;
  followUpChips?: Array<{ label: string; query: string }>;
  stagedDocumentType?: 'prescription' | 'lab_report' | 'photo' | 'document';
  // Automated In-Chat Appointment Flow (ChatUi ref)
  appointmentStepper?: AppointmentStepperData;
  doctorCarousel?: DoctorCarouselData;
  confirmedBookingPass?: Appointment;
  matchedMedicineCard?: MedicineItem;
  rescheduleCard?: RescheduleCardData;
  cancelCard?: CancelCardData;
  liveQueueTracker?: LiveQueueTrackerData;
  // Autonomous Cross-Website Navigator & Action Confirmation
  visualNavCard?: VisualModulePreview | null;
  actionConfirmation?: AgentActionConfirmation | null;
}

export interface ChatSession {
  id: string;
  title: string;
  dateGroup: 'Today' | 'Previous 7 Days';
  pinned?: boolean;
  archived?: boolean;
  messages: ChatMessage[];
}

interface ChatbotPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
  onOpenAmbulance?: () => void;
  onOpenPrescription?: () => void;
  onOpenDiseaseMap?: () => void;
  onOpenBabyShots?: () => void;
  onNavigateMedicines?: () => void;
  initialQuery?: string;
}

const createFreshSession = (title = 'New Consultation'): ChatSession => ({
  id: `chat-${Date.now()}`,
  title,
  dateGroup: 'Today',
  messages: [],
});

const createInitialReferenceSessions = (): ChatSession[] => {
  const defaultBookingSession: ChatSession = {
    id: 'chat-book-appointment',
    title: 'Book appointment',
    dateGroup: 'Today',
    messages: [
      {
        id: 'msg-u-1',
        sender: 'user',
        text: 'I want to book an appointment',
        time: '10:24 AM',
      },
      {
        id: 'msg-a-1',
        sender: 'ai',
        text: 'Sure! I can help you book an appointment.\nPlease tell me a few details so I can find the best available slots for you.',
        time: '10:24 AM',
        appointmentStepper: {
          id: 'stepper-ref-1',
          hospitalId: 'HG-H002',
          hospitalName: 'Govt Medical College & Hospital (GMCH)',
          patientType: 'myself',
          department: 'General Medicine',
          condition: 'Fever & headache for 3 days',
          preferredDate: '2025-09-29',
          timeSlot: 'Morning',
          isSubmitted: true,
        },
      },
      {
        id: 'msg-a-2',
        sender: 'ai',
        text: 'Here are the available doctors for General Medicine on Mon, 29 Sep 2025 (Morning). You can select a doctor and confirm your appointment.',
        time: '10:24 AM',
        doctorCarousel: {
          department: 'General Medicine',
          date: '2025-09-29',
          timeSlot: 'Morning',
          hospitalName: 'Govt Medical College & Hospital (GMCH)',
          selectedDoctorId: 'DOC001',
          selectedSlot: '09:00 AM',
          doctors: [
            {
              id: 'doc-001',
              doctorCode: 'DOC001',
              name: 'Dr. Mohamed',
              department: 'General Medicine',
              specialization: 'Internal Medicine & Chronic Care',
              qualification: 'MBBS, MD',
              opdRoom: 'Room 101',
              experienceYears: 12,
              rating: 4.8,
              reviewsCount: 320,
              avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
              availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM'],
              selectedSlot: '09:00 AM',
            },
            {
              id: 'doc-002',
              doctorCode: 'DOC002',
              name: 'Dr. Revathi',
              department: 'General Medicine',
              specialization: 'Preventive Cardiology',
              qualification: 'MBBS, MD',
              opdRoom: 'Room 201',
              experienceYears: 8,
              rating: 4.6,
              reviewsCount: 210,
              avatarUrl: 'https://images.unsplash.com/photo-1594824813583-7740e53a3eb2?auto=format&fit=crop&q=80&w=200',
              availableSlots: ['10:00 AM', '10:30 AM', '11:00 AM'],
            },
            {
              id: 'doc-003',
              doctorCode: 'DOC003',
              name: 'Dr. Arjun',
              department: 'General Medicine',
              specialization: 'Adult Primary Care',
              qualification: 'MBBS, DNB',
              opdRoom: 'Room 105',
              experienceYears: 10,
              rating: 4.7,
              reviewsCount: 284,
              avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
              availableSlots: ['09:30 AM', '10:00 AM', '10:30 AM'],
            },
          ],
        },
      },
      {
        id: 'msg-a-3',
        sender: 'ai',
        text: '🎉 Your appointment has been booked! Your official hospital OPD digital pass and live queue tracker are ready below.',
        time: '10:25 AM',
        confirmedBookingPass: {
          id: 'appt-demo-001',
          appointment_id: 'APPT250929004',
          patient_name: 'Sameer Ahmed',
          patient_phone: '+91 98765 43210',
          patient_health_id: 'HG001245',
          patient_age: 20,
          patient_gender: 'Male',
          doctor_name: 'Dr. Mohamed',
          department: 'General Medicine',
          appointment_date: '2025-09-29',
          appointment_time: '09:00 AM',
          appointment_type: 'Consultation',
          source: 'DocBot AI Chatbot',
          status: 'Scheduled',
          reason_for_visit: 'Fever & headache for 3 days',
          notes: 'Room 101. Govt Medical College & Hospital (GMCH)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        liveQueueTracker: {
          id: 'queue-demo-001',
          appointmentId: 'APPT250929004',
          tokenNumber: 4,
          tokenDisplay: '04',
          patientName: 'Sameer Ahmed',
          doctorName: 'Dr. Mohamed',
          department: 'General Medicine',
          opdRoom: 'Room 101',
          hospitalName: 'Govt Medical College & Hospital (GMCH)',
          currentServingToken: 2,
          patientsAhead: 2,
          estimatedWaitMinutes: 12,
          queueStatus: 'Active',
          lastUpdated: '10:25:00 AM',
          alertPingActive: false,
        },
      },
    ],
  };

  const medicineSession: ChatSession = {
    id: 'chat-med-info',
    title: 'Medicine information',
    dateGroup: 'Today',
    messages: [
      {
        id: 'msg-u-med',
        sender: 'user',
        text: 'What is the price of Paracetamol and Metformin?',
        time: '09:15 AM',
      },
      {
        id: 'msg-a-med',
        sender: 'ai',
        text: 'Under the PMBJP Pradhan Mantri Bharatiya Jan Aushadhi Pariyojana, generic Paracetamol 650mg is available for ₹4.50 (MRP ₹34.00, 87% savings) and Metformin 500mg is available for ₹7.50 (MRP ₹45.00, 83% savings) at certified Jan Aushadhi Kendras.',
        time: '09:15 AM',
        matchedMedicineCard: INITIAL_CACHE_CATALOG[0],
      },
    ],
  };

  const labSession: ChatSession = {
    id: 'chat-lab-test',
    title: 'Lab test results',
    dateGroup: 'Previous 7 Days',
    messages: [
      {
        id: 'msg-u-lab',
        sender: 'user',
        text: 'Can you review my recent Complete Blood Count (CBC) and Lipid panel?',
        time: '04:20 PM',
      },
      {
        id: 'msg-a-lab',
        sender: 'ai',
        text: 'Your hemoglobin is normal at 14.2 g/dL. Total cholesterol is 185 mg/dL (optimal <200). HDL is 48 mg/dL and LDL is 112 mg/dL. All baseline parameters are within clinical safety thresholds.',
        time: '04:20 PM',
      },
    ],
  };

  const chestPainSession: ChatSession = {
    id: 'chat-chest-pain',
    title: 'Chest pain guidance',
    dateGroup: 'Previous 7 Days',
    messages: [
      {
        id: 'msg-u-chest',
        sender: 'user',
        text: 'Mild burning chest discomfort after heavy dinner, no radiation or breathlessness.',
        time: '11:30 AM',
      },
      {
        id: 'msg-a-chest',
        sender: 'ai',
        text: 'This presentation is most consistent with gastroesophageal reflux (GERD/acidity). Avoid lying flat immediately after eating. If pain radiates to jaw, left arm, or causes cold sweats or breathlessness, call 108 emergency immediately.',
        time: '11:30 AM',
      },
    ],
  };

  return [defaultBookingSession, medicineSession, labSession, chestPainSession];
};

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
  lang,
  setLang: _setLang,
  onNavigateHome: _onNavigateHome,
  onNavigateProfile,
  onOpenAmbulance,
  onOpenPrescription: _onOpenPrescription,
  onOpenDiseaseMap: _onOpenDiseaseMap,
  onOpenBabyShots: _onOpenBabyShots,
  onNavigateMedicines,
  initialQuery,
}) => {
  // Zero-Disk Pure Cloud Storage: Sessions live strictly in memory and Supabase PostgreSQL RLS tables.
  // Initialized with authentic reference consultations matching ChatUi ref.
  const [sessions, setSessions] = useState<ChatSession[]>(() => createInitialReferenceSessions());

  const [activeSessionId, setActiveSessionId] = useState<string>('chat-book-appointment');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiveVisionOpen, setIsLiveVisionOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [activeBeneficiary, setActiveBeneficiary] = useState<FamilyMember | null>(() => familyMemberService.getActiveBeneficiary());
  const [activeCareLoops, setActiveCareLoops] = useState<CareLoopFollowUp[]>([]);
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<Record<string, string[]>>({});
  const [wizardStates, setWizardStates] = useState<Record<string, {
    currentStepIndex: number;
    answers: Record<string, TriageWizardOption>;
    isCompleted: boolean;
  }>>({});
  const [attachedPhoto, setAttachedPhoto] = useState<{
    dataUrl: string;
    fileName: string;
    fileSize: string;
  } | null>(null);
  const [stagedAttachment, setStagedAttachment] = useState<StagedClinicalAttachment | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  // Active In-Chat Appointment Automation State (ChatUi ref)
  const [activeAppointmentDraft, setActiveAppointmentDraft] = useState<{
    hospitalId: string;
    hospitalName: string;
    patientType: 'myself' | 'family';
    beneficiaryName?: string;
    department: string;
    condition: string;
    preferredDate: string;
    timeSlot: 'Morning' | 'Afternoon' | 'Evening';
    selectedDoctor?: DoctorSlotCard;
    selectedSlot?: string;
    isConfirmed?: boolean;
  }>({
    hospitalId: 'HG-H002',
    hospitalName: 'Govt Medical College & Hospital (GMCH)',
    patientType: 'myself',
    department: 'General Medicine',
    condition: 'Fever & headache for 3 days',
    preferredDate: '2025-09-29',
    timeSlot: 'Morning',
    selectedDoctor: {
      id: 'doc-001',
      doctorCode: 'DOC001',
      name: 'Dr. Mohamed',
      department: 'General Medicine',
      specialization: 'Internal Medicine & Chronic Care',
      qualification: 'MBBS, MD',
      opdRoom: 'Room 101',
      experienceYears: 12,
      rating: 4.8,
      reviewsCount: 320,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
      availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM'],
      selectedSlot: '09:00 AM',
    },
    selectedSlot: '09:00 AM',
    isConfirmed: false,
  });

  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isHospitalPickerOpen, setIsHospitalPickerOpen] = useState(false);
  const [isDepartmentPickerOpen, setIsDepartmentPickerOpen] = useState(false);
  const [doctorNameSearch, setDoctorNameSearch] = useState('');
  const [printingAppointment, setPrintingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDrafts, setRescheduleDrafts] = useState<
    Record<string, { date: string; timeSlot: 'Morning' | 'Afternoon' | 'Evening'; slot: string }>
  >({});
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});
  const [expandedWayfinding, setExpandedWayfinding] = useState<Record<string, boolean>>({});

  const [isQuickVitalsDrawerOpen, setIsQuickVitalsDrawerOpen] = useState(false);
  const [quickVitals, setQuickVitals] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    spo2: '',
    temperature: '',
    bloodSugar: '',
    sugarType: 'random' as 'random' | 'fasting' | 'post_prandial',
  });
  const [vitalsSavedNotice, setVitalsSavedNotice] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const isSendingRef = useRef(false);

  const formatDisplayDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const createLiveQueueTrackerForAppointment = (appt: Appointment): LiveQueueTrackerData => {
    const numMatch = (appt.appointment_id || '').match(/\d+$/);
    const tokenNum = numMatch ? (parseInt(numMatch[0].slice(-2), 10) || 4) : 4;
    const tokenDisplay = String(tokenNum).padStart(2, '0');

    const opdQueue = unifiedPatientStore.getOpdQueue();
    const activeServing = opdQueue.find((q) => q.status === 'In Consultation') || opdQueue[0];
    const currentServingToken = activeServing ? activeServing.token : Math.max(1, tokenNum - 2);
    const patientsAhead = Math.max(0, tokenNum - currentServingToken);
    const estimatedWaitMinutes = patientsAhead === 0 ? 3 : patientsAhead * 6;

    const allDocs = doctorOpdService.getDoctors();
    const doc = allDocs.find((d) => d.name.toLowerCase().includes((appt.doctor_name || '').toLowerCase()));
    const opdRoom = doc?.opd_room || 'Room 101';

    return {
      id: `queue-${appt.appointment_id || Date.now()}`,
      appointmentId: appt.appointment_id || 'APPT250929004',
      tokenNumber: tokenNum,
      tokenDisplay,
      patientName: appt.patient_name || 'Patient',
      doctorName: appt.doctor_name || 'Dr. Mohamed',
      department: appt.department || 'General Medicine',
      opdRoom,
      hospitalName: 'Govt Medical College & Hospital (GMCH)',
      currentServingToken,
      patientsAhead,
      estimatedWaitMinutes,
      queueStatus: patientsAhead === 0 ? 'Calling' : 'Active',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      alertPingActive: false,
    };
  };

  const handleTriggerRescheduleForPass = (pass: Appointment) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(now.getDate() + 2);

    const rescheduleCardData: RescheduleCardData = {
      id: `resched-${Date.now()}`,
      appointmentId: pass.appointment_id,
      patientName: pass.patient_name,
      doctorName: pass.doctor_name,
      department: pass.department,
      currentDate: pass.appointment_date,
      currentTime: pass.appointment_time,
      availableDates: [
        { label: 'Today', date: now.toISOString().slice(0, 10) },
        { label: 'Tomorrow', date: tomorrow.toISOString().slice(0, 10) },
        { label: 'Day After', date: dayAfter.toISOString().slice(0, 10) },
      ],
      selectedDate: tomorrow.toISOString().slice(0, 10),
      selectedTimeSlot: 'Morning',
      availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'],
      selectedSlot: '09:30 AM',
      isSubmitted: false,
    };

    const botMsg: ChatMessage = {
      id: `a-resched-card-${Date.now()}`,
      sender: 'ai',
      text: lang === 'ta'
        ? `நிச்சயமாக, உங்கள் மருத்துவ சந்திப்பை (${pass.appointment_id}) மாற்றியமைக்க கீழே புதிய தேதியையும் நேரத்தையும் தேர்ந்தெடுக்கவும்.`
        : `Certainly. To reschedule your appointment (${pass.appointment_id}) with ${pass.doctor_name}, please select your preferred new date and time slot below:`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rescheduleCard: rescheduleCardData,
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, botMsg] } : s))
    );
  };

  const handleTriggerCancelForPass = (pass: Appointment) => {
    const cancelCardData: CancelCardData = {
      id: `cancel-${Date.now()}`,
      appointmentId: pass.appointment_id,
      patientName: pass.patient_name,
      doctorName: pass.doctor_name,
      department: pass.department,
      appointmentDate: pass.appointment_date,
      appointmentTime: pass.appointment_time,
      selectedReason: 'Conflict in schedule',
      availableReasons: [
        'Conflict in schedule',
        'Feeling better / Symptoms resolved',
        'Consulted another physician',
        'Transportation / Personal emergency',
      ],
      isSubmitted: false,
    };

    const botMsg: ChatMessage = {
      id: `a-cancel-card-${Date.now()}`,
      sender: 'ai',
      text: lang === 'ta'
        ? `உங்கள் மருத்துவ சந்திப்பை (${pass.appointment_id}) ரத்து செய்வதை உறுதிப்படுத்த கீழே காரணத்தைத் தேர்ந்தெடுக்கவும்.`
        : `To cancel your appointment (${pass.appointment_id}) with ${pass.doctor_name}, please confirm your reason below so the OPD counter can release your queue slot:`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cancelCard: cancelCardData,
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, botMsg] } : s))
    );
  };

  const handleExecuteReschedule = async (
    msgId: string,
    appointmentId: string,
    newDate: string,
    newTime: string
  ) => {
    try {
      const success = await appointmentService.reschedule(
        appointmentId,
        newDate,
        newTime,
        undefined,
        'Rescheduled via DocBot AI conversational assistant'
      );

      if (success) {
        const updatedApt = appointmentService.getAppointmentById(appointmentId);

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) => {
                  if (m.id === msgId && m.rescheduleCard) {
                    return {
                      ...m,
                      rescheduleCard: {
                        ...m.rescheduleCard,
                        selectedDate: newDate,
                        selectedSlot: newTime,
                        isSubmitted: true,
                      },
                    };
                  }
                  return m;
                }),
              };
            }
            return s;
          })
        );

        if (updatedApt) {
          const confMsg: ChatMessage = {
            id: `a-resched-conf-${Date.now()}`,
            sender: 'ai',
            text: lang === 'ta'
              ? `🔄 உங்கள் மருத்துவ சந்திப்பு வெற்றிகரமாக ${formatDisplayDate(newDate)} அன்று ${newTime}-க்கு மாற்றப்பட்டது!`
              : `🔄 Your appointment has been successfully rescheduled to ${formatDisplayDate(newDate)} at ${newTime}! Your updated digital pass and live queue tracker are ready.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confirmedBookingPass: updatedApt,
            liveQueueTracker: createLiveQueueTrackerForAppointment(updatedApt),
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, confMsg] } : s))
          );
        }

        setToastMessage(`Appointment rescheduled to ${formatDisplayDate(newDate)} at ${newTime}!`);
      } else {
        setToastMessage('Could not reschedule appointment. Please try again.');
      }
    } catch (err: any) {
      console.error('Error executing reschedule:', err);
      setToastMessage(err?.message || 'Error rescheduling appointment.');
    }
  };

  const handleExecuteCancellation = async (
    msgId: string,
    appointmentId: string,
    reason: string
  ) => {
    try {
      const success = await appointmentService.updateStatus(
        appointmentId,
        'Cancelled',
        { reason, notes: 'Cancelled by patient via DocBot AI' }
      );

      if (success) {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) => {
                  if (m.id === msgId && m.cancelCard) {
                    return {
                      ...m,
                      cancelCard: {
                        ...m.cancelCard,
                        isSubmitted: true,
                      },
                    };
                  }
                  return m;
                }),
              };
            }
            return s;
          })
        );

        const cancelReceiptMsg: ChatMessage = {
          id: `a-cancel-conf-${Date.now()}`,
          sender: 'ai',
          text: lang === 'ta'
            ? `❌ உங்கள் மருத்துவ சந்திப்பு (${appointmentId}) வெற்றிகரமாக ரத்து செய்யப்பட்டது. காரணம்: "${reason}". உங்கள் டோக்கன் பொது வரிசைக்கு திரும்ப வழங்கப்பட்டுள்ளது.`
            : `❌ Your appointment (${appointmentId}) has been successfully cancelled. Reason: "${reason}". Your OPD slot has been safely released back to the general patient queue. Your previous consultation records and digital health vault remain intact.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, cancelReceiptMsg] } : s))
        );

        setToastMessage('Appointment cancelled successfully.');
      } else {
        setToastMessage('Could not cancel appointment. Please check appointment ID.');
      }
    } catch (err: any) {
      console.error('Error executing cancellation:', err);
      setToastMessage(err?.message || 'Error cancelling appointment.');
    }
  };

  const handleRefreshQueueTracker = (msgId: string, currentTracker: LiveQueueTrackerData) => {
    const updatedTracker = {
      ...currentTracker,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === msgId && m.liveQueueTracker) {
                return { ...m, liveQueueTracker: updatedTracker };
              }
              return m;
            }),
          };
        }
        return s;
      })
    );

    setToastMessage('OPD Queue refreshed: Live status synced.');
  };

  const handleToggleQueueAlert = (msgId: string, currentTracker: LiveQueueTrackerData) => {
    const newAlertState = !currentTracker.alertPingActive;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === msgId && m.liveQueueTracker) {
                return {
                  ...m,
                  liveQueueTracker: {
                    ...m.liveQueueTracker,
                    alertPingActive: newAlertState,
                  },
                };
              }
              return m;
            }),
          };
        }
        return s;
      })
    );

    setToastMessage(
      newAlertState
        ? '🔔 5-Minute Queue Alert enabled! We will ping you when Token #' + String(Math.max(1, currentTracker.tokenNumber - 1)).padStart(2, '0') + ' is called.'
        : 'Queue alert disabled.'
    );
  };

  const handleDownloadIcs = (appt: Appointment) => {
    const title = `Doctor Appointment with ${appt.doctor_name} (${appt.department})`;
    const description = `Hospital: Govt Medical College & Hospital (GMCH)\\nPatient: ${appt.patient_name}\\nHealth ID: ${appt.patient_health_id}\\nToken: ${appt.appointment_id}\\nReason: ${appt.reason_for_visit || 'Consultation'}`;
    const location = 'Govt Medical College & Hospital, Chennai';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HealthGrid//DocBot AI//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${appt.appointment_id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(lang === 'en' ? 'Appointment added to calendar (.ics)' : 'சந்திப்பு காலண்டரில் சேர்க்கப்பட்டது (.ics)');
  };

  const handleConfirmAppointment = async () => {
    try {
      const currentAuth = authService.getCurrentUser() || {
        id: 'usr-patient-1245',
        name: 'Sameer Ahmed',
        email: 'sameer@example.com',
        phone: '+91 98765 43210',
        role: 'PERSONAL' as const,
        healthId: 'HG001245',
        age: 20,
        bloodGroup: 'B+',
      };

      const patientName = activeAppointmentDraft.patientType === 'family' && activeAppointmentDraft.beneficiaryName
        ? activeAppointmentDraft.beneficiaryName
        : currentAuth.name || 'Patient';
      
      const doctorName = activeAppointmentDraft.selectedDoctor?.name || 'Dr. Mohamed';
      const dept = activeAppointmentDraft.department || 'General Medicine';
      const date = activeAppointmentDraft.preferredDate || new Date().toISOString().slice(0, 10);
      const time = activeAppointmentDraft.selectedSlot || '09:00 AM';
      const condition = activeAppointmentDraft.condition || 'General Outpatient Consultation';

      const newAppt = await appointmentService.createAppointment({
        patient_name: patientName,
        patient_phone: currentAuth.phone || '+91 98765 43210',
        patient_health_id: currentAuth.healthId || 'HG001245',
        doctor_name: doctorName,
        department: dept,
        appointment_date: date,
        appointment_time: time,
        appointment_type: 'Consultation',
        source: 'DocBot AI Chatbot',
        reason_for_visit: condition,
        notes: `Hospital: ${activeAppointmentDraft.hospitalName}. Room: ${activeAppointmentDraft.selectedDoctor?.opdRoom || 'Room 101'}. Booked via HealthGrid DocBot AI.`,
      });

      setActiveAppointmentDraft((prev) => ({
        ...prev,
        isConfirmed: true,
      }));

      const confirmedMsg: ChatMessage = {
        id: `a-conf-${Date.now()}`,
        sender: 'ai',
        text: lang === 'ta'
          ? `🎉 உங்கள் மருத்துவ சந்திப்பு வெற்றிகரமாக முன்பதிவு செய்யப்பட்டது! டோக்கன் எண்: ${newAppt.appointment_id}`
          : `🎉 Your appointment has been successfully booked and confirmed! Your official hospital OPD token is ${newAppt.appointment_id}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confirmedBookingPass: newAppt,
        liveQueueTracker: createLiveQueueTrackerForAppointment(newAppt),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, confirmedMsg],
            };
          }
          return s;
        })
      );

      setToastMessage(
        lang === 'en'
          ? `Appointment confirmed with ${doctorName} at ${time}!`
          : `${doctorName} மருத்துவருடனான சந்திப்பு உறுதி செய்யப்பட்டது!`
      );
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      setToastMessage(err?.message || 'Could not confirm appointment. Please try again.');
    }
  };

  const handleFindAvailableDoctors = (stepperData?: AppointmentStepperData) => {
    const draft = stepperData || activeAppointmentDraft;
    const allDocs = doctorOpdService.getDoctors();
    const deptNorm = (draft.department || 'General Medicine').toLowerCase();
    
    let matched = allDocs.filter(d => 
      d.department.toLowerCase().includes(deptNorm) ||
      deptNorm.includes(d.department.toLowerCase())
    );
    if (doctorNameSearch.trim()) {
      const q = doctorNameSearch.trim().toLowerCase();
      const filteredByDoc = matched.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.specialization && d.specialization.toLowerCase().includes(q))
      );
      if (filteredByDoc.length > 0) {
        matched = filteredByDoc;
      }
    }
    if (matched.length === 0) {
      matched = allDocs.slice(0, 4);
    }

    const slotTimes = draft.timeSlot === 'Evening'
      ? ['04:30 PM', '05:00 PM', '05:30 PM']
      : draft.timeSlot === 'Afternoon'
      ? ['12:30 PM', '01:00 PM', '01:30 PM']
      : ['09:00 AM', '09:30 AM', '10:00 AM'];

    const carouselDocs: DoctorSlotCard[] = matched.map((d, idx) => ({
      id: d.id,
      doctorCode: d.doctor_code || `DOC00${idx + 1}`,
      name: d.name,
      department: d.department,
      specialization: d.specialization || 'Clinical Specialist',
      qualification: d.qualification || 'MBBS, MD',
      opdRoom: d.opd_room || `Room 10${idx + 1}`,
      experienceYears: d.experience_years || 10,
      rating: Number((4.6 + (idx * 0.1) % 0.4).toFixed(1)),
      reviewsCount: 180 + idx * 45,
      avatarUrl: d.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
      availableSlots: slotTimes.map((t, tIdx) => {
        if (tIdx === 0 && idx === 1) return '10:00 AM';
        if (tIdx === 1 && idx === 1) return '10:30 AM';
        if (tIdx === 2 && idx === 1) return '11:00 AM';
        return t;
      }),
      selectedSlot: idx === 0 ? slotTimes[0] : undefined,
    }));

    const firstDoc = carouselDocs[0];
    const firstSlot = firstDoc?.availableSlots[0] || '09:00 AM';

    setActiveAppointmentDraft((prev) => ({
      ...prev,
      ...draft,
      selectedDoctor: firstDoc,
      selectedSlot: firstSlot,
      isConfirmed: false,
    }));

    const dateLabel = formatDisplayDate(draft.preferredDate);
    const carouselMsg: ChatMessage = {
      id: `a-carousel-${Date.now()}`,
      sender: 'ai',
      text: lang === 'ta'
        ? `${draft.department}-க்கான மருத்துவர்கள் (${dateLabel}, ${draft.timeSlot}): மருத்துவரைத் தேர்வு செய்து சந்திப்பை உறுதிப்படுத்தவும்.`
        : `Here are the available doctors for ${draft.department} on ${dateLabel} (${draft.timeSlot}). You can select a doctor and confirm your appointment.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doctorCarousel: {
        department: draft.department,
        date: draft.preferredDate,
        timeSlot: draft.timeSlot,
        hospitalName: draft.hospitalName,
        selectedDoctorId: firstDoc?.doctorCode || 'DOC001',
        selectedSlot: firstSlot,
        doctors: carouselDocs,
      },
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, carouselMsg],
          };
        }
        return s;
      })
    );
  };

  const handleTriggerAppointmentBooking = (userQueryText?: string) => {
    const userPrompt = userQueryText || (lang === 'en' ? 'I want to book an appointment' : 'நான் மருத்துவ சந்திப்பை முன்பதிவு செய்ய விரும்புகிறேன்');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const initialDraft = {
      hospitalId: 'HG-H002',
      hospitalName: 'Govt Medical College & Hospital (GMCH)',
      patientType: (activeBeneficiary ? 'family' : 'myself') as 'myself' | 'family',
      beneficiaryName: activeBeneficiary?.name,
      department: 'General Medicine',
      condition: activeAppointmentDraft.condition || 'Fever & headache for 3 days',
      preferredDate: '2025-09-29',
      timeSlot: 'Morning' as 'Morning' | 'Afternoon' | 'Evening',
      isConfirmed: false,
    };

    setActiveAppointmentDraft(initialDraft);

    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      sender: 'ai',
      text: lang === 'ta'
        ? 'நிச்சயமாக! உங்களுக்கு மருத்துவ சந்திப்பை முன்பதிவு செய்ய உதவுகிறேன்.\nஉங்களுக்கான சிறந்த நேரத்தைத் தேர்வு செய்ய சில விவரங்களை வழங்கவும்.'
        : 'Sure! I can help you book an appointment.\nPlease tell me a few details so I can find the best available slots for you.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appointmentStepper: {
        id: `stepper-${Date.now()}`,
        hospitalId: initialDraft.hospitalId,
        hospitalName: initialDraft.hospitalName,
        patientType: initialDraft.patientType,
        beneficiaryName: initialDraft.beneficiaryName,
        department: initialDraft.department,
        condition: initialDraft.condition,
        preferredDate: initialDraft.preferredDate,
        timeSlot: initialDraft.timeSlot,
        isSubmitted: false,
      },
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMsg, botMsg],
          };
        }
        return s;
      })
    );
  };

  const handleCheckMedicinePrices = () => {
    handleSendMessage(lang === 'ta' ? 'பாரசிட்டமால் மற்றும் மெட்ஃபோர்மின் ஜன் ஔஷதி விலையை சரிபார்க்கவும்' : 'Check Jan Aushadhi prices for Paracetamol 650mg, Metformin 500mg, and Combiflam');
  };

  const handleFindNearestClinic = () => {
    handleSendMessage(lang === 'ta' ? 'அருகிலுள்ள அவசர சிகிச்சை மற்றும் OPD கிளினிக்குகளைக் கண்டறியவும்' : 'Find nearest hospital casualty and OPD clinics with bed availability');
  };

  const handleViewReports = () => {
    setIsVitalsModalOpen(true);
  };

  const handleTalkToDoctor = () => {
    setIsLiveVisionOpen(true);
  };

  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  const renderAppointmentStepper = (msg: ChatMessage) => {
    const stepper = msg.appointmentStepper;
    if (!stepper) return null;

    const departments = [
      'General Medicine',
      'Cardiology',
      'Orthopaedics',
      'Dermatology',
      'Pediatrics',
      'ENT & Otorhinolaryngology',
      'Gynecology & Obstetrics',
      'Neurology'
    ];

    const isSubmitted = stepper.isSubmitted || activeAppointmentDraft.isConfirmed;

    return (
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white border border-teal-200/90 shadow-sm space-y-4 animate-in fade-in duration-200">
        {/* Hospital Selector Header Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                {lang === 'en' ? 'Selected Facility' : 'தேர்ந்தெடுக்கப்பட்ட மருத்துவமனை'}
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {activeAppointmentDraft.hospitalName || stepper.hospitalName}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setIsHospitalPickerOpen(!isHospitalPickerOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-teal-200 text-xs font-bold text-teal-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{lang === 'en' ? 'Change' : 'மாற்று'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isHospitalPickerOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 max-h-56 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Available Hospitals' : 'கிடைக்கக்கூடிய மருத்துவமனைகள்'}
                </div>
                {INITIAL_HOSPITALS.map((hosp) => (
                  <button
                    key={hosp.id}
                    type="button"
                    onClick={() => {
                      setActiveAppointmentDraft((prev) => ({
                        ...prev,
                        hospitalId: hosp.code,
                        hospitalName: hosp.name,
                      }));
                      setIsHospitalPickerOpen(false);
                      setToastMessage(lang === 'en' ? `Switched to ${hosp.name}` : `${hosp.name} தேர்ந்தெடுக்கப்பட்டது`);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      activeAppointmentDraft.hospitalId === hosp.code
                        ? 'bg-teal-50 text-teal-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate">{hosp.name}</span>
                    <span className="text-[10px] font-mono text-teal-600 shrink-0 ml-1.5">
                      {hosp.availableBeds} beds
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 1. Who is the appointment for? */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] inline-flex items-center justify-center font-bold">1</span>
            <span>{lang === 'en' ? 'Who is the appointment for?' : 'யாருக்கான மருத்துவ சந்திப்பு?'}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => {
                setActiveAppointmentDraft((prev) => ({
                  ...prev,
                  patientType: 'myself',
                  beneficiaryName: undefined,
                }));
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeAppointmentDraft.patientType === 'myself'
                  ? 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-500/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>{lang === 'en' ? 'Myself' : 'எனக்கு'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => {
                setActiveAppointmentDraft((prev) => ({
                  ...prev,
                  patientType: 'family',
                  beneficiaryName: activeBeneficiary?.name || prev.beneficiaryName || 'Family Member',
                }));
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeAppointmentDraft.patientType === 'family'
                  ? 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-500/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>{lang === 'en' ? 'Family Member' : 'குடும்ப உறுப்பினர்'}</span>
            </button>
          </div>

          {activeAppointmentDraft.patientType === 'family' && (
            <div className="pt-1.5">
              <input
                type="text"
                disabled={isSubmitted}
                value={activeAppointmentDraft.beneficiaryName || ''}
                onChange={(e) =>
                  setActiveAppointmentDraft((prev) => ({
                    ...prev,
                    beneficiaryName: e.target.value,
                  }))
                }
                placeholder={lang === 'en' ? "Enter family member's full name" : 'குடும்ப உறுப்பினரின் முழு பெயர்'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-teal-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* 2. Select Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] inline-flex items-center justify-center font-bold">2</span>
              <span>{lang === 'en' ? 'Select Department' : 'மருத்துவத் துறையைத் தேர்வு செய்க'}</span>
            </span>
            <span className="text-[10px] text-teal-700 font-bold">
              {activeAppointmentDraft.department}
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {departments.slice(0, 5).map((dept) => {
              const isSelected = activeAppointmentDraft.department.toLowerCase() === dept.toLowerCase();
              return (
                <button
                  key={dept}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => {
                    setActiveAppointmentDraft((prev) => ({
                      ...prev,
                      department: dept,
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {dept}
                </button>
              );
            })}

            <div className="relative inline-block">
              <button
                type="button"
                disabled={isSubmitted}
                onClick={() => setIsDepartmentPickerOpen(!isDepartmentPickerOpen)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'en' ? 'More' : 'மேலும்'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDepartmentPickerOpen && (
                <div className="absolute left-0 top-full mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30">
                  {departments.slice(5).map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        setActiveAppointmentDraft((prev) => ({
                          ...prev,
                          department: dept,
                        }));
                        setIsDepartmentPickerOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inbuilt Fill-in-the-blank Doctor Name Input */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'en' ? 'To which Doctor? (Type name or leave blank for any)' : 'எந்த மருத்துவருக்கு? (பெயரை உள்ளிடவும் அல்லது காலியாக விடவும்)'}</span>
              </label>
              {doctorNameSearch && (
                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setDoctorNameSearch('')}
                  className="text-[10px] text-teal-700 hover:underline cursor-pointer"
                >
                  {lang === 'en' ? 'Clear' : 'அழி'}
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                disabled={isSubmitted}
                value={doctorNameSearch}
                onChange={(e) => setDoctorNameSearch(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., Dr. Mohamed, Dr. Revathi, Dr. Arjun...' : 'எ.கா., Dr. Mohamed, Dr. Revathi...'}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Inbuilt Fill-in-the-blank Condition & Doctor Name Input inside Chat */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] inline-flex items-center justify-center font-bold">3</span>
            <span>{lang === 'en' ? 'Condition / Chief Complaint' : 'மருத்துவ நிலை / அறிகுறிகள்'}</span>
          </label>
          <input
            type="text"
            disabled={isSubmitted}
            value={activeAppointmentDraft.condition}
            onChange={(e) =>
              setActiveAppointmentDraft((prev) => ({
                ...prev,
                condition: e.target.value,
              }))
            }
            placeholder={lang === 'en' ? 'e.g., Fever & headache for 3 days, cough, joint pain...' : 'எ.கா., 3 நாட்களாக காய்ச்சல் மற்றும் தலைவலி...'}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none transition-all shadow-2xs"
          />
        </div>

        {/* 4. Preferred Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] inline-flex items-center justify-center font-bold">4</span>
              <span>{lang === 'en' ? 'Preferred Date' : 'விரும்பிய தேதி'}</span>
            </span>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {formatDisplayDate(activeAppointmentDraft.preferredDate)}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              disabled={isSubmitted}
              value={activeAppointmentDraft.preferredDate}
              onChange={(e) =>
                setActiveAppointmentDraft((prev) => ({
                  ...prev,
                  preferredDate: e.target.value,
                }))
              }
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:border-teal-500 outline-none"
            />
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const iso = tomorrow.toISOString().slice(0, 10);
                setActiveAppointmentDraft((prev) => ({ ...prev, preferredDate: iso }));
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
            >
              {lang === 'en' ? 'Tomorrow' : 'நாளை'}
            </button>
          </div>
        </div>

        {/* 5. Preferred Time Slot */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] inline-flex items-center justify-center font-bold">5</span>
            <span>{lang === 'en' ? 'Preferred Time Slot' : 'விரும்பிய நேரம்'}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { slot: 'Morning', labelEn: 'Morning', time: '8 AM - 12 PM', icon: '☀️' },
              { slot: 'Afternoon', labelEn: 'Afternoon', time: '12 PM - 4 PM', icon: '🌤️' },
              { slot: 'Evening', labelEn: 'Evening', time: '4 PM - 8 PM', icon: '🌙' },
            ].map((item) => {
              const isSelected = activeAppointmentDraft.timeSlot === item.slot;
              return (
                <button
                  key={item.slot}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() =>
                    setActiveAppointmentDraft((prev) => ({
                      ...prev,
                      timeSlot: item.slot as any,
                    }))
                  }
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold ring-1 ring-teal-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm">{item.icon}</div>
                  <div className="text-xs font-bold leading-tight mt-0.5">{item.labelEn}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{item.time}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Width Action Button: Find Available Doctors */}
        <button
          type="button"
          disabled={isSubmitted}
          onClick={() => handleFindAvailableDoctors(stepper)}
          className="w-full py-3 rounded-xl bg-[#057A55] hover:bg-[#046A4A] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'en' ? 'Find Available Doctors' : 'மருத்துவர்களைக் காண்க'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDoctorCarousel = (msg: ChatMessage) => {
    const carousel = msg.doctorCarousel;
    if (!carousel || !carousel.doctors || carousel.doctors.length === 0) return null;

    const curIdx = carouselIndices[msg.id] || 0;
    const curDoc = carousel.doctors[curIdx] || carousel.doctors[0];
    const totalDocs = carousel.doctors.length;

    const handlePrev = () => {
      setCarouselIndices((prev) => ({
        ...prev,
        [msg.id]: (curIdx - 1 + totalDocs) % totalDocs,
      }));
    };

    const handleNext = () => {
      setCarouselIndices((prev) => ({
        ...prev,
        [msg.id]: (curIdx + 1) % totalDocs,
      }));
    };

    const handleSelectSlot = (slot: string) => {
      setActiveAppointmentDraft((prev) => ({
        ...prev,
        selectedDoctor: curDoc,
        selectedSlot: slot,
      }));
      setToastMessage(
        lang === 'en'
          ? `Selected ${curDoc.name} for ${slot}`
          : `${curDoc.name} - ${slot} தேர்ந்தெடுக்கப்பட்டது`
      );
    };

    return (
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white border border-teal-200/90 shadow-sm space-y-4 animate-in fade-in duration-200">
        {/* Carousel Header with Navigation Arrows */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              {lang === 'en' ? `Available Specialist (${curIdx + 1} of ${totalDocs})` : `மருத்துவர் (${curIdx + 1} / ${totalDocs})`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer"
              title="Previous Doctor"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer"
              title="Next Doctor"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor Card Profile */}
        <div className="flex items-start gap-3.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-teal-200 shrink-0 bg-slate-100 shadow-2xs">
            <img
              src={curDoc.avatarUrl}
              alt={curDoc.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">{curDoc.name}</h4>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            </div>

            <div className="text-xs font-medium text-teal-800">
              {curDoc.department} • {curDoc.specialization}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
              <span>{curDoc.qualification}</span>
              <span>•</span>
              <span>{curDoc.experienceYears} yrs exp</span>
              <span>•</span>
              <span className="font-semibold text-teal-700">{curDoc.opdRoom}</span>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span>{curDoc.rating} ({curDoc.reviewsCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Time Slots Pills */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>{lang === 'en' ? 'Select Available Slot:' : 'நேரத்தைத் தேர்ந்தெடுக்கவும்:'}</span>
            <span className="text-[10px] text-slate-500 font-medium">OPD Consultation</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {curDoc.availableSlots.map((slot) => {
              const isSelected =
                activeAppointmentDraft.selectedDoctor?.doctorCode === curDoc.doctorCode &&
                activeAppointmentDraft.selectedSlot === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSelectSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50/50'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctor Selection Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {lang === 'en' ? 'Selected:' : 'தேர்வு:'}{' '}
            <strong className="text-teal-900">
              {activeAppointmentDraft.selectedDoctor?.name === curDoc.name
                ? `${curDoc.name} (${activeAppointmentDraft.selectedSlot || '09:00 AM'})`
                : 'Tap a slot above'}
            </strong>
          </div>

          {activeAppointmentDraft.isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'en' ? 'Confirmed' : 'உறுதி செய்யப்பட்டது'}</span>
            </span>
          ) : activeAppointmentDraft.selectedDoctor?.doctorCode === curDoc.doctorCode ? (
            <button
              type="button"
              onClick={handleConfirmAppointment}
              className="px-4 py-2 rounded-xl bg-[#057A55] hover:bg-[#046A4A] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>{lang === 'en' ? 'Confirm Appointment' : 'சந்திப்பை உறுதி செய்'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const defaultSlot = curDoc.availableSlots[0] || '09:00 AM';
                handleSelectSlot(activeAppointmentDraft.selectedSlot || defaultSlot);
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {lang === 'en' ? 'Select Doctor' : 'மருத்துவரைத் தேர்வுசெய்'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAppointmentSummaryCard = () => {
    const draft = activeAppointmentDraft;
    const patientName = draft.patientType === 'family' && draft.beneficiaryName
      ? draft.beneficiaryName
      : currentUser?.name || 'Myself';

    const doctor = draft.selectedDoctor;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-200/90 shadow-sm space-y-4">
        {/* Title */}
        <div
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          className="flex items-center justify-between pb-3 border-b border-slate-100 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'en' ? 'Appointment Summary' : 'சந்திப்பு சுருக்கம்'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {draft.isConfirmed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Confirmed</span>
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSummaryExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isSummaryExpanded && (
          <>
            {/* Details list */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{lang === 'en' ? 'Patient' : 'நோயாளி'}</span>
                <span className="font-bold text-slate-900">{patientName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{lang === 'en' ? 'Department' : 'துறை'}</span>
                <span className="font-bold text-teal-800">{draft.department}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{lang === 'en' ? 'Hospital' : 'மருத்துவமனை'}</span>
                <span className="font-bold text-slate-800 text-right max-w-42.5 truncate" title={draft.hospitalName}>
                  {draft.hospitalName}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{lang === 'en' ? 'Date' : 'தேதி'}</span>
                <span className="font-bold text-slate-900">{formatDisplayDate(draft.preferredDate)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{lang === 'en' ? 'Time Slot' : 'நேரம்'}</span>
                <span className="font-bold text-slate-900">
                  {draft.timeSlot} ({draft.selectedSlot || '09:00 AM'})
                </span>
              </div>

              {doctor && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">{lang === 'en' ? 'Doctor' : 'மருத்துவர்'}</span>
                  <span className="font-bold text-teal-900 text-right">
                    {doctor.name} <span className="text-[10px] text-slate-500">({doctor.opdRoom})</span>
                  </span>
                </div>
              )}

              {draft.condition && (
                <div className="py-1">
                  <span className="text-slate-500 font-medium block mb-0.5">{lang === 'en' ? 'Chief Complaint' : 'அறிகுறிகள்'}</span>
                  <span className="font-semibold text-slate-800 text-[11px] bg-slate-50 p-2 rounded-lg block border border-slate-200/60">
                    {draft.condition}
                  </span>
                </div>
              )}
            </div>

            {/* Primary Action Button: Confirm Appointment */}
            {!draft.isConfirmed ? (
              <button
                type="button"
                onClick={handleConfirmAppointment}
                className="w-full py-3 rounded-xl bg-[#057A55] hover:bg-[#046A4A] text-white text-xs font-bold shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'en' ? 'Confirm Appointment' : 'சந்திப்பை உறுதிப்படுத்து'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'en' ? 'Appointment Confirmed!' : 'சந்திப்பு உறுதி செய்யப்பட்டது!'}</span>
                </div>
                <p className="text-[10px] text-emerald-700">
                  {lang === 'en' ? 'Digital OPD Pass generated in chat below.' : 'OPD பாஸ் உருவாக்கப்பட்டது.'}
                </p>
              </div>
            )}

            <div className="text-[10px] text-center text-slate-400 font-medium">
              {lang === 'en'
                ? '✓ Verified Hospital OPD Token • Zero Waiting at Counter'
                : '✓ சரிபார்க்கப்பட்ட OPD டோக்கன் • கவுண்டரில் வரிசையில் நிற்க தேவையில்லை'}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderConfirmedBookingPass = (pass: Appointment) => {
    return (
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-linear-to-br from-emerald-50/90 via-teal-50/80 to-white border border-emerald-300 shadow-sm space-y-3.5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                {lang === 'en' ? 'Official Hospital OPD Digital Pass' : 'அரசு மருத்துவமனை OPD டிஜிட்டல் பாஸ்'}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">
                Govt Medical College & Hospital (GMCH)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold shadow-2xs">
            <QrCode className="w-3 h-3" />
            <span>{pass.appointment_id}</span>
          </div>
        </div>

        {/* Pass Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-white/80 border border-emerald-200/60">
            <span className="text-[10px] text-slate-500 font-medium block">Patient</span>
            <span className="font-bold text-slate-900 truncate block">{pass.patient_name}</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-emerald-200/60">
            <span className="text-[10px] text-slate-500 font-medium block">Doctor</span>
            <span className="font-bold text-teal-900 truncate block">{pass.doctor_name}</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-emerald-200/60">
            <span className="text-[10px] text-slate-500 font-medium block">Date & Time</span>
            <span className="font-bold text-slate-900 truncate block">
              {formatDisplayDate(pass.appointment_date)} • {pass.appointment_time}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-emerald-200/60">
            <span className="text-[10px] text-slate-500 font-medium block">Department / Room</span>
            <span className="font-bold text-emerald-800 truncate block">{pass.department}</span>
          </div>
        </div>

        {/* Pass Action Buttons */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPrintingAppointment(pass)}
            className="px-3 py-1.5 rounded-xl bg-[#057A55] hover:bg-[#046A4A] text-white text-xs font-bold shadow-2xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Print / Download Slip' : 'சீட்டை அச்சிடு'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadIcs(pass)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{lang === 'en' ? 'Add to Calendar (.ics)' : 'காலண்டரில் சேர்'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerRescheduleForPass(pass)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>{lang === 'en' ? 'Reschedule Slot' : 'நேரத்தை மாற்று'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerCancelForPass(pass)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'en' ? 'Cancel Slot' : 'ரத்து செய்'}</span>
          </button>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Govt+Medical+College+Hospital+Chennai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'en' ? 'Get Directions' : 'வழித்தடம்'}</span>
          </a>
        </div>
      </div>
    );
  };

  const renderMedicineCard = (med: MedicineItem) => {
    return (
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-linear-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-300 shadow-sm space-y-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {med.genericName}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">
                Dosage: {med.dosage} • {med.form} • {med.manufacturer}
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
            Save {med.savingsPercentage}%
          </span>
        </div>

        {/* Pricing comparison box */}
        <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium line-through">
              Branded MRP: ₹{med.brandPrice.toFixed(2)}
            </div>
            <div className="text-sm font-extrabold text-emerald-700 font-mono">
              Jan Aushadhi Price: ₹{med.genericPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              {med.brandName}
            </span>
          </div>
        </div>

        {/* Clinical usage */}
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-medium text-[11px] text-slate-600">
            {lang === 'ta' ? med.indicationsTa : med.indicationsEn}
          </p>
          <div className="text-[10px] text-teal-800 font-semibold bg-teal-50 p-1.5 rounded-lg border border-teal-200/60">
            Pack: {med.packSize} • WHO-GMP Certified Quality
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (onNavigateMedicines) onNavigateMedicines();
              else setToastMessage(lang === 'en' ? 'Opening Medicine Store...' : 'மருந்துக் கடை திறக்கப்படுகிறது...');
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Jan Aushadhi Store' : 'ஜன் ஔஷதி கடை'}</span>
          </button>

          <button
            type="button"
            onClick={() => setToastMessage(lang === 'en' ? 'Locating nearest Kendra within 5 km...' : 'அருகிலுள்ள மையம் தேடப்படுகிறது...')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-900 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>{lang === 'en' ? 'Locate Kendra' : 'மையத்தைக் காண்க'}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderRescheduleCard = (msg: ChatMessage) => {
    const card = msg.rescheduleCard;
    if (!card) return null;

    const draft = rescheduleDrafts[card.id] || {
      date: card.selectedDate,
      timeSlot: card.selectedTimeSlot,
      slot: card.selectedSlot,
    };

    const slotOptions =
      draft.timeSlot === 'Evening'
        ? ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM']
        : draft.timeSlot === 'Afternoon'
        ? ['12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM']
        : ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];

    return (
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-linear-to-br from-teal-50/90 via-sky-50/60 to-white border border-teal-300 shadow-sm space-y-3.5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-teal-200/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-950">
                {lang === 'en' ? 'Reschedule OPD Appointment' : 'சந்திப்பை மாற்றியமைக்கவும்'}
              </div>
              <div className="text-[10px] text-teal-700 font-semibold">
                Token: {card.appointmentId} • {card.doctorName}
              </div>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            card.isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
          }`}>
            {card.isSubmitted ? (lang === 'en' ? '✓ Rescheduled' : '✓ மாற்றப்பட்டது') : (lang === 'en' ? 'Select New Slot' : 'நேரத்தைத் தேர்வு செய்க')}
          </span>
        </div>

        {card.isSubmitted ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <div className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'en' ? 'Reschedule Confirmed!' : 'புதிய நேரம் உறுதி செய்யப்பட்டது!'}</span>
            </div>
            <p className="text-[10px] text-emerald-700">
              {lang === 'en'
                ? `Shifted to ${formatDisplayDate(card.selectedDate)} at ${card.selectedSlot}. Your updated pass and queue token are active below.`
                : `${formatDisplayDate(card.selectedDate)} ${card.selectedSlot}-க்கு மாற்றப்பட்டது.`}
            </p>
          </div>
        ) : (
          <>
            {/* Current Appointment Banner */}
            <div className="p-2.5 rounded-xl bg-white/90 border border-teal-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Current Booking</span>
                <span className="font-semibold text-slate-800">
                  {formatDisplayDate(card.currentDate)} • {card.currentTime}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-medium block">Department</span>
                <span className="font-bold text-teal-900">{card.department}</span>
              </div>
            </div>

            {/* Step 1: Select Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                {lang === 'en' ? '1. Choose New Date' : '1. புதிய தேதியைத் தேர்ந்தெடுக்கவும்'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {card.availableDates.map((d) => {
                  const isSel = draft.date === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() =>
                        setRescheduleDrafts((prev) => ({
                          ...prev,
                          [card.id]: { ...draft, date: d.date },
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white hover:bg-teal-50 border border-teal-200 text-slate-700'
                      }`}
                    >
                      {d.label} ({d.date.slice(5)})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Time Period */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                {lang === 'en' ? '2. Time of Day' : '2. நேரப் பிரிவு'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Morning', 'Afternoon', 'Evening'] as const).map((period) => {
                  const isSel = draft.timeSlot === period;
                  return (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        const newSlot =
                          period === 'Evening'
                            ? '04:30 PM'
                            : period === 'Afternoon'
                            ? '12:30 PM'
                            : '09:00 AM';
                        setRescheduleDrafts((prev) => ({
                          ...prev,
                          [card.id]: { ...draft, timeSlot: period, slot: newSlot },
                        }));
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        isSel
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white hover:bg-teal-50 border border-teal-200 text-slate-700'
                      }`}
                    >
                      {period}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Select Exact Slot */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                {lang === 'en' ? '3. Select Available Slot' : '3. கிடைக்கக்கூடிய நேரம்'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {slotOptions.map((slot) => {
                  const isSel = draft.slot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setRescheduleDrafts((prev) => ({
                          ...prev,
                          [card.id]: { ...draft, slot },
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-teal-900 text-white ring-2 ring-teal-500 shadow-xs'
                          : 'bg-white hover:bg-teal-50 border border-teal-200 text-teal-950'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button: Confirm Reschedule */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleExecuteReschedule(msg.id, card.appointmentId, draft.date, draft.slot)
                }
                className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? `Confirm Reschedule to ${draft.slot}`
                    : `${draft.slot}-க்கு மாற்றுவதை உறுதி செய்`}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCancelCard = (msg: ChatMessage) => {
    const card = msg.cancelCard;
    if (!card) return null;

    const currentReason = cancelReasons[card.id] || card.selectedReason || card.availableReasons[0];

    return (
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-linear-to-br from-rose-50/90 via-amber-50/60 to-white border border-rose-300 shadow-sm space-y-3.5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-rose-200/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-950">
                {lang === 'en' ? 'Cancel OPD Appointment' : 'சந்திப்பை ரத்து செய்க'}
              </div>
              <div className="text-[10px] text-rose-700 font-semibold">
                Token: {card.appointmentId} • {card.doctorName}
              </div>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            card.isSubmitted ? 'bg-rose-200 text-rose-900' : 'bg-rose-100 text-rose-800'
          }`}>
            {card.isSubmitted ? (lang === 'en' ? '✓ Cancelled' : '✓ ரத்து செய்யப்பட்டது') : (lang === 'en' ? 'Action Required' : 'உறுதிப்படுத்தவும்')}
          </span>
        </div>

        {card.isSubmitted ? (
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-center space-y-1">
            <div className="text-xs font-bold text-rose-900 flex items-center justify-center gap-1">
              <Check className="w-4 h-4 text-rose-600" />
              <span>{lang === 'en' ? 'Appointment Cancelled' : 'சந்திப்பு ரத்து செய்யப்பட்டது'}</span>
            </div>
            <p className="text-[10px] text-rose-700">
              {lang === 'en'
                ? `Booking token ${card.appointmentId} has been successfully released. Your health records and consultation history remain securely saved.`
                : `${card.appointmentId} டோக்கன் விடுவிக்கப்பட்டது. உங்கள் மருத்துவக் குறிப்புகள் பாதுகாப்பாக உள்ளன.`}
            </p>
          </div>
        ) : (
          <>
            {/* Booking Details */}
            <div className="p-2.5 rounded-xl bg-white/90 border border-rose-200 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Patient</span>
                <span className="font-bold text-slate-800 truncate block">{card.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Date & Time</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {formatDisplayDate(card.appointmentDate)} • {card.appointmentTime}
                </span>
              </div>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                {lang === 'en' ? 'Reason for Cancellation' : 'ரத்து செய்வதற்கான காரணம்'}
              </label>
              <div className="flex flex-col gap-1.5">
                {card.availableReasons.map((r) => {
                  const isSel = currentReason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setCancelReasons((prev) => ({
                          ...prev,
                          [card.id]: r,
                        }))
                      }
                      className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSel
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 font-semibold'
                          : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{r}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-rose-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Releasing this slot frees the OPD token for other waiting patients.'
                  : 'இந்த ஸ்லாட்டை ரத்து செய்வது மற்ற நோயாளிகளுக்கு வாய்ப்பளிக்கும்.'}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExecuteCancellation(msg.id, card.appointmentId, currentReason)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Yes, Cancel Appointment' : 'ஆம், சந்திப்பை ரத்து செய்'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderVisualNavCard = (card: VisualModulePreview) => {
    const handleNavClick = () => {
      if (card.moduleKey === 'maps') {
        if (_onOpenDiseaseMap) _onOpenDiseaseMap();
        else window.location.assign('/maps');
      } else if (card.moduleKey === 'medicines') {
        if (onNavigateMedicines) onNavigateMedicines();
        else window.location.assign('/medicines');
      } else if (card.moduleKey === 'records') {
        if (onNavigateProfile) onNavigateProfile();
        else window.location.assign('/profile');
      } else if (card.moduleKey === 'emergency') {
        if (onOpenAmbulance) onOpenAmbulance();
        else window.location.assign('#emergency');
      } else if (card.moduleKey === 'erp') {
        window.location.assign('/erp');
      }
    };

    return (
      <div className="mt-3.5 overflow-hidden rounded-2xl border border-teal-200/90 bg-linear-to-b from-white to-teal-50/40 shadow-xs transition-all hover:shadow-md animate-in fade-in duration-200">
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-900 group">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="h-full w-full object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-600/95 text-white backdrop-blur-md shadow-xs">
              <Sparkles className="w-3 h-3 text-teal-200" />
              {card.badge}
            </span>
          </div>
        </div>
        <div className="p-3.5 sm:p-4">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
            {card.title}
          </h4>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {card.description}
          </p>
          <button
            type="button"
            onClick={handleNavClick}
            className="mt-3 w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs shadow-teal-600/20 transition-all cursor-pointer"
          >
            <span>{card.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderActionConfirmationCard = (card: AgentActionConfirmation, msgId: string) => {
    const handleConfirm = () => {
      if (card.actionType === 'EMERGENCY_AMBULANCE') {
        agenticTools.emergencySOSDispatch('RED', 'Emergency dispatch confirmed by user');
        if (onOpenAmbulance) onOpenAmbulance();
      } else if (card.actionType === 'CHRONIC_REFILL') {
        agenticTools.scheduleChronicRefill30Days(card.payload.medication, card.payload.dosage, card.payload.days);
      }
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === msgId && m.actionConfirmation
              ? {
                  ...m,
                  actionConfirmation: { ...m.actionConfirmation, status: 'CONFIRMED' },
                }
              : m
          ),
        }))
      );
    };

    const handleCancel = () => {
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === msgId && m.actionConfirmation
              ? {
                  ...m,
                  actionConfirmation: { ...m.actionConfirmation, status: 'CANCELLED' },
                }
              : m
          ),
        }))
      );
    };

    if (card.status === 'CONFIRMED') {
      return (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>Action Executed:</strong> {card.title} confirmed and active.</span>
        </div>
      );
    }

    if (card.status === 'CANCELLED') {
      return (
        <div className="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-2 animate-in fade-in">
          <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Action cancelled. No changes were made to your account.</span>
        </div>
      );
    }

    return (
      <div className="mt-3 p-3.5 rounded-2xl border border-amber-300 bg-amber-50/80 shadow-xs animate-in fade-in">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Action Permission Required</span>
        </div>
        <h5 className="mt-1 font-semibold text-slate-900 text-xs sm:text-sm">{card.title}</h5>
        <p className="mt-1 text-xs text-slate-700 leading-relaxed">{card.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{card.confirmLabel}</span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <span>{card.cancelLabel}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderLiveQueueTracker = (tracker: LiveQueueTrackerData, msgId?: string) => {
    const isWayfindingOpen = expandedWayfinding[tracker.id] || false;

    return (
      <div className="mt-4 rounded-2xl bg-linear-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/40 p-4 sm:p-5 text-white shadow-xl space-y-4 animate-in fade-in duration-200">
        {/* Header HUD */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-800/50">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="text-[11px] font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <span>{lang === 'en' ? 'Live OPD Queue Radar' : 'நேரலை OPD வரிசை ரேடார்'}</span>
              </div>
              <div className="text-xs font-bold text-slate-200">
                {tracker.opdRoom} • {tracker.doctorName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-300 font-mono hidden sm:inline">
              {tracker.lastUpdated}
            </span>
            {msgId && (
              <button
                type="button"
                onClick={() => handleRefreshQueueTracker(msgId, tracker)}
                className="p-1.5 rounded-lg bg-teal-900/60 hover:bg-teal-800 text-teal-300 transition-colors cursor-pointer"
                title="Refresh Live Queue"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3-Column Cockpit Metric Displays */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Card 1: Your Token */}
          <div className="p-3 rounded-xl bg-white/5 border border-teal-500/30 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-teal-300/80">
              {lang === 'en' ? 'Your Token' : 'உங்கள் டோக்கன்'}
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight my-0.5">
              #{tracker.tokenDisplay}
            </span>
            <span className="text-[10px] text-slate-300 truncate max-w-full font-medium">
              {tracker.patientName}
            </span>
          </div>

          {/* Card 2: Now Serving */}
          <div className="p-3 rounded-xl bg-white/5 border border-teal-500/30 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-teal-300/80">
              {lang === 'en' ? 'Now Serving' : 'தற்போது அழைப்பு'}
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono tracking-tight my-0.5">
              #{String(tracker.currentServingToken).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-emerald-300 font-medium">
              {tracker.currentServingToken >= tracker.tokenNumber
                ? (lang === 'en' ? 'Your Turn Now!' : 'உங்கள் முறை!')
                : (lang === 'en' ? 'In Consultation' : 'ஆலோசனை நடக்கிறது')}
            </span>
          </div>

          {/* Card 3: Est. Wait */}
          <div className="p-3 rounded-xl bg-white/5 border border-teal-500/30 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-teal-300/80">
              {lang === 'en' ? 'Est. Wait' : 'எதிர்பார்க்கும் நேரம்'}
            </span>
            <span className="text-2xl font-black text-white font-mono tracking-tight my-0.5">
              ~{tracker.estimatedWaitMinutes}m
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              {tracker.patientsAhead} {lang === 'en' ? 'ahead' : 'முன்னால்'}
            </span>
          </div>
        </div>

        {/* 4-Stage Queue Timeline Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 1. Booked
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 2. Checked In
            </span>
            <span className={`${tracker.patientsAhead > 0 ? 'text-amber-300 font-bold' : 'text-emerald-400'} flex items-center gap-1`}>
              <Clock className="w-3 h-3" /> 3. In Waiting Room
            </span>
            <span className={`${tracker.currentServingToken >= tracker.tokenNumber ? 'text-emerald-300 font-bold' : 'text-slate-500'} flex items-center gap-1`}>
              <Stethoscope className="w-3 h-3" /> 4. Consultation
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full w-1/4"></div>
            <div className="bg-emerald-500 h-full w-1/4"></div>
            <div className={`h-full w-1/4 ${tracker.patientsAhead === 0 ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
            <div className={`h-full w-1/4 ${tracker.currentServingToken >= tracker.tokenNumber ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></div>
          </div>
        </div>

        {/* Interactive Alerts & Wayfinding Drawer */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          {msgId && (
            <button
              type="button"
              onClick={() => handleToggleQueueAlert(msgId, tracker)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                tracker.alertPingActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-teal-500/30'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>
                {tracker.alertPingActive
                  ? (lang === 'en' ? 'SMS & Push Alert Active' : 'விழிப்பூட்டல் இயக்கத்தில் உள்ளது')
                  : (lang === 'en' ? 'Set 5-Min SMS Alert' : 'SMS விழிப்பூட்டல் அமைக்க')}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setExpandedWayfinding((prev) => ({
                ...prev,
                [tracker.id]: !isWayfindingOpen,
              }))
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isWayfindingOpen ? (lang === 'en' ? 'Hide Floor Wayfinding' : 'வழியை மறைக்க') : (lang === 'en' ? 'OPD Room Wayfinding' : 'மருத்துவமனை வழித்தடம்')}</span>
          </button>
        </div>

        {/* Expandable Floor Navigation Guide */}
        {isWayfindingOpen && (
          <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-500/40 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{tracker.hospitalName} • Block B OPD Center</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>Enter via Main Hospital Gate 2 (OPD Registration Porch)</li>
              <li>Take the Lift or Escalator to <strong className="text-white">1st Floor - Wing B</strong></li>
              <li>Proceed past the Jan Aushadhi Pharmacy Counter to <strong className="text-white">{tracker.opdRoom}</strong></li>
              <li>Show your digital QR token at the Nurse Station for immediate vitals triage</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  const toggleMultiOption = (messageId: string, option: string) => {
    // Auditory feedback for rural & visually impaired patients
    const speechText = option.replace(/[🚨🏥💊📹🩺]/g, '').trim();
    if (speechText) {
      speechEngine.speak(speechText, lang === 'ta' ? 'ta' : 'en');
    }

    setSelectedMultiOptions((prev) => {
      const current = prev[messageId] || [];
      if (current.includes(option)) {
        return { ...prev, [messageId]: current.filter((x) => x !== option) };
      }
      return { ...prev, [messageId]: [...current, option] };
    });
  };

  const speakAllOptions = (items: string[]) => {
    const cleanList = items.map((i) => i.replace(/[🚨🏥💊📹🩺]/g, '').trim()).join('. ');
    const prefix = lang === 'ta' ? 'கிடைக்கக்கூடிய தேர்வுகள்: ' : 'Available choices: ';
    speechEngine.speak(prefix + cleanList, lang === 'ta' ? 'ta' : 'en');
  };

  const handleSendMultiOptions = (messageId: string) => {
    const selected = selectedMultiOptions[messageId] || [];
    if (selected.length === 0 || isThinking) return;
    const prompt = selected.join(', ');
    handleSendMessage(prompt);
  };

  const handleWizardOptionSelect = (
    messageId: string,
    wizard: TriageWizard,
    step: TriageWizardStep,
    option: TriageWizardOption
  ) => {
    // Auditory feedback
    const label = lang === 'ta' ? option.labelTa : option.labelEn;
    if (label) {
      speechEngine.speak(label, lang === 'ta' ? 'ta' : 'en');
    }

    const current = wizardStates[messageId] || {
      currentStepIndex: 0,
      answers: {},
      isCompleted: false,
    };

    if (current.isCompleted) return;

    const newAnswers = {
      ...current.answers,
      [step.id]: option,
    };

    const nextIndex = current.currentStepIndex + 1;
    const isFinished = nextIndex >= wizard.steps.length;

    setWizardStates((prev) => ({
      ...prev,
      [messageId]: {
        currentStepIndex: isFinished ? current.currentStepIndex : nextIndex,
        answers: newAnswers,
        isCompleted: isFinished,
      },
    }));

    if (isFinished) {
      // Auto-submit structured clinical assessment back into the conversation
      const summaryItems = wizard.steps.map((s) => {
        const chosen = newAnswers[s.id];
        const stepName = lang === 'ta' ? s.titleTa : s.titleEn;
        const optText = chosen ? (lang === 'ta' ? chosen.labelTa : chosen.labelEn) : 'None';
        return `${stepName}: ${optText}`;
      });
      const topicName = lang === 'ta' ? wizard.topicTa : wizard.topicEn;
      const clinicalPayload = `Clinical Assessment (${topicName}): [${summaryItems.join(' | ')}]`;
      handleSendMessage(clinicalPayload);
    }
  };

  const handleWizardStepBack = (messageId: string) => {
    setWizardStates((prev) => {
      const cur = prev[messageId];
      if (!cur || cur.currentStepIndex <= 0 || cur.isCompleted) return prev;
      return {
        ...prev,
        [messageId]: {
          ...cur,
          currentStepIndex: cur.currentStepIndex - 1,
        },
      };
    });
  };

  const speakWizardQuestion = (question: string) => {
    speechEngine.speak(question, lang === 'ta' ? 'ta' : 'en');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setToastMessage(lang === 'en' ? 'Image exceeds 10MB limit' : 'படம் 10MB அளவை தாண்டியுள்ளது');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const sizeKb = Math.round(file.size / 1024);
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        const mkd = markItDownService.cleanRawDocumentToMarkdown(`Symptom Photo Capture: ${file.name}`);
        setAttachedPhoto({
          dataUrl: reader.result,
          fileName: file.name,
          fileSize: sizeStr,
        });
        setStagedAttachment({
          file,
          fileName: file.name,
          fileSize: sizeStr,
          fileType: 'photo',
          dataUrl: reader.result,
          parsedMarkdown: mkd.markdown,
          tokenEstimate: mkd.tokenEstimate,
        });
        setToastMessage(
          lang === 'en'
            ? 'Photo staged. Follow up with voice or type your symptoms before sending.'
            : 'புகைப்படம் இணைக்கப்பட்டது. அனுப்பும் முன் அறிகுறிகளைப் பேசவும் அல்லது எழுதவும்.'
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setTimeout(() => chatInputRef.current?.focus(), 100);
  };

  const handlePrintSbar = (sbar: SbarHandoverBrief) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HealthGrid SBAR Clinical Handover - ${sbar.patientName || 'Patient'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.5; }
            h1 { font-size: 20px; color: #047857; margin-bottom: 4px; border-bottom: 2px solid #047857; padding-bottom: 6px; }
            .meta { font-size: 12px; color: #475569; margin-bottom: 20px; padding: 6px 0; }
            .section { margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc; }
            .section-title { font-weight: 800; font-size: 13px; text-transform: uppercase; color: #0f766e; margin-bottom: 6px; letter-spacing: 0.05em; }
            .section-content { font-size: 13px; color: #1e293b; white-space: pre-wrap; }
            .footer { margin-top: 28px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>HealthGrid Clinical Handover Slip (SBAR Protocol)</h1>
          <div class="meta">
            Patient: <strong>${sbar.patientName || 'Evaluated Patient'}</strong> (${sbar.ageGender || 'Unspecified'}) • Time: ${sbar.timestamp} • Attending: ${sbar.attendingPhysician || 'Triage Officer'}
          </div>
          <div class="section">
            <div class="section-title">S — Situation</div>
            <div class="section-content">${sbar.situation}</div>
          </div>
          <div class="section">
            <div class="section-title">B — Background</div>
            <div class="section-content">${sbar.background}</div>
          </div>
          <div class="section">
            <div class="section-title">A — Assessment</div>
            <div class="section-content">${sbar.assessment}</div>
          </div>
          <div class="section">
            <div class="section-title">R — Recommendation</div>
            <div class="section-content">${sbar.recommendation}</div>
          </div>
          <div class="footer">
            Generated autonomously by HealthGrid DocBot Clinical Engine • For Emergency & Hospital Consultation
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopySbar = (sbar: SbarHandoverBrief) => {
    const text = `SBAR CLINICAL HANDOVER BRIEF (HealthGrid)
Patient: ${sbar.patientName || 'Evaluated Patient'} (${sbar.ageGender || ''})
Time: ${sbar.timestamp}

[SITUATION]
${sbar.situation}

[BACKGROUND]
${sbar.background}

[ASSESSMENT]
${sbar.assessment}

[RECOMMENDATION]
${sbar.recommendation}`;
    navigator.clipboard.writeText(text);
    setToastMessage(lang === 'en' ? 'SBAR handover copied to clipboard' : 'SBAR அறிக்கை நகலெடுக்கப்பட்டது');
  };

  const handleSaveQuickVitalsToMemory = () => {
    let loggedCount = 0;
    if (quickVitals.systolic && quickVitals.diastolic) {
      const sys = Number(quickVitals.systolic);
      const dia = Number(quickVitals.diastolic);
      if (!isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0) {
        healthMemoryService.addEntry('blood_pressure', { systolic: sys, diastolic: dia }, 'mmHg', 'manual_entry');
        loggedCount++;
      }
    }
    if (quickVitals.heartRate) {
      const hr = Number(quickVitals.heartRate);
      if (!isNaN(hr) && hr > 0) {
        healthMemoryService.addEntry('heart_rate', hr, 'bpm', 'manual_entry');
        loggedCount++;
      }
    }
    if (quickVitals.spo2) {
      const spo2Val = Number(quickVitals.spo2);
      if (!isNaN(spo2Val) && spo2Val > 0) {
        healthMemoryService.addEntry('spo2', spo2Val, '%', 'manual_entry');
        loggedCount++;
      }
    }
    if (quickVitals.temperature) {
      const tempVal = Number(quickVitals.temperature);
      if (!isNaN(tempVal) && tempVal > 0) {
        healthMemoryService.addEntry('temperature', tempVal, '°F', 'manual_entry');
        loggedCount++;
      }
    }
    if (quickVitals.bloodSugar) {
      const sugarVal = Number(quickVitals.bloodSugar);
      if (!isNaN(sugarVal) && sugarVal > 0) {
        const timingMap: Record<string, 'fasting' | 'postprandial' | 'random'> = {
          fasting: 'fasting',
          post_prandial: 'postprandial',
          random: 'random',
        };
        healthMemoryService.addEntry(
          'blood_sugar',
          { glucose: sugarVal, timing: timingMap[quickVitals.sugarType] || 'random' },
          'mg/dL',
          'manual_entry'
        );
        loggedCount++;
      }
    }

    if (loggedCount > 0) {
      setVitalsSavedNotice(true);
      setTimeout(() => setVitalsSavedNotice(false), 2500);
    }
    return loggedCount;
  };

  const handleConsultWithQuickVitals = () => {
    handleSaveQuickVitalsToMemory();
    const summaryParts: string[] = [];
    if (quickVitals.systolic && quickVitals.diastolic) {
      summaryParts.push(`BP: ${quickVitals.systolic}/${quickVitals.diastolic} mmHg`);
    }
    if (quickVitals.heartRate) {
      summaryParts.push(`Pulse: ${quickVitals.heartRate} bpm`);
    }
    if (quickVitals.spo2) {
      summaryParts.push(`SpO2: ${quickVitals.spo2}%`);
    }
    if (quickVitals.temperature) {
      summaryParts.push(`Temp: ${quickVitals.temperature}°F`);
    }
    if (quickVitals.bloodSugar) {
      const label = quickVitals.sugarType === 'fasting' ? 'Fasting' : quickVitals.sugarType === 'post_prandial' ? 'Post-meal' : 'Random';
      summaryParts.push(`Blood Sugar: ${quickVitals.bloodSugar} mg/dL (${label})`);
    }

    if (summaryParts.length === 0) {
      setToastMessage(lang === 'en' ? 'Please enter at least one vital reading' : 'குறைந்தது ஒரு அளவீட்டையாவது உள்ளிடவும்');
      return;
    }

    setIsQuickVitalsDrawerOpen(false);
    const consultPrompt = lang === 'ta'
      ? `எனது தற்போதைய உடலியல் அளவீடுகள்: ${summaryParts.join(', ')}. இவற்றை மருத்துவ நெறிமுறைகளின்படி மதிப்பீடு செய்து எனக்கு வழிகாட்டவும்.`
      : `My vitals logged right now: ${summaryParts.join(', ')}. Please evaluate these against standard clinical reference ranges and advise if anything needs attention.`;

    handleSendMessage(consultPrompt);
  };

  const handleOptionSelect = (opt: string) => {
    // Auditory confirmation
    const speechText = opt.replace(/[🚨🏥💊📹🩺]/g, '').trim();
    if (speechText) {
      speechEngine.speak(speechText, lang === 'ta' ? 'ta' : 'en');
    }

    const cleanOpt = opt.toLowerCase();
    if (cleanOpt.includes('108') || cleanOpt.includes('emergency') || cleanOpt.includes('ambulance')) {
      if (onOpenAmbulance) {
        onOpenAmbulance();
        return;
      }
      window.location.href = 'tel:108';
      return;
    }
    if (cleanOpt.includes('kendra') || cleanOpt.includes('jan aushadhi') || cleanOpt.includes('generic store') || cleanOpt.includes('find medicines')) {
      if (onNavigateMedicines) {
        onNavigateMedicines();
        return;
      }
    }
    if (cleanOpt.includes('video doctor') || cleanOpt.includes('live vision') || cleanOpt.includes('video consult')) {
      setIsLiveVisionOpen(true);
      return;
    }
    if (cleanOpt.includes('vitals') || cleanOpt.includes('record bp') || cleanOpt.includes('telemetry')) {
      setIsVitalsModalOpen(true);
      return;
    }
    if (cleanOpt.includes('upload prescription') || cleanOpt.includes('scan prescription')) {
      if (_onOpenPrescription) {
        _onOpenPrescription();
        return;
      }
    }
    if (cleanOpt.includes('nearest hospital') || cleanOpt.includes('casualty')) {
      if (onOpenAmbulance) {
        onOpenAmbulance();
        return;
      }
    }
    // Otherwise standard conversational query
    handleSendMessage(opt);
  };

  // Subscribe to active family beneficiary updates
  useEffect(() => {
    return familyMemberService.subscribe((_members, active) => {
      setActiveBeneficiary(active);
    });
  }, []);

  // Subscribe to proactive Care-Loop recovery tasks
  useEffect(() => {
    return careLoopService.subscribe((loops) => {
      setActiveCareLoops(loops.filter((l) => l.status === 'PENDING'));
    });
  }, []);

  // Sync auth state and enforce clean slate on logout
  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
      if (!user) {
        setSessions([createFreshSession()]);
        setActiveSessionId(`chat-${Date.now()}`);
      }
    });
    return unsub;
  }, []);

  // Context Menu State for Right-Click on Chat History
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    sessionId: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    sessionId: '',
  });

  // Inline Rename State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const checkAuth = (customNotice?: string): boolean => {
    const user = authService.getCurrentUser();
    if (user) return true;
    const notice =
      customNotice ||
      (lang === 'en'
        ? 'Sign in or create an account to start your consultation'
        : 'மருத்துவ ஆலோசனையைத் தொடங்க உள்நுழையவும் அல்லது புதிய கணக்கு தொடங்கவும்');
    setLoginNotice(notice);
    setToastMessage(notice);
    setIsLoginOpen(true);
    return false;
  };

  const withAuth = (action: () => void, customNotice?: string): void => {
    if (checkAuth(customNotice)) {
      action();
    } else {
      pendingActionRef.current = action;
    }
  };

  const ensureAuth = (action?: () => void, customNotice?: string): boolean => {
    if (action) {
      withAuth(action, customNotice);
      return Boolean(authService.getCurrentUser());
    }
    return checkAuth(customNotice);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setLoginNotice(null);
    if (pendingActionRef.current) {
      const act = pendingActionRef.current;
      pendingActionRef.current = null;
      setTimeout(() => act(), 100);
    } else {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  };

  // Sync initial search query if transferred from landing hero
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputText(initialQuery.trim());
      if (authService.getCurrentUser()) {
        handleSendMessage(initialQuery.trim());
      }
    }
  }, [initialQuery]);

  // Subscribe to auth changes and load isolated user chat sessions from Supabase
  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
      if (user) {
        loadSupabaseSessions(user.id);
      }
    });
  }, []);

  const loadSupabaseSessions = async (userId: string) => {
    try {
      const { data: dbSessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase sessions query error:', error);
        return;
      }

      if (dbSessions && dbSessions.length > 0) {
        const sessionIds = dbSessions.map((s) => s.id);
        const { data: dbMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true });

        const mapped: ChatSession[] = dbSessions.map((s) => {
          const msgs: ChatMessage[] = (dbMessages || [])
            .filter((m) => m.session_id === s.id)
            .map((m) => ({
              id: m.id,
              sender: m.sender as 'user' | 'ai',
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              liked: m.liked === true,
              disliked: m.liked === false,
              usageMeta: m.model_name
                ? {
                    latencyMs: m.latency_ms || 0,
                    totalTokens: m.total_tokens || 0,
                    modelName: m.model_name,
                  }
                : undefined,
            }));

          const isToday = new Date(s.created_at).toDateString() === new Date().toDateString();
          return {
            id: s.id,
            title: s.title,
            dateGroup: isToday ? 'Today' : 'Previous 7 Days',
            pinned: s.is_pinned || false,
            archived: s.is_archived || false,
            messages: msgs,
          };
        });

        setSessions(mapped);
        if (mapped.length > 0) {
          setActiveSessionId(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load chat sessions from Supabase:', err);
    }
  };

  const persistMessage = async (msg: { session_id: string; sender: string; text: string; latency_ms?: number; total_tokens?: number; model_name?: string }) => {
    try {
      await supabase.from('chat_messages').insert(msg);
    } catch (err) {
      console.warn('Failed to persist message to Supabase:', err);
    }
  };

  const updateSessionInDb = async (sessionId: string, updates: Record<string, any>) => {
    try {
      await supabase.from('chat_sessions').update(updates).eq('id', sessionId);
    } catch (err) {
      console.warn('Failed to update session in Supabase:', err);
    }
  };

  const deleteSessionInDb = async (sessionId: string) => {
    try {
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
    } catch (err) {
      console.warn('Failed to delete session in Supabase:', err);
    }
  };

  // Auto-scroll on new message or thinking state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isThinking]);

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  // Auto-dismiss toast alert after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Clean up speech engine on unmount
  useEffect(() => {
    return () => {
      speechEngine.stopListening();
      speechEngine.stopSpeaking();
    };
  }, []);

  // Voice input handling with speechEngine and pulse animation
  const handleToggleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      setToastMessage(lang === 'en' ? 'Processing speech...' : 'குரல் பதிவு செயலாக்கப்படுகிறது...');
      await speechEngine.stopListening();
      return;
    }

    if (isVoiceSpeaking) {
      speechEngine.stopSpeaking();
      setIsVoiceSpeaking(false);
    }

    setIsRecording(true);
    setToastMessage(
      lang === 'en'
        ? 'Listening... Speak symptoms in English or Tamil (Tap mic or "Done" to finish)'
        : 'கேட்கிறது... தமிழில் அல்லது English-ல் பேசவும் (முடிக்க மைக் தட்டவும்)'
    );

    await speechEngine.startListening(lang, {
      onTranscript: (transcript, isFinal) => {
        if (transcript && transcript.trim()) {
          setInputText(transcript);
        }
        if (isFinal) {
          const normalized = TanglishNormalizer.normalize(transcript);
          if (normalized.isRedFlag) {
            console.info('Urgent medical keyword detected in speech:', normalized.detectedKeywords);
          }
          setToastMessage(
            lang === 'en'
              ? `Heard: "${transcript.slice(0, 32)}${transcript.length > 32 ? '...' : ''}"`
              : `பதிவு: "${transcript.slice(0, 32)}${transcript.length > 32 ? '...' : ''}"`
          );
        }
      },
      onStateChange: (state) => {
        if (state === 'idle') {
          setIsRecording(false);
        } else if (state === 'processing') {
          setToastMessage(lang === 'en' ? 'Transcribing with Whisper AI...' : 'குரல் உரை மாற்றப்படுகிறது...');
        } else if (state === 'error') {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        console.warn('Voice input error:', err);
        setIsRecording(false);
        setToastMessage(err);
      },
    });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create New Chat
  const handleNewChat = async () => {
    agiService.resetLivingClinicalDossier();
    const defaultTitle = lang === 'en' ? 'New Consultation' : 'புதிய ஆலோசனை';
    let newId = `chat-${Date.now()}`;

    if (currentUser) {
      try {
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: currentUser.id,
            title: defaultTitle,
          })
          .select()
          .single();

        if (!error && newSession) {
          newId = newSession.id;
        }
      } catch (err) {
        console.warn('Could not create new session in Supabase:', err);
      }
    }

    const newChat: ChatSession = {
      id: newId,
      title: defaultTitle,
      dateGroup: 'Today',
      messages: [],
    };
    setSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newId);
  };

  // Submit Prompt to AGI Doctor
  const handleSendMessage = async (textToSend?: string) => {
    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
    }

    if (isSendingRef.current || isThinking) return;

    const rawQuery = (textToSend || inputText).trim();
    const photoToAttach = attachedPhoto;
    const currentStaged = stagedAttachment;
    if (!rawQuery && !photoToAttach && !currentStaged) return;

    let defaultPrompt = '';
    if (currentStaged) {
      if (currentStaged.fileType === 'prescription') {
        defaultPrompt = lang === 'ta'
          ? 'இணைக்கப்பட்ட மருத்துவச் சீட்டை (Prescription) ஆய்வு செய்து, பரிந்துரைக்கப்பட்ட மருந்துகள், அளவுமுறை, சாத்தியமான முரண்பாடுகள் மற்றும் ஜன் ஔஷதி மலிவு விலை மாற்று மருந்துகளைக் கண்டறியவும்.'
          : 'Please analyze this clinical prescription, verify medications, dosages, potential contraindications, and identify authentic Jan Aushadhi generic equivalents.';
      } else if (currentStaged.fileType === 'lab_report') {
        defaultPrompt = lang === 'ta'
          ? 'இணைக்கப்பட்ட பரிசோதனை அறிக்கையை (Lab Report) ஆய்வு செய்து, இயல்பான மற்றும் அசாதாரண குறிகாட்டிகள் மற்றும் அடுத்த கட்ட மருத்துவ நடவடிக்கைகளை விளக்குக.'
          : 'Please evaluate this laboratory diagnostic report, highlighting abnormal parameters, clinical implications, and actionable follow-ups.';
      } else {
        defaultPrompt = lang === 'ta'
          ? 'இணைக்கப்பட்ட மருத்துவ ஆவணத்தை பகுப்பாய்வு செய்து தேவையான மருத்துவ வழிகாட்டுதல்களை வழங்கவும்.'
          : 'Please clinically review this attached medical document and advise.';
      }
    } else if (photoToAttach) {
      defaultPrompt = lang === 'ta'
        ? 'தயவுசெய்து இந்த புகைப்படத்தை ஆய்வு செய்து (தடிப்பு, தொண்டை, கண் சிவத்தல் அல்லது அறிகுறிகள்), வழிகாட்டவும்.'
        : 'Please analyze this clinical symptom photo (skin rash, throat, eye redness, or physical signs) and advise me.';
    }

    const query = rawQuery || defaultPrompt;

    isSendingRef.current = true;
    setInputText('');
    setAttachedPhoto(null);
    setStagedAttachment(null);
    setIsThinking(true);

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageDataUrl: photoToAttach?.dataUrl || currentStaged?.dataUrl,
      attachmentName: photoToAttach?.fileName || currentStaged?.fileName,
      stagedDocumentType: currentStaged?.fileType,
    };

    // Update session title if it was default
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isFirstQuery = s.messages.length === 0;
          return {
            ...s,
            title: isFirstQuery ? query.slice(0, 26) + (query.length > 26 ? '...' : '') : s.title,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setInputText('');
    setIsThinking(true);

    // If active session is in Supabase (UUID), persist user message
    const isSupabaseSession = currentUser && activeSessionId && activeSessionId.length > 20 && !activeSessionId.startsWith('chat-');
    if (isSupabaseSession) {
      persistMessage({
        session_id: activeSessionId,
        sender: 'user',
        text: query,
      });

      if (activeSession && activeSession.messages.length === 0) {
        const titleSnippet = query.slice(0, 26) + (query.length > 26 ? '...' : '');
        updateSessionInDb(activeSessionId, { title: titleSnippet });
      }
    }

    try {
      let patientContext: string | undefined = undefined;

      const currentBeneficiary = familyMemberService.getActiveBeneficiary();
      if (currentBeneficiary) {
        // Third-Person Caregiver Consultation Mode
        const parts: string[] = [
          `CAREGIVER CONSULTATION MODE: The user is consulting on behalf of their ${currentBeneficiary.relationship}, ${currentBeneficiary.name}`,
          `Patient: ${currentBeneficiary.name}`,
          `Relationship to user: ${currentBeneficiary.relationship}`,
          `Age: ${currentBeneficiary.age} years old`,
          `Gender: ${currentBeneficiary.gender}`,
          `Health ID: ${currentBeneficiary.healthId}`,
          `BEDSIDE MANNER DIRECTIVE: You MUST address the user in the third person regarding the patient as a caring family member/caregiver (e.g. "I understand you are consulting for your ${currentBeneficiary.relationship.toLowerCase()}, ${currentBeneficiary.name}. What symptoms is she/he currently experiencing?"). Calibrate triage questions, red flags, and safe dosages for a ${currentBeneficiary.age}-year-old ${currentBeneficiary.gender}. Inquire gently about any chronic conditions or daily medications ${currentBeneficiary.name} takes.`
        ];
        if (currentBeneficiary.chronicConditions && currentBeneficiary.chronicConditions.length > 0) {
          parts.push(`Known Conditions: ${currentBeneficiary.chronicConditions.join(', ')}`);
        }
        if (currentBeneficiary.allergies && currentBeneficiary.allergies.length > 0) {
          parts.push(`Known Allergies: ${currentBeneficiary.allergies.join(', ')}`);
        }
        patientContext = parts.join('. ') + '.';
      } else {
        const patientProfile = medicalRecordService.getProfile();
        const conditions = (patientProfile.chronicConditions || []).filter(c => Boolean(c) && !c.toLowerCase().includes('seasonal'));
        const allergies = (patientProfile.allergies || []).filter(a => Boolean(a) && !a.toLowerCase().includes('penicillin'));
        const hasName = Boolean(
          patientProfile.name &&
          patientProfile.name.trim() &&
          !patientProfile.name.toLowerCase().includes('murugan') &&
          !patientProfile.name.toLowerCase().includes('verified patient')
        );

        // Only attach clinical context if user is signed in with legitimate, non-mock profile data
        if (currentUser && (hasName || conditions.length > 0 || allergies.length > 0)) {
          const parts: string[] = [];
          if (hasName) parts.push(`Patient: ${patientProfile.name.trim()}`);
          if (patientProfile.age > 0) parts.push(`Age: ${patientProfile.age}y`);
          if (conditions.length > 0) parts.push(`Chronic Conditions: ${conditions.join(', ')}`);
          if (allergies.length > 0) parts.push(`Drug Allergies: ${allergies.join(', ')}`);
          if (parts.length > 0) {
            patientContext = parts.join('. ') + '.';
          }
        }
        // Attach Chronological Medical Records Timeline so past records are referenced by exact date
        const timelineSummary = medicalRecordService.getChronologicalTimelineSummary();
        if (timelineSummary) {
          patientContext = patientContext
            ? `${patientContext} Patient Past Medical Records (Chronological Order): ${timelineSummary}`
            : `Patient Past Medical Records (Chronological Order): ${timelineSummary}`;
        }
      }

      const history = (activeSession?.messages || []).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await agiService.consultAgiDoctor(
        query,
        history,
        patientContext,
        undefined,
        photoToAttach?.dataUrl || currentStaged?.dataUrl,
        currentStaged?.parsedMarkdown
      );

      // Check for medicine queries or generic savings intent
      const lowerQuery = query.toLowerCase();
      const isMedicineIntent =
        lowerQuery.includes('medicine') ||
        lowerQuery.includes('tablet') ||
        lowerQuery.includes('syrup') ||
        lowerQuery.includes('jan aushadhi') ||
        lowerQuery.includes('kendra') ||
        lowerQuery.includes('generic') ||
        lowerQuery.includes('paracetamol') ||
        lowerQuery.includes('dolo') ||
        lowerQuery.includes('metformin') ||
        lowerQuery.includes('combiflam') ||
        lowerQuery.includes('pantop') ||
        lowerQuery.includes('pantocid') ||
        lowerQuery.includes('விலை') ||
        lowerQuery.includes('மருந்து');

      let matchedMedicine: MedicineItem | undefined = undefined;
      if (isMedicineIntent) {
        const matches = medicineStoreService.findGenericMatches(query);
        if (matches.length > 0) {
          matchedMedicine = matches[0];
        } else {
          matchedMedicine = medicineStoreService.getCatalog()[0] || INITIAL_CACHE_CATALOG[0];
        }
      }

      // Parse natural language booking, reschedule, cancel, and clinical intents
      const nlp = NlpBookingParser.parse(query);

      // Look up patient's existing active appointments
      const patientHealthId = currentBeneficiary?.healthId || currentUser?.healthId || 'HG001245';
      const patientAppts = appointmentService.getAppointmentsForPatient(patientHealthId);
      const activeAppts = patientAppts.filter((a) => a.status !== 'Cancelled');
      const latestActiveAppt = activeAppts[0] || appointmentService.getAppointments().find((a) => a.status !== 'Cancelled');

      let cancelCardData: CancelCardData | undefined = undefined;
      if (nlp.hasCancelIntent && latestActiveAppt) {
        cancelCardData = {
          id: `cancel-${Date.now()}`,
          appointmentId: latestActiveAppt.appointment_id,
          patientName: latestActiveAppt.patient_name,
          doctorName: latestActiveAppt.doctor_name,
          department: latestActiveAppt.department,
          appointmentDate: latestActiveAppt.appointment_date,
          appointmentTime: latestActiveAppt.appointment_time,
          selectedReason: 'Conflict in schedule',
          availableReasons: [
            'Conflict in schedule',
            'Feeling better / Symptoms resolved',
            'Consulted another physician',
            'Transportation / Personal emergency',
          ],
          isSubmitted: false,
        };
      }

      let rescheduleCardData: RescheduleCardData | undefined = undefined;
      if (nlp.hasRescheduleIntent && latestActiveAppt && !cancelCardData) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const dayAfter = new Date(now);
        dayAfter.setDate(now.getDate() + 2);

        const slotTimes =
          (nlp.timeSlot || 'Morning') === 'Evening'
            ? ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM']
            : (nlp.timeSlot || 'Morning') === 'Afternoon'
            ? ['12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM']
            : ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];

        rescheduleCardData = {
          id: `resched-${Date.now()}`,
          appointmentId: latestActiveAppt.appointment_id,
          patientName: latestActiveAppt.patient_name,
          doctorName: latestActiveAppt.doctor_name,
          department: latestActiveAppt.department,
          currentDate: latestActiveAppt.appointment_date,
          currentTime: latestActiveAppt.appointment_time,
          availableDates: [
            { label: 'Today', date: now.toISOString().slice(0, 10) },
            { label: 'Tomorrow', date: tomorrow.toISOString().slice(0, 10) },
            { label: 'Day After', date: dayAfter.toISOString().slice(0, 10) },
          ],
          selectedDate: nlp.preferredDate || tomorrow.toISOString().slice(0, 10),
          selectedTimeSlot: nlp.timeSlot || 'Morning',
          availableSlots: slotTimes,
          selectedSlot: nlp.exactSlot || slotTimes[0],
          isSubmitted: false,
        };
      }

      let generatedStepper: AppointmentStepperData | undefined = undefined;
      let generatedCarousel: DoctorCarouselData | undefined = undefined;

      if (nlp.hasBookingIntent && !cancelCardData && !rescheduleCardData && !response.triageWizard) {
        const dept = nlp.department || (nlp.doctor ? nlp.doctor.department : activeAppointmentDraft.department) || 'General Medicine';
        const date = nlp.preferredDate || activeAppointmentDraft.preferredDate || new Date().toISOString().slice(0, 10);
        const period = nlp.timeSlot || activeAppointmentDraft.timeSlot || 'Morning';
        const cond = nlp.condition || activeAppointmentDraft.condition || query;
        const hospId = nlp.hospitalId || activeAppointmentDraft.hospitalId || 'HG-H002';
        const hospName = nlp.hospitalName || activeAppointmentDraft.hospitalName || 'Govt Medical College & Hospital (GMCH)';

        if (nlp.doctor) {
          const docSlotTimes =
            period === 'Evening'
              ? ['04:30 PM', '05:00 PM', '05:30 PM']
              : period === 'Afternoon'
              ? ['12:30 PM', '01:00 PM', '01:30 PM']
              : ['09:00 AM', '09:30 AM', '10:00 AM'];

          const chosenSlot = nlp.exactSlot || docSlotTimes[0];

          const docCard: DoctorSlotCard = {
            id: nlp.doctor.id,
            doctorCode: nlp.doctor.doctor_code || 'DOC001',
            name: nlp.doctor.name,
            department: nlp.doctor.department,
            specialization: nlp.doctor.specialization || 'Clinical Specialist',
            qualification: nlp.doctor.qualification || 'MBBS, MD',
            opdRoom: nlp.doctor.opd_room || 'Room 101',
            experienceYears: nlp.doctor.experience_years || 10,
            rating: 4.8,
            reviewsCount: 320,
            avatarUrl: nlp.doctor.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
            availableSlots: docSlotTimes,
            selectedSlot: chosenSlot,
          };

          const allDocs = doctorOpdService.getDoctors();
          const otherDocs = allDocs
            .filter((d) => d.id !== nlp.doctor?.id && d.department.toLowerCase().includes(dept.toLowerCase()))
            .slice(0, 2)
            .map((d, i) => ({
              id: d.id,
              doctorCode: d.doctor_code || `DOC00${i + 2}`,
              name: d.name,
              department: d.department,
              specialization: d.specialization || 'Clinical Specialist',
              qualification: d.qualification || 'MBBS, MD',
              opdRoom: d.opd_room || `Room 10${i + 2}`,
              experienceYears: d.experience_years || 8,
              rating: 4.6,
              reviewsCount: 200,
              avatarUrl: d.avatar_url || 'https://images.unsplash.com/photo-1594824813583-7740e53a3eb2?auto=format&fit=crop&q=80&w=200',
              availableSlots: docSlotTimes,
            }));

          const carouselDocs = [docCard, ...otherDocs];

          setActiveAppointmentDraft((prev) => ({
            ...prev,
            hospitalId: hospId,
            hospitalName: hospName,
            department: dept,
            condition: cond,
            preferredDate: date,
            timeSlot: period,
            selectedDoctor: docCard,
            selectedSlot: chosenSlot,
            isConfirmed: false,
          }));

          generatedCarousel = {
            department: dept,
            date,
            timeSlot: period,
            hospitalName: hospName,
            selectedDoctorId: docCard.doctorCode,
            selectedSlot: chosenSlot,
            doctors: carouselDocs,
          };
        } else {
          setActiveAppointmentDraft((prev) => ({
            ...prev,
            hospitalId: hospId,
            hospitalName: hospName,
            department: dept,
            condition: cond,
            preferredDate: date,
            timeSlot: period,
            isConfirmed: false,
          }));

          generatedStepper = {
            id: `stepper-${Date.now()}`,
            hospitalId: hospId,
            hospitalName: hospName,
            patientType: activeAppointmentDraft.patientType || (currentBeneficiary ? 'family' : 'myself'),
            beneficiaryName: currentBeneficiary?.name || activeAppointmentDraft.beneficiaryName,
            department: dept,
            condition: cond,
            preferredDate: date,
            timeSlot: period,
            isSubmitted: false,
          };
        }
      }

      let generatedQueueTracker: LiveQueueTrackerData | undefined = undefined;
      const isQueueQuery =
        lowerQuery.includes('queue') ||
        lowerQuery.includes('token') ||
        lowerQuery.includes('wait') ||
        lowerQuery.includes('வரிசை') ||
        lowerQuery.includes('டோக்கன்');

      if (isQueueQuery && latestActiveAppt && !cancelCardData && !rescheduleCardData) {
        generatedQueueTracker = createLiveQueueTrackerForAppointment(latestActiveAppt);
      }

      const aiMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: response.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotionalState: response.emotionalState,
        executedTools: response.executedTools,
        genericMedicines: response.genericMedicines,
        suggestedOptions: response.suggestedOptions,
        triageWizard: response.triageWizard,
        esiTriage: response.esiTriage,
        janAushadhiSavingsCard: response.janAushadhiSavingsCard,
        sbarHandover: response.sbarHandover,
        safetyCheck: response.safetyCheck,
        followUpChips: response.followUpChips,
        matchedMedicineCard: matchedMedicine,
        appointmentStepper: generatedStepper,
        doctorCarousel: generatedCarousel,
        rescheduleCard: rescheduleCardData,
        cancelCard: cancelCardData,
        liveQueueTracker: generatedQueueTracker,
        visualNavCard: response.visualNavCard,
        actionConfirmation: response.actionConfirmation,
        usageMeta: {
          latencyMs: response.usage.latencyMs,
          totalTokens: response.usage.totalTokens,
          modelName: response.usage.modelName || 'HealthGrid AGI Clinical Engine',
        },
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMessage],
            };
          }
          return s;
        })
      );

      // Persist AI response to Supabase
      if (isSupabaseSession) {
        persistMessage({
          session_id: activeSessionId,
          sender: 'ai',
          text: response.content,
          latency_ms: response.usage.latencyMs,
          total_tokens: response.usage.totalTokens,
          model_name: response.usage.modelName || 'HealthGrid AGI Clinical Engine',
        });
      }

      // Play audio TTS gently
      speechEngine.speak(
        response.content,
        lang,
        0.85,
        () => setIsVoiceSpeaking(true),
        () => setIsVoiceSpeaking(false)
      );

      // If life-threatening emergency, notify ambulance
      if (response.isEmergency && onOpenAmbulance) {
        setTimeout(() => {
          onOpenAmbulance();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      if (err?.message && err.message.toLowerCase().includes('rate limit')) {
        setToastMessage(err.message);
      } else {
        const fallbackAiMessage: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: lang === 'en'
            ? "I am currently assessing your clinical details. Please describe your symptoms or try again in a moment."
            : "உங்கள் அறிகுறிகளை ஆய்வு செய்கிறேன். தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, fallbackAiMessage] } : s))
        );
      }
    } finally {
      setIsThinking(false);
      isSendingRef.current = false;
    }
  };

  // In-Chat Clinical Document Staging (MarkItDown Token-Optimized, Non-Auto-Triggering)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!checkAuth(lang === 'en' ? 'Sign in to analyze medical documents' : 'மருத்துவ ஆவணங்களைப் பகுப்பாய்வு செய்ய உள்நுழையவும்')) {
      pendingActionRef.current = () => fileInputRef.current?.click();
      e.target.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setToastMessage(lang === 'en' ? 'Document exceeds 15MB limit' : 'ஆவணம் 15MB அளவை தாண்டியுள்ளது');
      e.target.value = '';
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const lowerName = file.name.toLowerCase();
    let docType: 'prescription' | 'lab_report' | 'photo' | 'document' = 'prescription';
    if (lowerName.includes('lab') || lowerName.includes('report') || lowerName.includes('blood') || lowerName.includes('test') || lowerName.includes('pathology')) {
      docType = 'lab_report';
    } else if (lowerName.endsWith('.pdf')) {
      docType = 'document';
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const dataUrl = reader.result;
          const mkd = markItDownService.convertPrescriptionToMarkdown({
            clinicOrHospital: 'Clinical Slip / Document',
            date: new Date().toLocaleDateString('en-GB'),
            diagnosisNotes: file.name.replace(/\.[^/.]+$/, ''),
            rawText: `Attached image document: ${file.name} (${sizeStr})`,
          });
          setAttachedPhoto({
            dataUrl,
            fileName: file.name,
            fileSize: sizeStr,
          });
          setStagedAttachment({
            file,
            fileName: file.name,
            fileSize: sizeStr,
            fileType: docType,
            dataUrl,
            parsedMarkdown: mkd.markdown,
            tokenEstimate: mkd.tokenEstimate,
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      const mkd = markItDownService.cleanRawDocumentToMarkdown(
        `Clinical Document: ${file.name}\nSize: ${sizeStr}\nFormat: PDF / Binary Diagnostic Record`,
        file.name
      );
      setStagedAttachment({
        file,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: docType,
        parsedMarkdown: mkd.markdown,
        tokenEstimate: mkd.tokenEstimate,
      });
    }

    setToastMessage(
      lang === 'en'
        ? `Staged "${file.name}". You can now type a question or tap the mic to speak before sending.`
        : `"${file.name}" இணைக்கப்பட்டது. அனுப்பும் முன் கேள்விகளைப் பேசலாம் அல்லது தட்டச்சு செய்யலாம்.`
    );
    e.target.value = '';
    setTimeout(() => chatInputRef.current?.focus(), 150);
  };

  // Conclude Live Vision Consultation & Generate Longitudinal Care-Loop Plan
  const handleLiveConsultationComplete = (summary: LiveConsultationSummary) => {
    const reportText = lang === 'en'
      ? `[Live Vision & Voice Tele-Clinic Consultation Report]\n` +
        `• Session Duration: ${Math.round(summary.durationSeconds)}s\n` +
        `• Chief Complaint: ${summary.chiefComplaint}\n` +
        `• Visual Observations:\n${summary.visualFindings.map(f => `  - ${f}`).join('\n')}\n` +
        `• Clinical Guidance & Advice:\n${summary.doctorConclusion}\n` +
        `• Scheduled Care-Loop: Proactive recovery check-in active in 24 hours.`
      : `[நிகழ்நேர கேமரா மருத்துவ அறிக்கை]\n` +
        `• ஆலோசனை நேரம்: ${Math.round(summary.durationSeconds)} வினாடிகள்\n` +
        `• அறிகுறிகள்: ${summary.chiefComplaint}\n` +
        `• காட்சிப் பதிவுகள்:\n${summary.visualFindings.map(f => `  - ${f}`).join('\n')}\n` +
        `• மருத்துவ வழிகாட்டுதல்:\n${summary.doctorConclusion}\n` +
        `• தீவிரக் கண்காணிப்பு: 24 மணிநேரத்தில் மறுபரிசீலனை நினைவூட்டல் தொடங்கப்பட்டது.`;

    const summaryMessage: ChatMessage = {
      id: `a-${Date.now()}`,
      sender: 'ai',
      text: reportText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      genericMedicines: summary.genericMedications,
      executedTools: [
        {
          id: `tool-${Date.now()}-live`,
          name: 'liveVisionDoctor',
          label: 'Live Vision Tele-Clinic HUD',
          status: 'success',
          resultSummary: `Concluded ${summary.durationSeconds}s stream with visual telemetry`,
        },
      ],
      usageMeta: {
        latencyMs: 310,
        totalTokens: 520,
        modelName: 'Gemini 2.5 Flash Vision',
      },
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: `Live Clinic: ${summary.chiefComplaint.slice(0, 16)}`,
            messages: [...s.messages, summaryMessage],
          };
        }
        return s;
      })
    );

    setToastMessage(lang === 'en' ? 'Live Tele-Clinic Consultation saved with 24h Care-Loop!' : 'நேரடி கேமரா ஆலோசனை சேமிக்கப்பட்டது!');
  };

  // Immediate Simulation of 24h Care-Loop Follow-up
  const handleSimulateCareLoopCheckIn = (loop: CareLoopFollowUp) => {
    const prompt = lang === 'en' ? loop.followUpPromptEn : loop.followUpPromptTa;
    const aiMessage: ChatMessage = {
      id: `a-${Date.now()}`,
      sender: 'ai',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotionalState: 'calm',
      executedTools: [
        {
          id: `tool-${Date.now()}-careloop`,
          name: 'careLoopRecoveryMonitor',
          label: 'Autonomous Proactive Care-Loop Follow-up',
          status: 'success',
          resultSummary: `24-Hour Recovery Check-in for ${loop.condition}`,
        },
      ],
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s))
    );

    speechEngine.speak(prompt.slice(0, 220), lang, 0.88);
  };

  // Right-click context menu handler
  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sessionId,
    });
  };

  // Pin / Unpin
  const handleTogglePin = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextPinned = !s.pinned;
          if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
            updateSessionInDb(sessionId, { is_pinned: nextPinned });
          }
          return { ...s, pinned: nextPinned };
        }
        return s;
      })
    );
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Start Rename
  const handleStartRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Commit Rename
  const handleSaveRename = (sessionId: string) => {
    if (editingTitle.trim()) {
      const trimmed = editingTitle.trim();
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
              updateSessionInDb(sessionId, { title: trimmed });
            }
            return { ...s, title: trimmed };
          }
          return s;
        })
      );
    }
    setEditingSessionId(null);
  };

  // Archive
  const handleArchive = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
            updateSessionInDb(sessionId, { is_archived: true });
          }
          return { ...s, archived: true };
        }
        return s;
      })
    );
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Delete
  const handleDeleteSession = (sessionId: string) => {
    if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
      deleteSessionInDb(sessionId);
    }
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Like / Dislike
  const handleToggleLike = (msgId: string, type: 'like' | 'dislike') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === msgId) {
                return {
                  ...m,
                  liked: type === 'like' ? !m.liked : false,
                  disliked: type === 'dislike' ? !m.disliked : false,
                };
              }
              return m;
            }),
          };
        }
        return s;
      })
    );
  };

  // Read Aloud
  const handleSpeakMessage = (text: string) => {
    if (isVoiceSpeaking) {
      speechEngine.stopSpeaking();
      setIsVoiceSpeaking(false);
    } else {
      speechEngine.speak(
        text,
        lang,
        1.1,
        () => setIsVoiceSpeaking(true),
        () => setIsVoiceSpeaking(false)
      );
    }
  };

  // Suggestion action card triggers (Tailored for Caregiver Mode when activeBeneficiary is chosen)
  const suggestionCards = activeBeneficiary
    ? [
        {
          titleEn: `Report symptoms for ${activeBeneficiary.name.split(' ')[0]}`,
          titleTa: `${activeBeneficiary.name.split(' ')[0]}-ன் அறிகுறிகள் கூற`,
          icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50',
          query: `My ${activeBeneficiary.relationship.toLowerCase()}, ${activeBeneficiary.name} (${activeBeneficiary.age}y ${activeBeneficiary.gender}), has had a persistent fever and fatigue for 2 days. What should we do?`,
        },
        {
          titleEn: `Check medicine doses for ${activeBeneficiary.name.split(' ')[0]}`,
          titleTa: `மருந்து டோஸ் சரிபார்க்க`,
          icon: <Pill className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50',
          query: `What is the safe medication dosage and precautions for a ${activeBeneficiary.age}-year-old ${activeBeneficiary.gender}?`,
        },
        {
          titleEn: 'Find hospital / specialist',
          titleTa: 'சிறப்பு மருத்துவமனை தேட',
          icon: <Building2 className="w-5 h-5 text-rose-600" />,
          bg: 'bg-rose-50',
          query: `Where is the nearest multi-specialty hospital with geriatric/pediatric care in Chennai?`,
        },
        {
          titleEn: 'Home care & diet tips',
          titleTa: 'வீட்டுப் பராமரிப்பு & உணவு',
          icon: <ShieldAlert className="w-5 h-5 text-teal-600" />,
          bg: 'bg-teal-50',
          query: `What diet, hydration, and home monitoring steps should I take for my ${activeBeneficiary.relationship.toLowerCase()} right now?`,
        },
      ]
    : [
        {
          titleEn: 'Ask about a symptom',
          titleTa: 'அறிகுறிகள் பற்றி கேட்க',
          icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50',
          query: 'I have had a sore throat, dry cough, and mild chills for 2 days.'
        },
        {
          titleEn: 'Check a medicine',
          titleTa: 'மருந்து விவரம் பார்க்க',
          icon: <Pill className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50',
          query: 'Can I take Paracetamol 500mg and Montelukast together?'
        },
        {
          titleEn: 'Find a nearby hospital',
          titleTa: 'அருகிலுள்ள மருத்துவமனை',
          icon: <Building2 className="w-5 h-5 text-rose-600" />,
          bg: 'bg-rose-50',
          query: 'Where is the nearest 24/7 Government Emergency Hospital in Chennai?'
        },
        {
          titleEn: 'Get first-aid guidance',
          titleTa: 'முதலுதவி வழிகாட்டுதல்',
          icon: <ShieldAlert className="w-5 h-5 text-teal-600" />,
          bg: 'bg-teal-50',
          query: 'What is the immediate first-aid for a sudden burn or cut at home?'
        }
      ];

  return (
    <div className="flex h-full w-full overflow-hidden font-sans bg-white text-slate-800">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Hidden File Input for Paperclip */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={() => {
          handleSendMessage('Attached prescription document. Please extract medicines and verify contraindications.');
        }}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dedicated Consultation History & Sessions) */}
      {/* ========================================================= */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        w-72 sm:w-80 md:w-64 lg:w-72 shrink-0 flex flex-col border-r bg-[#FAFCFB] border-slate-200/90
        transform transition-transform duration-200 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar Header: Title + Close Button on Mobile */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0A604D] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                {lang === 'en' ? 'Consultations' : 'உரையாடல்கள்'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {lang === 'en' ? 'Chat History & Vault' : 'முந்தைய குறிப்புகள்'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* + New Chat Pill Button */}
        <div className="p-3 pb-1">
          <button
            onClick={() => {
              ensureAuth(handleNewChat, lang === 'en' ? 'Sign in to start a new chat' : 'புதிய உரையாடலைத் தொடங்க உள்நுழையவும்');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E8F7F2] hover:bg-[#DDF2EB] text-[#0A604D] font-bold text-xs sm:text-sm transition-colors border border-[#C6ECE0] shadow-2xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'en' ? 'New Consultation' : 'புதிய உரையாடல்'}</span>
          </button>
        </div>

        {/* Recent Chats Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'en' ? 'Recent Chats' : 'முந்தைய உரையாடல்கள்'}
          </div>

          <div className="px-3 py-0.5 text-[10px] font-semibold text-slate-400">
            {lang === 'en' ? 'Today' : 'இன்று'}
          </div>

          <div className="space-y-0.5">
            {sessions
              .filter((s) => !s.archived)
              .map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = session.id === editingSessionId;

                return (
                  <div
                    key={session.id}
                    onContextMenu={(e) => handleContextMenu(e, session.id)}
                    className="relative group"
                  >
                    {isEditing ? (
                      <div className="px-3 py-1.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id);
                            if (e.key === 'Escape') setEditingSessionId(null);
                          }}
                          autoFocus
                          className="w-full text-xs px-2 py-1 bg-white border border-teal-500 rounded-md outline-none text-slate-800"
                        />
                        <button
                          onClick={() => handleSaveRename(session.id)}
                          className="p-1 text-teal-600 hover:text-teal-800"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (!authService.getCurrentUser()) {
                            ensureAuth();
                            return;
                          }
                          agiService.resetLivingClinicalDossier();
                          setActiveSessionId(session.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (!authService.getCurrentUser()) {
                              ensureAuth();
                              return;
                            }
                            agiService.resetLivingClinicalDossier();
                            setActiveSessionId(session.id);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isActive
                            ? 'bg-[#E8F7F2] text-[#0A604D] font-bold'
                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0A604D]' : 'text-slate-400'}`} />
                          <span className="truncate">{session.title}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {session.pinned && (
                            <Pin className="w-3 h-3 text-teal-600 fill-teal-600 shrink-0" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-slate-800 rounded transition-opacity"
                            title="Options"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Bottom Profile Footer (leads to /profile) */}
        <div className="p-3 border-t border-slate-200 bg-[#FAFCFB]">
          <button
            onClick={() => {
              if (currentUser) {
                onNavigateProfile();
              } else {
                setIsLoginOpen(true);
              }
            }}
            className="w-full p-2.5 rounded-2xl flex items-center justify-between text-xs transition-colors group cursor-pointer hover:bg-slate-100 text-slate-700"
            title={currentUser ? (lang === 'en' ? 'Open Profile Page' : 'சுயவிவரப் பக்கம்') : (lang === 'en' ? 'Click to Sign In' : 'உள்நுழைய கிளிக்')}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-xs ring-1 ring-teal-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-slate-900 truncate max-w-32.5">
                  {currentUser ? currentUser.name : (lang === 'en' ? 'Guest Patient' : 'விருந்தினர்')}
                </div>
                <div className="text-[10px] text-teal-600 font-medium">
                  {currentUser ? (lang === 'en' ? 'My Health Profile' : 'என் சுயவிவரம்') : (lang === 'en' ? 'Click to Sign In' : 'உள்நுழைய கிளிக்')}
                </div>
              </div>
            </div>
            <span className="text-slate-400 font-bold group-hover:text-teal-600 transition-colors">&gt;</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CHAT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Bar (Matching Chatbot UI.png) */}
        <header className="px-3 sm:px-6 py-2 sm:py-2.5 border-b flex items-center justify-between shrink-0 z-20 bg-white border-slate-200/90 gap-2">
          {/* Left: Mobile History Drawer Trigger + DocBot AI + Verified Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
              aria-label="Open consultation history"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0A604D]" />
              <span>{lang === 'en' ? 'History' : 'வரலாறு'}</span>
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-teal-50 border border-teal-200/60 p-1 flex items-center justify-center shadow-2xs shrink-0">
              <img
                src="/docbot_mascot.png"
                alt="DocBot AI"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">DocBot AI</h2>
              <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700">
                <span className="truncate max-w-27.5 sm:max-w-none">{lang === 'en' ? 'Verified Assistant' : 'சரிபார்க்கப்பட்டவர்'}</span>
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
              </div>
            </div>
          </div>

          {/* Right: Actions Header Pills (Clean, Minimal, Single Line, Zero Wrap) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* New Chat Pill */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(handleNewChat, lang === 'en' ? 'Sign in to start a new chat' : 'புதிய உரையாடலைத் தொடங்க உள்நுழையவும்');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-teal-200 bg-[#E8F7F2] hover:bg-[#DDF2EB] text-[#0A604D] text-[11px] sm:text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title={lang === 'en' ? 'Start fresh consultation' : 'புதிய உரையாடல்'}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{lang === 'en' ? 'New' : 'புதியது'}</span>
            </button>

            {/* Beneficiary Switcher Pill (ABDM Multi-Profile Standard) */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(
                  () => setIsBeneficiaryModalOpen(true),
                  lang === 'en'
                    ? 'Sign in to consult for family members'
                    : 'குடும்ப உறுப்பினர்களுக்காக ஆலோசிக்க உள்நுழையவும்'
                );
              }}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all shadow-2xs group cursor-pointer ${
                activeBeneficiary
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 hover:bg-amber-500/25 ring-1 ring-amber-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={
                activeBeneficiary
                  ? `Consulting for: ${activeBeneficiary.name} (${activeBeneficiary.relationship})`
                  : 'Consulting for Myself'
              }
            >
              <User className={`w-3.5 h-3.5 ${activeBeneficiary ? 'text-amber-700' : 'text-teal-600'} group-hover:scale-110 transition-transform shrink-0`} />
              <span className="font-bold truncate max-w-21.25 sm:max-w-32.5">
                {activeBeneficiary
                  ? `${activeBeneficiary.relationship}: ${activeBeneficiary.name.split(' ')[0]}`
                  : (lang === 'en' ? 'Myself' : 'எனக்கு')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </button>

            {/* Live Vision & Voice Tele-Clinic Launch Pill */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(
                  () => setIsLiveVisionOpen(true),
                  lang === 'en'
                    ? 'Sign in to start Live Vision & Voice Consultation'
                    : 'நேரடி கேமரா ஆலோசனையைத் தொடங்க உள்நுழையவும்'
                );
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all bg-emerald-500/10 border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/20 shadow-2xs group cursor-pointer"
              title="Start Real-Time Live Camera & Voice Tele-Clinic"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Video className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-bold">
                {lang === 'en' ? 'Live' : 'நேரடி'}
              </span>
              <span className="font-bold hidden md:inline">
                {lang === 'en' ? ' Vision' : ' கேமரா'}
              </span>
            </button>

            {/* Longitudinal Health Memory & Vitals Hub Pill */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(
                  () => setIsVitalsModalOpen(true),
                  lang === 'en'
                    ? 'Sign in to access your Longitudinal Health Memory'
                    : 'உங்கள் நீண்டகால மருத்துவ நினைவகத்தைக் காண உள்நுழையவும்'
                );
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 shadow-2xs group cursor-pointer"
              title="Open Longitudinal Health Memory & Vitals Hub"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-bold">
                {lang === 'en' ? 'Records' : 'நினைவகம்'}
              </span>
              <span className="font-bold hidden md:inline">
                {lang === 'en' ? ' Hub' : ''}
              </span>
            </button>
          </div>
        </header>

        {/* Messages Body + Desktop Appointment Summary Side-by-Side (Matching ChatUi ref.png) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FAFCFB]">
          {/* Active Caregiver Consultation Mode Banner */}
          {activeBeneficiary && (
            <div className="max-w-3xl mx-auto p-3 sm:p-3.5 rounded-2xl bg-linear-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-amber-200/90 text-amber-900 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  {activeBeneficiary.gender === 'Female' ? '👩' : '👨'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate">
                      {lang === 'en' ? 'Caregiver Mode' : 'பராமரிப்பாளர் முறை'}: {activeBeneficiary.name}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full font-bold border border-amber-300 shrink-0">
                      {activeBeneficiary.relationship}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium truncate">
                    {activeBeneficiary.age}y • {activeBeneficiary.gender} • <span className="font-mono font-semibold">{activeBeneficiary.healthId}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBeneficiaryModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                {lang === 'en' ? 'Switch Patient' : 'நோயாளி மாற்று'}
              </button>
            </div>
          )}

          {/* Pinned Autonomous Proactive Care-Loop Recovery Monitor */}
          {activeCareLoops.length > 0 && (
            <div className="max-w-3xl mx-auto p-3.5 rounded-2xl bg-linear-to-r from-teal-50 via-emerald-50 to-teal-50/50 border border-teal-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-950">
                      {lang === 'en' ? 'Proactive Care-Loop Recovery Monitor' : 'தீவிரக் கண்காணிப்பு நெறிமுறை'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-200/70 text-teal-800">
                      {lang === 'en' ? '24h Scheduled Check-in' : '24 மணிநேர நினைவூட்டல்'}
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                    {lang === 'en'
                      ? `Tracking recovery for: ${activeCareLoops[0].condition} (${activeCareLoops[0].initialSymptoms})`
                      : `கண்காணிக்கப்படும் அறிகுறிகள்: ${activeCareLoops[0].condition}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateCareLoopCheckIn(activeCareLoops[0])}
                className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Simulate 24h Check-in Loop Instantly"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Simulate 24h Check-in' : '24h மாதிரி சோதனை'}</span>
              </button>
            </div>
          )}
          {/* Welcome Screen when Session Has No Messages */}
          {(!activeSession || activeSession.messages.length === 0) && (
            <div className="max-w-2xl mx-auto pt-8 pb-4 text-center space-y-6 animate-in fade-in duration-300">
              {/* Center Robot Icon */}
              <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border border-teal-200/80 p-2 flex items-center justify-center shadow-xs">
                <img
                  src="/docbot_mascot.png"
                  alt="DocBot Mascot"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeBeneficiary
                    ? (lang === 'en'
                        ? `Consulting for ${activeBeneficiary.name}`
                        : `${activeBeneficiary.name} - மருத்துவ ஆலோசனை`)
                    : (lang === 'en'
                        ? 'Hello! How can I help you today?'
                        : 'வணக்கம்! இன்று உங்களுக்கு எவ்வாறு உதவலாம்?')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                  {activeBeneficiary
                    ? (lang === 'en'
                        ? `Describe symptoms or concerns regarding your ${activeBeneficiary.relationship.toLowerCase()} (${activeBeneficiary.age}y). Clinical guidance and triage will be calibrated for them.`
                        : `உங்கள் ${activeBeneficiary.relationship}-க்கான அறிகுறிகளை விவரிக்கவும். மருத்துவ ஆலோசனைகள் அதற்கேற்ப வழங்கப்படும்.`)
                    : (lang === 'en'
                        ? 'Get trusted, easy-to-understand health information, 24/7.'
                        : 'நம்பகமான, எளிதில் புரியக்கூடிய மருத்துவ ஆலோசனைகள் 24 மணி நேரமும்.')}
                </p>
              </div>

              {/* Action Suggestion Pills (Concise, Small & Pill-Styled) */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-xl mx-auto">
                {suggestionCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(card.query)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-xs text-xs font-semibold text-slate-700 transition-all cursor-pointer group shadow-2xs"
                  >
                    <span className="p-1 rounded-full bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </span>
                    <span>
                      {lang === 'en' ? card.titleEn : card.titleTa}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Conversation Messages */}
          {activeSession &&
            activeSession.messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-3xl ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-2xl bg-teal-50 border border-teal-200/80 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <img
                        src="/docbot_mascot.png"
                        alt="DocBot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#E8F7F2] border border-[#C6ECE0] text-slate-800 rounded-tr-sm max-w-lg'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm w-full shadow-xs'
                    }`}
                  >
                    {/* User Attachment Indicator */}
                    {isUser && msg.attachmentName && !msg.imageDataUrl && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-100/70 border border-teal-200 text-[11px] font-bold text-teal-900">
                        <FileUp className="w-3.5 h-3.5 text-teal-700" />
                        <span>{msg.attachmentName}</span>
                      </div>
                    )}

                    {/* Multimodal Symptom Photo Preview with Zoom Lightbox */}
                    {isUser && msg.imageDataUrl && (
                      <div className="mb-2.5">
                        <button
                          type="button"
                          onClick={() => setPreviewLightboxUrl(msg.imageDataUrl || null)}
                          className="group relative block overflow-hidden rounded-xl border border-teal-300 shadow-xs max-w-xs transition-transform hover:scale-[1.01] cursor-pointer"
                          title="Click to view full photo"
                        >
                          <img
                            src={msg.imageDataUrl}
                            alt={msg.attachmentName || 'Clinical Photo'}
                            className="w-full max-h-56 object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                            <Search className="w-4 h-4" />
                            <span>Zoom Photo</span>
                          </div>
                        </button>
                        {msg.attachmentName && (
                          <div className="mt-1 text-[10px] text-teal-800 font-medium flex items-center gap-1">
                            <Camera className="w-3 h-3 text-teal-600" />
                            <span>{msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Autonomous Agentic Tool Execution Badges (Zero Emojis, Pure Lucide SVGs) */}
                    {!isUser && msg.executedTools && msg.executedTools.length > 0 && (
                      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                        {msg.executedTools.map((tool) => (
                          <span
                            key={tool.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#0B7A75]/10 text-[#0B7A75] border border-[#0B7A75]/20 shadow-2xs"
                            title={tool.resultSummary}
                          >
                            {tool.name === 'searchJanAushadhi' && <Search className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'findNearbyCare' && <MapPin className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'checkDiseaseOutbreaks' && <Activity className="w-3 h-3 text-amber-600" />}
                            {tool.name === 'emergencySOSDispatch' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                            {tool.name === 'readMedicalDocument' && <FileText className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'longitudinalHealthMemory' && <Activity className="w-3 h-3 text-teal-600" />}
                            {tool.name === 'liveVisionDoctor' && <Video className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'careLoopRecoveryMonitor' && <Clock className="w-3 h-3 text-teal-600" />}
                            {tool.name === 'multimodalVisionDiagnostics' && <Camera className="w-3 h-3 text-teal-600" />}
                            <span>{tool.label}</span>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dual-Track Emotional De-escalation Protocol Badge */}
                    {!isUser && msg.emotionalState && msg.emotionalState !== 'calm' && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        <HeartHandshake className="w-3 h-3 text-teal-600" />
                        <span>
                          {msg.emotionalState === 'panic' && (lang === 'en' ? 'Emergency De-escalation Protocol Active' : 'அதிதீவிர அமைதி நெறிமுறை')}
                          {msg.emotionalState === 'parental_worry' && (lang === 'en' ? 'Pediatric Reassurance Protocol Active' : 'குழந்தை நல ஆறுதல் நெறிமுறை')}
                          {msg.emotionalState === 'financial_stress' && (lang === 'en' ? 'Jan Aushadhi Cost Relief Protocol Active' : 'ஜன் ஔஷதி கட்டண நிவாரணம்')}
                          {msg.emotionalState === 'geriatric_confusion' && (lang === 'en' ? 'Geriatric Safety Protocol Active' : 'முதியோர் பாதுகாப்பு நெறிமுறை')}
                          {msg.emotionalState === 'anxious' && (lang === 'en' ? 'Clinical Reassurance Active' : 'மருத்துவ ஆறுதல்')}
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* In-Chat Interactive Appointment Booking Stepper (ChatUi ref) */}
                    {!isUser && msg.appointmentStepper && renderAppointmentStepper(msg)}

                    {/* In-Chat Doctor Carousel with Time Slot Selection (ChatUi ref) */}
                    {!isUser && msg.doctorCarousel && renderDoctorCarousel(msg)}

                    {/* In-Chat Confirmed Official Booking Pass (ChatUi ref) */}
                    {!isUser && msg.confirmedBookingPass && renderConfirmedBookingPass(msg.confirmedBookingPass)}

                    {/* In-Chat Live OPD Queue Tracker */}
                    {!isUser && msg.liveQueueTracker && renderLiveQueueTracker(msg.liveQueueTracker, msg.id)}

                    {/* In-Chat Reschedule Card */}
                    {!isUser && msg.rescheduleCard && renderRescheduleCard(msg)}

                    {/* In-Chat Cancellation Card */}
                    {!isUser && msg.cancelCard && renderCancelCard(msg)}

                    {/* In-Chat Jan Aushadhi Medicine Card (ChatUi ref) */}
                    {!isUser && msg.matchedMedicineCard && renderMedicineCard(msg.matchedMedicineCard)}

                    {/* Autonomous Visual Site Reference Card (ChatUi ref) */}
                    {!isUser && msg.visualNavCard && renderVisualNavCard(msg.visualNavCard)}

                    {/* Sensitive Mutation Permission Confirmation Card (Two-Tier Model) */}
                    {!isUser && msg.actionConfirmation && renderActionConfirmationCard(msg.actionConfirmation, msg.id)}

                    {/* Unique Clinical Differentiator 1: Live ESI Triage Radar & Casualty HUD */}
                    {!isUser && msg.esiTriage && (
                      <div className={`mt-3 p-3.5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
                        msg.esiTriage.level <= 2 || msg.esiTriage.isRedFlag
                          ? 'bg-rose-50/90 border-rose-300 shadow-sm'
                          : msg.esiTriage.level === 3
                          ? 'bg-amber-50/80 border-amber-300'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                              msg.esiTriage.level <= 2 || msg.esiTriage.isRedFlag
                                ? 'bg-rose-600 text-white animate-pulse'
                                : msg.esiTriage.level === 3
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              ESI Level {msg.esiTriage.level} • {msg.esiTriage.label}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {msg.esiTriage.urgency}
                            </span>
                          </div>

                          {(msg.esiTriage.level <= 2 || msg.esiTriage.isRedFlag) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenAmbulance) onOpenAmbulance();
                                else window.open('tel:108', '_self');
                              }}
                              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                              <span>{lang === 'en' ? 'Call 108 Emergency' : '108 அவசர அழைப்பு'}</span>
                            </button>
                          )}
                        </div>

                        {msg.esiTriage.redFlags.length > 0 && (
                          <div className="mt-2 text-xs font-semibold text-rose-800 flex items-start gap-1.5 bg-rose-100/70 p-2 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-[11px] uppercase tracking-wide">
                                {lang === 'en' ? 'Acute Red-Flag Signals Detected:' : 'அதிதீவிர மருத்துவ எச்சரிக்கை அறிகுறிகள்:'}
                              </div>
                              <div className="text-[11px] font-medium mt-0.5">
                                {msg.esiTriage.redFlags.join(' • ')}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span className="font-medium">
                              Nearest Casualty: <strong className="text-teal-900">{msg.esiTriage.nearestCasualtyBeds.hospitalName}</strong>
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold font-mono text-[10px]">
                            {msg.esiTriage.nearestCasualtyBeds.availableBeds} beds available
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Unique Clinical Differentiator 2: Allergy & Longitudinal Vitals Shield */}
                    {!isUser && msg.safetyCheck && (msg.safetyCheck.allergyWarnings.length > 0 || msg.safetyCheck.contraindicationAlerts.length > 0 || msg.safetyCheck.vitalsFlags.length > 0) && (
                      <div className="mt-3 p-3 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950">
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>{lang === 'en' ? 'Clinical Safety & Allergy Shield' : 'மருத்துவ பாதுகாப்பு & ஒவ்வாமை எச்சரிக்கை'}</span>
                        </div>
                        {msg.safetyCheck.allergyWarnings.map((w, wIdx) => (
                          <div key={wIdx} className="text-[11px] text-rose-800 font-medium flex items-center gap-1 bg-white/70 p-1.5 rounded-lg border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>{w}</span>
                          </div>
                        ))}
                        {msg.safetyCheck.contraindicationAlerts.map((c, cIdx) => (
                          <div key={cIdx} className="text-[11px] text-amber-900 font-medium flex items-center gap-1 bg-white/70 p-1.5 rounded-lg border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{c}</span>
                          </div>
                        ))}
                        {msg.safetyCheck.vitalsFlags.map((v, vIdx) => (
                          <div key={vIdx} className="text-[11px] text-slate-800 font-medium flex items-center gap-1 bg-white/70 p-1.5 rounded-lg border border-slate-200">
                            <Activity className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unique Clinical Differentiator 3: PMBJP Jan Aushadhi Generic Savings Slip */}
                    {!isUser && msg.janAushadhiSavingsCard && msg.janAushadhiSavingsCard.items.length > 0 && (
                      <div className="mt-3.5 p-3.5 rounded-2xl bg-linear-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Pill className="w-4 h-4 text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-950">
                              {lang === 'en' ? 'PMBJP Jan Aushadhi Savings Slip' : 'ஜன் ஔஷதி மலிவு விலை சேமிப்பு சீட்டு'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                            Save ₹{msg.janAushadhiSavingsCard.totalSavings} ({msg.janAushadhiSavingsCard.savingsPercentage}%)
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {msg.janAushadhiSavingsCard.items.map((item, itIdx) => (
                            <div
                              key={itIdx}
                              className="p-2 rounded-xl bg-white/80 border border-emerald-200/80 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 truncate">{item.brandedMedicine}</div>
                                <div className="text-[11px] text-emerald-800 font-medium truncate">
                                  ↳ {item.genericEquivalent}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[10px] text-slate-400 line-through">₹{item.brandedPrice.toFixed(2)}</div>
                                <div className="font-extrabold text-emerald-700 font-mono text-xs">₹{item.genericPrice.toFixed(2)}</div>
                                <div className="text-[9px] font-bold text-emerald-600">Save {item.savingsPercentage}%</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-emerald-800 font-medium">
                            {lang === 'en' ? '100% CDSCO certified bioequivalent' : 'அரசு அங்கீகாரம் பெற்ற தரமான மருந்துகள்'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateMedicines) onNavigateMedicines();
                              else setToastMessage(lang === 'en' ? 'Opening Kendra Locator' : 'ஜன் ஔஷதி மையங்கள் திறக்கப்படுகிறது');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{lang === 'en' ? 'Locate Kendra' : 'மையத்தைக் காண்க'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Unique Clinical Differentiator 4: 1-Tap SBAR Clinical Handover Slip */}
                    {!isUser && msg.sbarHandover && (
                      <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-300/80 shadow-2xs space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                              <Stethoscope className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {lang === 'en' ? 'Doctor SBAR Clinical Handover Slip' : 'மருத்துவர் SBAR ஒப்படைப்பு குறிப்பு'}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Standard Hospital Communication Protocol
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopySbar(msg.sbarHandover!)}
                              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copy SBAR Handover"
                            >
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>{lang === 'en' ? 'Copy' : 'நகலெடு'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintSbar(msg.sbarHandover!)}
                              className="px-2 py-1 rounded-lg bg-[#0A604D] hover:bg-[#084F3F] text-white text-[11px] font-bold transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="Print SBAR Handover"
                            >
                              <Printer className="w-3 h-3" />
                              <span>{lang === 'en' ? 'Print' : 'அச்சிடு'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-white border border-slate-200/90 space-y-1">
                            <div className="font-extrabold text-[10px] uppercase tracking-wider text-teal-800 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-900 inline-flex items-center justify-center text-[9px] font-black">S</span>
                              <span>Situation</span>
                            </div>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{msg.sbarHandover.situation}</p>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-slate-200/90 space-y-1">
                            <div className="font-extrabold text-[10px] uppercase tracking-wider text-blue-800 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 inline-flex items-center justify-center text-[9px] font-black">B</span>
                              <span>Background</span>
                            </div>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{msg.sbarHandover.background}</p>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-slate-200/90 space-y-1">
                            <div className="font-extrabold text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 inline-flex items-center justify-center text-[9px] font-black">A</span>
                              <span>Assessment</span>
                            </div>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{msg.sbarHandover.assessment}</p>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-slate-200/90 space-y-1">
                            <div className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 inline-flex items-center justify-center text-[9px] font-black">R</span>
                              <span>Recommendation</span>
                            </div>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{msg.sbarHandover.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded Longitudinal Health Memory Insight Pill */}
                    {!isUser && msg.executedTools && msg.executedTools.some((t) => t.name === 'longitudinalHealthMemory') && (
                      <div className="mt-3 p-3 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-xs space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-teal-950">
                            <Activity className="w-3.5 h-3.5 text-teal-600" />
                            <span>{lang === 'en' ? 'Health Memory & Vitals Correlation' : 'மருத்துவ நினைவக ஒப்பீடு'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsVitalsModalOpen(true)}
                            className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                          >
                            {lang === 'en' ? 'Open Vitals Hub' : 'அளவீடுகளைக் காண்க'}
                          </button>
                        </div>
                        <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
                          {msg.executedTools.find((t) => t.name === 'longitudinalHealthMemory')?.resultSummary}
                        </p>
                      </div>
                    )}

                    {/* Interactive Jan Aushadhi Generic Medicine Comparison Cards */}
                    {!isUser && msg.genericMedicines && msg.genericMedicines.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-[#0B7A75]" />
                            <span>{lang === 'en' ? 'PMBJP Jan Aushadhi Generic Alternatives' : 'ஜன் ஔஷதி மலிவு விலை மாற்று மருந்துகள்'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {lang === 'en' ? '50% to 90% Lower Cost (PMBJP)' : '50% முதல் 90% வரை சேமிப்பு'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.genericMedicines.map((med, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-teal-400 transition-colors text-xs space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <div className="font-bold text-slate-800">{med.brandName}</div>
                                  <div className="text-[11px] text-slate-500 font-medium">{med.genericName}</div>
                                </div>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>-{med.savingsPercentage}%</span>
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                                <span className="text-slate-400 line-through">₹{med.brandPrice.toFixed(2)}</span>
                                <span className="font-bold text-emerald-700 font-mono text-xs">₹{med.genericPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inline Interactive Clinical Triage Wizard */}
                    {!isUser && msg.triageWizard && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100/90 animate-in fade-in duration-200">
                        {(() => {
                          const wizard = msg.triageWizard;
                          const state = wizardStates[msg.id] || {
                            currentStepIndex: 0,
                            answers: {},
                            isCompleted: false,
                          };
                          const curIdx = Math.min(state.currentStepIndex, wizard.steps.length - 1);
                          const curStep = wizard.steps[curIdx];
                          const totalSteps = wizard.totalSteps;
                          const progressPercent = state.isCompleted
                            ? 100
                            : Math.round(((curIdx) / totalSteps) * 100);

                          return (
                            <div className="rounded-2xl border border-teal-200/90 bg-linear-to-b from-teal-50/60 via-white to-slate-50/80 p-3.5 sm:p-4 shadow-2xs space-y-3 transition-all duration-300">
                              {/* Header & Step Counter */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-[#0B7A75]/10 flex items-center justify-center text-[#0B7A75]">
                                    <Activity className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 leading-tight">
                                      {lang === 'ta' ? wizard.topicTa : wizard.topicEn}
                                    </div>
                                    <div className="text-[10px] text-teal-700/80 font-medium">
                                      {lang === 'ta' ? 'ICMR மருத்துவ நிலை அளவீடு' : 'ICMR Clinical Triage Flow'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {!state.isCompleted && curIdx > 0 && (
                                    <button
                                      type="button"
                                      disabled={isThinking}
                                      onClick={() => handleWizardStepBack(msg.id)}
                                      className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-0.5 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                      title={lang === 'ta' ? 'முந்தைய கேள்வி' : 'Previous Step'}
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                      <span>{lang === 'ta' ? 'முந்தைய' : 'Back'}</span>
                                    </button>
                                  )}
                                  <div className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100/80 text-teal-900 border border-teal-200/60">
                                    {state.isCompleted
                                      ? (lang === 'ta' ? 'முடிந்தது' : 'Complete')
                                      : `${lang === 'ta' ? 'படி' : 'Step'} ${curIdx + 1}/${totalSteps}`}
                                  </div>
                                </div>
                              </div>

                              {/* Animated Progress Bar */}
                              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-teal-500 to-[#0B7A75] transition-all duration-300 rounded-full"
                                  style={{ width: `${state.isCompleted ? 100 : Math.max(progressPercent, 15)}%` }}
                                />
                              </div>

                              {/* Active Step Question or Completed Summary */}
                              {!state.isCompleted ? (
                                <div className="space-y-2.5 pt-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-800">
                                      {lang === 'ta' ? curStep.questionTa : curStep.questionEn}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => speakWizardQuestion(lang === 'ta' ? curStep.questionTa : curStep.questionEn)}
                                      className="text-[10px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200/80 transition-colors shrink-0"
                                      title={lang === 'ta' ? 'கேள்வியைக் கேளுங்கள்' : 'Listen to question'}
                                    >
                                      <Volume2 className="w-2.5 h-2.5 text-teal-600" />
                                      <span>{lang === 'ta' ? 'கேளுங்கள்' : 'Listen'}</span>
                                    </button>
                                  </div>

                                  {/* Selectable Option Chips */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                    {curStep.options.map((opt, optIdx) => {
                                      const labelText = lang === 'ta' ? opt.labelTa : opt.labelEn;
                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          disabled={isThinking}
                                          onClick={() => handleWizardOptionSelect(msg.id, wizard, curStep, opt)}
                                          className={`group px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all duration-150 flex items-start justify-between gap-2 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                                            opt.isRedFlag
                                              ? 'bg-rose-50/80 hover:bg-rose-100/90 border-rose-300/80 text-rose-900 hover:border-rose-400'
                                              : 'bg-white hover:bg-teal-50/70 border-slate-200 hover:border-teal-400 text-slate-800 hover:text-teal-950'
                                          }`}
                                        >
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5 font-medium leading-snug">
                                              {opt.isRedFlag && (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                              )}
                                              <span>{labelText}</span>
                                            </div>
                                            {lang !== 'ta' && (
                                              <div className="text-[10px] text-slate-500 font-normal group-hover:text-teal-700/80">
                                                {opt.labelTa}
                                              </div>
                                            )}
                                          </div>
                                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 text-[#0B7A75]" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                /* Completed Status Pill & Answer Summary */
                                <div className="space-y-2 pt-1 animate-in fade-in duration-300">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                      {lang === 'ta'
                                        ? 'மதிப்பீடு நிறைவடைந்தது • மருத்துவர் ஆய்வு செய்கிறார்'
                                        : 'Assessment Complete • Transmitted to Clinical Doctor'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {wizard.steps.map((st, sIdx) => {
                                      const ans = state.answers[st.id];
                                      if (!ans) return null;
                                      const ansText = lang === 'ta' ? ans.labelTa : ans.labelEn;
                                      return (
                                        <div
                                          key={sIdx}
                                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                                            ans.isRedFlag
                                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                                              : 'bg-slate-100/90 text-slate-700 border-slate-200/90'
                                          }`}
                                        >
                                          <span className="font-semibold text-slate-500">
                                            {lang === 'ta' ? st.titleTa : st.titleEn}:
                                          </span>
                                          <span className="truncate max-w-50">{ansText}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Unique Clinical Differentiator 5: Adaptive Bilingual Clinical Follow-Up Chips */}
                    {!isUser && msg.followUpChips && msg.followUpChips.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100/90 space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <Sparkles className="w-3 h-3 text-[#0B7A75]" />
                          <span>{lang === 'en' ? 'Clinical Next Steps (1-Tap):' : 'அடுத்த கட்ட மருத்துவ வழிகாட்டல்:'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.followUpChips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              disabled={isThinking}
                              onClick={() => handleSendMessage(chip.query)}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 hover:border-teal-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <span>{chip.label}</span>
                              <ArrowRight className="w-3 h-3 text-teal-600 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Adaptive Choosing Options (Single-Tap Pills or Multi-Select Checkboxes) */}
                    {!isUser && (!msg.triageWizard || wizardStates[msg.id]?.isCompleted) && msg.suggestedOptions && msg.suggestedOptions.items && msg.suggestedOptions.items.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100/90 animate-in fade-in duration-200">
                        {msg.suggestedOptions.type === 'single_tap' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#0B7A75]" />
                                <span>{lang === 'en' ? 'Quick Follow-ups & Responses' : 'விரைவு பதில்கள்'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => speakAllOptions(msg.suggestedOptions!.items)}
                                className="text-[10px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200/80 transition-colors"
                                title={lang === 'en' ? 'Listen to all options' : 'தேர்வுகளைக் கேளுங்கள்'}
                              >
                                <Volume2 className="w-2.5 h-2.5 text-teal-600" />
                                <span>{lang === 'en' ? 'Listen' : 'கேளுங்கள்'}</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.suggestedOptions.items.map((opt, oIdx) => {
                                const clean = opt.toLowerCase();
                                const isEmergency = clean.includes('108') || clean.includes('emergency') || clean.includes('ambulance');
                                const isStore = clean.includes('kendra') || clean.includes('jan aushadhi') || clean.includes('medicine');
                                const isVideo = clean.includes('video') || clean.includes('vision');
                                const isVitals = clean.includes('vital') || clean.includes('telemetry');

                                let colorStyles = 'bg-[#0B7A75]/5 hover:bg-[#0B7A75]/15 text-[#0B7A75] border-[#0B7A75]/25 hover:border-[#0B7A75]/50';
                                if (isEmergency) {
                                  colorStyles = 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-400 font-semibold';
                                } else if (isStore) {
                                  colorStyles = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-400';
                                } else if (isVideo) {
                                  colorStyles = 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-400';
                                } else if (isVitals) {
                                  colorStyles = 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-400';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={isThinking}
                                    onClick={() => handleOptionSelect(opt)}
                                    className={`group px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-left ${colorStyles}`}
                                  >
                                    <span>{opt}</span>
                                    <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-[#0B7A75]" />
                                <span>{lang === 'en' ? 'Select all that apply:' : 'பொருந்துபவற்றைத் தேர்ந்தெடுக்கவும்:'}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => speakAllOptions(msg.suggestedOptions!.items)}
                                  className="text-[10px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200/80 transition-colors"
                                  title={lang === 'en' ? 'Listen to options' : 'தேர்வுகளைக் கேளுங்கள்'}
                                >
                                  <Volume2 className="w-2.5 h-2.5 text-teal-600" />
                                  <span>{lang === 'en' ? 'Listen' : 'கேளுங்கள்'}</span>
                                </button>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {(selectedMultiOptions[msg.id] || []).length} {lang === 'en' ? 'selected' : 'தேர்ந்தெடுக்கப்பட்டது'}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {msg.suggestedOptions.items.map((opt, oIdx) => {
                                const isChecked = (selectedMultiOptions[msg.id] || []).includes(opt);
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={isThinking}
                                    onClick={() => toggleMultiOption(msg.id, opt)}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium text-left flex items-center gap-2 border transition-all cursor-pointer ${
                                      isChecked
                                        ? 'bg-teal-50 border-teal-500 text-teal-950 font-semibold shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                    }`}
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-[#0B7A75] shrink-0" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="truncate">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="pt-1 flex items-center justify-between">
                              <button
                                type="button"
                                disabled={isThinking || (selectedMultiOptions[msg.id] || []).length === 0}
                                onClick={() => handleSendMultiOptions(msg.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#0B7A75] hover:bg-[#09635f] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                              >
                                <span>{lang === 'en' ? 'Send Selected' : 'தேர்ந்தெடுத்தவற்றை அனுப்பு'}</span>
                                <span>({(selectedMultiOptions[msg.id] || []).length})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Actions Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{msg.time}</span>
                        {isUser && <span className="text-teal-600 font-bold">✓✓</span>}
                      </div>

                      {!isUser && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="p-1 hover:text-slate-700 rounded transition-colors"
                            title={copiedId === msg.id ? 'Copied!' : 'Copy to clipboard'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLike(msg.id, 'like')}
                            className={`p-1 hover:text-slate-700 rounded transition-colors ${
                              msg.liked ? 'text-teal-600 font-bold' : ''
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLike(msg.id, 'dislike')}
                            className={`p-1 hover:text-slate-700 rounded transition-colors ${
                              msg.disliked ? 'text-rose-500 font-bold' : ''
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSpeakMessage(msg.text)}
                            className="p-1 hover:text-teal-700 rounded transition-colors cursor-pointer"
                            title={isVoiceSpeaking ? (lang === 'en' ? 'Stop Speaking' : 'நிறுத்து') : (lang === 'en' ? 'Read Aloud with Doctor Voice' : 'படிக்கவும்')}
                          >
                            {isVoiceSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Thinking State with Moving Jump Dots Alone (Per User Mandate) */}
          {isThinking && (
            <div className="flex items-start gap-3 max-w-3xl mr-auto animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-2xl bg-teal-50 border border-teal-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  src="/docbot_mascot.png"
                  alt="DocBot"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Desktop Right Side Panel for Appointment Summary (Matching ChatUi ref.png) */}
        {activeAppointmentDraft && (
          <aside className="hidden xl:flex w-80 lg:w-72 xl:w-84 border-l border-slate-200/90 bg-[#FAFCFB] flex-col p-5 overflow-y-auto shrink-0 animate-in fade-in slide-in-from-right-4 duration-200">
            {renderAppointmentSummaryCard()}
          </aside>
        )}
      </div>

        {/* ========================================================= */}
        {/* 3. INPUT BAR & DOCKED CONTROLS */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-5 pb-5 sm:pb-5 safe-area-pb border-t z-10 bg-white border-slate-200/90">
          <div className="max-w-3xl mx-auto space-y-2.5">
            
            {/* Docked Quick-Vitals Drawer Trigger & Ambient AI Doctor Status */}
            <div className="flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={() => setIsQuickVitalsDrawerOpen(!isQuickVitalsDrawerOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                  isQuickVitalsDrawerOpen
                    ? 'bg-[#0A604D] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:bg-teal-50/60'
                }`}
                title="Toggle Ambient Quick Vitals Telemetry Drawer"
              >
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'en' ? 'Quick Vitals' : 'உடலியல் பதிவு'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isQuickVitalsDrawerOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-slate-600 font-semibold">{lang === 'en' ? 'AI Doctor Online' : 'மருத்துவர் இணைப்பில் உள்ளார்'}</span>
                </span>
              </div>
            </div>

            {/* Live Voice Recording Status Banner */}
            {isRecording && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-900 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span>
                    {lang === 'en'
                      ? 'Listening to symptoms... Speak in English or Tamil'
                      : 'கேட்கிறது... அறிகுறிகளைத் தமிழில் அல்லது ஆங்கிலத்தில் பேசவும்'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>{lang === 'en' ? 'Done Speaking' : 'முடிந்தது'}</span>
                </button>
              </div>
            )}

            {/* Ambient Quick-Vitals Telemetry Drawer (Docked directly above chat input) */}
            {isQuickVitalsDrawerOpen && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-teal-200/90 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {lang === 'en' ? 'Quick Vitals Telemetry' : 'உடனடி உடலியல் அளவீடுகள்'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {lang === 'en' ? 'Log bedside readings directly into clinical memory' : 'மருத்துவ நினைவகத்தில் உடனடியாக பதிவு செய்யவும்'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickVitalsDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 5 Vitals Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {/* Blood Pressure */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      <span>BP (Sys/Dia)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="120"
                        value={quickVitals.systolic}
                        onChange={(e) => setQuickVitals({ ...quickVitals, systolic: e.target.value })}
                        className="w-1/2 p-1 text-xs text-center bg-white rounded border border-slate-200 outline-none focus:border-teal-500 font-medium"
                      />
                      <span className="text-slate-400 text-xs">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={quickVitals.diastolic}
                        onChange={(e) => setQuickVitals({ ...quickVitals, diastolic: e.target.value })}
                        className="w-1/2 p-1 text-xs text-center bg-white rounded border border-slate-200 outline-none focus:border-teal-500 font-medium"
                      />
                    </div>
                    <div className="text-[9px] text-slate-400 text-center mt-1">mmHg</div>
                  </div>

                  {/* Pulse */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                      <Activity className="w-3 h-3 text-teal-600" />
                      <span>Pulse</span>
                    </div>
                    <input
                      type="number"
                      placeholder="72"
                      value={quickVitals.heartRate}
                      onChange={(e) => setQuickVitals({ ...quickVitals, heartRate: e.target.value })}
                      className="w-full p-1 text-xs text-center bg-white rounded border border-slate-200 outline-none focus:border-teal-500 font-medium"
                    />
                    <div className="text-[9px] text-slate-400 text-center mt-1">bpm</div>
                  </div>

                  {/* SpO2 */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      <span>SpO2 Oxygen</span>
                    </div>
                    <input
                      type="number"
                      placeholder="98"
                      value={quickVitals.spo2}
                      onChange={(e) => setQuickVitals({ ...quickVitals, spo2: e.target.value })}
                      className="w-full p-1 text-xs text-center bg-white rounded border border-slate-200 outline-none focus:border-teal-500 font-medium"
                    />
                    <div className="text-[9px] text-slate-400 text-center mt-1">%</div>
                  </div>

                  {/* Temperature */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                      <Thermometer className="w-3 h-3 text-amber-500" />
                      <span>Temperature</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={quickVitals.temperature}
                      onChange={(e) => setQuickVitals({ ...quickVitals, temperature: e.target.value })}
                      className="w-full p-1 text-xs text-center bg-white rounded border border-slate-200 outline-none focus:border-teal-500 font-medium"
                    />
                    <div className="text-[9px] text-slate-400 text-center mt-1">°F</div>
                  </div>

                  {/* Blood Sugar */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-indigo-500" />
                        <span>Sugar</span>
                      </span>
                      <select
                        value={quickVitals.sugarType}
                        onChange={(e) => setQuickVitals({ ...quickVitals, sugarType: e.target.value as any })}
                        className="text-[9px] bg-white border border-slate-200 rounded px-1 outline-none text-slate-600 font-normal"
                      >
                        <option value="random">RBS</option>
                        <option value="fasting">FBS</option>
                        <option value="post_prandial">PPBS</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      placeholder="110"
                      value={quickVitals.bloodSugar}
                      onChange={(e) => setQuickVitals({ ...quickVitals, bloodSugar: e.target.value })}
                      className="w-full p-1 text-xs text-center bg-white rounded border border-slate-200 outline-none focus:border-teal-500 font-medium"
                    />
                    <div className="text-[9px] text-slate-400 text-center mt-1">mg/dL</div>
                  </div>
                </div>

                {/* Quick Vitals Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {vitalsSavedNotice ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'en' ? 'Saved to Patient Health Memory' : 'மருத்துவ நினைவகத்தில் சேமிக்கப்பட்டது'}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400">
                      {lang === 'en' ? 'Normal: BP ~120/80, SpO2 ≥ 95%, Pulse 60-100' : 'சாதாரண அளவீடு: BP 120/80, SpO2 ≥ 95%'}
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={handleSaveQuickVitalsToMemory}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Save Only' : 'சேமிக்க'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConsultWithQuickVitals}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0A604D] hover:bg-[#084F3F] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>{lang === 'en' ? 'Log & Consult' : 'பதிவு & ஆலோசனை'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Staged Clinical Attachment Tray (MarkItDown Token-Optimized, Non-Auto-Triggering) */}
            {(stagedAttachment || attachedPhoto) && (
              <div className="p-3 rounded-2xl bg-linear-to-r from-teal-50/95 via-emerald-50/90 to-teal-50/95 border border-teal-200 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {stagedAttachment?.dataUrl || attachedPhoto?.dataUrl ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-teal-300 shrink-0 bg-white shadow-2xs">
                        <img
                          src={stagedAttachment?.dataUrl || attachedPhoto?.dataUrl}
                          alt="Preview"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewLightboxUrl(stagedAttachment?.dataUrl || attachedPhoto?.dataUrl || null)}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-300/80 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
                        {stagedAttachment?.fileType === 'lab_report' ? (
                          <Activity className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-teal-950 flex items-center gap-1.5">
                        <span className="truncate">{stagedAttachment?.fileName || attachedPhoto?.fileName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-200/80 text-teal-800 shrink-0">
                          {stagedAttachment?.fileType || 'Photo'}
                        </span>
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium flex items-center gap-1.5 flex-wrap">
                        <span>{stagedAttachment?.fileSize || attachedPhoto?.fileSize}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                          MarkItDown: ~{stagedAttachment?.tokenEstimate || 120} tokens (75% savings)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStagedAttachment(null);
                      setAttachedPhoto(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-teal-200/60 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer shrink-0"
                    title={lang === 'en' ? 'Remove attachment' : 'நீக்கு'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1-Tap Quick Clinical Intent Pills */}
                <div className="pt-1.5 border-t border-teal-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[10px] text-teal-800 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>{lang === 'en' ? 'Quick Clinical Intent:' : 'விரைவு நோக்கம்:'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setInputText(lang === 'ta' ? 'இதற்கான ஜன் ஔஷதி மலிவு விலை மாற்று மருந்துகளைக் கண்டறியவும்' : 'Find Jan Aushadhi generic equivalents for this prescription')}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Pill className="w-2.5 h-2.5 text-teal-600" />
                      <span>{lang === 'en' ? 'Generic Savings' : 'ஜன் ஔஷதி சேமிப்பு'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText(lang === 'ta' ? 'எனது உடல்நிலை மற்றும் மருந்து ஒவ்வாமைகளுடன் ஏதேனும் முரண்பாடு உள்ளதா என சோதிக்கவும்' : 'Check for drug interactions and contraindications with my health profile')}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />
                      <span>{lang === 'en' ? 'Interaction Check' : 'ஒவ்வாமை சோதனை'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText(lang === 'ta' ? 'மருத்துவர் பார்வைக்கான SBAR குறிப்பைத் தயார் செய்யவும்' : 'Generate SBAR clinical handover for my doctor visit')}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-2.5 h-2.5 text-blue-600" />
                      <span>{lang === 'en' ? 'SBAR Handover' : 'SBAR குறிப்பு'}</span>
                    </button>
                  </div>
                </div>

                {/* Follow-up Hint */}
                <div className="text-[10px] text-teal-700/90 font-medium italic">
                  {lang === 'en'
                    ? '💡 Attachment is staged. Type your specific question or tap the mic to speak before sending.'
                    : '💡 ஆவணம் இணைக்கப்பட்டுள்ளது. அனுப்பும் முன் கேள்வியைத் தட்டச்சு செய்யவும் அல்லது பேசவும்.'}
                </div>
              </div>
            )}

            {/* Input Capsule (Matching Chatbot UI.png) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isThinking || isSendingRef.current) return;
                handleSendMessage();
              }}
              className="rounded-full border flex items-center gap-2 p-1.5 sm:p-2 shadow-xs transition-all bg-white border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100"
            >
              {/* Paperclip Attachment Button (Prescription / Lab PDF) */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Attach Prescription or Lab Slip"
              >
                <Paperclip className="w-4 h-4 rotate-45" />
              </button>

              {/* Multimodal Camera / Symptom Photo Button */}
              <button
                type="button"
                onClick={() => {
                  photoInputRef.current?.click();
                }}
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                  attachedPhoto
                    ? 'text-teal-700 bg-teal-100 ring-2 ring-teal-300'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Attach or snap photo of physical symptom (skin rash, eye redness, throat, wound)"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Text Input Field */}
              <input
                ref={chatInputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isRecording
                    ? (lang === 'en' ? 'Listening... speak symptoms now...' : 'கேட்கிறது... இப்போது பேசவும்...')
                    : (lang === 'en' ? 'Ask a health question in English or Tamil (or tap mic to speak)...' : 'தமிழில் அல்லது English-ல் மருத்துவக் கேள்வி கேட்கவும்...')
                }
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-1"
              />

              {/* Microphone Button with Active Pulsing Ring Animation */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isRecording ? (lang === 'en' ? 'Stop listening' : 'நிறுத்து') : (lang === 'en' ? 'Voice Input (Click to Speak)' : 'குரல் உள்ளீடு')}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce text-white' : ''}`} />
              </button>

              {/* Circular Send Button (Matching Chatbot UI.png) */}
              <button
                type="submit"
                disabled={isThinking}
                className="p-2.5 rounded-full bg-[#057A55] hover:bg-[#046A4A] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Actions Tray (Matching ChatUi ref.png) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => handleTriggerAppointmentBooking()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'en' ? 'Book Appointment' : 'சந்திப்பு முன்பதிவு'}</span>
              </button>

              <button
                type="button"
                onClick={handleCheckMedicinePrices}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'en' ? 'Check Medicine Prices' : 'மருந்து விலை சரிபார்'}</span>
              </button>

              <button
                type="button"
                onClick={handleFindNearestClinic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{lang === 'en' ? 'Find Nearest Clinic' : 'அருகிலுள்ள கிளினிக்'}</span>
              </button>

              <button
                type="button"
                onClick={handleViewReports}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{lang === 'en' ? 'View Reports' : 'அறிக்கைகள்'}</span>
              </button>

              <button
                type="button"
                onClick={handleTalkToDoctor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'en' ? 'Talk to Doctor' : 'மருத்துவரிடம் பேசு'}</span>
              </button>
            </div>

            {/* Mobile / Tablet Floating Appointment Summary Bar */}
            <div className="xl:hidden">
              {activeAppointmentDraft && !activeAppointmentDraft.isConfirmed && (
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0">
                    <div className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">
                      {lang === 'en' ? 'Selected Appointment' : 'தேர்ந்தெடுக்கப்பட்ட சந்திப்பு'}
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {activeAppointmentDraft.department} • {activeAppointmentDraft.selectedDoctor?.name || 'Dr. Mohamed'} ({activeAppointmentDraft.selectedSlot || '09:00 AM'})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmAppointment}
                    className="px-3.5 py-1.5 rounded-xl bg-[#057A55] hover:bg-[#046A4A] text-white text-xs font-bold shadow-xs whitespace-nowrap active:scale-95 transition-transform cursor-pointer"
                  >
                    {lang === 'en' ? 'Confirm' : 'உறுதி செய்'}
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Hidden Photo Input for Multimodal Clinical Vision */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Bottom Medical Disclaimer (Matching Chatbot UI.png) */}
            <p className="text-[11px] text-center text-slate-400 font-medium">
              {lang === 'en'
                ? 'HealthGrid AI provides general health information and is not a substitute for professional medical advice.'
                : 'HealthGrid AI பொதுவான மருத்துவத் தகவல்களை மட்டுமே வழங்குகிறது. தீவிர நோய்களுக்கு மருத்துவரை நேரில் அணுகவும்.'}
            </p>
          </div>
        </div>

      </main>

      {/* ========================================================= */}
      {/* 4. CONTEXT MENU FOR CHAT HISTORY (Right-Click) */}
      {/* ========================================================= */}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleTogglePin(contextMenu.sessionId)}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Pin className="w-3.5 h-3.5 text-teal-600" />
            <span>Pin chat</span>
          </button>

          <button
            onClick={() => {
              const target = sessions.find((s) => s.id === contextMenu.sessionId);
              if (target) handleStartRename(target);
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Rename</span>
          </button>

          <button
            onClick={() => handleArchive(contextMenu.sessionId)}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Archive className="w-3.5 h-3.5 text-slate-600" />
            <span>Archive</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            onClick={() => handleDeleteSession(contextMenu.sessionId)}
            className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete chat</span>
          </button>
        </div>
      )}

      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Login Modal mounted inside ChatbotPage */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginNotice(null);
          pendingActionRef.current = null;
        }}
        lang={lang}
        contextNotice={loginNotice}
        onSuccess={handleLoginSuccess}
      />

      {/* Live Camera Vision & Voice Doctor Tele-Clinic Modal */}
      <LiveVisionDoctorModal
        isOpen={isLiveVisionOpen}
        onClose={() => setIsLiveVisionOpen(false)}
        lang={lang}
        userId={currentUser?.id || 'guest-patient'}
        patientName={activeBeneficiary ? activeBeneficiary.name : (currentUser?.name || 'Arjun Kumar')}
        onConsultationComplete={handleLiveConsultationComplete}
      />

      {/* Longitudinal Health Memory & Vitals Telemetry Modal */}
      <VitalsTelemetryModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        lang={lang}
      />

      {/* Consultation Beneficiary & Family Member Multi-Profile Modal */}
      <ConsultationBeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setIsBeneficiaryModalOpen(false)}
        lang={lang}
        onSelectBeneficiary={(member) => {
          setActiveBeneficiary(member);
          if (member) {
            setToastMessage(
              lang === 'en'
                ? `Switched patient to ${member.name} (${member.relationship})`
                : `நோயாளி மாற்றப்பட்டார்: ${member.name} (${member.relationship})`
            );
          } else {
            setToastMessage(
              lang === 'en'
                ? 'Switched consultation to Myself'
                : 'ஆலோசனை எனக்கான முறைக்கு மாற்றப்பட்டது'
            );
          }
        }}
      />

      {/* Lightbox for Full-Resolution Clinical Photo Inspection */}
      {previewLightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewLightboxUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-3 border border-slate-700 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 px-2 text-white text-xs font-bold border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-teal-400">
                <Camera className="w-4 h-4" />
                <span>Multimodal Clinical Vision Inspection</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewLightboxUrl(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewLightboxUrl}
              alt="Enlarged Clinical Photo"
              className="max-h-[75vh] w-auto object-contain rounded-lg mt-2 shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Printable OPD Slip Modal for Official Verification (ChatUi ref) */}
      <PrintAppointmentSlipModal
        isOpen={Boolean(printingAppointment)}
        appointment={printingAppointment}
        onClose={() => setPrintingAppointment(null)}
      />

    </div>
  );
};
