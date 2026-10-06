import React from 'react';
import {
  X,
  Printer,
  QrCode,
} from 'lucide-react';
import { type Appointment } from '../../../services/appointmentService';

interface PrintAppointmentSlipModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export const PrintAppointmentSlipModal: React.FC<PrintAppointmentSlipModalProps> = ({
  isOpen,
  appointment,
  onClose,
}) => {
  if (!isOpen || !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs print:p-0 print:bg-white">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-auto max-h-none sm:max-h-[92vh] sm:rounded-2xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95 print:shadow-none print:border-0">
        {/* Header - Hidden in print */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Appointment Confirmation Slip</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Printable Slip Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-800">
          {/* Hospital Brand & Slip Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center gap-1.5 text-teal-700 font-black text-base tracking-tight">
              <span className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">✚</span>
              HealthGrid Hospital
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Apollo Multi-Specialty Clinic · Chennai Central</div>
            <div className="text-[10px] text-slate-400">NABH Accredited · ABDM Tier-1 Sovereign Facility</div>
            <div className="mt-2 text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 py-1 rounded-md">
              Outpatient Consultation Pass
            </div>
          </div>

          {/* Appointment ID & QR Code */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Appointment ID</div>
              <div className="text-sm font-black text-teal-700 font-mono">{appointment.appointment_id}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Source: {appointment.source}</div>
            </div>
            <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Information</div>
            <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">Patient Name</span>
                <span className="font-bold text-slate-900">{appointment.patient_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">HealthID / UHID</span>
                <span className="font-bold text-slate-900 font-mono">{appointment.patient_health_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Age / Gender</span>
                <span className="font-semibold text-slate-700">{appointment.patient_age} yrs / {appointment.patient_gender}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Mobile Phone</span>
                <span className="font-semibold text-slate-700">{appointment.patient_phone}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Doctor */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultation Details</div>
            <div className="grid grid-cols-2 gap-2 bg-teal-50/40 p-2.5 rounded-lg border border-teal-100">
              <div>
                <span className="text-[10px] text-teal-600 block">Consulting Doctor</span>
                <span className="font-bold text-slate-900">{appointment.doctor_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-teal-600 block">Department</span>
                <span className="font-semibold text-slate-800">{appointment.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-teal-600 block">Date</span>
                <span className="font-bold text-slate-900">{appointment.appointment_date}</span>
              </div>
              <div>
                <span className="text-[10px] text-teal-600 block">Reporting Slot</span>
                <span className="font-bold text-teal-700">{appointment.appointment_time}</span>
              </div>
            </div>
          </div>

          {/* Reporting Guidelines */}
          <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 space-y-1 leading-relaxed">
            <div className="font-bold text-slate-700">Important Instructions:</div>
            <div>• Please report to the triage desk 15 minutes prior to your slot time.</div>
            <div>• Present this digital pass or QR code at Room 101 reception for express check-in.</div>
            <div>• For any emergency queries, dial hospital helpline: 108 or 044-2829-0200.</div>
          </div>
        </div>

        {/* Action Tray - Hidden in print */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Appointment Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
