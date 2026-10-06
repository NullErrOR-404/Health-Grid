import React, { useState } from 'react';
import { X, FlaskConical, CheckSquare, Square, Zap } from 'lucide-react';
import {
  emergencyService,
  type EmergencyCase,
} from '../../../services/emergencyService';

interface RequestTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EmergencyCase | null;
  triggerToast: (msg: string) => void;
}

interface TestOption {
  id: string;
  name: string;
  category: 'Laboratory' | 'Radiology' | 'Point-of-Care';
  defaultPriority: 'STAT (Immediate)' | 'Urgent (< 30 min)' | 'Routine';
}

const COMMON_STAT_TESTS: TestOption[] = [
  { id: 'trop', name: 'Troponin-I STAT (High Sensitivity)', category: 'Laboratory', defaultPriority: 'STAT (Immediate)' },
  { id: 'abg', name: 'Arterial Blood Gas (ABG) + Lactate', category: 'Laboratory', defaultPriority: 'STAT (Immediate)' },
  { id: 'ecg', name: '12-Lead ECG (STAT Emergency)', category: 'Point-of-Care', defaultPriority: 'STAT (Immediate)' },
  { id: 'ct-brain', name: 'Non-Contrast CT Brain (Stroke/Trauma)', category: 'Radiology', defaultPriority: 'STAT (Immediate)' },
  { id: 'cxr', name: 'Chest X-Ray Portable (AP View)', category: 'Radiology', defaultPriority: 'Urgent (< 30 min)' },
  { id: 'fast', name: 'Bedside FAST Sonography (Trauma)', category: 'Point-of-Care', defaultPriority: 'STAT (Immediate)' },
  { id: 'cbc', name: 'Complete Blood Count (CBC) + Platelets', category: 'Laboratory', defaultPriority: 'Urgent (< 30 min)' },
  { id: 'lytes', name: 'Serum Electrolytes + Renal Panel', category: 'Laboratory', defaultPriority: 'Urgent (< 30 min)' },
  { id: 'ddimer', name: 'D-Dimer Quantitative STAT', category: 'Laboratory', defaultPriority: 'STAT (Immediate)' },
  { id: 'ptinr', name: 'Coagulation Profile (PT/INR, aPTT)', category: 'Laboratory', defaultPriority: 'Urgent (< 30 min)' },
];

export const RequestTestsModal: React.FC<RequestTestsModalProps> = ({
  isOpen,
  onClose,
  patient,
  triggerToast,
}) => {
  const [selectedTests, setSelectedTests] = useState<string[]>(['trop', 'ecg']);
  const [priority, setPriority] = useState<'STAT (Immediate)' | 'Urgent (< 30 min)' | 'Routine'>('STAT (Immediate)');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      triggerToast('Please select at least one investigation');
      return;
    }

    setIsSubmitting(true);
    try {
      const testsToOrder = selectedTests.map((tId) => {
        const item = COMMON_STAT_TESTS.find((t) => t.id === tId)!;
        return {
          test_name: item.name,
          category: item.category,
          priority: priority,
        };
      });

      const res = await emergencyService.requestStatTests(patient.id, testsToOrder);

      if (res.success) {
        triggerToast(`${selectedTests.length} STAT investigations dispatched to LIS/RIS!`);
        onClose();
      } else {
        triggerToast(res.error || 'Failed to dispatch tests');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Error ordering investigations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Request STAT Emergency Tests</h2>
              <p className="text-xs text-slate-400">Rapid requisition for Point-of-Care, LIS & RIS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Patient Overview Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
              <div className="text-xs font-black text-slate-900">{patient.patient_name}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
              <div className="text-xs font-bold text-slate-700">{patient.er_location}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triage Level</span>
              <div
                className={`text-xs font-bold ${
                  patient.triage_level === 'Red'
                    ? 'text-rose-600'
                    : patient.triage_level === 'Yellow'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {patient.triage_level}
              </div>
            </div>
          </div>

          {/* Priority Radios */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['STAT (Immediate)', 'Urgent (< 30 min)', 'Routine'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    priority === p
                      ? 'border-rose-600 bg-rose-50/70 text-rose-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs">{p}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Catalogue Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Select Emergency Tests ({selectedTests.length} Selected)</span>
              <button
                type="button"
                onClick={() => setSelectedTests(COMMON_STAT_TESTS.map((t) => t.id))}
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
              >
                Select All STAT
              </button>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {COMMON_STAT_TESTS.map((test) => {
                const isChecked = selectedTests.includes(test.id);
                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => toggleTest(test.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      isChecked
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="mt-0.5 text-teal-600">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 fill-teal-600 text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {test.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{test.category}</span>
                        <span>•</span>
                        <span className="font-semibold text-rose-600">{test.defaultPriority}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Indication */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Indication / Diagnostic Hypothesis
            </label>
            <textarea
              rows={2}
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="e.g. Rule out acute coronary syndrome / pulmonary embolism. Acute chest tightness with diaphoresis."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
            />
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Order STAT Investigations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
