import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShieldCheck, FileText, ShoppingBag, MapPin, RefreshCw } from 'lucide-react';
import type { Language } from '../types';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true); // Default to sample prescription for instant preview

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  const medicines = [
    {
      brandName: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin + Potassium Clavulanate (625mg)',
      timing: lang === 'en' ? 'Morning 1 - Night 1 (After Food)' : 'காலை 1 - இரவு 1 (உணவுக்குப் பின்)',
      duration: '5 days',
      brandPrice: 204,
      genericPrice: 22,
      savingsPct: 89,
      purposeEn: 'For bacterial infection and throat pain',
      purposeTa: 'தொண்டை வலி மற்றும் பாக்டீரியா தொற்றுக்கு',
    },
    {
      brandName: 'Dolo 650',
      genericName: 'Paracetamol Tablets IP (650mg)',
      timing: lang === 'en' ? 'Only if fever > 100°F (After Food)' : 'காய்ச்சல் 100°F மேல் இருந்தால் மட்டும்',
      duration: '3 days',
      brandPrice: 34,
      genericPrice: 4,
      savingsPct: 88,
      purposeEn: 'For fever & body ache',
      purposeTa: 'காய்ச்சல் மற்றும் உடல் வலிக்கு',
    },
    {
      brandName: 'Pantocid 40',
      genericName: 'Pantoprazole Gastro-Resistant (40mg)',
      timing: lang === 'en' ? 'Morning 1 (Before Food)' : 'காலை 1 (உணவுக்கு முன் வெறும் வயிற்றில்)',
      duration: '5 days',
      brandPrice: 155,
      genericPrice: 18,
      savingsPct: 88,
      purposeEn: 'Prevents stomach acidity',
      purposeTa: 'அசிடிட்டி மற்றும் நெஞ்செரிச்சல் தடுப்பு',
    },
  ];

  const totalBrandCost = medicines.reduce((acc, m) => acc + m.brandPrice, 0);
  const totalGenericCost = medicines.reduce((acc, m) => acc + m.genericPrice, 0);
  const totalSavings = totalBrandCost - totalGenericCost;

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div data-lenis-prevent className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  {lang === 'en' ? 'Prescription Scanner & Medicine Saver' : 'மருந்து சீட்டு ஸ்கேனர் & மலிவு விலை'}
                </h3>
                <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                  {lang === 'en' ? 'Doctor Verified' : 'சரிபார்க்கப்பட்டது'}
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                {lang === 'en' ? 'Translates doctor handwriting into clear instructions' : 'மருத்துவர் கையெழுத்தை எளிய தமிழில் விளக்கும்'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          
          {/* Action / Upload Strip */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {lang === 'en' ? 'Doctor Prescription Loaded' : 'மருத்துவர் சீட்டு இணைக்கப்பட்டது'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? '3 medications verified, 0 allergy conflicts' : '3 மருந்துகள் சரிபார்க்கப்பட்டன, ஒவ்வாமை இல்லை'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? (lang === 'en' ? 'Scanning...' : 'ஸ்கேன் செய்கிறது...') : (lang === 'en' ? 'Re-scan Photo' : 'மறுபடி ஸ்கேன் செய்')}</span>
            </button>
          </div>

          {/* Big Savings Callout Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {lang === 'en' ? 'Generic Medicine Savings' : 'அரசு மலிவு மருந்து சேமிப்பு'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-950">
                  {lang === 'en' ? `You save ₹${totalSavings} (88% less) with generic medicines!` : `மலிவு மருந்துகளில் நீங்கள் ₹${totalSavings} (88%) சேமிக்கலாம்!`}
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
              <span className="text-xs text-slate-500 line-through">₹{totalBrandCost}</span>
              <span className="text-lg font-black text-emerald-700">₹{totalGenericCost} only</span>
            </div>
          </div>

          {/* Decoded Medicines List */}
          {hasScanned && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'en' ? 'Decoded Medication Routine' : 'மருந்து உட்கொள்ளும் முறை'}
                </h4>
                <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Certified by Jan Aushadhi DB' : 'அரசு மருந்தக சான்று'}
                </span>
              </div>

              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{med.brandName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                          {med.duration}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Generic: {med.genericName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through">₹{med.brandPrice}</span>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ₹{med.genericPrice} ({med.savingsPct}% OFF)
                      </span>
                    </div>
                  </div>

                  {/* Timing & Purpose Banner */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>{med.timing}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {lang === 'ta' ? med.purposeTa : med.purposeEn}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nearest Generic Medicine Store */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {lang === 'en' ? 'Nearest Cheap Medicine Shop' : 'அருகிலுள்ள மக்கள் மருந்தகம் (Jan Aushadhi)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Opposite Bus Stand, Royapuram (0.6 km away)' : 'பேருந்து நிலையம் எதிரில், ராயபுரம் (0.6 கி.மீ)'}
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              {lang === 'en' ? 'View Map' : 'வழி பார்க்க'}
            </a>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {lang === 'en' ? 'All prices regulated under National Pharmaceutical Authority' : 'அரசு நிர்ணயித்த சீரான விலை'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {lang === 'en' ? 'Close' : 'மூடு'}
          </button>
        </div>

      </div>
    </div>
  );
};
