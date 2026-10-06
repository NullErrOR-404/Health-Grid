import React from 'react';
import { X, FileText, Printer, ShieldAlert, Download } from 'lucide-react';
import type { EmergencyCase, EmergencyMetrics } from '../../../services/emergencyService';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: EmergencyMetrics;
  criticalCases: EmergencyCase[];
  triggerToast: (msg: string) => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  criticalCases,
  triggerToast,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    triggerToast('Generating printable Casualty Shift Handover Report...');
    window.print();
  };

  const handleExport = () => {
    triggerToast('Shift handover summary exported as text document.');
    const reportText = `HEALTHGRID CASUALTY SHIFT REPORT\nDate: Mon, 02 Oct 2026\nShift: Day Shift (08:00 - 16:00)\nIn-Charge: Dr. Priya\nTotal Active: ${metrics.totalActive}\nCritical Red: ${metrics.criticalRed}\nIn Treatment: ${metrics.inTreatment}\nWaiting: ${metrics.waiting}\nDischarged: ${metrics.discharged}`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ER-Shift-Report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Casualty Shift Handover (SBAR)</h2>
              <p className="text-xs text-slate-400">Emergency Department census & critical transition summary</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Shift Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shift Period</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">Day Shift (08:00 - 16:00)</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duty Physician</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">Dr. Priya (MD ER)</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Charge Nurse</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">Sr. Deepa (ICU Staff)</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report Timestamp</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Census KPI Gauges */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Census Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Active Census</span>
                <div className="text-xl font-black text-blue-900 mt-0.5">{metrics.totalActive}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-center">
                <span className="text-[10px] font-bold text-rose-700 uppercase">Code Red</span>
                <div className="text-xl font-black text-rose-900 mt-0.5">{metrics.criticalRed}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase">In Treatment</span>
                <div className="text-xl font-black text-amber-900 mt-0.5">{metrics.inTreatment}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-700 uppercase">Waiting</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{metrics.waiting}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Discharged</span>
                <div className="text-xl font-black text-emerald-900 mt-0.5">{metrics.discharged}</div>
              </div>
            </div>
          </div>

          {/* High Priority Code Red Patient Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Critical Patients (Immediate Attention)
              </h3>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {criticalCases.length} Critical Cases
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {criticalCases.map((pat) => (
                <div key={pat.id} className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                      {pat.patient_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {pat.patient_name} ({pat.patient_age}y, {pat.patient_gender})
                        <span className="text-[10px] font-mono text-slate-400">{pat.er_location}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                        {pat.chief_complaint}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-slate-900">
                      BP: {pat.latest_vitals.bp} • HR: {pat.latest_vitals.hr}
                    </div>
                    <div className="text-[10px] text-rose-600 font-bold">
                      SpO2: {pat.latest_vitals.spo2}% ({pat.assigned_doctor_name})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SBAR Clinical Narrative */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              SBAR Handover Handshake Protocol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="font-bold text-slate-700">Situation:</span> Casualty occupancy is high ({metrics.totalActive} active cases). Resuscitation Bay 1 & 2 occupied.
              </div>
              <div>
                <span className="font-bold text-slate-700">Background:</span> 4 acute trauma arrivals in past 3 hours following NH-45 collision. 2 STEMI admissions.
              </div>
              <div>
                <span className="font-bold text-slate-700">Assessment:</span> IPD ICU bed crunch in General Medicine. Fast Track clearing steadily.
              </div>
              <div>
                <span className="font-bold text-slate-700">Recommendation:</span> Prioritize IPD step-down transfer for Sameer Ahmed and Lakshmi Priya to free Resus Bay.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Handover</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Shift Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
