import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  Bed,
  FlaskConical,
  Siren,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Pill,
  Mic,
  MicOff,
  VideoOff,
  Building2,
  X
} from 'lucide-react';
import type { Language } from '../../types';
import {
  hisService,
  type PatientToken,
  type InpatientBed,
  type LabOrderItem,
  type PrescriptionItem,
  type InPersonReferral,
  type WardType
} from '../../services/hisService';

interface HospitalInformationSystemProps {
  lang: Language;
  onExitToCitizenView: () => void;
}

type HisTab = 'QUEUE' | 'ENCOUNTER' | 'BEDS' | 'LABS' | 'CASUALTY' | 'STATISTICS';

const SAMPLE_GENERIC_MEDS = [
  { brand: 'Augmentin 625', generic: 'Amoxicillin + Clavulanic Acid 625mg', salt: 'Amoxicillin Trihydrate IP', defFreq: '1-0-1' },
  { brand: 'Glycomet 500', generic: 'Metformin Hydrochloride IP 500mg', salt: 'Metformin HCl', defFreq: '1-0-1' },
  { brand: 'Telma 40', generic: 'Telmisartan Tablets IP 40mg', salt: 'Telmisartan', defFreq: '1-0-0' },
  { brand: 'Pan 40', generic: 'Pantoprazole Gastro-Resistant 40mg', salt: 'Pantoprazole Sodium IP', defFreq: '1-0-0' },
  { brand: 'Dolo 650', generic: 'Paracetamol Tablets IP 650mg', salt: 'Paracetamol IP', defFreq: '1-1-1' },
  { brand: 'Azithral 500', generic: 'Azithromycin Tablets IP 500mg', salt: 'Azithromycin Dihydrate IP', defFreq: '1-0-0' },
  { brand: 'Atorva 10', generic: 'Atorvastatin Tablets IP 10mg', salt: 'Atorvastatin Calcium IP', defFreq: '0-0-1' },
  { brand: 'Electral ORS', generic: 'Oral Rehydration Salts IP (WHO Formula)', salt: 'Sodium Chloride + Glucose', defFreq: 'PRN' },
];

