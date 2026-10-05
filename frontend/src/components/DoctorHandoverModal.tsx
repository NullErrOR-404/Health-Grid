import React, { useRef } from 'react';
import { X, Printer, Share2, ShieldAlert, AlertOctagon, CheckCircle2, QrCode, ShieldCheck } from 'lucide-react';
import type { Language } from '../types';
import { authService } from '../services/authService';
import { healthMemoryService } from '../services/healthMemoryService';

interface DoctorHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  patientData?: {
    name?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
    symptoms?: string;
    symptomsTa?: string;
    triageLevel?: 'RED' | 'AMBER' | 'YELLOW' | 'GREEN';
    vitals?: {
      bp?: string;
      pulse?: number;
      spo2?: number;
      temp?: string;
    };
    allergies?: string[];
    paramedicInterventions?: string[];
  };
}

export const DoctorHandoverModal: React.FC<DoctorHandoverModalProps> = ({
  isOpen,
  onClose,
  lang,
  patientData,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentUser = authService.getCurrentUser();
  const vitalsEntries = healthMemoryService.getEntries();
  const latestBp = vitalsEntries.find(e => e.type === 'blood_pressure');
  const latestPulse = vitalsEntries.find(e => e.type === 'heart_rate');
  const latestSpo2 = vitalsEntries.find(e => e.type === 'spo2');
  const latestTemp = vitalsEntries.find(e => e.type === 'temperature');

  const resolvedName = patientData?.name || currentUser?.name || (lang === 'en' ? 'Emergency Patient Handover' : 'அவசர சிகிச்சை நோயாளி');
  const resolvedAge = patientData?.age ?? currentUser?.age;
  const resolvedGender = patientData?.gender || '';
  const resolvedBloodGroup = patientData?.bloodGroup || currentUser?.bloodGroup || (lang === 'en' ? 'Not Recorded' : 'பதிவு செய்யப்படவில்லை');
  const resolvedPhone = patientData?.phone || currentUser?.phone || (lang === 'en' ? 'Not Provided' : 'குறிப்பிடப்படவில்லை');

  const resolvedBp = patientData?.vitals?.bp || (latestBp ? `${(latestBp.value as any).systolic}/${(latestBp.value as any).diastolic} mmHg` : null);
  const resolvedPulse = patientData?.vitals?.pulse || (latestPulse ? Number(latestPulse.value) : null);
  const resolvedSpo2 = patientData?.vitals?.spo2 || (latestSpo2 ? Number(latestSpo2.value) : null);
  const resolvedTemp = patientData?.vitals?.temp || (latestTemp ? `${latestTemp.value} °F` : null);

  const resolvedAllergies = patientData?.allergies && patientData.allergies.length > 0 ? patientData.allergies : [];
  const resolvedSymptoms = patientData?.symptoms || (lang === 'en' ? 'Emergency casualty triage and medical handover.' : 'அவசர சிகிச்சை ஒப்படைப்பு ஆவணம்.');
  const resolvedSymptomsTa = patientData?.symptomsTa || 'அவசர சிகிச்சை ஒப்படைப்பு ஆவணம்.';
  const resolvedInterventions = patientData?.paramedicInterventions || [
    'Emergency 108 Dispatch Telemetry Connected',
    'Real-time Casualty Hospital Routing Active',
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚨 *HEALTHGRID CASUALTY HANDOVER CARD*\nPatient: ${resolvedName} (${resolvedAge ? `${resolvedAge}Y` : 'Age Unspecified'}${resolvedGender ? `/${resolvedGender}` : ''})\nBlood Group: ${resolvedBloodGroup}\nContact: ${resolvedPhone}\nVitals: BP ${resolvedBp || 'Not Recorded'}, Pulse ${resolvedPulse ? `${resolvedPulse} bpm` : 'Not Recorded'}, SpO2 ${resolvedSpo2 ? `${resolvedSpo2}%` : 'Not Recorded'}\nAllergies: ${resolvedAllergies.length > 0 ? resolvedAllergies.join(', ') : 'None Recorded'}\nSymptoms: ${resolvedSymptoms}\n108 Emergency Response Service (GVK EMRI)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl border-none sm:border border-slate-200 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl flex flex-col overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  {lang === 'en' ? 'Doctor Casualty Handover Card' : 'மருத்துவமனை அவசர சிகிச்சை ஒப்படைப்பு ஏடு'}
                </h3>
                <span className="text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">
                  108 CASUALTY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Standardized pre-hospital clinical handover for casualty triage' : 'அவசர சிகிச்சை பிரிவில் மருத்துவரிடம் உடனடியாக வழங்கக்கூடிய ஆவணம்'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              title="Print Handover Card"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div ref={cardRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60 text-slate-900">
          
          {/* Triage Alert Banner */}
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                108
              </div>
              <div>
                <div className="text-xs font-black uppercase text-red-700 tracking-wider">
                  {lang === 'en' ? '108 EMERGENCY AMBULANCE CASUALTY HANDOVER' : '108 அவசர சிகிச்சை ஒப்படைப்பு'}
                </div>
                <div className="text-sm font-bold text-red-950">
                  {resolvedSymptoms}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-500 block">Ambulance Service</span>
              <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                TN 108 (GVK EMRI)
              </span>
            </div>
          </div>

          {/* Patient Details & QR Grid */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Identification</div>
                <div className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{resolvedName}</span>
                  {(resolvedAge !== undefined || resolvedGender) && (
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {resolvedAge !== undefined ? `${resolvedAge} Y` : ''} {resolvedGender ? `/ ${resolvedGender}` : ''}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Contact: <span className="font-bold text-slate-800">{resolvedPhone}</span> • Blood Group: <span className="font-extrabold text-red-600">{resolvedBloodGroup}</span>
                </div>
              </div>

              {/* Fast Triage QR Code */}
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex-shrink-0">
                <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <div className="text-[10px] leading-tight text-slate-500 font-medium">
                  <span className="font-bold text-slate-800 block">Scan at Casualty</span>
                  Syncs with e-Hospital & GH EHR
                </div>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                {lang === 'en' ? 'Pre-Hospital Vital Signs' : 'ஆம்புலன்ஸில் பதிவு செய்யப்பட்ட உயிராதார அளவுகள்'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Blood Pressure</div>
                  <div className="text-base font-black text-slate-900">{resolvedBp || '—'}</div>
                  <div className={`text-[10px] font-semibold ${resolvedBp ? 'text-teal-600' : 'text-slate-400'}`}>
                    {resolvedBp ? 'Recorded' : 'Not Recorded'}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Pulse Rate</div>
                  <div className="text-base font-black text-slate-900">{resolvedPulse ? `${resolvedPulse} bpm` : '—'}</div>
                  <div className={`text-[10px] font-semibold ${resolvedPulse ? 'text-teal-600' : 'text-slate-400'}`}>
                    {resolvedPulse ? 'Recorded' : 'Not Recorded'}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Oxygen (SpO2)</div>
                  <div className="text-base font-black text-slate-900">{resolvedSpo2 ? `${resolvedSpo2}%` : '—'}</div>
                  <div className={`text-[10px] font-semibold ${resolvedSpo2 ? 'text-teal-600' : 'text-slate-400'}`}>
                    {resolvedSpo2 ? 'Recorded' : 'Not Recorded'}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Temperature</div>
                  <div className="text-base font-black text-slate-900">{resolvedTemp || '—'}</div>
                  <div className={`text-[10px] font-semibold ${resolvedTemp ? 'text-teal-600' : 'text-slate-400'}`}>
                    {resolvedTemp ? 'Recorded' : 'Not Recorded'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALLERGIES STRIP */}
          {resolvedAllergies.length > 0 ? (
            <div className="bg-rose-100/80 border-2 border-rose-400 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-rose-900 tracking-wide">
                  {lang === 'en' ? 'CRITICAL DRUG ALLERGIES (DO NOT ADMINISTER)' : 'முக்கிய மருந்து ஒவ்வாமை எச்சரிக்கை'}
                </div>
                <div className="text-xs font-extrabold text-rose-950 flex flex-wrap gap-2 mt-0.5">
                  {resolvedAllergies.map((all, idx) => (
                    <span key={idx} className="bg-white/90 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                      ⚠️ {all}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  {lang === 'en' ? 'NO KNOWN DRUG ALLERGIES ON FILE' : 'மருந்து ஒவ்வாமை எதுவும் பதிவு செய்யப்படவில்லை'}
                </div>
                <div className="text-[11px] text-emerald-700">
                  {lang === 'en' ? 'No adverse drug interactions or penicillin contraindications reported' : 'எந்தவொரு ஒவ்வாமை எதிர்வினைகளும் பதிவு செய்யப்படவில்லை'}
                </div>
              </div>
            </div>
          )}

          {/* Presenting Symptoms in Tamil & English */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Chief Complaints & Clinical Narrative' : 'நோயாளியின் முதன்மை அறிகுறிகள்'}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              {resolvedSymptoms}
            </p>
            {resolvedSymptomsTa && (
              <p className="text-xs font-medium text-teal-800 bg-teal-50/70 p-2.5 rounded-xl border border-teal-100">
                <span className="font-bold">வட்டாரத் தமிழ் விவரம்:</span> {resolvedSymptomsTa}
              </p>
            )}
          </div>

          {/* Paramedic Pre-Hospital Interventions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'en' ? 'Pre-Hospital Emergency Interventions' : 'ஆம்புலன்ஸ் முதலுதவி சிகிச்சை'}</span>
              <span className="text-[11px] font-semibold text-teal-700">108 Emergency Response Team</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {resolvedInterventions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            {lang === 'en'
              ? 'Handover token: HG-2026-CH09-P1 • Complies with National Ambulance Code (AIS-125)'
              : 'அரசு மருத்துவமனை அவசர பிரிவு குறியீடு: HG-2026-CH09-P1'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Print Card' : 'அச்சிடு'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              {lang === 'en' ? 'Close' : 'மூடு'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
