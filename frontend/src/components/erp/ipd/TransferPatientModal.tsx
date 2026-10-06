import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ipdBedService, type IpdWard, type IpdBed, type IpdAdmission, type Doctor } from '../../../services/ipdBedService';

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  admission: IpdAdmission | null;
}

export const TransferPatientModal: React.FC<TransferPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  admission,
}) => {
  const [wards, setWards] = useState<IpdWard[]>([]);
  const [beds, setBeds] = useState<IpdBed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [targetWardCode, setTargetWardCode] = useState('PRIV');
  const [targetBedNumber, setTargetBedNumber] = useState('');
  const [transferReason, setTransferReason] = useState('Patient request for private room upgrade');
  const [authorizedBy, setAuthorizedBy] = useState('Dr. Mohamed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const [w, b, d] = await Promise.all([
        ipdBedService.getWards(),
        ipdBedService.getBeds(),
        ipdBedService.getDoctors(),
      ]);
      setWards(w);
      setBeds(b);
      setDoctors(d);

      // Default target ward to something different than current
      if (admission) {
        const otherWard = w.find((ward) => ward.ward_code !== admission.ward_code);
        if (otherWard) {
          setTargetWardCode(otherWard.ward_code);
        }
      }
    };
    load();
  }, [isOpen, admission]);

  // Target available beds
  const targetAvailableBeds = beds.filter(
    (b) => b.ward_code === targetWardCode && (b.status === 'Available' || b.status === 'Cleaning')
  );

  useEffect(() => {
    if (targetAvailableBeds.length > 0) {
      setTargetBedNumber(targetAvailableBeds[0].bed_number);
    } else {
      setTargetBedNumber('');
    }
  }, [targetWardCode, beds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!admission) {
      setErrorMsg('No active admission selected.');
      return;
    }
    if (!targetBedNumber) {
      setErrorMsg('Please select a valid destination bed.');
      return;
    }
    if (targetBedNumber === admission.bed_number) {
      setErrorMsg('Destination bed cannot be the same as current bed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ipdBedService.transferPatient({
        admissionId: admission.id,
        patientHealthId: admission.patient_health_id,
        patientName: admission.patient_name,
        fromBedNumber: admission.bed_number,
        toBedNumber: targetBedNumber,
        fromWardCode: admission.ward_code,
        toWardCode: targetWardCode,
        transferReason,
        authorizedBy,
      });

      if (res.success) {
        onSuccess(
          `Patient ${admission.patient_name} transferred from Bed ${admission.bed_number} to Bed ${targetBedNumber} successfully.`
        );
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to complete bed transfer.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected transfer error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !admission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Transfer Patient Bed</h3>
              <p className="text-xs text-slate-500">Move patient across wards or change bed allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Patient & Bed Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {admission.patient_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{admission.patient_name}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {admission.patient_health_id} • {admission.diagnosis}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Current Bed</div>
              <div className="text-sm font-extrabold text-blue-700">Bed {admission.bed_number}</div>
              <div className="text-[10px] text-slate-500">{admission.ward_name}</div>
            </div>
          </div>

          {/* Destination Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Destination Ward & Bed
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Ward</label>
                <select
                  value={targetWardCode}
                  onChange={(e) => setTargetWardCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                >
                  {wards.map((w) => (
                    <option key={w.ward_code} value={w.ward_code}>
                      {w.name} ({w.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Available Bed</label>
                <select
                  value={targetBedNumber}
                  onChange={(e) => setTargetBedNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-blue-700"
                >
                  {targetAvailableBeds.length === 0 ? (
                    <option value="">No beds available in this ward</option>
                  ) : (
                    targetAvailableBeds.map((b) => (
                      <option key={b.bed_number} value={b.bed_number}>
                        Bed {b.bed_number} ({b.bed_type})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Justification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Transfer Reason</label>
            <select
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-2"
            >
              <option value="Patient request for private room upgrade">Patient / Family Request (Room Upgrade)</option>
              <option value="Step-down care: Transferred from ICU to Step-Down/General Ward">Step-down care: ICU Step-Down to Ward</option>
              <option value="Clinical Escalation: Transferred to ICU/HDU for intensive monitoring">Clinical Escalation: Transfer to ICU/HDU</option>
              <option value="Infection Control: Barrier nursing and isolation protocol">Infection Control: Barrier Nursing Isolation</option>
              <option value="Post-operative surgical ward relocation">Post-Operative Ward Relocation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Authorizing Consultant</label>
            <select
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.department})
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetBedNumber}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transferring Patient...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Bed Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
