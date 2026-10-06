import React, { useState } from 'react';
import { X, UserCheck, Search } from 'lucide-react';
import { unifiedPatientStore, type OpdQueueItem, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface OpdRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (queueItem: OpdQueueItem) => void;
}

export const OpdRegistrationModal: React.FC<OpdRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const patients = unifiedPatientStore.getAllPatients();
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [doctor, setDoctor] = useState('Dr. Mohamed');
  const [visitType, setVisitType] = useState('General OPD');

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p: UnifiedPatient) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.healthId.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const queueItem = unifiedPatientStore.addExistingPatientToOpd(
      selectedPatientId,
      department,
      doctor,
      visitType
    );

    if (queueItem) {
      onRegistered(queueItem);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">New OPD Registration</h3>
              <p className="text-xs text-slate-500">Allocate OPD token and assign consulting specialist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Select Registered Patient (or Search HealthID)
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or HealthID (HG001...)"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {filteredPatients.map((p: UnifiedPatient) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.healthId}) • {p.phone} • {p.age}/{p.gender[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Gynaecology">Gynaecology</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Nephrology">Nephrology</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Consulting Doctor
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Dr. Mohamed">Dr. Mohamed</option>
                <option value="Dr. Revathi">Dr. Revathi</option>
                <option value="Dr. Arjun">Dr. Arjun</option>
                <option value="Dr. Priya">Dr. Priya</option>
                <option value="Dr. Karthik">Dr. Karthik</option>
                <option value="Dr. Nivetha">Dr. Nivetha</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Visit Type
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="General OPD">General OPD</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Acute Consultation">Acute Consultation</option>
              <option value="Specialist Review">Specialist Review</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700"
            >
              Generate Token & Check In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
