import React, { useState } from 'react';
import { X, Pill, Plus, Trash2 } from 'lucide-react';
import { unifiedPatientStore, type PrescriptionItem } from '../../../services/unifiedPatientStore';

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSaved?: () => void;
}

export const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSaved,
}) => {
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      drug: 'Paracetamol 650mg (Dolo)',
      dosage: '1 tab',
      freq: '1-0-1',
      duration: '5 days',
      instructions: 'After food with warm water',
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        drug: '',
        dosage: '1 tab',
        freq: '1-0-1',
        duration: '5 days',
        instructions: 'After food',
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: keyof PrescriptionItem, val: string) => {
    const updated = [...items];
    updated[idx][field] = val;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.drug.trim().length > 0);
    if (validItems.length === 0) return;

    unifiedPatientStore.addPrescription(patientId, validItems);
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Issue Prescription</h3>
              <p className="text-xs text-slate-500">Patient: {patientName} • Grounds in Jan Aushadhi formulary</p>
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
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">Medicine #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={item.drug}
                    onChange={(e) => handleUpdateItem(idx, 'drug', e.target.value)}
                    placeholder="Drug name (e.g. Amoxicillin 500mg, Metformin 500mg)"
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={item.dosage}
                    onChange={(e) => handleUpdateItem(idx, 'dosage', e.target.value)}
                    placeholder="Dose (1 tab)"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                  <input
                    type="text"
                    value={item.freq}
                    onChange={(e) => handleUpdateItem(idx, 'freq', e.target.value)}
                    placeholder="Freq (1-0-1)"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => handleUpdateItem(idx, 'duration', e.target.value)}
                    placeholder="Duration (5 days)"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={item.instructions}
                    onChange={(e) => handleUpdateItem(idx, 'instructions', e.target.value)}
                    placeholder="Instructions (e.g. After food with warm water)"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-teal-300 text-teal-700 hover:bg-teal-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Medicine
          </button>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
              Sign & Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
