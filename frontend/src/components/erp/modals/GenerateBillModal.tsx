import React, { useState } from 'react';
import { X, CreditCard, Plus, Trash2, IndianRupee } from 'lucide-react';
import { unifiedPatientStore, type BillItem } from '../../../services/unifiedPatientStore';

interface GenerateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onBilled?: () => void;
}

export const GenerateBillModal: React.FC<GenerateBillModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onBilled,
}) => {
  const [items, setItems] = useState<BillItem[]>([
    { desc: 'OPD Consultation Fee (General Medicine)', amount: 300 },
    { desc: 'Basic Vitals & Triage Assessment', amount: 50 },
    { desc: 'Prescription Pharmacy Formulation', amount: 120 },
  ]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Govt Scheme'>('UPI');

  if (!isOpen) return null;

  const total = items.reduce((acc, i) => acc + (i.amount || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { desc: 'Additional Clinical Service', amount: 100 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: keyof BillItem, val: string | number) => {
    const updated = [...items];
    if (field === 'amount') {
      updated[idx].amount = Number(val) || 0;
    } else {
      updated[idx].desc = String(val);
    }
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    unifiedPatientStore.generateBill(patientId, items, paymentStatus);
    if (onBilled) onBilled();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Generate Invoice & Bill</h3>
              <p className="text-xs text-slate-500">Patient: {patientName}</p>
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
          <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={item.desc}
                  onChange={(e) => handleUpdateItem(idx, 'desc', e.target.value)}
                  placeholder="Service description"
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
                <div className="relative w-28">
                  <span className="absolute left-2 top-2 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={(e) => handleUpdateItem(idx, 'amount', e.target.value)}
                    className="w-full text-xs pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg bg-white font-bold"
                  />
                </div>
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
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-1.5 border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Line Item
          </button>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'UPI' | 'Card' | 'Govt Scheme')}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Govt Scheme">Govt Scheme (CMCHS)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending')}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Paid">Mark as Paid (Receipt)</option>
                <option value="Pending">Pending Collection</option>
              </select>
            </div>
          </div>

          {/* Total summary */}
          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900">Total Invoice Amount:</span>
            <span className="text-lg font-black text-teal-800 flex items-center">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {total.toLocaleString('en-IN')}
            </span>
          </div>

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
              Generate Bill & Update Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
