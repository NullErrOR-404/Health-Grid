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
  ShieldAlert,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ImageIcon,
  ArrowRight
} from 'lucide-react';
import type { Language } from '../types';
import { prescriptionAiService, type PrescriptionAnalysisResult } from '../services/prescriptionAiService';
import { speechEngine } from '../services/speechService';
import { supabase } from '../services/supabaseClient';
import { medicineStoreService } from '../services/medicineStoreService';
import { authService } from '../services/authService';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenDiseaseMap?: () => void;
  onNavigateMedicines?: () => void;
}

interface RecentUploadItem {
  id: string;
  date: string;
  medicineCount: number;
  doctorName?: string;
  result: PrescriptionAnalysisResult;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenDiseaseMap,
  onNavigateMedicines,
}) => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
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

  // Supabase Patient Profile & Recent Uploads
  const [patientAllergies, setPatientAllergies] = useState<string[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUploadItem[]>([]);
  const [isSavedToProfile, setIsSavedToProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop device camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleAddAllToGenericCart = () => {
    if (!analysisResult || !analysisResult.medicines || analysisResult.medicines.length === 0) return;

    const count = medicineStoreService.addScannedMedicinesToCart(analysisResult.medicines);
    window.dispatchEvent(
      new CustomEvent('healthgrid:toast', {
        detail: {
          message: lang === 'en'
            ? `Added ${count} generic medicines to cart! (Saving ₹${analysisResult.totalSavings})`
            : `${count} மலிவு ஜெனரிக் மருந்துகள் கூடையில் சேர்க்கப்பட்டன! (₹${analysisResult.totalSavings} சேமிப்பு)`,
        },
      })
    );

    onClose();
    if (onNavigateMedicines) {
      onNavigateMedicines();
    } else {
      window.history.pushState({}, '', '/medicines');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleCreateChronicRefillFromRx = () => {
    if (!analysisResult || !analysisResult.medicines || analysisResult.medicines.length === 0) return;

    const currentUser = authService.getCurrentUser();
    const schedule = medicineStoreService.createRefillSchedule({
      userId: currentUser?.id || 'patient-user',
      medicalId: currentUser?.healthId || 'HG-600040-7821',
      patientName: currentUser?.name || 'Verified Patient',
      patientPhone: currentUser?.phone || '+91 98401 23456',
      prescriptionId: 'RX-SCANNED',
      prescriptionDate: analysisResult.date,
      doctorName: analysisResult.doctorName,
      items: analysisResult.medicines.map((m) => ({
        brandName: m.brandName,
        genericName: m.genericName,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration,
        brandPrice: m.brandPrice,
        genericPrice: m.genericPrice,
      })),
    });

    window.dispatchEvent(
      new CustomEvent('healthgrid:toast', {
        detail: {
          message: lang === 'en'
            ? `Activated 30-Day PMBJP Chronic Refill Schedule (#${schedule.id}) with Day-25 adherence alerts!`
            : `தொடர் மறுவரவு திட்டம் (#${schedule.id}) தொடங்கப்பட்டது!`,
        },
      })
    );

    onClose();
    if (onNavigateMedicines) {
      onNavigateMedicines();
    } else {
      window.history.pushState({}, '', '/medicines');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Start device camera
  const startCamera = async (facingMode: 'environment' | 'user' = 'environment') => {
    try {
      setCameraError(null);
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this device.');
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

  // Toggle front/rear camera
  const handleSwitchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Sync audio language when modal language switches
  useEffect(() => {
    setAudioLang(lang === 'ta' ? 'ta' : 'en');
  }, [lang]);

  // Load patient's known allergies & recent uploads from Supabase
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

      // Fetch dynamic past scans
      prescriptionAiService.fetchRecentPrescriptions().then((items) => {
        setRecentUploads(items);
      });
    }
  }, [isOpen]);

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && isCameraActive && !analysisResult && !isAnalyzing) {
      startCamera(cameraFacingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      speechEngine.stopSpeaking();
    };
  }, [isOpen, isCameraActive, cameraFacingMode, analysisResult, isAnalyzing]);

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
    setIsCameraActive(false);
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

  // Reset scan and re-arm
  const handleResetScan = () => {
    speechEngine.stopSpeaking();
    setIsPlayingAudio(false);
    setCapturedPages([]);
    setShowMultiPageToast(false);
    setAnalysisResult(null);
    setErrorMsg(null);
    setIsSavedToProfile(false);
    setSaveFeedback(null);
    setIsCameraActive(false);
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
        0.88,
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
      // Refresh dynamic recent uploads
      prescriptionAiService.fetchRecentPrescriptions().then(setRecentUploads);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-5xl bg-white rounded-none sm:rounded-[28px] shadow-2xl border-none sm:border border-slate-200/90 flex flex-col overflow-hidden">
        
        {/* Hidden Canvas for High-Resolution Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* TOP MODAL HEADER (Matches Reference Exactly) */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5F3] flex items-center justify-center text-[#147D6F] shadow-2xs">
              <Camera className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                {lang === 'en' ? 'Prescription Scanner & Medicine Saver' : 'மருந்துச் சீட்டு ஸ்கேனர் & மலிவு மருந்து சேமிப்பு'}
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {lang === 'en'
                  ? "Upload or capture your prescription. We'll extract the medicines and save them to your profile."
                  : 'உங்கள் மருந்துச் சீட்டைப் பதிவேற்றவும் அல்லது படம் எடுக்கவும். மருந்துகளை பிரித்தெடுத்து உங்கள் சுயவிவரத்தில் சேமிப்போம்.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && (
              <button
                type="button"
                onClick={handleResetScan}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
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
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">

          {/* ERROR ALERT BANNER */}
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

          {/* ANALYZING STATE WITH NEURAL PROGRESS ANIMATION */}
          {isAnalyzing && (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center space-y-4 animate-in fade-in duration-200">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-[#E8F5F3] flex items-center justify-center text-[#147D6F] animate-pulse">
                  <FileText className="w-10 h-10" />
                </div>
                <div className="absolute -inset-1 rounded-3xl border-2 border-teal-500 animate-ping opacity-25"></div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {lang === 'en' ? 'Analyzing Clinical Prescription' : 'மருத்துவ பரிசீலனை நடைபெறுகிறது'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {analysisStep}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-[#147D6F] rounded-full animate-indeterminate"></div>
              </div>
            </div>
          )}

          {/* PRE-SCAN 2-COLUMN VIEW (Matches Reference Layout Pixel-for-Pixel) */}
          {!analysisResult && !isAnalyzing && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: TABS + DASHED DROPZONE + OR + LIVE CAMERA CARD */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Pill Tabs: [Upload or Scan] / [From Gallery] */}
                <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 w-full max-w-[340px] text-xs font-semibold border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('upload');
                    }}
                    className={`flex-1 py-1.5 px-3.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'upload'
                        ? 'bg-white text-[#0F766E] border border-slate-200/80 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>{lang === 'en' ? 'Upload or Scan' : 'பதிவேற்று அல்லது ஸ்கேன்'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('gallery');
                      galleryInputRef.current?.click();
                    }}
                    className={`flex-1 py-1.5 px-3.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'gallery'
                        ? 'bg-white text-[#0F766E] border border-slate-200/80 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'en' ? 'From Gallery' : 'கேலரியிலிருந்து'}</span>
                  </button>
                </div>

                {/* Camera Error Banner */}
                {cameraError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div className="flex-1">{cameraError}</div>
                    <button
                      type="button"
                      onClick={() => setCameraError(null)}
                      className="font-bold text-amber-800 hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* IN-PLACE LIVE CAMERA VIEWFINDER (When Camera is Active) */}
                {isCameraActive && (
                  <div className="relative rounded-[24px] overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] border-2 border-slate-300 shadow-inner flex items-center justify-center group animate-in fade-in duration-200">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Framing Guidelines */}
                    <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-teal-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-t-4 border-l-4 border-teal-400 rounded-tl-sm"></div>
                        <div className="w-4 h-4 border-t-4 border-r-4 border-teal-400 rounded-tr-sm"></div>
                      </div>
                      <div className="text-center bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-3 rounded-full mx-auto shadow-md">
                        {lang === 'en' ? 'Position prescription slip inside frame' : 'மருத்துவர் சீட்டை கட்டத்திற்குள் வைக்கவும்'}
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-b-4 border-l-4 border-teal-400 rounded-bl-sm"></div>
                        <div className="w-4 h-4 border-b-4 border-r-4 border-teal-400 rounded-br-sm"></div>
                      </div>
                    </div>

                    {/* Close Camera Overlay Button */}
                    <button
                      type="button"
                      onClick={() => setIsCameraActive(false)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer"
                      title="Back to Upload"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Camera Control Bar */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 px-4">
                      {/* Switch Camera */}
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
                        className="w-16 h-16 rounded-full bg-white border-4 border-[#147D6F] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title={lang === 'en' ? 'Capture Photo' : 'படம் எடு'}
                      >
                        <div className="w-11 h-11 rounded-full bg-[#147D6F] flex items-center justify-center text-white">
                          <Camera className="w-5 h-5" />
                        </div>
                      </button>

                      {/* Quick Upload from Files */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
                        title={lang === 'en' ? 'Upload File' : 'கோப்பு ஏற்று'}
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* DASHED UPLOAD DROPZONE (Matches Reference Graphic & Style Exactly) */}
                {!isCameraActive && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#CCFBF1] hover:border-[#14B8A6] rounded-[24px] bg-[#F0FDFA]/30 hover:bg-[#F0FDFA]/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all cursor-pointer group shadow-2xs"
                  >
                    {/* Reference Document Icon with Lines and Plus Badge */}
                    <div className="w-20 h-24 rounded-2xl bg-[#CCFBF1]/70 border border-[#99F6E4]/70 relative flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform shadow-2xs">
                      <div className="w-10 h-1.5 bg-[#0D9488]/80 rounded-full"></div>
                      <div className="w-7 h-1.5 bg-[#0D9488]/50 rounded-full"></div>
                      <div className="w-8 h-1.5 bg-[#0D9488]/50 rounded-full"></div>
                      
                      <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    <h4 className="font-bold text-[#1F2937] text-sm sm:text-base mt-4">
                      {lang === 'en' ? 'Drag and drop your prescription here' : 'மருந்துச் சீட்டை இங்கே இழுத்து இடவும்'}
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {lang === 'en' ? 'or click to upload' : 'அல்லது பதிவேற்ற கிளிக் செய்யவும்'}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-4 px-5 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] text-[#374151] font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{lang === 'en' ? 'Choose File' : 'கோப்பைத் தேர்ந்தெடு'}</span>
                    </button>

                    <p className="text-[11px] text-[#9CA3AF] mt-4 font-normal">
                      {lang === 'en'
                        ? 'Supports JPG, PNG, PDF, WebP (Max 10 MB)'
                        : 'JPG, PNG, PDF, WebP வடிவங்கள் (அதிகபட்சம் 10 MB)'}
                    </p>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* CAPTURED PAGES THUMBNAIL STRIP */}
                {capturedPages.length > 0 && (
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>{capturedPages.length} {capturedPages.length === 1 ? 'Page' : 'Pages'} Captured</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {lang === 'en' ? 'Ready to analyze' : 'பரிசீலிக்க தயார்'}
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

                {/* MULTI-PAGE TOAST OVERLAY */}
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
                          setIsCameraActive(true);
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

                {/* "OR" DIVIDER (Matches Reference Layout) */}
                <div className="flex items-center my-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest before:flex-1 before:border-t before:border-[#E5E7EB] after:flex-1 after:border-t after:border-[#E5E7EB] gap-3">
                  OR
                </div>

                {/* "USE LIVE CAMERA" CARD (Matches Reference Layout) */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#E2E8F0]/70 flex items-center justify-center text-[#475569] flex-shrink-0">
                      <Camera className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1E293B] text-xs sm:text-sm">
                        {lang === 'en' ? 'Use Live Camera' : 'நேரலை கேமராவைப் பயன்படுத்துங்கள்'}
                      </h5>
                      <p className="text-[11px] text-[#64748B]">
                        {lang === 'en' ? 'Capture a clear photo of your prescription' : 'மருந்துச் சீட்டை தெளிவான படமாக எடுங்கள்'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraActive(true);
                      startCamera(cameraFacingMode);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Open Camera' : 'கேமராவைத் திற'}</span>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: HOW IT WORKS + TIPS + RECENT UPLOADS (Matches Reference Layout) */}
              <div className="lg:col-span-5 space-y-4">

                {/* Card 1: How it works? */}
                <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284C7]" />
                    <h5 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">
                      {lang === 'en' ? 'How it works?' : 'இது எவ்வாறு செயல்படுகிறது?'}
                    </h5>
                  </div>

                  <div className="space-y-1">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#CCFBF1] text-[#0F766E] font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p className="text-xs text-[#334155] font-medium leading-relaxed">
                        {lang === 'en'
                          ? 'Upload or capture a clear photo of your prescription.'
                          : 'மருந்துச் சீட்டின் தெளிவான புகைப்படத்தை பதிவேற்றவும் அல்லது படம் எடுக்கவும்.'}
                      </p>
                    </div>

                    <div className="w-0.5 h-3 border-l-2 border-dashed border-[#99F6E4] ml-3 my-0.5"></div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#CCFBF1] text-[#0F766E] font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p className="text-xs text-[#334155] font-medium leading-relaxed">
                        {lang === 'en'
                          ? 'Our AI extracts the medicines and key details (e.g., dosage, frequency).'
                          : 'மருந்துகள், அளவு மற்றும் உட்கொள்ளும் நேரங்களை AI கண்டறியும்.'}
                      </p>
                    </div>

                    <div className="w-0.5 h-3 border-l-2 border-dashed border-[#99F6E4] ml-3 my-0.5"></div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#CCFBF1] text-[#0F766E] font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p className="text-xs text-[#334155] font-medium leading-relaxed">
                        {lang === 'en'
                          ? 'Review and save to your health profile.'
                          : 'பரிசீலித்து உங்கள் மருத்துவ சுயவிவரத்தில் சேமிக்கவும்.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Tips for better results */}
                <div className="bg-[#ECFDF5]/80 border border-[#D1FAE5] rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#0D9488]" />
                    <h5 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">
                      {lang === 'en' ? 'Tips for better results' : 'சிறந்த முடிவுகளுக்கான குறிப்புகள்'}
                    </h5>
                  </div>

                  <ul className="space-y-2 text-xs text-[#334155] font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                      <span>{lang === 'en' ? 'Ensure the prescription is well-lit and in focus' : 'மருந்துச் சீட்டு நல்ல வெளிச்சத்தில் தெளிவாக இருப்பதை உறுதிசெய்க'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                      <span>{lang === 'en' ? "Capture the full page (including doctor's details)" : 'மருத்துவர் விவரங்களுடன் முழுப் பக்கத்தையும் படம் எடுக்கவும்'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                      <span>{lang === 'en' ? 'Avoid shadows and glare' : 'நிழல்கள் மற்றும் பிரதிபலிப்பைத் தவிர்க்கவும்'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                      <span>{lang === 'en' ? 'Supports printed or handwritten prescriptions' : 'அச்சிடப்பட்ட அல்லது கையால் எழுதப்பட்ட சீட்டுகளை ஆதரிக்கும்'}</span>
                    </li>
                  </ul>
                </div>

                {/* Card 3: Recent Uploads (Dynamic from User's Supabase UUID) */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0D9488]" />
                      <h5 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">
                        {lang === 'en' ? 'Recent Uploads' : 'சமீபத்திய பதிவேற்றங்கள்'}
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.hash = '#health-records';
                      }}
                      className="text-xs font-bold text-[#0D9488] hover:text-[#0F766E] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'View All' : 'அனைத்தும்'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* List of Dynamic Items */}
                  {recentUploads.length > 0 ? (
                    <div className="space-y-2">
                      {recentUploads.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setAnalysisResult(item.result);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/70 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-teal-700">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h6 className="font-bold text-slate-900 text-xs">
                                Prescription - {item.date}
                              </h6>
                              <p className="text-[11px] text-slate-500">
                                {item.medicineCount} {item.medicineCount === 1 ? 'medicine' : 'medicines'} detected
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 text-[#059669]" />
                            <span>Saved</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-500">
                        {lang === 'en'
                          ? 'No past scans yet. Scan your first prescription slip to see it here!'
                          : 'கடந்த கால ஸ்கேன்கள் எதுவும் இல்லை. உங்கள் முதல் மருந்துச் சீட்டை இங்கே ஸ்கேன் செய்யுங்கள்!'}
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* RESULTS STATE (Unified 2-Column Split: Clinical Findings + Smart Timetable & Radar) */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
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

              {/* 2-Column Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Clinical Header + Audio Doctor + Savings + Deciphered Medicines */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Doctor & Clinic Slip Header */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">
                            {analysisResult.clinicOrHospital}
                          </span>
                          {(analysisResult.doctorLicenseNo || analysisResult.doctorPtrNo) && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {[analysisResult.doctorLicenseNo, analysisResult.doctorPtrNo].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </div>
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

                    {/* Patient Demographics Banner */}
                    {analysisResult.patientName && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          Patient: {analysisResult.patientName}
                        </span>
                        {(analysisResult.patientAge || analysisResult.patientGender) && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                            {[analysisResult.patientAge ? `${analysisResult.patientAge} Y` : '', analysisResult.patientGender].filter(Boolean).join(' / ')}
                          </span>
                        )}
                        {analysisResult.patientAddress && (
                          <span className="text-slate-500 text-[11px] truncate max-w-[260px]" title={analysisResult.patientAddress}>
                            📍 {analysisResult.patientAddress}
                          </span>
                        )}
                        <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          HTA Verified ✓
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clinical Synergy & Pharmacological Insight Banner */}
                  {analysisResult.clinicalSynergyInsight && (
                    <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>{lang === 'en' ? 'Clinical Synergy & Bioavailability Insight' : 'மருத்துவ கூட்டு நற்பயன் விளக்கம்'}</span>
                      </div>
                      <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                        {lang === 'ta' && analysisResult.clinicalSynergyInsightTa
                          ? analysisResult.clinicalSynergyInsightTa
                          : analysisResult.clinicalSynergyInsight}
                      </p>
                    </div>
                  )}

                  {/* Bedside Audio Doctor Card */}
                  <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-teal-200 shadow-xs">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-teal-100">
                            {lang === 'en' ? "Bedside Doctor's Audio Advice" : 'மருத்துவரின் குரல் வழிகாட்டல்'}
                          </h5>
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

                    <p className="text-xs text-teal-50/95 leading-relaxed bg-white/10 p-3 rounded-xl border border-white/10 italic">
                      "{audioLang === 'ta' ? analysisResult.humanDoctorExplanationTa : analysisResult.humanDoctorExplanationEn}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleToggleAudio}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer ${
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

                      {isPlayingAudio && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-5 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                          <div className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Jan Aushadhi Generic Savings Banner */}
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#065F46]">
                          {lang === 'en' ? 'PMBJP Jan Aushadhi Savings' : 'ஜன் அவுஷதி மலிவு மருந்து சேமிப்பு'}
                        </div>
                        <div className="text-sm sm:text-base font-black text-emerald-950">
                          {lang === 'en'
                            ? `You save ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}% off) with generics!`
                            : `ஜெனரிக் மருந்துகளில் ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}%) சேமிப்பு!`}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 line-through">Brand: ₹{analysisResult.totalBrandCost}</div>
                        <div className="text-base font-black text-[#059669]">₹{analysisResult.totalGenericCost} only</div>
                      </div>

                      {/* Breakthrough Action: Directly Auto-fill Generic Cart */}
                      <button
                        type="button"
                        onClick={handleAddAllToGenericCart}
                        className="py-2 px-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Add All to Generic Cart' : 'கூடையில் சேர்க்க'}</span>
                      </button>

                      {/* Breakthrough Action: Auto-Schedule 30-Day Chronic Refill */}
                      <button
                        type="button"
                        onClick={handleCreateChronicRefillFromRx}
                        className="py-2 px-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Set up automated 30-day refills with Day-25 WhatsApp and Calendar alerts"
                      >
                        <Clock className="w-3.5 h-3.5 text-teal-300" />
                        <span>{lang === 'en' ? 'Start 30-Day Auto-Refill' : 'தொடர் மறுவரவு'}</span>
                      </button>

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
                        className="py-2 px-2.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title={lang === 'en' ? 'Find Nearest Jan Aushadhi Kendra' : 'மருந்தகம் காண்க'}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Kendra Map' : 'வரைபடம்'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Deciphered Medications List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {lang === 'en' ? 'Deciphered Medicines & Generic Equivalents' : 'பரிந்துரைக்கப்பட்ட மருந்துகள் & ஜெனரிக் மாற்று'}
                      </h5>
                      <span className="text-[11px] text-[#0F766E] font-semibold">
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
                            <div className="flex flex-wrap items-center gap-2">
                              <h6 className="font-extrabold text-slate-900 text-sm">
                                {med.brandName}
                              </h6>
                              {med.dosage && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                  {med.dosage}
                                </span>
                              )}
                              {med.quantity && (
                                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 px-2 py-0.5 rounded-md">
                                  Qty: {med.quantity}
                                </span>
                              )}
                              {med.chemicalNotation && (
                                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-1.5 py-0.5 rounded-md">
                                  {med.chemicalNotation}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#0F766E] font-semibold mt-0.5 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488] flex-shrink-0" />
                              <span>{med.genericName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:text-right">
                            <span className="text-xs text-slate-400 line-through">₹{med.brandPrice}</span>
                            <span className="text-sm font-black text-emerald-700">₹{med.genericPrice}</span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                              {med.savingsPct}% off
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                medicineStoreService.addScannedMedicinesToCart([med]);
                                window.dispatchEvent(
                                  new CustomEvent('healthgrid:toast', {
                                    detail: {
                                      message: lang === 'en'
                                        ? `Added ${med.genericName} to Generic Cart!`
                                        : `${med.genericName} கூடையில் சேர்க்கப்பட்டது!`,
                                    },
                                  })
                                );
                              }}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-emerald-200/60"
                              title="Add to generic cart"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Frequency, Timing, Duration badges */}
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

                  {/* Actions Footer */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveToProfile}
                      disabled={isSaving || isSavedToProfile}
                      className={`flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                        isSavedToProfile
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                      }`}
                    >
                      {isSavedToProfile ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>{lang === 'en' ? 'Saved to Your Health Profile' : 'சுயவிவரத்தில் சேர்க்கப்பட்டது'}</span>
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
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>{lang === 'en' ? 'Scan Another Slip' : 'மற்றொரு சீட்டு ஸ்கேன்'}</span>
                    </button>
                  </div>

                </div>

                {/* RIGHT COLUMN: SMART DOSAGE TIMETABLE + SAFETY RADAR + REFILL TRACKER */}
                <div className="lg:col-span-5 space-y-4">

                  {/* Smart Daily Dosage Routine & Exporter */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#0F766E]" />
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {lang === 'en' ? 'Daily Medication Routine' : 'தினசரி மருந்து அட்டவணை'}
                        </h5>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleExportWhatsApp}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs cursor-pointer"
                          title="Share schedule to WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={handleAddCalendarReminder}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                          title="Add to Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      </div>
                    </div>

                    {/* Morning */}
                    <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/70 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        <span>{lang === 'en' ? 'Morning (Breakfast)' : 'காலை (உணவுக்குப் பின்)'}</span>
                      </div>
                      {analysisResult.dosageSchedule.morning.length > 0 ? (
                        <ul className="text-xs text-slate-800 space-y-1">
                          {analysisResult.dosageSchedule.morning.map((m, idx) => (
                            <li key={idx} className="bg-white/80 p-2 rounded-lg border border-amber-200/50 font-medium">
                              {m}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No morning doses</p>
                      )}
                    </div>

                    {/* Afternoon */}
                    <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/70 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                        <Sunset className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lang === 'en' ? 'Afternoon (Lunch)' : 'மதியம் (உணவுக்குப் பின்)'}</span>
                      </div>
                      {analysisResult.dosageSchedule.afternoon.length > 0 ? (
                        <ul className="text-xs text-slate-800 space-y-1">
                          {analysisResult.dosageSchedule.afternoon.map((m, idx) => (
                            <li key={idx} className="bg-white/80 p-2 rounded-lg border border-blue-200/50 font-medium">
                              {m}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No afternoon doses</p>
                      )}
                    </div>

                    {/* Night */}
                    <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-200/70 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{lang === 'en' ? 'Night (Dinner)' : 'இரவு (உணவுக்குப் பின்)'}</span>
                      </div>
                      {analysisResult.dosageSchedule.night.length > 0 ? (
                        <ul className="text-xs text-slate-800 space-y-1">
                          {analysisResult.dosageSchedule.night.map((m, idx) => (
                            <li key={idx} className="bg-white/80 p-2 rounded-lg border border-indigo-200/50 font-medium">
                              {m}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No night doses</p>
                      )}
                    </div>
                  </div>

                  {/* Drug Safety & Food Precaution Radar */}
                  {analysisResult.safetyRadar && (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-slate-900">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>{lang === 'en' ? 'Safety & Food Interaction Radar' : 'உணவு & மருந்து பாதுகாப்பு எச்சரிக்கை'}</span>
                      </div>

                      <div className="space-y-2">
                        {analysisResult.safetyRadar.foodInteractions.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-0.5">
                            <span className="font-bold text-amber-950">{item.medicine}:</span>
                            <p className="text-slate-700">
                              {lang === 'ta' ? item.cautionTa : item.cautionEn}
                            </p>
                          </div>
                        ))}

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-0.5">
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

                  {/* Course Duration & Refill Countdown */}
                  {analysisResult.refillCountdown && (
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-teal-950 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-black text-sm">
                          {analysisResult.refillCountdown.courseDurationDays}d
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {lang === 'en' ? `${analysisResult.refillCountdown.courseDurationDays}-Day Treatment Course` : `${analysisResult.refillCountdown.courseDurationDays} நாட்கள் சிகிச்சை`}
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            {analysisResult.refillCountdown.dailyPillsCount} {lang === 'en' ? 'pills/day' : 'மாத்திரைகள்/நாள்'} · {analysisResult.refillCountdown.refillDateText}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px]">
                        {lang === 'en' ? 'Active' : 'நடப்பு'}
                      </span>
                    </div>
                  )}

                  {/* Allergy Warnings */}
                  {analysisResult.allergyWarnings && analysisResult.allergyWarnings.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{lang === 'en' ? 'Profile Allergy Conflict' : 'ஒவ்வாமை எச்சரிக்கை'}</span>
                      </div>
                      {analysisResult.allergyWarnings.map((aw, idx) => (
                        <div key={idx} className="text-xs bg-white/80 p-2 rounded-lg border border-rose-200">
                          <span className="font-bold text-rose-900">{aw.medicine}</span> matches <span className="font-bold text-rose-700">{aw.allergen}</span>.
                          <p className="text-[11px] text-slate-600">
                            {lang === 'ta' ? aw.warningTa : aw.warningEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
