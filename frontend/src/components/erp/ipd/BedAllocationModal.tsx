import React, { useState, useEffect } from 'react';
import {
  X,
  BedDouble,
  CheckCircle2,
  Search
} from 'lucide-react';
import { ipdBedService, type IpdWard, type IpdBed } from '../../../services/ipdBedService';
import { unifiedPatientStore, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface BedAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const BedAllocationModal: React.FC<BedAllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [wards, setWards] = useState<IpdWard[]>([]);
  const [beds, setBeds] = useState<IpdBed[]>([]);
  const [patients, setPatients] = useState<UnifiedPatient[]>([]);

  const [selectedWardCode, setSelectedWardCode] = useState('GEN');
  const [selectedBedNumber, setSelectedBedNumber] = useState('');
  const [selectedPatientHealthId, setSelectedPatientHealthId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const [w, b] = await Promise.all([
        ipdBedService.getWards(),
        ipdBedService.getBeds(),
      ]);
      setWards(w);
      setBeds(b);
      setPatients(unifiedPatientStore.getAllPatients());
    };
    load();
  }, [isOpen]);

  const availableBeds = beds.filter(
    (b) => b.ward_code === selectedWardCode && (b.status === 'Available' || b.status === 'Cleaning')
  );

  useEffect(() => {
    if (availableBeds.length > 0 && !selectedBedNumber) {
      setSelectedBedNumber(availableBeds[0].bed_number);
    }
  }, [availableBeds]);

  const handleSelectPatient = (p: UnifiedPatient) => {
    setSelectedPatientHealthId(p.healthId);
    setPatientName(p.name);
    setPatientSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedNumber || !selectedPatientHealthId || !patientName) return;

    setIsSubmitting(true);
    try {
      const ok = await ipdBedService.allocateBed(selectedBedNumber, selectedPatientHealthId, patientName);
      if (ok) {
        onSuccess(`Bed ${selectedBedNumber} allocated to ${patientName} (${selectedPatientHealthId}).`);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredPatients = patientSearch.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.healthId.toLowerCase().includes(patientSearch.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Direct Bed Allocation</h3>
              <p className="text-xs text-slate-500">Assign an available bed to a registered patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Ward & Bed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
              <select
                value={selectedWardCode}
                onChange={(e) => {
                  setSelectedWardCode(e.target.value);
                  setSelectedBedNumber('');
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
              >
                {wards.map((w) => (
                  <option key={w.ward_code} value={w.ward_code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available Bed</label>
              <select
                value={selectedBedNumber}
                onChange={(e) => setSelectedBedNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-bold text-teal-700"
              >
                {availableBeds.length === 0 ? (
                  <option value="">No beds available</option>
                ) : (
                  availableBeds.map((b) => (
                    <option key={b.bed_number} value={b.bed_number}>
                      Bed {b.bed_number} ({b.bed_type})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Patient Search */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Patient
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patient name or HealthID..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            {filteredPatients.length > 0 && (
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatient(p)}
                    className="w-full px-3 py-1.5 text-left hover:bg-teal-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-slate-400 ml-2">({p.healthId})</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Patient Readout */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Selected Patient</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Name"
                required
                className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">HealthID (UHID)</label>
              <input
                type="text"
                value={selectedPatientHealthId}
                onChange={(e) => setSelectedPatientHealthId(e.target.value.toUpperCase())}
                placeholder="e.g. HG001245"
                required
                className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white font-mono font-bold text-teal-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={isSubmitting || !selectedBedNumber || !patientName}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Allocate Bed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
