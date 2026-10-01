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
  Sparkles,
  SwitchCamera,
  Check,
  Plus,
  Pill,
  Calendar,
  Clock,
  Stethoscope
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
  // Navigation & Scan State
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'results'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Image & Analysis State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Doctor State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLang, setAudioLang] = useState<'en' | 'ta'>(lang === 'ta' ? 'ta' : 'en');

  // Supabase Patient Profile Allergies & Save State
  const [patientAllergies, setPatientAllergies] = useState<string[]>([]);
  const [isSavedToProfile, setIsSavedToProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync audio language when modal language changes
  useEffect(() => {
    setAudioLang(lang === 'ta' ? 'ta' : 'en');
  }, [lang]);

  // Load patient's known allergies from Supabase on mount
  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('patients')
            .select('allergies')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data?.allergies && Array.isArray(data.allergies)) {
                setPatientAllergies(data.allergies);
              }
            });
        }
      });
    }
  }, [isOpen]);

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage && !analysisResult) {
      startCamera(cameraFacingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      speechEngine.stopSpeaking();
    };
  }, [isOpen, activeTab, cameraFacingMode, capturedImage, analysisResult]);

  if (!isOpen) return null;

  // Start device camera
  const startCamera = async (facingMode: 'environment' | 'user' = 'environment') => {
    try {
      setCameraError(null);
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser.');
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
          videoRef.current?.play().catch(e => console.warn('Video play warning:', e));
        };
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access or use photo upload.'
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

  // Toggle front/back camera
  const handleSwitchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture still frame from live camera
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

    stopCamera();
    setCapturedImage(dataUrl);
    processPrescriptionImage(dataUrl);
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      stopCamera();
      setCapturedImage(dataUrl);
      processPrescriptionImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI vision and OCR extraction pipeline
  const processPrescriptionImage = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setIsSavedToProfile(false);
    speechEngine.stopSpeaking();
    setIsPlayingAudio(false);

    try {
      setAnalysisStep(
        lang === 'en'
          ? 'Deciphering doctor handwriting with open-source medical vision...'
          : 'மருத்துவர் கையெழுத்தை AI கணினிப் பார்வை மூலம் படிக்கிறது...'
      );

      // Perform extraction
      const result = await prescriptionAiService.analyzePrescription(imageSrc, patientAllergies);

      setAnalysisStep(
        lang === 'en'
          ? 'Cross-referencing Jan Aushadhi generic price matrix...'
          : 'அரசு ஜன் அவுஷதி மலிவு விலை அட்டவணையுடன் ஒப்பிடுகிறது...'
      );

      setTimeout(() => {
        setAnalysisResult(result);
        setIsAnalyzing(false);
        setActiveTab('results');
      }, 600);
    } catch (err: any) {
      console.error('Prescription processing error:', err);
      setIsAnalyzing(false);
      setErrorMsg(
        err.message || (lang === 'en' ? 'Could not analyze prescription. Please retake photo with clearer lighting.' : 'மருந்துச் சீட்டைப் படிக்க முடியவில்லை. வெளிச்சத்தில் மீண்டும் படம் எடுக்கவும்.')
      );
    }
  };

  // Reset and scan another prescription
  const handleResetScan = () => {
    speechEngine.stopSpeaking();
    setIsPlayingAudio(false);
    setCapturedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    setIsSavedToProfile(false);
    setActiveTab('camera');
  };

  // Audio Doctor voice explanation handler
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      speechEngine.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    if (!analysisResult) return;

    const textToSpeak =
      audioLang === 'ta'
        ? analysisResult.humanDoctorExplanationTa
        : analysisResult.humanDoctorExplanationEn;

    if (!textToSpeak) return;

    speechEngine.speak(
      textToSpeak,
      audioLang,
      0.9, // Gentle bedside pace
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  // Save extracted medications to Supabase profile
  const handleSaveToProfile = async () => {
    if (!analysisResult || analysisResult.medicines.length === 0) return;
    setIsSaving(true);
    const success = await prescriptionAiService.saveMedicationsToSupabase(analysisResult.medicines);
    setIsSaving(false);
    if (success) {
      setIsSavedToProfile(true);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div data-lenis-prevent className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  {lang === 'en' ? 'Prescription Scanner & Medicine Saver' : 'மருந்து சீட்டு ஸ்கேனர் & மலிவு விலை'}
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>AI Powered</span>
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                {lang === 'en' ? 'Translates doctor handwriting into clear instructions' : 'மருத்துவர் கையெழுத்தை எளிய தமிழில் விளக்கும்'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              speechEngine.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas for Camera Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Content Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
          
          {/* TAB 1: Camera Scanner & Upload View */}
          {activeTab !== 'results' && !analysisResult && (
            <div className="space-y-4">
              
              {/* Scan Mode Switcher Pills */}
              <div className="flex items-center justify-between bg-slate-200/70 p-1 rounded-2xl max-w-xs mx-auto text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                    startCamera(cameraFacingMode);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'camera'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
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
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Upload File' : 'கோப்பு ஏற்று'}</span>
                </button>
              </div>

              {/* Error banner if camera fails */}
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
                    <div className="text-center bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-3 rounded-full mx-auto shadow-md">
                      {lang === 'en' ? 'Align prescription inside frame' : 'மருந்துச் சீட்டை கட்டத்திற்குள் வைக்கவும்'}
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-4 border-l-4 border-teal-400 rounded-bl-sm"></div>
                      <div className="w-4 h-4 border-b-4 border-r-4 border-teal-400 rounded-br-sm"></div>
                    </div>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 px-4">
                    {/* Switch Camera Button */}
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
                      title={lang === 'en' ? 'Upload from Gallery' : 'படத்தை பதிவேற்று'}
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
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {lang === 'en' ? 'Click or drag prescription photo here' : 'மருந்து சீட்டு படத்தை இங்கே பதிவேற்றவும்'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {lang === 'en' ? 'Supports JPG, PNG, WebP or clear mobile camera photos.' : 'JPG, PNG, WebP அல்லது தெளிவான மொபைல் கேமரா புகைப்படங்கள்.'}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* ANALYZING STATE WITH NEURAL SCANNER PULSE */}
          {isAnalyzing && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in duration-200">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 animate-pulse">
                  <FileText className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-teal-500 animate-ping opacity-30"></div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {lang === 'en' ? 'Analyzing Clinical Prescription' : 'மருந்து சீட்டு ஆய்வு செய்யப்படுகிறது'}
                </h4>
                <p className="text-xs text-teal-700 font-semibold mt-1 animate-pulse">
                  {analysisStep}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-teal-500 animate-indeterminate rounded-full"></div>
              </div>

              <p className="text-[11px] text-slate-400">
                {lang === 'en'
                  ? 'Transcribing doctor cursive handwriting & cross-referencing PMBJP Jan Aushadhi generic formulations...'
                  : 'மருத்துவர் கையெழுத்தை உணர்ந்து, மலிவு விலை ஜெனரிக் மாத்திரைகளுடன் ஒப்பிடுகிறது...'}
              </p>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-bold">
                  {lang === 'en' ? 'Analysis Failed' : 'ஆய்வு தோல்வியடைந்தது'}
                </div>
                <div>{errorMsg}</div>
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="font-bold underline text-rose-700 mt-1 inline-block"
                >
                  {lang === 'en' ? 'Retake or re-upload photo' : 'மீண்டும் படம் எடுக்க'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AI CLINICAL ANALYSIS & MEDICINE SAVER RESULTS */}
          {activeTab === 'results' && analysisResult && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Top Doctor & Scan Metadata Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {analysisResult.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {analysisResult.clinicOrHospital} • <span className="text-slate-400">{analysisResult.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full">
                    {analysisResult.medicines.length} {lang === 'en' ? 'Medicines' : 'மருந்துகள்'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetScan}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Scan New' : 'புதிய ஸ்கேன்'}</span>
                  </button>
                </div>
              </div>

              {/* Breakthrough Innovation: Audio Bedside Doctor Explanation */}
              <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                    <Volume2 className={`w-4 h-4 text-teal-700 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                    <span>{lang === 'en' ? 'Listen to Doctor Explanation (No Jargon)' : 'மருத்துவர் குரல் விளக்கம் (எளிய தமிழில்)'}</span>
                  </div>

                  {/* Audio language switcher */}
                  <div className="flex items-center bg-white/80 p-0.5 rounded-lg border border-teal-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        speechEngine.stopSpeaking();
                        setIsPlayingAudio(false);
                        setAudioLang('en');
                      }}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        audioLang === 'en' ? 'bg-teal-700 text-white' : 'text-slate-600'
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
                      className={`px-2 py-0.5 rounded-md font-tamil transition-colors cursor-pointer ${
                        audioLang === 'ta' ? 'bg-teal-700 text-white' : 'text-slate-600'
                      }`}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>

                {/* Explanation text bubble */}
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-teal-100/80">
                  "{audioLang === 'ta' ? analysisResult.humanDoctorExplanationTa : analysisResult.humanDoctorExplanationEn}"
                </p>

                {/* Audio controls button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Pause Audio' : 'நிறுத்து'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Play Voice Guidance' : 'குரல் வழிகாட்டலைக் கேள்'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-teal-800/80 font-medium">
                    {lang === 'en' ? 'Speech synthesized for elderly patients' : 'முதியோருக்கான மெதுவான குரல்'}
                  </span>
                </div>
              </div>

              {/* Allergy Warning Card if cross-check finds conflict */}
              {analysisResult.allergyWarnings && analysisResult.allergyWarnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'en' ? 'Profile Allergy Alert' : 'ஒவ்வாமை எச்சரிக்கை'}</span>
                  </div>
                  {analysisResult.allergyWarnings.map((aw, idx) => (
                    <div key={idx} className="text-xs bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <span className="font-bold text-amber-900">{aw.medicine}</span> conflicts with your recorded allergy to <span className="font-bold text-rose-700">{aw.allergen}</span>.
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {lang === 'ta' ? aw.warningTa : aw.warningEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Big Savings Callout Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      {lang === 'en' ? 'Generic Medicine Savings' : 'அரசு மலிவு மருந்து சேமிப்பு'}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-emerald-950">
                      {lang === 'en'
                        ? `You save ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}% less) with generic medicines!`
                        : `மலிவு மருந்துகளில் நீங்கள் ₹${analysisResult.totalSavings} (${analysisResult.savingsPercentage}%) சேமிக்கலாம்!`}
                    </div>
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
                  <span className="text-xs text-slate-500 line-through">₹{analysisResult.totalBrandCost}</span>
                  <span className="text-lg font-black text-emerald-700">₹{analysisResult.totalGenericCost} only</span>
                </div>
              </div>

              {/* Extracted Prescribed Medications List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'en' ? 'Deciphered Medications & Equivalents' : 'பரிந்துரைக்கப்பட்ட மருந்துகள் & ஜெனரிக் மாற்று'}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    PMBJP Jan Aushadhi Verified
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

              {/* Action Buttons: Save to Profile & Find Jan Aushadhi Store */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveToProfile}
                  disabled={isSaving || isSavedToProfile}
                  className={`flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isSavedToProfile
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isSavedToProfile ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'en' ? 'Saved to Your Health Profile' : 'உங்கள் சுயவிவரத்தில் சேமிக்கப்பட்டது'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        {isSaving
                          ? (lang === 'en' ? 'Saving to Profile...' : 'சேமிக்கிறது...')
                          : (lang === 'en' ? 'Save to My Profile Medications' : 'என் மருத்துவ விவரத்தில் சேர்')}
                      </span>
                    </>
                  )}
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
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'en' ? 'Find Nearest Jan Aushadhi Store' : 'அருகிலுள்ள மலிவு மருந்தகம் காண்க'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
