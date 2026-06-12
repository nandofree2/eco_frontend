import React from 'react';
import { DeliveryOrder } from '../../types';
import { X, ShoppingCart, Building2, Calendar, FileText, ArrowRight, Package, Users, Receipt, Percent, DollarSign, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

interface DeliveryOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder | null;
  onEdit?: (order: DeliveryOrder) => void;
  onApprove?: (id: string) => void;
  approveLoading?: boolean;
}

const DeliveryOrderDetailModal: React.FC<DeliveryOrderDetailModalProps> = ({
  isOpen, onClose, order, onEdit, onApprove, approveLoading
}) => {
  if (!isOpen || !order) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Order Details</h2>
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">{order.code || 'Delivery Order'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* General Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Branch</p>
                  <h3 className="text-base font-black text-gray-900 leading-tight">{order.branch_name || '---'}</h3>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Customer</p>
                  <h3 className="text-base font-black text-gray-900 leading-tight">{order.customer_name || '---'}</h3>
                </div>
              </div>
            </div>

            {order.description && (
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Description</p>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed">{order.description}</p>
                </div>
              </div>
            )}

          </div>

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Order Items</h3>

            {/* Items header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-right">Qty</div>

            </div>

            <div className="space-y-1.5">
              {order.delivery_order_items?.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="sm:col-span-5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900">{item.product_name || '---'}</p>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="text-xs font-bold text-gray-700">{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Created At</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">

          <div className="flex items-center gap-3">
            {order.approval_status !== 'approved' && onApprove && (
              <button
                onClick={() => onApprove(order.id)}
                disabled={approveLoading}
                className="px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 border border-transparent hover:border-green-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> {approveLoading ? 'Approving...' : 'Approve'}
              </button>
            )}
            {order.approval_status !== 'approved' && onEdit && (
              <button onClick={() => onEdit(order)} className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderDetailModal;
