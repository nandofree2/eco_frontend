import React from 'react';
import { Customer, Membership } from '../../types';
import {
  X, Users, Mail, Phone, MapPin, Banknote,
  Wallet, TrendingUp, CreditCard, Crown, Edit2, FileText
} from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit?: (customer: Customer) => void;
  onDeposit?: (customer: Customer) => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen, onClose, customer, onEdit, onDeposit
}) => {
  if (!isOpen || !customer) return null;

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
  };

  const getMembershipBadge = (membership?: Membership) => {
    switch (membership) {
      case Membership.VIP: return { label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Crown className="w-3 h-3" /> };
      case Membership.Member: return { label: 'MEMBER', color: 'bg-green-100 text-green-700 border-green-200', icon: null };
      case Membership.Regular:
      default: return { label: 'REGULAR', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
    }
  };

  const badge = getMembershipBadge(customer.membership);
  const phoneValue = customer.phone_number || customer.phone;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Customer Details - [ {customer.name || 'Customer'} ]</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Identity */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-eco-100 text-eco-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Name</p>
                  <h3 className="text-base font-black text-gray-900 leading-tight truncate">{customer.name || '---'}</h3>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Membership</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${badge.color}`}>
                    {badge.icon}{badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Contact Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight break-words">{phoneValue || '---'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight break-words">{customer.email || '---'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Address</p>
                <p className="text-sm font-bold text-gray-900 leading-relaxed">{customer.address || 'No address provided'}</p>
              </div>
            </div>

            {customer.description && (
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Notes</p>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed italic">"{customer.description}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Financial Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Receivable</span>
                </div>
                <p className="text-sm font-black text-orange-600 leading-tight">{formatCurrency(customer.receivable)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Payable</span>
                </div>
                <p className="text-sm font-black text-red-600 leading-tight">{formatCurrency(customer.payable)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ordered</span>
                </div>
                <p className="text-sm font-black text-blue-600 leading-tight">{formatCurrency(customer.ordered_amount)}</p>
              </div>
              <div className="p-3 bg-eco-50 rounded-xl border border-eco-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Banknote className="w-3.5 h-3.5 text-eco-500" />
                  <span className="text-[9px] font-bold text-eco-700 uppercase tracking-widest">Deposit</span>
                </div>
                <p className="text-sm font-black text-eco-700 leading-tight">{formatCurrency(customer.deposit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-end gap-3 border-t border-gray-100">
          {onEdit && (
            <button onClick={() => onEdit(customer)} className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
          {onDeposit && (
            <button onClick={() => onDeposit(customer)} className="px-4 py-2.5 bg-eco-600 text-white hover:bg-eco-700 border border-transparent font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm">
              <Banknote className="w-4 h-4" /> Deposit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
