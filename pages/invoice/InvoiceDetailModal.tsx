import React from 'react';
import { Invoice } from '../../types';
import { formatDateOnly } from '../../services/helper';
import { X, ShoppingCart, Building2, Calendar, FileText, ArrowRight, Package, Users, Receipt, Percent, DollarSign, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Invoice | null;
  approveLoading?: boolean;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen, onClose, order, approveLoading
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
              <h2 className="text-base font-bold text-white leading-tight">Invoice Details - [ {order.code || 'Invoice'} ]</h2>
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

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Order Items</h3>

            <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-3">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Price after Disc</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-1.5">
              {order.delivery_order_items?.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900">{item.product_name || '---'}</p>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="text-xs font-bold text-gray-700">{item.quantity}</span>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="text-xs font-bold text-gray-700">{formatCurrency(item.price)}</span>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="text-xs font-bold text-gray-700">{formatCurrency(item.after_discount_price)}</span>
                  </div>
                  <div className="sm:col-span-3 text-right">
                    <span className="text-xs font-bold text-gray-700">{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Breakdown */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Billing Breakdown</h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" /> Items Subtotal
                </span>
                <span className="text-sm font-black text-gray-900">
                  {formatCurrency((order?.delivery_order_items || []).reduce((sum, item) => sum + (Number(item.total_price) || 0), 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Shipping Price
                </span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(order.shipping_price)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex items-center justify-between">
                <span className="text-sm font-black text-gray-900 uppercase">Payment Bill</span>
                <span className="text-lg font-black text-eco-700">{formatCurrency(order.payment_bill)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex items-center justify-between">
                <span className="text-sm font-black text-gray-900 uppercase">Payment Remaining</span>
                <span className="text-lg font-black text-eco-700">{formatCurrency(order.payment_remaining)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Created At</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{formatDateOnly(order.created_at)}</span>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Deadline</span>
              </div>
              <span className="text-xs font-bold text-red-700">{formatDateOnly(order.payment_deadline)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
