import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  ShieldCheck,
  FileText,
  ShoppingBag,
  MapPin,
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
  Moon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ImageIcon,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Edit3,
  Bookmark,
  Utensils
} from 'lucide-react';
import type { Language } from '../types';
import { prescriptionAiService, type PrescriptionAnalysisResult, type ScannedMedicine } from '../services/prescriptionAiService';
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

  // Redesigned Post-Scan UI State (Matches Reference Visual)
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [isEditAllOpen, setIsEditAllOpen] = useState<boolean>(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [tempMedicines, setTempMedicines] = useState<ScannedMedicine[]>([]);

  useEffect(() => {
    if (isEditAllOpen && analysisResult) {
      setTempMedicines(JSON.parse(JSON.stringify(analysisResult.medicines)));
    }
  }, [isEditAllOpen, analysisResult]);

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
      console.error('Prescription processing caught:', err);
      setIsAnalyzing(false);
      let friendlyMsg = lang === 'en'
        ? 'Could not decipher prescription clearly. Please retake photo with better lighting or focus.'
        : 'மருந்துச் சீட்டைப் படிக்க முடியவில்லை. தெளிவான வெளிச்சத்தில் மீண்டும் படம் எடுக்கவும்.';

      // Only display message if it is human-readable (not a raw JSON dump or API 404/500 code)
      if (err?.message && !err.message.includes('{') && !err.message.includes('404') && !err.message.includes('status') && !err.message.includes('API') && !err.message.includes('models/')) {
        friendlyMsg = err.message;
      }
      setErrorMsg(friendlyMsg);
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
    setActivePageIndex(0);
    setZoomLevel(1);
    setRotation(0);
    setIsLightboxOpen(false);
    setExpandedCardIndex(null);
    setIsEditAllOpen(false);
    setEditingCardIndex(null);
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
          ? 'Prescription securely saved to your health profile!'
          : 'மருத்துவ விவரங்கள் உங்கள் பாதுகாப்பான சுயவிவரத்தில் சேர்க்கப்பட்டன!'
      );
      window.dispatchEvent(
        new CustomEvent('healthgrid:toast', {
          detail: {
            message: lang === 'en'
              ? 'Prescription saved to your Health Profile!'
              : 'மருந்துச் சீட்டு உங்கள் மருத்துவ சுயவிவரத்தில் பாதுகாப்பாகச் சேமிக்கப்பட்டது!',
          },
        })
      );
      // Refresh dynamic recent uploads
      prescriptionAiService.fetchRecentPrescriptions().then(setRecentUploads);
    } else {
      setSaveFeedback(res.error || (lang === 'en' ? 'Unable to save. Please sign in.' : 'சேமிக்க முடியவில்லை. உள்நுழையவும்.'));
    }
  };

  // Update single medicine inline
  const handleUpdateMedicine = (index: number, updatedFields: Partial<ScannedMedicine>) => {
    if (!analysisResult) return;
    const updatedMeds = [...analysisResult.medicines];
    updatedMeds[index] = { ...updatedMeds[index], ...updatedFields };

    const totalBrandCost = updatedMeds.reduce((acc, m) => acc + (m.brandPrice || 0), 0);
    const totalGenericCost = updatedMeds.reduce((acc, m) => acc + (m.genericPrice || 0), 0);
    const totalSavings = Math.max(0, totalBrandCost - totalGenericCost);
    const savingsPercentage = totalBrandCost > 0 ? Math.round((totalSavings / totalBrandCost) * 100) : 0;

    setAnalysisResult({
      ...analysisResult,
      medicines: updatedMeds,
      totalBrandCost,
      totalGenericCost,
      totalSavings,
      savingsPercentage,
    });
    setEditingCardIndex(null);
  };

  // Batch update all medicines from Edit All modal
  const handleSaveAllEditedMedicines = (newMeds: ScannedMedicine[]) => {
    if (!analysisResult) return;
    const totalBrandCost = newMeds.reduce((acc, m) => acc + (m.brandPrice || 0), 0);
    const totalGenericCost = newMeds.reduce((acc, m) => acc + (m.genericPrice || 0), 0);
    const totalSavings = Math.max(0, totalBrandCost - totalGenericCost);
    const savingsPercentage = totalBrandCost > 0 ? Math.round((totalSavings / totalBrandCost) * 100) : 0;

    setAnalysisResult({
      ...analysisResult,
      medicines: newMeds,
      totalBrandCost,
      totalGenericCost,
      totalSavings,
      savingsPercentage,
    });
    setIsEditAllOpen(false);

    window.dispatchEvent(
      new CustomEvent('healthgrid:toast', {
        detail: {
          message: lang === 'en'
            ? 'Prescription medicines updated successfully!'
            : 'மருந்துகள் விவரங்கள் புதுப்பிக்கப்பட்டன!',
        },
      })
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full h-full sm:h-auto sm:max-h-[94vh] ${analysisResult && !isAnalyzing ? 'sm:max-w-6xl lg:max-w-7xl' : 'sm:max-w-5xl'} bg-[#F8FAFC] rounded-none sm:rounded-[28px] shadow-2xl border-none sm:border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300`}>
        
        {/* Hidden Canvas for High-Resolution Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* TOP MODAL HEADER (Dynamic: Upload mode vs Post-Scan Redesigned Header) */}
        {analysisResult && !isAnalyzing ? (
          <div className="px-5 sm:px-8 py-4 sm:py-5 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetScan}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                aria-label="Back"
                title={lang === 'en' ? 'Back to upload' : 'பின்செல்'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-xl leading-tight">
                    {lang === 'en' ? 'Prescription Scanned' : 'மருந்துச் சீட்டு ஸ்கேன் செய்யப்பட்டது'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#E8F8F4] text-[#0F766E] border border-teal-200/70">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>{lang === 'en' ? 'Completed' : 'முடிந்தது'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {lang === 'en'
                    ? `We found ${analysisResult.medicines.length} medicines. Please check the details before saving.`
                    : `${analysisResult.medicines.length} மருந்துகள் கண்டறியப்பட்டன. சேமிக்கும் முன் விவரங்களைச் சரிபார்க்கவும்.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <button
                type="button"
                onClick={handleResetScan}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>{lang === 'en' ? 'Scan Another' : 'புதிய ஸ்கேன்'}</span>
              </button>

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
        ) : (
          <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 flex-shrink-0">
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
        )}

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

          {/* RESULTS STATE (Pixel-Perfect Match with Reference Visual: After prescription scanned ref.png) */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
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

              {/* MAIN 2-COLUMN BALANCED GRID (Matches Reference) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: SCANNED PRESCRIPTION CARD */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Card Header: Icon + Title + Page Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F8F4] text-[#0F766E] flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <FileText className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {lang === 'en' ? 'Scanned Prescription' : 'ஸ்கேன் செய்யப்பட்ட மருந்துச் சீட்டு'}
                      </h4>
                    </div>

                    {/* Page Indicator (with pagination if multiple pages) */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600">
                      {capturedPages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                          disabled={activePageIndex === 0}
                          className="hover:text-slate-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span>
                        {lang === 'en'
                          ? `Page ${activePageIndex + 1} of ${capturedPages.length || 1}`
                          : `பக்கம் ${activePageIndex + 1} / ${capturedPages.length || 1}`}
                      </span>
                      {capturedPages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setActivePageIndex((prev) => Math.min((capturedPages.length || 1) - 1, prev + 1))}
                          disabled={activePageIndex === (capturedPages.length || 1) - 1}
                          className="hover:text-slate-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="Next Page"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prescription Preview Viewport */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[1/1] max-h-[480px] bg-slate-100/70 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center p-3 select-none group">
                    {capturedPages.length > 0 ? (
                      <img
                        src={capturedPages[activePageIndex]}
                        alt="Scanned Prescription"
                        className="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-200"
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        }}
                      />
                    ) : (
                      /* High-fidelity Prescription Slip Mockup (Matches Reference Photo Exactly) */
                      <div
                        className="w-full h-full bg-[#FAF7F0] border border-[#E4DEC9] rounded-xl p-4 sm:p-6 flex flex-col justify-between text-slate-800 shadow-inner overflow-hidden font-sans transition-transform duration-200"
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        }}
                      >
                        {/* Clinic & Doctor Letterhead */}
                        <div className="flex items-start justify-between border-b border-[#E4DEC9] pb-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-[#FAF7F0] flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
                              ⚕
                            </div>
                            <div>
                              <div className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                                {analysisResult.doctorName || 'Dr. R. Kumar, MBBS, MD'}
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-slate-600">
                                General Physician
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                            <div className="font-bold text-slate-900">Apollo Clinic</div>
                            <div>Anna Nagar, Chennai - 600040</div>
                            <div>Ph: 044-2820 1234</div>
                          </div>
                        </div>

                        {/* Patient Demographics */}
                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-[#E4DEC9] text-[11px] sm:text-xs">
                          <div>
                            <span className="text-slate-500">Name: </span>
                            <span className="font-semibold text-blue-900 italic font-serif">
                              {analysisResult.patientName || 'S. Ravi'}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-slate-500">Age: </span>
                            <span className="font-semibold text-blue-900 italic font-serif">
                              {analysisResult.patientAge || '45'} / {analysisResult.patientGender || 'M'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-blue-900 italic font-serif">
                              {analysisResult.date || '12/08/2024'}
                            </span>
                          </div>
                        </div>

                        {/* Rx Symbol & Medication Entries in Doctor Script Style */}
                        <div className="flex-1 py-3 space-y-2 text-xs sm:text-[13px] font-serif text-blue-950">
                          <div className="text-base sm:text-lg font-black text-slate-900 font-sans">
                            ℞
                          </div>
                          {analysisResult.medicines.slice(0, 4).map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 italic leading-tight">
                              <div>
                                <span className="font-bold mr-1">{idx + 1}.</span>
                                <span>{med.form || 'Tab.'} {med.brandName || med.genericName} {med.dosage}</span>
                                <span className="ml-2 text-slate-600 font-sans text-[11px]">({med.frequency})</span>
                              </div>
                              <span className="text-[11px] text-slate-600 font-sans font-medium flex-shrink-0">
                                {med.duration || '30 days'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Doctor's Signature */}
                        <div className="text-right pt-2 border-t border-[#E4DEC9]">
                          <span className="font-serif italic text-blue-900 text-sm font-bold">
                            R. Kumar
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Viewer Toolbar: Zoom In, Zoom Out, Rotate, Full Screen */}
                  <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(Number((z + 0.25).toFixed(2)), 2.5))}
                      className="py-2 px-2 sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 active:scale-95"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'Zoom In' : 'பெரிதாக்கு'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.75))}
                      className="py-2 px-2 sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 active:scale-95"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'Zoom Out' : 'சிறிதாக்கு'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-2 px-2 sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 active:scale-95"
                      title="Rotate 90 Degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'Rotate' : 'சுழற்று'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="py-2 px-2 sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 active:scale-95"
                      title="Open Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'Full Screen' : 'முழுத்திரை'}</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: EXTRACTED MEDICINES CARD */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Card Header: Icon + Title + Edit All Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F8F4] text-[#0F766E] flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Pill className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                          {lang === 'en' ? 'Extracted Medicines' : 'கண்டறியப்பட்ட மருந்துகள்'}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                          {lang === 'en'
                            ? `We found ${analysisResult.medicines.length} medicines in this prescription.`
                            : `இந்த மருந்துச் சீட்டில் ${analysisResult.medicines.length} மருந்துகள் உள்ளன.`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditAllOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>{lang === 'en' ? 'Edit All' : 'அனைத்தையும் திருத்து'}</span>
                    </button>
                  </div>

                  {/* Medicines Cards List */}
                  <div className="space-y-3.5">
                    {analysisResult.medicines.map((med, idx) => {
                      const isExpanded = expandedCardIndex === idx;
                      const isEditing = editingCardIndex === idx;
                      const isNight = (med.frequency || '').toLowerCase().includes('night') || (med.frequency || '').toLowerCase().includes('dinner');

                      return (
                        <div
                          key={med.id || idx}
                          className={`border rounded-2xl p-4 sm:p-4.5 transition-all shadow-2xs bg-white space-y-3 ${
                            isExpanded ? 'border-[#0F766E] ring-1 ring-teal-500/20' : 'border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Top Row: Number Circle + Name + Verified Badge + Actions */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-lg bg-[#E8F8F4] text-[#0F766E] font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                                    {med.brandName || med.genericName}
                                  </h5>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50 flex-shrink-0" />
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {med.dosage || 'Standard'} • {med.form || 'Tablet'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingCardIndex(isEditing ? null : idx)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  isEditing
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{isEditing ? (lang === 'en' ? 'Close' : 'மூடு') : (lang === 'en' ? 'Edit' : 'திருத்து')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedCardIndex(isExpanded ? null : idx)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Expand details"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180 text-[#0F766E]' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* 4 Metadata Columns (Pill Grid Matching Reference Visual) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
                            {/* 1. Dose */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                                <Pill className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs leading-tight">
                                  {med.dosage?.toLowerCase().includes('tab') || med.dosage?.toLowerCase().includes('cap')
                                    ? med.dosage
                                    : `1 ${med.form ? med.form.toLowerCase() : 'tablet'}`}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  {lang === 'en' ? 'Dose' : 'அளவு'}
                                </div>
                              </div>
                            </div>

                            {/* 2. Frequency */}
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isNight ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs leading-tight truncate max-w-[100px]" title={med.frequency}>
                                  {med.frequency || '1-0-1'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  {lang === 'en' ? 'Frequency' : 'முறை'}
                                </div>
                              </div>
                            </div>

                            {/* 3. When to take */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                                <Utensils className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs leading-tight truncate max-w-[95px]" title={lang === 'ta' ? med.timingTa : med.timing}>
                                  {lang === 'ta' ? med.timingTa : med.timing || 'After food'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  {lang === 'en' ? 'When to take' : 'உட்கொள்ளும் நேரம்'}
                                </div>
                              </div>
                            </div>

                            {/* 4. Duration */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs leading-tight">
                                  {lang === 'ta' ? med.durationTa : med.duration || '30 days'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  {lang === 'en' ? 'Duration' : 'கால அளவு'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* INLINE EDIT FORM (When this card is being edited) */}
                          {isEditing && (
                            <div className="pt-3 border-t border-slate-200 space-y-3 bg-slate-50 p-3.5 rounded-xl animate-in fade-in duration-200">
                              <div className="font-bold text-xs text-slate-800">
                                {lang === 'en' ? 'Edit Medicine Details' : 'மருந்து விவரங்களைத் திருத்துக'}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">Name</label>
                                  <input
                                    type="text"
                                    defaultValue={med.brandName}
                                    id={`med-name-${idx}`}
                                    className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">Dosage</label>
                                  <input
                                    type="text"
                                    defaultValue={med.dosage}
                                    id={`med-dosage-${idx}`}
                                    className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">Frequency</label>
                                  <input
                                    type="text"
                                    defaultValue={med.frequency}
                                    id={`med-freq-${idx}`}
                                    className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500">When to take</label>
                                  <input
                                    type="text"
                                    defaultValue={med.timing}
                                    id={`med-timing-${idx}`}
                                    className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingCardIndex(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nameEl = document.getElementById(`med-name-${idx}`) as HTMLInputElement;
                                    const dosageEl = document.getElementById(`med-dosage-${idx}`) as HTMLInputElement;
                                    const freqEl = document.getElementById(`med-freq-${idx}`) as HTMLInputElement;
                                    const timingEl = document.getElementById(`med-timing-${idx}`) as HTMLInputElement;
                                    handleUpdateMedicine(idx, {
                                      brandName: nameEl?.value || med.brandName,
                                      dosage: dosageEl?.value || med.dosage,
                                      frequency: freqEl?.value || med.frequency,
                                      timing: timingEl?.value || med.timing,
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59]"
                                >
                                  Save Updates
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ACCORDION EXPANDED SECTION (Clinical Insights & PMBJP Generic Comparison) */}
                          {isExpanded && !isEditing && (
                            <div className="pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                              {/* PMBJP Generic Savings Card */}
                              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
                                <div>
                                  <div className="font-extrabold text-[#065F46] flex items-center gap-1.5">
                                    <ShoppingBag className="w-3.5 h-3.5 text-[#059669]" />
                                    <span>PMBJP Generic Equivalent: {med.genericName}</span>
                                  </div>
                                  <div className="text-[11px] text-emerald-800 mt-0.5">
                                    Brand MRP: <span className="line-through">₹{med.brandPrice}</span> · Jan Aushadhi:{' '}
                                    <span className="font-black text-emerald-900">₹{med.genericPrice}</span> ({med.savingsPct}% savings)
                                  </div>
                                </div>

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
                                  className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{lang === 'en' ? 'Add to Cart' : 'கூடையில் சேர்'}</span>
                                </button>
                              </div>

                              {/* Patient Context Note */}
                              {med.clinicalVerification?.patientContextNoteEn && (
                                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
                                  <Lightbulb className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold">Context Advisory: </span>
                                    <span>{lang === 'ta' && med.clinicalVerification.patientContextNoteTa ? med.clinicalVerification.patientContextNoteTa : med.clinicalVerification.patientContextNoteEn}</span>
                                  </div>
                                </div>
                              )}

                              {/* Precautions & Purpose */}
                              <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 px-1">
                                <span>
                                  <span className="font-semibold text-slate-700">Purpose: </span>
                                  {lang === 'ta' ? med.purposeTa : med.purposeEn}
                                </span>
                                {med.chemicalNotation && (
                                  <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Formula: {med.chemicalNotation}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION: DISCLAIMER (LEFT) + ACTION TRAY (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
                
                {/* LEFT BOTTOM: DISCLAIMER BANNER (Matches Reference Photo Exactly) */}
                <div className="lg:col-span-6 bg-[#E8F8F4] border border-teal-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 text-teal-950 shadow-2xs h-full">
                  <div className="w-9 h-9 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <ShieldCheck className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm text-teal-950 leading-tight">
                      {lang === 'en' ? 'Please verify the extracted information' : 'பிரித்தெடுக்கப்பட்ட விவரங்களைச் சரிபார்க்கவும்'}
                    </h5>
                    <p className="text-xs text-teal-900/80 leading-relaxed mt-1">
                      {lang === 'en'
                        ? "HealthGrid helps read your prescription but does not replace your doctor's instructions. If anything here differs from the original prescription, follow the original prescription and ask your doctor or pharmacist."
                        : 'ஹெல்த்கிரிட் உங்கள் மருந்துச் சீட்டைப் படிக்க உதவுகிறது, ஆனால் மருத்துவரின் நேரடி வழிகாட்டுதலுக்கு மாற்றாகாது. ஏதேனும் வேறுபாடு இருந்தால், அசல் மருந்துச் சீட்டைப் பின்பற்றி மருத்துவரிடம் ஆலோசிக்கவும்.'}
                    </p>
                  </div>
                </div>

                {/* RIGHT BOTTOM: "WHAT WOULD YOU LIKE TO DO NEXT?" ACTION TRAY */}
                <div className="lg:col-span-6 space-y-2 flex flex-col justify-between">
                  <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {lang === 'en' ? 'What would you like to do next?' : 'அடுத்து என்ன செய்ய விரும்புகிறீர்கள்?'}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    {/* Action 1: Save to Health Profile (Solid Teal Card) */}
                    <button
                      type="button"
                      onClick={handleSaveToProfile}
                      disabled={isSaving || isSavedToProfile}
                      className={`rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-xs transition-all cursor-pointer group active:scale-95 text-left border ${
                        isSavedToProfile
                          ? 'bg-emerald-700 text-white border-emerald-600'
                          : 'bg-[#0F766E] hover:bg-[#115E59] text-white border-teal-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                          {isSavedToProfile ? <Check className="w-4 h-4 text-emerald-200" /> : <Bookmark className="w-4 h-4 text-teal-100" />}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-[13px] leading-tight text-white">
                            {isSavedToProfile
                              ? (lang === 'en' ? 'Saved to Profile ✓' : 'சேமிக்கப்பட்டது ✓')
                              : (lang === 'en' ? 'Save to Health Profile' : 'சுயவிவரத்தில் சேமி')}
                          </div>
                          <div className="text-[10px] text-teal-100/80 leading-tight mt-0.5">
                            {lang === 'en' ? 'Keep this prescription safe' : 'பாதுகாப்பாக சேமிக்கவும்'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-teal-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>

                    {/* Action 2: Find Medicines (White Card with Pill Icon) */}
                    <button
                      type="button"
                      onClick={handleAddAllToGenericCart}
                      className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-900 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-2xs transition-all cursor-pointer group active:scale-95 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center flex-shrink-0">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-[13px] leading-tight text-slate-900">
                            {lang === 'en' ? 'Find Medicines' : 'மருந்துகள் காண்க'}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {lang === 'en' ? 'Check availability & lower cost' : 'மலிவு விலை ஜெனரிக் மாற்று'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>

                    {/* Action 3: Hear Instructions (White Card with Speaker Icon) */}
                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className={`border rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-2xs transition-all cursor-pointer group active:scale-95 text-left ${
                        isPlayingAudio
                          ? 'bg-rose-50 border-rose-200 text-rose-950 animate-pulse'
                          : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isPlayingAudio ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-[13px] leading-tight">
                            {isPlayingAudio
                              ? (lang === 'en' ? 'Pause Audio' : 'குரலை நிறுத்து')
                              : (lang === 'en' ? 'Hear Instructions' : 'குரல் வழிகாட்டல்')}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {lang === 'en' ? 'Listen to dosage details' : 'அளவு விவரங்களைக் கேளுங்கள்'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>
                  </div>

                  {/* SECONDARY QUICK CLINICAL TOOLS (WhatsApp, Calendar, 30d Refill, Kendra Map) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>{lang === 'en' ? 'Quick Tools:' : 'விரைவு கருவிகள்:'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* WhatsApp Export */}
                      <button
                        type="button"
                        onClick={handleExportWhatsApp}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Share timetable on WhatsApp' : 'வாட்ஸ்அப்பில் பகிரவும்'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'en' ? 'WhatsApp' : 'வாட்ஸ்அப்'}</span>
                      </button>

                      {/* Calendar Alarm */}
                      <button
                        type="button"
                        onClick={handleAddCalendarReminder}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Add reminder to Google Calendar' : 'கூகிள் காலெண்டரில் சேர்க்க'}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lang === 'en' ? 'Calendar' : 'காலெண்டர்'}</span>
                      </button>

                      {/* 30-Day PMBJP Chronic Refill */}
                      <button
                        type="button"
                        onClick={handleCreateChronicRefillFromRx}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Setup 30-day automatic Jan Aushadhi refill' : '30-நாள் மாதாந்திர ரீஃபில் அமைக்க'}
                      >
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>{lang === 'en' ? '30d Refill' : 'ரீஃபில்'}</span>
                      </button>

                      {/* Nearby Kendra Map */}
                      {onOpenDiseaseMap && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenDiseaseMap();
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={lang === 'en' ? 'Locate PMBJP Kendras on map' : 'கேந்திரா வரைபடம்'}
                        >
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          <span>{lang === 'en' ? 'Kendra Map' : 'வரைபடம்'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* EDIT ALL MEDICINES MODAL SHEET */}
          {isEditAllOpen && analysisResult && (
            <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#0F766E]" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {lang === 'en' ? 'Edit Extracted Medicines' : 'அனைத்து மருந்து விவரங்களையும் திருத்து'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditAllOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {tempMedicines.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="font-extrabold text-[#0F766E]">
                        Medicine #{idx + 1}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Brand Name</label>
                          <input
                            type="text"
                            value={m.brandName}
                            onChange={(e) => {
                              const updated = [...tempMedicines];
                              updated[idx].brandName = e.target.value;
                              setTempMedicines(updated);
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Dosage</label>
                          <input
                            type="text"
                            value={m.dosage}
                            onChange={(e) => {
                              const updated = [...tempMedicines];
                              updated[idx].dosage = e.target.value;
                              setTempMedicines(updated);
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Frequency</label>
                          <input
                            type="text"
                            value={m.frequency}
                            onChange={(e) => {
                              const updated = [...tempMedicines];
                              updated[idx].frequency = e.target.value;
                              setTempMedicines(updated);
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">When to take</label>
                          <input
                            type="text"
                            value={m.timing}
                            onChange={(e) => {
                              const updated = [...tempMedicines];
                              updated[idx].timing = e.target.value;
                              setTempMedicines(updated);
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsEditAllOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAllEditedMedicines(tempMedicines)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-xs cursor-pointer active:scale-95"
                  >
                    Save All Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LIGHTBOX FULLSCREEN PREVIEW MODAL */}
          {isLightboxOpen && (
            <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
                <div className="font-extrabold text-sm sm:text-base">
                  Prescription Inspection Lightbox
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(Number((z + 0.25).toFixed(2)), 3))}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                  >
                    + Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.5))}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                  >
                    - Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                  >
                    ↻ Rotate
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center overflow-auto p-4 select-none">
                {capturedPages.length > 0 ? (
                  <img
                    src={capturedPages[activePageIndex]}
                    alt="Prescription High-Res"
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    }}
                  />
                ) : (
                  <div className="text-white/60 text-sm">
                    No physical image uploaded. Displaying parsed clinical findings.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
