import React from 'react';
import { AdjustmentProduct, AdjustmentType, ApprovalStatus } from '../types';
import { X, SlidersHorizontal, Building2, Calendar, FileText, ArrowRight, Package, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface AdjustmentProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustment: AdjustmentProduct | null;
}

const AdjustmentProductDetailModal: React.FC<AdjustmentProductDetailModalProps> = ({
  isOpen,
  onClose,
  adjustment
}) => {
  if (!isOpen || !adjustment) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Adjustment Details</h2>
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">Inventory Record</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* General Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Branch</p>
                <h3 className="text-base font-black text-gray-900 leading-tight">{adjustment.branch_name}</h3>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                  ID: <span className="font-mono">{adjustment.branch_id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                  adjustment.approval_status === ApprovalStatus.Approved ? 'bg-green-100 text-green-700' :
                  adjustment.approval_status === ApprovalStatus.Pending ? 'bg-amber-100 text-amber-700' :
                  adjustment.approval_status === ApprovalStatus.Rejected ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {adjustment.approval_status === ApprovalStatus.Approved && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                  {adjustment.approval_status === ApprovalStatus.Pending && <Clock className="w-2.5 h-2.5 mr-1" />}
                  {adjustment.approval_status === ApprovalStatus.Rejected && <AlertCircle className="w-2.5 h-2.5 mr-1" />}
                  {adjustment.approval_status?.toUpperCase() || 'DRAFT'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  adjustment.adjustment_type === AdjustmentType.In ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {adjustment.adjustment_type === AdjustmentType.In ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Adjustment Type</p>
                  <h3 className={`text-base font-black leading-tight ${
                    adjustment.adjustment_type === AdjustmentType.In ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {adjustment.adjustment_type === AdjustmentType.In ? 'Stock IN (+)' : 'Stock OUT (-)'}
                  </h3>
                </div>
              </div>

              {adjustment.description && (
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Description</p>
                    <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">{adjustment.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Adjusted Items</h3>
            <div className="space-y-1.5">
              {adjustment.adjustment_product_items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.product_name}</p>
                      <p className="text-[9px] font-mono text-gray-500">{item.product_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    Qty: {item.quantity}
                  </div>
                </div>
              ))}
              {(!adjustment.adjustment_product_items || adjustment.adjustment_product_items.length === 0) && (
                <p className="text-sm text-gray-500 italic text-center py-4">No items recorded.</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Created At</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{formatDate(adjustment.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            ID: <span className="font-mono">{adjustment.id}</span>
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

export default AdjustmentProductDetailModal;
