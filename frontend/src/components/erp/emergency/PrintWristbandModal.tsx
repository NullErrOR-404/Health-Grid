import React from 'react';
import { X, Printer, QrCode, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { EmergencyCase } from '../../../services/emergencyService';

interface PrintWristbandModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

export const PrintWristbandModal: React.FC<PrintWristbandModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    triggerToast(`Printing thermal wristband for ${patient.patient_name}...`);
    window.print();
  };

  const triageColorBar =
    patient.triage_level === 'Red'
      ? 'bg-rose-600 text-white'
      : patient.triage_level === 'Yellow'
      ? 'bg-amber-500 text-slate-900'
      : 'bg-emerald-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Print Patient Wristband</h2>
              <p className="text-xs text-slate-400">Thermal barcode casualty identification band</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-600">
            Previewing standard 1 x 11 inch thermal identification wristband for hospital emergency admission:
          </p>

          {/* Wristband Visual Preview */}
          <div className="p-4 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col sm:flex-row items-stretch">
              {/* Triage color indicator band */}
              <div
                className={`w-full sm:w-16 py-2 px-3 sm:py-6 flex flex-col items-center justify-center font-black text-xs uppercase tracking-wider ${triageColorBar}`}
              >
                <span className="sm:-rotate-90 whitespace-nowrap">{patient.triage_level} CODE</span>
              </div>

              {/* Patient Core Info */}
              <div className="p-4 flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {patient.patient_name}
                    </h3>
                    <div className="text-[11px] font-mono font-bold text-teal-700 mt-0.5">
                      {patient.patient_health_id}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">
                      {patient.case_number}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700">
                      {patient.er_location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1 border-t border-slate-100">
                  <span>Age: <strong className="text-slate-900">{patient.patient_age} yrs</strong></span>
                  <span>Gender: <strong className="text-slate-900">{patient.patient_gender}</strong></span>
                  <span>Admit: <strong className="text-slate-900">{new Date(patient.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>

                {patient.allergies && patient.allergies !== 'No known allergies' && (
                  <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>ALLERGY ALERT: {patient.allergies}</span>
                  </div>
                )}

                {/* Barcode Mock Graphic */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-0.5 h-7">
                      {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7].map((w, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 h-full"
                          style={{ width: `${(w % 3) + 1}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 tracking-widest block">
                      *{patient.patient_health_id}*
                    </span>
                  </div>

                  <div className="w-10 h-10 border border-slate-200 rounded-lg p-1 bg-slate-50 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Water-resistant thermal resin print with cryptographic ABDM QR verification.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Wristband</span>
          </button>
        </div>
      </div>
    </div>
  );
};
