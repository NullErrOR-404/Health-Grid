import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  ShieldCheck,
  FileText,
  ShoppingBag,
  MapPin,
  RefreshCw,
  Volume2,
  VolumeX,
  AlertTriangle,
  SwitchCamera,
  Check,
  Plus,
  Pill,
  Calendar,
  Clock,
  Share2,
  CalendarPlus,
  Trash2,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import type { Language } from '../types';
import { prescriptionAiService, type PrescriptionAnalysisResult } from '../services/prescriptionAiService';
import { speechEngine } from '../services/speechService';
import { supabase } from '../services/supabaseClient';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenDiseaseMap?: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenDiseaseMap,
}) => {
  // Navigation & Multi-Page Scan State
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'results'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Multi-page batch captures
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [showMultiPageToast, setShowMultiPageToast] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bedside Doctor Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLang, setAudioLang] = useState<'en' | 'ta'>(lang === 'ta' ? 'ta' : 'en');

  // Supabase Patient Profile & Security State
  const [patientAllergies, setPatientAllergies] = useState<string[]>([]);
  const [isSavedToProfile, setIsSavedToProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync audio language when modal language switches
  useEffect(() => {
    setAudioLang(lang === 'ta' ? 'ta' : 'en');
  }, [lang]);

  // Load patient's known allergies securely from Supabase
  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('patients')
            .select('known_allergies, allergies')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              const allergyList = data?.known_allergies || data?.allergies;
              if (Array.isArray(allergyList)) {
                setPatientAllergies(allergyList);
              }
            });
        }
      });
    }
  }, [isOpen]);

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !analysisResult && !isAnalyzing) {
      startCamera(cameraFacingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      speechEngine.stopSpeaking();
    };
  }, [isOpen, activeTab, cameraFacingMode, analysisResult, isAnalyzing]);

  if (!isOpen) return null;

  // Start device camera
  const startCamera = async (facingMode: 'environment' | 'user' = 'environment') => {
    try {
      setCameraError(null);
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Video play warning:', e));
        };
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start warning:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow access or upload photos.'
          : err.message || 'Unable to access camera.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Toggle front/rear camera
  const handleSwitchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture still photo from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Append to captured pages array
    const updated = [...capturedPages, dataUrl];
    setCapturedPages(updated);
    setShowMultiPageToast(true);
  };

  // Remove a captured page thumbnail
  const handleRemovePage = (index: number) => {
    const updated = capturedPages.filter((_, idx) => idx !== index);
    setCapturedPages(updated);
    if (updated.length === 0) {
      setShowMultiPageToast(false);
    }
  };

  // Handle uploaded files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readPromises: Promise<string>[] = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((dataUrls) => {
      const updated = [...capturedPages, ...dataUrls];
      setCapturedPages(updated);
      setShowMultiPageToast(true);
    });
  };

  // Proceed to analyze all captured pages
  const handleProceedToAnalysis = async () => {
    if (capturedPages.length === 0) return;
    setShowMultiPageToast(false);
    stopCamera();

    setIsAnalyzing(true);
    setErrorMsg(null);
    setIsSavedToProfile(false);
    setSaveFeedback(null);
    speechEngine.stopSpeaking();
    setIsPlayingAudio(false);

    try {
      setAnalysisStep(
        lang === 'en'
          ? `Reading ${capturedPages.length > 1 ? `${capturedPages.length} prescription pages` : 'prescription handwriting'}...`
          : `மருத்துவர் கையெழுத்தை AI மூலம் படிக்கிறது (${capturedPages.length} பக்கங்கள்)...`
      );

      const result = await prescriptionAiService.analyzePrescription(capturedPages, patientAllergies);

      setAnalysisStep(
        lang === 'en'
          ? 'Finding Jan Aushadhi generic matches & calculating savings...'
          : 'அரசு ஜன் அவுஷதி மலிவு விலை மருந்துகளை ஒப்பிடுகிறது...'
      );

      setTimeout(() => {
        setAnalysisResult(result);
        setIsAnalyzing(false);
        setActiveTab('results');
      }, 500);
    } catch (err: any) {
      console.error('Prescription processing error:', err);
      setIsAnalyzing(false);
      setErrorMsg(
        err.message ||
          (lang === 'en'
            ? 'Could not analyze prescription. Please retake photo with clearer lighting.'
            : 'மருந்துச் சீட்டைப் படிக்க முடியவில்லை. தெளிவான வெளிச்சத்தில் மீண்டும் படம் எடுக்கவும்.')
      );
    }
  };

  // Reset scan and re-arm camera
  const handleResetScan = () => {
    speechEngine.stopSpeaking();
    setIsPlayingAudio(false);
    setCapturedPages([]);
    setShowMultiPageToast(false);
    setAnalysisResult(null);
    setErrorMsg(null);
    setIsSavedToProfile(false);
    setSaveFeedback(null);
    setActiveTab('camera');
  };

  // Audio Doctor voice advice playback
  const handleToggleAudio = () => {
    if (!analysisResult) return;

    if (isPlayingAudio) {
      speechEngine.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speechText =
        audioLang === 'ta'
          ? analysisResult.humanDoctorExplanationTa
          : analysisResult.humanDoctorExplanationEn;

      setIsPlayingAudio(true);
      speechEngine.speak(
        speechText,
        audioLang,
        0.88, // Reassuring bedside doctor pacing
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Save scanned prescription and medications securely mapped to user UUID
  const handleSaveToProfile = async () => {
    if (!analysisResult || isSaving || isSavedToProfile) return;

    setIsSaving(true);
    setSaveFeedback(null);

    const res = await prescriptionAiService.savePrescriptionRecord(analysisResult);
    setIsSaving(false);

    if (res.success) {
      setIsSavedToProfile(true);
      setSaveFeedback(
        lang === 'en'
          ? 'Confidential prescription securely saved to your health profile!'
          : 'மருத்துவ விவரங்கள் உங்கள் பாதுகாப்பான சுயவிவரத்தில் சேர்க்கப்பட்டன!'
      );
    } else {
      setSaveFeedback(res.error || (lang === 'en' ? 'Unable to save. Please sign in.' : 'சேமிக்க முடியவில்லை. உள்நுழையவும்.'));
    }
  };

  // Export dosage timetable to WhatsApp
  const handleExportWhatsApp = () => {
    if (!analysisResult) return;

    let text = `🏥 *HealthGrid Prescription Schedule*\n`;
    text += `👨‍⚕️ *Doctor:* ${analysisResult.doctorName}\n`;
    text += `📅 *Date:* ${analysisResult.date}\n`;
    text += `📋 *Diagnosis:* ${analysisResult.diagnosisNotes}\n\n`;

    text += `⏰ *DAILY MEDICATION ROUTINE:*\n`;
    if (analysisResult.dosageSchedule.morning.length > 0) {
      text += `🌅 *Morning (Breakfast):*\n` + analysisResult.dosageSchedule.morning.map((m) => `  • ${m}`).join('\n') + `\n`;
    }
    if (analysisResult.dosageSchedule.afternoon.length > 0) {
      text += `☀️ *Afternoon (Lunch):*\n` + analysisResult.dosageSchedule.afternoon.map((m) => `  • ${m}`).join('\n') + `\n`;
    }
    if (analysisResult.dosageSchedule.night.length > 0) {
      text += `🌙 *Night (Dinner):*\n` + analysisResult.dosageSchedule.night.map((m) => `  • ${m}`).join('\n') + `\n`;
    }

    text += `\n💰 *PMBJP Jan Aushadhi Savings:* ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}% lower)`;
    text += `\n\n_Shared securely via HealthGrid Care_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Add reminder to Google Calendar
  const handleAddCalendarReminder = () => {
    if (!analysisResult) return;

    const title = encodeURIComponent(`HealthGrid Medicine Routine: ${analysisResult.diagnosisNotes}`);
    const details = encodeURIComponent(
      `Daily Medications:\nMorning: ${analysisResult.dosageSchedule.morning.join(', ') || 'None'}\nNight: ${analysisResult.dosageSchedule.night.join(', ') || 'None'}\nDoctor: ${analysisResult.doctorName}`
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&recur=RRULE:FREQ=DAILY;COUNT=${analysisResult.refillCountdown.courseDurationDays || 5}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Hidden Canvas for High-Resolution Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* TOP MODAL HEADER */}
        <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                {lang === 'en' ? 'Prescription Scanner & Medicine Saver' : 'மருந்துச் சீட்டு ஸ்கேனர் & மலிவு மருந்து சேமிப்பு'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'en'
                  ? 'Deciphers handwriting · Jan Aushadhi Generics · Audio Doctor'
                  : 'கையெழுத்துப் படிப்பு · அரசு மலிவு மருந்துகள் · குரல் அறிவுரை'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'results' && (
              <button
                type="button"
                onClick={handleResetScan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                title={lang === 'en' ? 'Scan another prescription' : 'மறுபடி ஸ்கேன் செய்'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Scan Another' : 'புதிய ஸ்கேன்'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">{lang === 'en' ? 'Scanning Notice: ' : 'கவனிக்க: '}</span>
                {errorMsg}
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-rose-500 hover:text-rose-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* CAMERA & SCAN VIEW */}
          {activeTab !== 'results' && !isAnalyzing && (
            <div className="space-y-3">
              {/* Tab Selector: Live Camera vs Upload */}
              <div className="flex p-1 bg-slate-200/80 rounded-2xl text-xs font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                    startCamera(cameraFacingMode);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'camera'
                      ? 'bg-white text-teal-700 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Live Camera' : 'கேமரா'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    stopCamera();
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-teal-700 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Upload Slip / Photo' : 'கோப்பு ஏற்று'}</span>
                </button>
              </div>

              {/* Camera Error banner */}
              {cameraError && activeTab === 'camera' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div className="flex-1">{cameraError}</div>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="font-bold underline text-amber-800"
                  >
                    Use Upload
                  </button>
                </div>
              )}

              {/* LIVE CAMERA VIEWFINDER */}
              {activeTab === 'camera' && !cameraError && (
                <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] border-2 border-slate-300 shadow-inner flex items-center justify-center group">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Document Framing Guide Overlay */}
                  <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-teal-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-4 border-l-4 border-teal-400 rounded-tl-sm"></div>
                      <div className="w-4 h-4 border-t-4 border-r-4 border-teal-400 rounded-tr-sm"></div>
                    </div>
                    <div className="text-center bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-3 rounded-full mx-auto shadow-md">
                      {lang === 'en' ? 'Position prescription slip inside frame' : 'மருத்துவர் சீட்டை கட்டத்திற்குள் வைக்கவும்'}
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-4 border-l-4 border-teal-400 rounded-bl-sm"></div>
                      <div className="w-4 h-4 border-b-4 border-r-4 border-teal-400 rounded-br-sm"></div>
                    </div>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 px-4">
                    {/* Switch Front/Rear Camera */}
                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
                      title={lang === 'en' ? 'Switch Camera' : 'கேமரா மாற்று'}
                    >
                      <SwitchCamera className="w-5 h-5" />
                    </button>

                    {/* Main Shutter Capture Button */}
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={!isCameraActive || isAnalyzing}
                      className="w-16 h-16 rounded-full bg-white border-4 border-teal-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group-hover:ring-4 group-hover:ring-teal-400/40"
                      title={lang === 'en' ? 'Capture Prescription' : 'படம் எடு'}
                    >
                      <div className="w-11 h-11 rounded-full bg-teal-600 flex items-center justify-center text-white">
                        <Camera className="w-5 h-5" />
                      </div>
                    </button>

                    {/* Quick Upload Fallback */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
                      title={lang === 'en' ? 'Upload from Photos' : 'படத்தை பதிவேற்று'}
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* UPLOAD DROPZONE */}
              {(activeTab === 'upload' || cameraError) && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-white hover:bg-teal-50/40 rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {lang === 'en' ? 'Click to select prescription photos or bills' : 'மருந்து சீட்டு படங்களை இங்கே தேர்ந்தெடுக்கவும்'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {lang === 'en' ? 'You can select multiple pages (JPG, PNG, WebP).' : 'பல பக்கங்களைத் தேர்ந்தெடுக்கலாம் (JPG, PNG, WebP).'}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* CAPTURED PAGES THUMBNAIL RIBBON */}
              {capturedPages.length > 0 && (
                <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>{capturedPages.length} {capturedPages.length === 1 ? 'Page' : 'Pages'} Ready</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {lang === 'en' ? 'Add more pages or proceed below' : 'மேலும் பக்கங்கள் சேர்க்கலாம்'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {capturedPages.map((pageData, idx) => (
                      <div
                        key={idx}
                        className="relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group"
                      >
                        <img src={pageData} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-sm">
                          P{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MULTI-PAGE TOAST OVERLAY / PROMPT */}
              {showMultiPageToast && capturedPages.length > 0 && (
                <div className="bg-teal-900 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-teal-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center text-teal-300 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-teal-200">
                        {lang === 'en' ? `Page ${capturedPages.length} Captured!` : `பக்கம் ${capturedPages.length} எடுக்கப்பட்டது!`}
                      </div>
                      <div className="text-sm font-semibold">
                        {lang === 'en' ? 'Want to scan another page or bill?' : 'மற்றொரு பக்கம் அல்லது பில் ஸ்கேன் செய்ய வேண்டுமா?'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMultiPageToast(false);
                        if (activeTab === 'camera') {
                          startCamera(cameraFacingMode);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-teal-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? '+ Snap Another Page' : '+ மேலும் பக்கம்'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToAnalysis}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-teal-950 text-xs font-extrabold transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span>{lang === 'en' ? `Analyze ${capturedPages.length > 1 ? `All (${capturedPages.length})` : 'Prescription'}` : 'பரிசீலிக்க ➔'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REASSURING MEDICAL ANALYSIS ANIMATION */}
          {isAnalyzing && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in duration-200">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 animate-pulse">
                  <FileText className="w-10 h-10" />
                </div>
                <div className="absolute -inset-1 rounded-3xl border-2 border-teal-500 animate-ping opacity-25"></div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {lang === 'en' ? 'Clinical Intelligence at Work' : 'மருத்துவ பரிசீலனை நடைபெறுகிறது'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {analysisStep}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-teal-600 rounded-full animate-indeterminate"></div>
              </div>
            </div>
          )}

          {/* BREAKTHROUGH RESULTS VIEW */}
          {activeTab === 'results' && analysisResult && !isAnalyzing && (
            <div className="space-y-4 animate-in fade-in duration-300">

              {/* Feedback Alert for Save Action */}
              {saveFeedback && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                  isSavedToProfile
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}>
                  {isSavedToProfile ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  <span>{saveFeedback}</span>
                </div>
              )}

              {/* DOCTOR & CLINIC CLINICAL HEADER */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                    {analysisResult.clinicOrHospital}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {analysisResult.doctorName}
                  </h4>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Diagnosis:</span>
                    <span>{analysisResult.diagnosisNotes}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-center">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{analysisResult.date}</span>
                  {analysisResult.pagesCount > 1 && (
                    <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                      {analysisResult.pagesCount} Pages
                    </span>
                  )}
                </div>
              </div>

              {/* BEDSIDE AUDIO DOCTOR CARD */}
              <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-teal-200 shadow-xs">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-teal-100">
                        {lang === 'en' ? "Bedside Doctor's Audio Advice" : 'மருத்துவரின் குரல் வழிகாட்டல்'}
                      </h4>
                      <p className="text-[11px] text-teal-300">
                        {lang === 'en' ? 'Gentle spoken instructions for taking medicines' : 'மருந்துகளை உட்கொள்ள எளிய குரல் விளக்கம்'}
                      </p>
                    </div>
                  </div>

                  {/* Language Switcher for Voice */}
                  <div className="flex items-center bg-teal-950/60 p-1 rounded-xl border border-teal-700/50 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        speechEngine.stopSpeaking();
                        setIsPlayingAudio(false);
                        setAudioLang('en');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        audioLang === 'en' ? 'bg-teal-600 text-white shadow-xs' : 'text-teal-300 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        speechEngine.stopSpeaking();
                        setIsPlayingAudio(false);
                        setAudioLang('ta');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        audioLang === 'ta' ? 'bg-teal-600 text-white shadow-xs' : 'text-teal-300 hover:text-white'
                      }`}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>

                {/* Spoken Advice Quote Bubble */}
                <p className="text-xs text-teal-50/95 leading-relaxed bg-white/10 p-3.5 rounded-2xl border border-white/10 italic">
                  "{audioLang === 'ta' ? analysisResult.humanDoctorExplanationTa : analysisResult.humanDoctorExplanationEn}"
                </p>

                {/* Play/Pause Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-teal-950'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Pause Audio Voice' : 'குரலை நிறுத்து'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Listen to Doctor Voice' : 'மருத்துவர் குரலைக் கேளுங்கள்'}</span>
                      </>
                    )}
                  </button>

                  {/* Audio wave animation */}
                  {isPlayingAudio && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-5 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                      <div className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* JAN AUSHADHI GENERIC MEDICINE SAVINGS SPOTLIGHT */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-950 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      {lang === 'en' ? 'PMBJP Jan Aushadhi Savings' : 'ஜன் அவுஷதி மலிவு மருந்து சேமிப்பு'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-950">
                      {lang === 'en'
                        ? `You save ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}% off) with generics!`
                        : `ஜெனரிக் மருந்துகளில் ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}%) சேமிப்பு!`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-200">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 line-through">Brand: ₹{analysisResult.totalBrandCost}</div>
                    <div className="text-xl font-black text-emerald-700">₹{analysisResult.totalGenericCost} only</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenDiseaseMap) {
                        onOpenDiseaseMap();
                      } else {
                        window.history.pushState({}, '', '/maps');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Find Kendra' : 'மருந்தகம் காண்க'}</span>
                  </button>
                </div>
              </div>

              {/* BREAKTHROUGH INNOVATION 1: SMART DOSAGE TIMETABLE & WHATSAPP EXPORTER */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>{lang === 'en' ? 'Smart Daily Medication Routine' : 'தினசரி மருந்து அட்டவணை'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'en' ? 'Mapped by morning, afternoon, and dinner schedules' : 'காலை, மதியம், இரவு நேரப் பிரிவுகள்'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportWhatsApp}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Share routine to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Send WhatsApp' : 'வாட்ஸ்அப் பகிர்'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddCalendarReminder}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'Calendar' : 'நாள்காட்டி'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Morning Routine */}
                  <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span>{lang === 'en' ? 'Morning (Breakfast)' : 'காலை (உணவுக்குப் பின்)'}</span>
                    </div>
                    {analysisResult.dosageSchedule.morning.length > 0 ? (
                      <ul className="text-xs text-slate-800 space-y-1.5">
                        {analysisResult.dosageSchedule.morning.map((m, idx) => (
                          <li key={idx} className="bg-white/80 p-2 rounded-xl border border-amber-200/50 font-medium">
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No morning doses</p>
                    )}
                  </div>

                  {/* Afternoon Routine */}
                  <div className="bg-blue-50/60 rounded-2xl p-3.5 border border-blue-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <Sunset className="w-4 h-4 text-blue-600" />
                      <span>{lang === 'en' ? 'Afternoon (Lunch)' : 'மதியம் (உணவுக்குப் பின்)'}</span>
                    </div>
                    {analysisResult.dosageSchedule.afternoon.length > 0 ? (
                      <ul className="text-xs text-slate-800 space-y-1.5">
                        {analysisResult.dosageSchedule.afternoon.map((m, idx) => (
                          <li key={idx} className="bg-white/80 p-2 rounded-xl border border-blue-200/50 font-medium">
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No afternoon doses</p>
                    )}
                  </div>

                  {/* Night Routine */}
                  <div className="bg-indigo-50/60 rounded-2xl p-3.5 border border-indigo-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <span>{lang === 'en' ? 'Night (Dinner)' : 'இரவு (உணவுக்குப் பின்)'}</span>
                    </div>
                    {analysisResult.dosageSchedule.night.length > 0 ? (
                      <ul className="text-xs text-slate-800 space-y-1.5">
                        {analysisResult.dosageSchedule.night.map((m, idx) => (
                          <li key={idx} className="bg-white/80 p-2 rounded-xl border border-indigo-200/50 font-medium">
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No night doses</p>
                    )}
                  </div>
                </div>
              </div>

              {/* BREAKTHROUGH INNOVATION 2: DRUG INTERACTION & FOOD PRECAUTION RADAR */}
              {analysisResult.safetyRadar && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'en' ? 'Drug Safety & Food Interaction Radar' : 'உணவு & மருந்து பாதுகாப்பு எச்சரிக்கை'}</span>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.safetyRadar.foodInteractions.map((item, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-amber-950">{item.medicine}:</span>
                        <p className="text-slate-700">
                          {lang === 'ta' ? item.cautionTa : item.cautionEn}
                        </p>
                      </div>
                    ))}

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-0.5">
                      <span className="font-bold text-slate-800">
                        {lang === 'en' ? 'Missed Dose Protocol: ' : 'மருந்து விடுபட்டால்: '}
                      </span>
                      <p className="text-slate-600">
                        {lang === 'ta'
                          ? analysisResult.safetyRadar.missedDoseGuidanceTa
                          : analysisResult.safetyRadar.missedDoseGuidanceEn}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BREAKTHROUGH INNOVATION 3: COURSE DURATION & REFILL COUNTDOWN */}
              {analysisResult.refillCountdown && (
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-3xl p-4 flex items-center justify-between gap-3 text-xs text-teal-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                      {analysisResult.refillCountdown.courseDurationDays}d
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? `${analysisResult.refillCountdown.courseDurationDays}-Day Treatment Course` : `${analysisResult.refillCountdown.courseDurationDays} நாட்கள் மருந்து காலம்`}
                      </div>
                      <div className="text-slate-600">
                        {analysisResult.refillCountdown.dailyPillsCount} {lang === 'en' ? 'pills per day' : 'மாத்திரைகள் ஒரு நாளைக்கு'} · {analysisResult.refillCountdown.refillDateText}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px]">
                      {lang === 'en' ? 'Active Course' : 'நடப்பு மருந்து'}
                    </span>
                  </div>
                </div>
              )}

              {/* ALLERGY WARNING BANNER */}
              {analysisResult.allergyWarnings && analysisResult.allergyWarnings.length > 0 && (
                <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{lang === 'en' ? 'Profile Allergy Conflict' : 'சுயவிவர ஒவ்வாமை முரண்பாடு'}</span>
                  </div>
                  {analysisResult.allergyWarnings.map((aw, idx) => (
                    <div key={idx} className="text-xs bg-white/80 p-2.5 rounded-xl border border-rose-200">
                      <span className="font-bold text-rose-900">{aw.medicine}</span> matches your recorded allergy to <span className="font-bold text-rose-700">{aw.allergen}</span>.
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {lang === 'ta' ? aw.warningTa : aw.warningEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* EXTRACTED PRESCRIBED MEDICATIONS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'en' ? 'Deciphered Medicines & Generic Equivalents' : 'பரிந்துரைக்கப்பட்ட மருந்துகள் & ஜெனரிக் மாற்று'}
                  </h4>
                  <span className="text-[11px] text-teal-700 font-semibold">
                    PMBJP Verified
                  </span>
                </div>

                {analysisResult.medicines.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-slate-900 text-sm">
                            {med.brandName}
                          </h5>
                          {med.dosage && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {med.dosage}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-teal-700 font-semibold mt-0.5 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>{med.genericName}</span>
                        </div>
                      </div>

                      {/* Pricing Tag */}
                      <div className="flex items-center gap-2 sm:text-right">
                        <span className="text-xs text-slate-400 line-through">₹{med.brandPrice}</span>
                        <span className="text-sm font-black text-emerald-700">₹{med.genericPrice}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                          {med.savingsPct}% off
                        </span>
                      </div>
                    </div>

                    {/* Schedule, Food Timing & Purpose */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-medium">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>{med.frequency}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-medium">
                        <Pill className="w-3 h-3 text-amber-600" />
                        <span>{lang === 'ta' ? med.timingTa : med.timing}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg font-medium">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        <span>{lang === 'ta' ? med.durationTa : med.duration}</span>
                      </span>

                      <span className="text-slate-500 text-[11px] ml-auto">
                        {lang === 'ta' ? med.purposeTa : med.purposeEn}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveToProfile}
                  disabled={isSaving || isSavedToProfile}
                  className={`flex-1 w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isSavedToProfile
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isSavedToProfile ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'en' ? 'Saved to Your Health Profile' : 'உங்கள் சுயவிவரத்தில் சேர்க்கப்பட்டது'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        {isSaving
                          ? (lang === 'en' ? 'Saving Securely...' : 'சேமிக்கிறது...')
                          : (lang === 'en' ? 'Save to My Profile Medications' : 'என் மருத்துவ விவரத்தில் சேர்')}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetScan}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                  <span>{lang === 'en' ? 'Scan Another Slip' : 'மற்றொரு சீட்டு ஸ்கேன்'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
