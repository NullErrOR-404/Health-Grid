import React, { useState, useEffect } from 'react';
import { X, UserCheck, Search, AlertCircle, CheckCircle2, Loader2, UserPlus } from 'lucide-react';
import { unifiedPatientStore, type OpdQueueItem, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface OpdRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (queueItem: OpdQueueItem) => void;
  onOpenWalkInRegistration?: () => void;
}

export const OpdRegistrationModal: React.FC<OpdRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  onOpenWalkInRegistration,
}) => {
  const [patients, setPatients] = useState<UnifiedPatient[]>(() => unifiedPatientStore.getAllPatients());
  const [healthIdQuery, setHealthIdQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<UnifiedPatient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [department, setDepartment] = useState('General Medicine');
  const [doctor, setDoctor] = useState('Dr. Mohamed');
  const [visitType, setVisitType] = useState('General OPD');

  useEffect(() => {
    if (isOpen) {
      const current = unifiedPatientStore.getAllPatients();
      setPatients(current);
      if (current.length > 0 && !selectedPatient) {
        setSelectedPatient(current[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLookupHealthId = async (overrideId?: string) => {
    const idToSearch = (overrideId !== undefined ? overrideId : healthIdQuery).trim().toUpperCase();
    if (!idToSearch) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const found = await unifiedPatientStore.lookupPatientByHealthId(idToSearch);
      if (found) {
        setSelectedPatient(found);
        setSearchError(null);
      } else {
        setSelectedPatient(null);
        setSearchError(`No verified citizen account found with Health ID "${idToSearch}".`);
      }
    } catch {
      setSearchError('Error communicating with database. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFromDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = patients.find((p) => p.id === id);
    if (found) {
      setSelectedPatient(found);
      setHealthIdQuery(found.healthId);
      setSearchError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const queueItem = unifiedPatientStore.addExistingPatientToOpd(
      selectedPatient.id,
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
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Hospital Check-In &amp; OPD Token</h3>
              <p className="text-xs text-slate-500">Admit verified citizen with HealthGrid ID to consultation queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* STEP 1: Search Patient by HealthGrid ID */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-teal-600" />
                <span>Search Citizen HealthGrid ID</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">e.g. HG-PP27BNQ, HG-64XBAAG</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={healthIdQuery}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setHealthIdQuery(val);
                    if (searchError) setSearchError(null);
                    if (val.length >= 10 && val.startsWith('HG-')) {
                      handleLookupHealthId(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLookupHealthId();
                    }
                  }}
                  placeholder="Enter citizen Health ID (HG-...)"
                  className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white uppercase placeholder:font-sans placeholder:normal-case placeholder:font-normal"
                />
              </div>

              <button
                type="button"
                onClick={() => handleLookupHealthId()}
                disabled={isSearching || !healthIdQuery.trim()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Fetch</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick dropdown fallback for loaded directory */}
            {patients.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase flex-shrink-0">
                  Or pick registered:
                </span>
                <select
                  value={selectedPatient?.id || ''}
                  onChange={handleSelectFromDropdown}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="" disabled>-- Select authentic patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.healthId}) • {p.phone || 'No Phone'} • {p.age}y/{p.gender[0]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Error State */}
            {searchError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-2 text-xs text-rose-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{searchError}</div>
                    <div className="text-[11px] text-rose-600 mt-0.5">
                      The patient needs to register a HealthGrid account at the desk first.
                    </div>
                  </div>
                </div>

                {onOpenWalkInRegistration && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWalkInRegistration();
                    }}
                    className="flex-shrink-0 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Register Now</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* VERIFIED PATIENT IDENTITY CARD */}
          {selectedPatient && (
            <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-teal-800 tracking-wider">
                    Verified Citizen Record
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md">
                  {selectedPatient.healthId}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Full Name</span>
                  <span className="font-bold text-slate-900">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Age / Gender</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPatient.age} yrs • {selectedPatient.gender}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Blood Group</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Phone Number</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.phone || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Email / Account</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {selectedPatient.email || 'Linked via HealthID'}
                  </span>
                </div>
              </div>

              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && selectedPatient.allergies[0] !== 'No known allergies' && (
                <div className="pt-2 border-t border-teal-200/60 text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clinical Allergies: {selectedPatient.allergies.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: e-Chart Preparation (Department, Doctor & Visit Type) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Consulting Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-800"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Gynaecology">Gynaecology</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Paediatrics">Paediatrics</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Attending Specialist *
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-800"
              >
                <option value="Dr. Mohamed">Dr. Mohamed (Senior Physician)</option>
                <option value="Dr. Revathi">Dr. Revathi (Cardiologist)</option>
                <option value="Dr. Arjun">Dr. Arjun (General OPD)</option>
                <option value="Dr. Priya">Dr. Priya (Diabetologist)</option>
                <option value="Dr. Karthik">Dr. Karthik (Orthopaedist)</option>
                <option value="Dr. Nivetha">Dr. Nivetha (Paediatrician)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Visit Purpose / Type
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-800"
            >
              <option value="General OPD">General OPD Consultation</option>
              <option value="Follow-up">Surveillance Follow-up</option>
              <option value="Acute Consultation">Acute Illness / Symptoms</option>
              <option value="Specialist Review">Specialist Clinical Review</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {onOpenWalkInRegistration ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWalkInRegistration();
                }}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Patient? Register at Desk</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedPatient}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Admit &amp; Issue Token</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
