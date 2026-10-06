import React, { useState, useEffect } from 'react';
import { X, Bed, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
} from '../../../services/emergencyService';
import {
  ipdBedService,
  type IpdWard,
  type IpdBed,
  type Doctor,
} from '../../../services/ipdBedService';

interface AdmitToIpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
  onNavigateToIpdBed?: (bedNumber: string) => void;
}

export const AdmitToIpdModal: React.FC<AdmitToIpdModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
  onNavigateToIpdBed,
}) => {
  const [wards, setWards] = useState<IpdWard[]>([]);
  const [beds, setBeds] = useState<IpdBed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedWardCode, setSelectedWardCode] = useState<string>('ICU');
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>('');
  const [attendingDoctor, setAttendingDoctor] = useState<string>('Dr. Priya');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [expectedDischarge, setExpectedDischarge] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadIpdResources = async () => {
        try {
          const [loadedWards, loadedBeds, loadedDocs] = await Promise.all([
            ipdBedService.getWards(),
            ipdBedService.getBeds(),
            ipdBedService.getDoctors(),
          ]);
          setWards(loadedWards);
          setBeds(loadedBeds);
          setDoctors(loadedDocs);

          if (loadedWards.length > 0) {
            setSelectedWardCode(loadedWards[0].ward_code);
          }
        } catch (e) {
          console.warn('Error loading IPD resources:', e);
        }
      };
      loadIpdResources();
    }
  }, [isOpen]);

  // Set default diagnosis and expected discharge when patient changes
  useEffect(() => {
    if (patient) {
      setDiagnosis(patient.chief_complaint || 'Emergency Inpatient Escalation');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 4);
      setExpectedDischarge(futureDate.toISOString().slice(0, 10));
    }
  }, [patient]);

  // Filter available beds for selected ward
  const availableBedsInWard = beds.filter(
    (b) => b.ward_code === selectedWardCode && b.status === 'Available'
  );

  useEffect(() => {
    if (availableBedsInWard.length > 0) {
      setSelectedBedNumber(availableBedsInWard[0].bed_number);
    } else {
      setSelectedBedNumber('');
    }
  }, [selectedWardCode, beds]);

  if (!isOpen || !patient) return null;

  const currentWard = wards.find((w) => w.ward_code === selectedWardCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedNumber) {
      triggerToast('No available bed selected in this ward. Please select another ward or discharge a bed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyService.admitToIpd(patient.id, {
        wardCode: selectedWardCode,
        wardName: currentWard?.name || selectedWardCode,
        bedNumber: selectedBedNumber,
        doctorName: attendingDoctor,
        diagnosis: diagnosis.trim() || patient.chief_complaint,
        expectedDischarge: expectedDischarge || new Date().toISOString().slice(0, 10),
      });

      if (res.success) {
        triggerToast(`Patient ${patient.patient_name} admitted to IPD ${selectedWardCode} (${selectedBedNumber})! ID: ${res.admissionNumber}`);
        if (onNavigateToIpdBed) {
          onNavigateToIpdBed(selectedBedNumber);
        }
        onClose();
      } else {
        triggerToast(res.error || 'Failed to complete IPD bed transfer');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error processing IPD admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Admit Casualty Patient to IPD</h2>
              <p className="text-xs text-blue-100">Live ward transfer and bed occupancy allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Patient Overview Strip */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Patient</span>
              <div className="text-xs font-black text-slate-900">{patient.patient_name}</div>
              <div className="text-[10px] font-mono font-semibold text-blue-700">{patient.patient_health_id}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Current Location</span>
              <div className="text-xs font-bold text-slate-700">{patient.er_location}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Triage Level</span>
              <div className="text-xs font-bold text-rose-600">{patient.triage_level}</div>
            </div>
          </div>

          {/* Ward Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Destination Inpatient Ward
            </label>
            <select
              value={selectedWardCode}
              onChange={(e) => setSelectedWardCode(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-bold bg-white"
            >
              {wards.map((ward) => (
                <option key={ward.id} value={ward.ward_code}>
                  {ward.name} ({ward.ward_code}) • {ward.floor} • Total Beds: {ward.total_beds}
                </option>
              ))}
            </select>
          </div>

          {/* Bed Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Available Bed in {selectedWardCode}
              </label>
              <span className="text-[11px] font-bold text-emerald-600">
                {availableBedsInWard.length} Beds Available
              </span>
            </div>

            {availableBedsInWard.length === 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>No available beds in {selectedWardCode}. Please choose another ward.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableBedsInWard.map((bed) => {
                  const isSelected = selectedBedNumber === bed.bed_number;
                  return (
                    <button
                      key={bed.id}
                      type="button"
                      onClick={() => setSelectedBedNumber(bed.bed_number)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{bed.bed_number}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{bed.bed_type}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inpatient Attending Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inpatient Attending Doctor
              </label>
              <select
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium bg-white"
              >
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.department})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Dr. Priya">Dr. Priya (Emergency Medicine)</option>
                    <option value="Dr. Arvind">Dr. Arvind (General Medicine)</option>
                    <option value="Dr. Rajesh">Dr. Rajesh (Cardiology)</option>
                    <option value="Dr. Meenakshi">Dr. Meenakshi (Trauma & Critical Care)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Discharge Date
              </label>
              <input
                type="date"
                value={expectedDischarge}
                onChange={(e) => setExpectedDischarge(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Admission Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Diagnosis & Handover Summary
            </label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute coronary syndrome with non-ST elevation MI. Admitted to ICU for continuous cardiac telemetry."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Transfer Notice */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Admitting automatically updates bed status to Occupied in Supabase and records clinical transfer audit trail.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBedNumber}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Transferring...</span>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Confirm IPD Admission</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
