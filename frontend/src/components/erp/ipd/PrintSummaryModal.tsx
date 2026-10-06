import React from 'react';
import {
  X,
  Printer,
  HeartPulse
} from 'lucide-react';
import { type IpdAdmission } from '../../../services/ipdBedService';

interface PrintSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: IpdAdmission | null;
}

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({
  isOpen,
  onClose,
  admission,
}) => {
  if (!isOpen || !admission) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Actions */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Printable Inpatient Case Sheet & Admission Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-900 font-sans print:p-0 print:m-0">
          {/* Hospital Crest Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  HealthGrid Super-Speciality Hospital
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Autonomous Multi-Tenant Healthcare Operations • NABH & ABDM Accredited
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  100 Feet Road, Apollo Avenue, Chennai 600006 • Ph: +91 44 2829 0000
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-2.5 py-1 bg-teal-100/70 border border-teal-300 rounded-lg text-teal-900 text-xs font-extrabold uppercase tracking-wider">
                IPD Case Summary
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                Ref: {admission.admission_number}
              </div>
            </div>
          </div>

          {/* Patient Demographics & Bed Census Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
              <strong className="text-slate-900 text-sm">{admission.patient_name}</strong>
              <div className="text-[11px] text-slate-500">{admission.patient_age} Years / {admission.patient_gender}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sovereign HealthID (UHID)</span>
              <strong className="text-teal-700 font-mono text-sm">{admission.patient_health_id}</strong>
              <div className="text-[11px] text-slate-500">{admission.patient_phone}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Bed & Ward Location</span>
              <strong className="text-slate-900 text-sm">Bed {admission.bed_number}</strong>
              <div className="text-[11px] text-slate-500">{admission.ward_name} ({admission.ward_code})</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Attending Consultant</span>
              <strong className="text-slate-900 text-sm">{admission.doctor_name}</strong>
              <div className="text-[11px] text-slate-500">{admission.department}</div>
            </div>
          </div>

          {/* Admission Timeline */}
          <div className="grid grid-cols-3 gap-3 text-xs border border-slate-200 rounded-xl p-3 bg-white">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Admission Timestamp</span>
              <span className="font-semibold text-slate-800">
                {new Date(admission.admission_date).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Discharge</span>
              <span className="font-semibold text-slate-800">
                {admission.expected_discharge ? new Date(admission.expected_discharge).toLocaleDateString() : 'Under Observation'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Admission Status</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {admission.status} ({admission.admission_type})
              </span>
            </div>
          </div>

          {/* Diagnosis & Clinical Findings */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
              Clinical Assessment & Diagnosis
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block text-sm">{admission.diagnosis}</span>
              <p className="text-slate-600 mt-1">{admission.chief_complaint || 'Patient admitted for acute monitoring and treatment.'}</p>
            </div>
          </div>

          {/* Active Orders & Treatment Instructions */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
              Active Inpatient Medical Orders & Protocol
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
              <li>IV Fluids: Normal Saline 0.9% maintenance therapy via infusion pump.</li>
              <li>Antipyretic therapy: Tab Paracetamol 650mg SOS for body temperature exceeding 100 F.</li>
              <li>Diagnostic Monitoring: Complete Blood Count (CBC) with Platelet Count every 12 hours.</li>
              <li>Dietary instructions: High oral fluids (coconut water, electrolytes), soft gastro-protective diet.</li>
              <li>Nursing instructions: Hourly vitals charting, monitor urine output and hematocrit levels.</li>
            </ul>
          </div>

          {/* Signatures Footer */}
          <div className="pt-10 flex items-end justify-between text-xs border-t border-slate-300">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <div className="font-bold text-slate-700">Staff Nurse In-Charge</div>
              <div className="text-[10px] text-slate-400 font-mono">Ward Nursing Station</div>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-400 mb-1" />
              <div className="font-bold text-slate-900">{admission.doctor_name}</div>
              <div className="text-[10px] text-slate-500 font-medium">Senior Consultant Physician • Lic # TN-88421</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
