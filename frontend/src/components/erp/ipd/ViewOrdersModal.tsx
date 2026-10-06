import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  Plus,
  Pill,
  FlaskConical,
  Activity,
  CheckCircle2,
  Utensils
} from 'lucide-react';
import { ipdBedService, type IpdAdmission, type IpdDoctorOrder } from '../../../services/ipdBedService';

interface ViewOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  admission: IpdAdmission | null;
}

export const ViewOrdersModal: React.FC<ViewOrdersModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  admission,
}) => {
  const [orders, setOrders] = useState<IpdDoctorOrder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderType, setOrderType] = useState<IpdDoctorOrder['order_type']>('Medication');
  const [description, setDescription] = useState('');
  const [orderedBy, setOrderedBy] = useState('Dr. Mohamed');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !admission) return;
    const fetchOrders = async () => {
      const data = await ipdBedService.getDoctorOrders(admission.id, admission.patient_health_id);
      setOrders(data);
    };
    fetchOrders();
  }, [isOpen, admission]);

  if (!isOpen || !admission) return null;

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const newOrder = await ipdBedService.addDoctorOrder({
        admission_id: admission.id,
        patient_health_id: admission.patient_health_id,
        order_type: orderType,
        description: description.trim(),
        ordered_by: orderedBy,
      });
      setOrders([newOrder, ...orders]);
      setDescription('');
      setShowAddForm(false);
      onSuccess(`Order added for ${admission.patient_name}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'Lab Investigation':
        return <FlaskConical className="w-4 h-4 text-blue-600" />;
      case 'Diet':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/30">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Doctor Orders & Treatment Plan</h3>
              <p className="text-xs text-slate-500">
                Bed {admission.bed_number} • {admission.patient_name} ({admission.patient_health_id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders list and Add action */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Active Orders ({orders.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel New Order' : 'Add New Order'}</span>
            </button>
          </div>

          {/* Collapsible Add Order Form */}
          {showAddForm && (
            <form onSubmit={handleAddOrder} className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-3 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order Category</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Medication">Medication Order</option>
                    <option value="Lab Investigation">Lab Investigation</option>
                    <option value="Radiology">Radiology / Imaging</option>
                    <option value="Nursing Procedure">Nursing Procedure</option>
                    <option value="Diet">Dietary Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ordering Physician</label>
                  <input
                    type="text"
                    value={orderedBy}
                    onChange={(e) => setOrderedBy(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prescription / Order Instructions</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. IV Ceftriaxone 1g IV BD, Repeat Serum Electrolytes in 6h..."
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Order</span>
                </button>
              </div>
            </form>
          )}

          {/* Orders Listing */}
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No orders logged for this patient admission yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(ord.order_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ord.description}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                          {ord.order_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>Ordered by: <strong className="text-slate-700">{ord.ordered_by}</strong></span>
                        <span>•</span>
                        <span>{new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{ord.status}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
