import React from 'react';
import { AccountReceivable } from '../../types';
import { formatDateOnly } from '../../services/helper';
import {
  X, Receipt, Users, FileText, Calendar, DollarSign,
  CheckCircle2, Clock, XCircle, Edit2, Check, MapPin, CreditCard, Building2
} from 'lucide-react';

interface AccountReceivableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AccountReceivable | null;
  onEdit: () => void;
  onApprove: (id: string) => void;
  approveLoading?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
}

const AccountReceivableDetailModal: React.FC<AccountReceivableDetailModalProps> = ({
  isOpen, onClose, record, onEdit, onApprove, approveLoading, canEdit, canApprove
}) => {
  if (!isOpen || !record) return null;

  const formatCurrency = (value?: number | string) => {
    if (value == null || value === '') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(Number(value));
  };

  const isDraft = record.approval_status === 'draft';
  const isApproved = record.approval_status === 'approved';
  const isRejected = record.approval_status === 'rejected';

  const statusConfig = {
    draft:    { label: 'Draft',    icon: Clock,         bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
    approved: { label: 'Approved', icon: CheckCircle2,  bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-400'  },
    rejected: { label: 'Rejected', icon: XCircle,       bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400'    },
  };
  const status = statusConfig[record.approval_status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-eco-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Account Receivable — {record.code || record.id?.slice(0, 8)}
              </h2>
              <p className="text-eco-100 text-[10px] font-bold uppercase tracking-widest">Payment Record Detail</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.border} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Customer & Invoice Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Customer</p>
                <p className="text-sm font-black text-gray-900 leading-tight">{record.customer_name || '---'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Invoice</p>
                <p className="text-sm font-black text-gray-900 leading-tight">{record.invoice_code || '---'}</p>
              </div>
            </div>
          </div>

          {/* Customer Address */}
          {(record as any).customer_address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Customer Address</p>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{(record as any).customer_address}</p>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">
              Payment Details
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
              {/* Amount Paid */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-eco-500" /> Amount Paid
                </span>
                <span className="text-base font-black text-eco-700">{formatCurrency(record.amount)}</span>
              </div>

              {/* Customer Deposit */}
              {(record as any).customer_deposit != null && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Customer Deposit
                  </span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency((record as any).customer_deposit)}</span>
                </div>
              )}

              {/* Payment Remaining */}
              {(record as any).payment_remaining != null && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Invoice Remaining
                  </span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency((record as any).payment_remaining)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Payment Type</p>
                <p className="text-sm font-black text-gray-900 capitalize">{record.payment_type || '---'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Payment Date</p>
                <p className="text-sm font-black text-gray-900">{formatDateOnly(record.payment_date) || '---'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Branch</p>
                <p className="text-sm font-black text-gray-900">{(record as any).branch_name || '---'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Created: <span className="font-bold text-gray-600">{formatDateOnly((record as any).created_at)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Updated: <span className="font-bold text-gray-600">{formatDateOnly((record as any).updated_at)}</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100 shrink-0 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* Edit button — only when draft */}
            {canEdit && isDraft && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 hover:border-eco-400 hover:text-eco-700 text-gray-700 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}

            {/* Approve button — only when draft */}
            {canApprove && isDraft && (
              <button
                type="button"
                onClick={() => onApprove(record.id)}
                disabled={approveLoading}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-eco-600 hover:bg-eco-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                {approveLoading ? 'Approving...' : 'Approve'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivableDetailModal;
