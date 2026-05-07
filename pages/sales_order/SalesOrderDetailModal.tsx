import React from 'react';
import { SalesOrder } from '../../types';
import { X, ShoppingCart, Building2, Calendar, FileText, ArrowRight, Package, Users, Receipt, Percent, DollarSign, CheckCircle2 } from 'lucide-react';

interface SalesOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrder | null;
}

const SalesOrderDetailModal: React.FC<SalesOrderDetailModalProps> = ({
  isOpen, onClose, order
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
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">{order.code || 'Sales Order'}</p>
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

            {order.tax_include && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-eco-50 text-eco-700 border border-eco-100">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Tax Included
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
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-1.5">
              {order.sales_order_items?.map((item, index) => (
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
                  <div className="sm:col-span-3 text-right">
                    <span className="text-xs font-medium text-gray-600">{formatCurrency(item.price)}</span>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="text-xs font-black text-gray-900">{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
              {(!order.sales_order_items || order.sales_order_items.length === 0) && (
                <p className="text-sm text-gray-500 italic text-center py-4">No items recorded.</p>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Pricing Breakdown</h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" /> Subtotal
                </span>
                <span className="text-sm font-black text-gray-900">{formatCurrency(order.total_price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-orange-400" /> Discount
                </span>
                <span className="text-sm font-bold text-orange-600">- {formatCurrency(order.discount_price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Tax
                  {order.tax_include && <span className="text-[8px] bg-eco-100 text-eco-700 px-1.5 py-0.5 rounded font-black">INCL</span>}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {order.tax_include ? 'Included' : `+ ${formatCurrency(order.tax_price)}`}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex items-center justify-between">
                <span className="text-sm font-black text-gray-900 uppercase">Grand Total</span>
                <span className="text-lg font-black text-eco-700">{formatCurrency(order.grand_total)}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
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
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            ID: <span className="font-mono">{order.id}</span>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            Close View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetailModal;