export const HospitalInformationSystem: React.FC<HospitalInformationSystemProps> = ({
  lang,
  onExitToCitizenView
}) => {
  const [activeTab, setActiveTab] = useState<HisTab>('QUEUE');
  const [tokens, setTokens] = useState<PatientToken[]>([]);
  const [beds, setBeds] = useState<InpatientBed[]>([]);
  const [labs, setLabs] = useState<LabOrderItem[]>([]);
  const [activeEncounterToken, setActiveEncounterToken] = useState<PatientToken | null>(null);

  // Encounter Form State
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);

  // In-Person Referral State
  const [referInPerson, setReferInPerson] = useState(false);
  const [referralDept, setReferralDept] = useState('General Medicine / Internal OPD');
  const [referralDate, setReferralDate] = useState('Tomorrow, 10:00 AM');
  const [referralReason, setReferralReason] = useState('');
  const [requiredInvestigations] = useState<string[]>([
    'Physical Abdominal Palpation',
    '12-Lead Resting ECG'
  ]);

  // Video call controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Admission Modal State
  const [admitBedId, setAdmitBedId] = useState<string | null>(null);
  const [admitPatientName, setAdmitPatientName] = useState('');
  const [admitAge, setAdmitAge] = useState(45);
  const [admitDiagnosis, setAdmitDiagnosis] = useState('');

  // Doctor Info
  const doctorName = 'Dr. R. Meenakshi, MD';
  const doctorReg = 'TNMC-74892';
  const hospitalName = 'Govt Medical College & Hospital • Urban CHC Hub';

  const refreshData = () => {
    setTokens(hisService.getTokens());
    setBeds(hisService.getBeds());
    setLabs(hisService.getLabs());
  };

  useEffect(() => {
    refreshData();
    const unsub = hisService.subscribe(refreshData);
    return unsub;
  }, []);

  // When active encounter token changes, pre-fill SOAP notes from patient intake
  useEffect(() => {
    if (activeEncounterToken) {
      setSubjective(
        `Patient reports: "${activeEncounterToken.chiefComplaint}".\nOnset: ${activeEncounterToken.onsetTimeline}.\nProgression: ${activeEncounterToken.conditionProgression}.\nPain Scale: ${activeEncounterToken.painScale}/10.`
      );
      setObjective(
        `Vitals at intake: BP: ${activeEncounterToken.healthGridCv.lastVitals.bp} | HR: ${activeEncounterToken.healthGridCv.lastVitals.heartRate} bpm | SpO2: ${activeEncounterToken.healthGridCv.lastVitals.spo2}% | Temp: ${activeEncounterToken.healthGridCv.lastVitals.tempF}.\nKnown Allergies: ${activeEncounterToken.healthGridCv.allergies.join(', ') || 'NKDA'}.\nChronic History: ${activeEncounterToken.healthGridCv.chronicConditions.join(', ') || 'Nil'}.`
      );
      setAssessment(
        activeEncounterToken.triageUrgency === 'RED'
          ? 'Suspected Acute Coronary Event / High Urgency Evaluation'
          : activeEncounterToken.triageUrgency === 'AMBER'
          ? 'Acute Febrile Illness / Possible Dengue Syndrome'
          : 'Acute Symptomatic Episode - Stable Outpatient'
      );
      setPlan(
        '1. Rest and hydration.\n2. Standardize medication regimen.\n3. Monitor vital signs every 4 hours.'
      );
      setPrescriptions([
        {
          id: 'rx-1',
          medicineName: 'Paracetamol Tablets IP 650mg',
          genericSalt: 'Paracetamol IP (Jan Aushadhi PMBJP)',
          dosage: '650mg',
          frequency: '1-0-1',
          durationDays: 3,
          instructions: 'After food for fever control'
        }
      ]);
      setReferInPerson(false);
      setReferralReason('');
    }
  }, [activeEncounterToken]);

  const handleCallPatient = (token: PatientToken) => {
    hisService.callPatientToken(token.tokenId, {
      doctorId: 'DOC-TN-74892',
      doctorName,
      specialization: 'Senior Consultant Physician'
    });
    setActiveEncounterToken(token);
    setActiveTab('ENCOUNTER');
  };

  const handleAddPrescription = () => {
    const med = SAMPLE_GENERIC_MEDS[selectedMedIndex] || SAMPLE_GENERIC_MEDS[0];
    const newRx: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicineName: med.generic,
      genericSalt: med.salt,
      dosage: 'Standard Adult',
      frequency: med.defFreq,
      durationDays: 5,
      instructions: 'After meals with warm water'
    };
    setPrescriptions([...prescriptions, newRx]);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleCompleteEncounter = () => {
    if (!activeEncounterToken) return;

    let referral: InPersonReferral | null = null;
    if (referInPerson) {
      referral = {
        referralId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: activeEncounterToken.patientId,
        patientName: activeEncounterToken.patientName,
        referredByDoctor: doctorName,
        facilityName: hospitalName,
        department: referralDept,
        scheduledDate: referralDate,
        scheduledSlot: '10:00 AM - 11:30 AM',
        clinicalReason: referralReason || 'Requires physical tactile examination and laboratory verification.',
        investigationsRequired: requiredInvestigations,
        passQrData: `HG-REF:${activeEncounterToken.patientId}:${referralDept}:${referralDate}`
      };
    }

    hisService.completeEncounter({
      tokenId: activeEncounterToken.tokenId,
      patientId: activeEncounterToken.patientId,
      patientName: activeEncounterToken.patientName,
      doctorId: 'DOC-TN-74892',
      doctorName,
      subjectiveNotes: subjective,
      objectiveFindings: objective,
      assessmentDiagnosis: assessment,
      clinicalPlan: plan,
      prescriptions,
      labOrders: [],
      inPersonReferral: referral
    });

    setActiveEncounterToken(null);
    setActiveTab('QUEUE');
  };

  const handleConfirmAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitBedId || !admitPatientName.trim()) return;

    hisService.admitPatientToBed(admitBedId, {
      patientId: `HG-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: admitPatientName,
      age: admitAge,
      gender: 'Male',
      primaryDiagnosis: admitDiagnosis || 'Acute Clinical Observation',
      attendingDoctor: doctorName,
      oxygenSupportRequired: true
    });

    setAdmitBedId(null);
    setAdmitPatientName('');
    setAdmitDiagnosis('');
  };

  const bedStats = hisService.getBedStats();
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING' || t.status === 'IN_CONSULTATION');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Clinical Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {lang === 'en' ? 'HealthGrid Hospital Information System (HIS / EHR)' : 'ஹெல்த்கிரிட் மருத்துவமனை தகவல் அமைப்பு (HIS / EHR)'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Ward Telemetry
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {hospitalName}
            </p>
          </div>
        </div>

        {/* Doctor Identity & Exit Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2.5 text-right bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <div>
              <div className="text-xs font-bold text-slate-200">{doctorName}</div>
              <div className="text-[10px] text-teal-400">Reg: {doctorReg} • On Duty</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onExitToCitizenView}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Return to Citizen Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Citizen View</span>
          </button>
        </div>
      </header>

      {/* Main HIS Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800 flex flex-row md:flex-col justify-between p-3 flex-shrink-0 overflow-x-auto md:overflow-visible">
          <nav className="flex flex-row md:flex-col gap-1 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('QUEUE')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'QUEUE'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>OPD Token Queue</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'QUEUE' ? 'bg-white/20 text-white' : 'bg-slate-800 text-teal-400'
              }`}>
                {waitingTokens.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ENCOUNTER')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'ENCOUNTER'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4" />
                <span>Live Consult Chamber</span>
              </div>
              {activeEncounterToken && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BEDS')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'BEDS'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bed className="w-4 h-4" />
                <span>Inpatient ADT & Beds</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'BEDS' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {bedStats.occupied}/{bedStats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LABS')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'LABS'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4" />
                <span>Lab Orders & Results</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'LABS' ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
              }`}>
                {labs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CASUALTY')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'CASUALTY'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Siren className="w-4 h-4 text-rose-400" />
                <span>Casualty 108 Radar</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Live
              </span>
            </button>
          </nav>

          {/* Quick Bed Telemetry Widget at Sidebar bottom */}
          <div className="hidden md:block p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 mt-4">
            <div className="flex items-center justify-between text-slate-300 font-bold text-[11px]">
              <span>ICU Capacity</span>
              <span className="text-teal-400">{bedStats.icuAvailable} Beds Free</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{ width: `${Math.round((bedStats.icuOccupied / bedStats.icuTotal) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Occupancy: {bedStats.occupancyPercentage}%</span>
              <span>Total: {bedStats.total} Beds</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: OPD TOKEN QUEUE */}
          {activeTab === 'QUEUE' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-400" />
                    <span>Active OPD Consultation Queue (First-Come, First-Served)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Patient screening intake results, urgency rating, and transmitted HealthGrid CVs
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Red: Emergency
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Amber: Urgent
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Green: Routine
                  </span>
                </div>
              </div>

              {waitingTokens.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-200">OPD Queue is currently clear!</p>
                  <p className="text-xs">Incoming patient screening tokens will automatically appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {waitingTokens.map((token) => (
                    <div
                      key={token.tokenId}
                      className={`p-5 rounded-3xl border transition-all ${
                        token.triageUrgency === 'RED'
                          ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                          : token.triageUrgency === 'AMBER'
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-teal-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-white font-mono">
                              #{token.tokenId}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                token.triageUrgency === 'RED'
                                  ? 'bg-rose-500 text-white'
                                  : token.triageUrgency === 'AMBER'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-emerald-500 text-slate-950'
                              }`}
                            >
                              {token.triageUrgency} Priority
                            </span>
                            {token.status === 'IN_CONSULTATION' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                                In Chamber
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-200 mt-1">
                            {token.patientName} ({token.age} yrs • {token.gender} • {token.bloodGroup})
                          </h3>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ABHA: {token.healthGridCv.abhaId} • Phone: {token.phone}
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 justify-end text-slate-400">
                            <Clock className="w-3 h-3" />
                            {token.createdAt.split(' ')[1] || token.createdAt}
                          </span>
                          <span className="block mt-1 text-[10px] text-teal-400 font-semibold">
                            Pain: {token.painScale}/10
                          </span>
                        </div>
                      </div>

                      {/* Chief Complaint */}
                      <div className="mt-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                          Chief Complaint:
                        </span>
                        <p className="text-slate-200 leading-snug">{token.chiefComplaint}</p>
                        <div className="text-[10px] text-slate-400 pt-1">
                          <span className="text-slate-500">Onset:</span> {token.onsetTimeline} •{' '}
                          <span className="text-slate-500">Progression:</span> {token.conditionProgression}
                        </div>
                      </div>

                      {/* HealthGrid CV Indicators */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Allergies:</span>
                          <span className="font-semibold text-rose-400 truncate block">
                            {token.healthGridCv.allergies.join(', ') || 'NKDA'}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Chronic History:</span>
                          <span className="font-semibold text-slate-300 truncate block">
                            {token.healthGridCv.chronicConditions.join(', ') || 'Nil'}
                          </span>
                        </div>
                      </div>

                      {/* Call Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Vitals: BP {token.healthGridCv.lastVitals.bp} | SpO2 {token.healthGridCv.lastVitals.spo2}%
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCallPatient(token)}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{token.status === 'IN_CONSULTATION' ? 'Resume Chamber' : 'Call Patient Now'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE CONSULTATION CHAMBER (EHR ENCOUNTER) */}
          {activeTab === 'ENCOUNTER' && (
            <div className="space-y-4">
              {!activeEncounterToken ? (
                <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 text-slate-400 space-y-3">
                  <Video className="w-10 h-10 text-teal-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Active Patient In Chamber</h3>
                  <p className="text-xs max-w-md mx-auto leading-relaxed">
                    Select a patient from the OPD Token Queue to start a teleconsultation encounter with full HealthGrid CV records.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('QUEUE')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Open OPD Token Queue</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Video Room & HealthGrid CV Panel (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Simulated Teleconsultation Video Stream */}
                    <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl relative">
                      <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center relative">
                        {/* Remote Patient Video Avatar */}
                        <div className="text-center space-y-2">
                          <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto text-2xl font-bold">
                            {activeEncounterToken.patientName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {activeEncounterToken.patientName} (Live Connected)
                            </div>
                            <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              WebRTC 1080p TeleDoc Stream
                            </div>
                          </div>
                        </div>

                        {/* Picture-in-Picture Doctor Stream */}
                        <div className="absolute bottom-3 right-3 w-28 h-20 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shadow-md flex items-center justify-center">
                          <div className="text-[10px] text-teal-400 font-bold text-center">
                            You (Dr. Meenakshi)
                          </div>
                        </div>
                      </div>

                      {/* Video Call Controls */}
                      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsMicMuted(!isMicMuted)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                            title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                          >
                            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsVideoMuted(!isVideoMuted)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isVideoMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                            title={isVideoMuted ? 'Enable Camera' : 'Turn Off Camera'}
                          >
                            {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="text-xs text-slate-400 font-mono">
                          Token #{activeEncounterToken.tokenId}
                        </div>
                      </div>
                    </div>

                    {/* Transmitted HealthGrid CV & Longitudinal Records */}
                    <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-teal-400" />
                          HealthGrid Patient CV & EHR
                        </span>
                        <span className="text-[10px] text-teal-400 font-mono">
                          {activeEncounterToken.healthGridCv.patientId}
                        </span>
                      </div>

                      {/* Critical Allergy Flag */}
                      {activeEncounterToken.healthGridCv.allergies.length > 0 &&
                        !activeEncounterToken.healthGridCv.allergies.includes('No Known Drug Allergies (NKDA)') && (
                          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                            <span>
                              <strong>ALLERGY ALERT:</strong> {activeEncounterToken.healthGridCv.allergies.join(', ')}
                            </span>
                          </div>
                        )}

                      {/* Vitals Summary */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">BP</span>
                          <span className="font-bold text-slate-200">
                            {activeEncounterToken.healthGridCv.lastVitals.bp}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Pulse</span>
                          <span className="font-bold text-teal-300">
                            {activeEncounterToken.healthGridCv.lastVitals.heartRate} bpm
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">SpO2</span>
                          <span className="font-bold text-emerald-300">
                            {activeEncounterToken.healthGridCv.lastVitals.spo2}%
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Temp</span>
                          <span className="font-bold text-amber-300">
                            {activeEncounterToken.healthGridCv.lastVitals.tempF}
                          </span>
                        </div>
                      </div>

                      {/* Chronic Conditions & Current Meds */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Chronic Conditions:
                          </span>
                          <span className="text-slate-200">
                            {activeEncounterToken.healthGridCv.chronicConditions.join(', ') || 'None recorded'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Active Medications:
                          </span>
                          <span className="text-slate-200">
                            {activeEncounterToken.healthGridCv.currentMedications.join(', ') || 'None current'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: SOAP Notes, e-Prescribing, & In-Person Referral (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* SOAP Encounter Form */}
                    <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-teal-400" />
                          <span>SOAP Clinical Encounter Documentation</span>
                        </h3>
                        <span className="text-xs text-slate-400">
                          Patient: {activeEncounterToken.patientName} (#{activeEncounterToken.tokenId})
                        </span>
                      </div>

                      {/* Subjective & Objective */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-teal-400 mb-1">
                            S - Subjective (History & Patient Statements)
                          </label>
                          <textarea
                            rows={3}
                            value={subjective}
                            onChange={(e) => setSubjective(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-teal-400 mb-1">
                            O - Objective (Clinical Observations & Vitals)
                          </label>
                          <textarea
                            rows={3}
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      {/* Assessment & Plan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-teal-400 mb-1">
                            A - Assessment (Diagnosis / Impression)
                          </label>
                          <textarea
                            rows={2}
                            value={assessment}
                            onChange={(e) => setAssessment(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-teal-400 mb-1">
                            P - Plan (Therapy & Follow-Up)
                          </label>
                          <textarea
                            rows={2}
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      {/* e-Prescribing & Jan Aushadhi Generic Substitution Pad */}
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-teal-400" />
                            <span>Digital Prescription (e-Prescribing & Generic Salt Match)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <select
                              value={selectedMedIndex}
                              onChange={(e) => setSelectedMedIndex(parseInt(e.target.value))}
                              className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                            >
                              {SAMPLE_GENERIC_MEDS.map((med, idx) => (
                                <option key={idx} value={idx}>
                                  {med.generic} ({med.brand})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={handleAddPrescription}
                              className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Rx</span>
                            </button>
                          </div>
                        </div>

                        {/* Prescribed Items Table */}
                        <div className="space-y-2">
                          {prescriptions.map((rx) => (
                            <div
                              key={rx.id}
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-200">{rx.medicineName}</span>
                                <div className="text-[11px] text-teal-400">
                                  {rx.frequency} • {rx.durationDays} Days • {rx.instructions}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePrescription(rx.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* In-Person Physical Referral Scheduler */}
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-400" />
                              Schedule In-Person Investigation / Physical Follow-Up
                            </span>
                            <p className="text-[11px] text-slate-400">
                              For cases requiring hands-on palpation, ECG, ultrasound, or blood tests
                            </p>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={referInPerson}
                              onChange={(e) => setReferInPerson(e.target.checked)}
                              className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                            />
                            <span className="text-xs font-bold text-teal-300">Issue In-Person Referral</span>
                          </label>
                        </div>

                        {referInPerson && (
                          <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/40 space-y-3 text-xs animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">
                                  Target Department / Clinic
                                </label>
                                <select
                                  value={referralDept}
                                  onChange={(e) => setReferralDept(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                                >
                                  <option value="General Medicine / Internal OPD">General Medicine / Internal OPD</option>
                                  <option value="Cardiology & ECG Triage">Cardiology & ECG Triage</option>
                                  <option value="Pulmonology / Chest Clinic">Pulmonology / Chest Clinic</option>
                                  <option value="Pediatrics & Immunization">Pediatrics & Immunization</option>
                                  <option value="Casualty & Emergency Observation">Casualty & Emergency Observation</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">
                                  Appointment Slot
                                </label>
                                <input
                                  type="text"
                                  value={referralDate}
                                  onChange={(e) => setReferralDate(e.target.value)}
                                  placeholder="e.g. Tomorrow at 10:30 AM"
                                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Clinical Reason for In-Person Visit
                              </label>
                              <input
                                type="text"
                                value={referralReason}
                                onChange={(e) => setReferralReason(e.target.value)}
                                placeholder="e.g. Requires abdominal rebound tenderness check & ultrasound imaging"
                                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Complete Encounter Action */}
                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEncounterToken(null);
                            setActiveTab('QUEUE');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Cancel Encounter
                        </button>

                        <button
                          type="button"
                          onClick={handleCompleteEncounter}
                          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete Consultation & Issue Digital Rx</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INPATIENT ADT & BED CENSUS */}
          {activeTab === 'BEDS' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bed className="w-5 h-5 text-teal-400" />
                    <span>Inpatient Bed Census & ADT Management</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time occupancy tracking across ICU, Emergency Casualty, Oxygen, and General Wards
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Total: <strong className="text-white">{bedStats.total}</strong></span>
                  <span className="text-rose-400">Occupied: <strong>{bedStats.occupied}</strong></span>
                  <span className="text-emerald-400">Available: <strong>{bedStats.available}</strong></span>
                </div>
              </div>

              {/* Ward Grid */}
              {(['ICU', 'EMERGENCY_CASUALTY', 'OXYGEN_WARD', 'GENERAL_WARD'] as WardType[]).map((ward) => {
                const wardBeds = beds.filter((b) => b.ward === ward);
                return (
                  <div key={ward} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {ward.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {wardBeds.filter((b) => b.status === 'AVAILABLE').length} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {wardBeds.map((bed) => (
                        <div
                          key={bed.bedId}
                          className={`p-4 rounded-2xl border transition-all ${
                            bed.status === 'OCCUPIED'
                              ? 'bg-slate-950/80 border-slate-800'
                              : bed.status === 'AVAILABLE'
                              ? 'bg-emerald-950/10 border-emerald-500/30 hover:border-emerald-500'
                              : 'bg-amber-950/10 border-amber-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-sm font-bold text-white font-mono">{bed.bedCode}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                bed.status === 'OCCUPIED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : bed.status === 'AVAILABLE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {bed.status}
                            </span>
                          </div>

                          {bed.status === 'OCCUPIED' ? (
                            <div className="mt-3 space-y-1.5 text-xs">
                              <div className="font-bold text-slate-200">
                                {bed.patientName} ({bed.age}y • {bed.gender})
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-2">
                                {bed.primaryDiagnosis}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Admitted: {bed.admittedAt}
                              </div>

                              <button
                                type="button"
                                onClick={() => hisService.dischargePatientFromBed(bed.bedId)}
                                className="w-full mt-2 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Discharge Patient
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 text-xs space-y-2">
                              <p className="text-[11px] text-slate-500">
                                Bed sanitized and ready for admission.
                              </p>
                              {bed.status === 'AVAILABLE' && (
                                <button
                                  type="button"
                                  onClick={() => setAdmitBedId(bed.bedId)}
                                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                >
                                  Admit Patient
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Admission Modal Dialog */}
              {admitBedId && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                  onClick={() => setAdmitBedId(null)}
                >
                  <div
                    className="w-full max-w-md bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Bed className="w-4 h-4 text-teal-400" />
                        <span>Admit Patient to Bed #{admitBedId}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setAdmitBedId(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleConfirmAdmission} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Patient Full Name</label>
                        <input
                          type="text"
                          required
                          value={admitPatientName}
                          onChange={(e) => setAdmitPatientName(e.target.value)}
                          placeholder="e.g. M. Sundaram"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Age</label>
                          <input
                            type="number"
                            value={admitAge}
                            onChange={(e) => setAdmitAge(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Attending Doctor</label>
                          <input
                            type="text"
                            disabled
                            value={doctorName}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Primary Diagnosis</label>
                        <input
                          type="text"
                          required
                          value={admitDiagnosis}
                          onChange={(e) => setAdmitDiagnosis(e.target.value)}
                          placeholder="e.g. Acute Bronchitis with Respiratory Distress"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAdmitBedId(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                        >
                          Confirm Admission
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LAB ORDERS & RESULTS */}
          {activeTab === 'LABS' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-teal-400" />
                  <span>Clinical Laboratory & Diagnostic Hub</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time status of pathology, biochemistry, and microbiology investigation orders
                </p>
              </div>

              <div className="rounded-3xl bg-slate-950/70 border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3.5">Order ID</th>
                        <th className="px-5 py-3.5">Patient</th>
                        <th className="px-5 py-3.5">Investigation</th>
                        <th className="px-5 py-3.5">Specimen</th>
                        <th className="px-5 py-3.5">Priority</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {labs.map((lab) => (
                        <tr key={lab.orderId} className="hover:bg-slate-900/40">
                          <td className="px-5 py-3 font-mono font-bold text-white">{lab.orderId}</td>
                          <td className="px-5 py-3">
                            <span className="font-semibold text-slate-200 block">{lab.patientName}</span>
                            <span className="text-[10px] text-slate-500">{lab.patientId}</span>
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-200">{lab.testName}</td>
                          <td className="px-5 py-3 text-slate-400">{lab.specimenType}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                lab.priority === 'STAT'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {lab.priority}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                lab.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : lab.status === 'IN_ANALYSIS'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {lab.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {lab.resultValue ? (
                              <span
                                className={`font-semibold ${
                                  lab.isAbnormal ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                {lab.resultValue}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  hisService.updateLabStatus(
                                    lab.orderId,
                                    'COMPLETED',
                                    'Normal Physiological Range',
                                    false
                                  )
                                }
                                className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                              >
                                Mark Result Ready
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CASUALTY 108 RADAR */}
          {activeTab === 'CASUALTY' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Siren className="w-5 h-5 text-rose-400" />
                  <span>Casualty & Emergency 108 Pre-Arrival Radar</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Pre-arrival casualty handover alerts transmitting victim vitals, blood type, and allergy alerts before the ambulance arrives
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Approaching Ambulance #108-TN-04
                    </span>
                    <span className="text-xs font-bold text-white bg-rose-600 px-3 py-1 rounded-full">
                      ETA: 4 Mins
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-base font-bold text-white">S. Kumar (38y • Male • O+ve)</div>
                    <p className="text-xs text-slate-300">
                      High-speed two-wheeler skid on GST Road. Suspected polytrauma with blunt chest injury.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-rose-400">
                      Paramedic Pre-Arrival Vitals:
                    </span>
                    <div className="text-rose-200">
                      BP: 94/60 mmHg (Hypotensive) • HR: 118 bpm (Tachycardia) • SpO2: 92% on O2 Mask
                    </div>
                    <div className="text-rose-300 font-semibold pt-1">
                      ⚠️ Allergy: Penicillin • Airway stable on cervical collar
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Trauma Team: Red Alert Activated</span>
                    <span className="px-3 py-1 rounded-xl bg-teal-600 text-white font-bold">
                      Bed CAS-02 Reserved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
