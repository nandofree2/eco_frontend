import React from 'react';
import { UserPayRate } from '../../types';
import { formatDateOnly } from '../../services/helper';
import {
  X, TrendingUp, Users, Calendar, DollarSign,
  CheckCircle2, XCircle, Edit2, Clock
} from 'lucide-react';

interface UserPayRateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UserPayRate | null;
  onEdit: () => void;
  canEdit?: boolean;
}

const UserPayRateDetailModal: React.FC<UserPayRateDetailModalProps> = ({
  isOpen, onClose, record, onEdit, canEdit
}) => {
  if (!isOpen || !record) return null;

  const formatCurrency = (value?: number | string) => {
    if (value == null || value === '') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(Number(value));
  };

  const rateItems = [
    { label: 'Monthly Rate', value: record.monthly_rate, color: 'text-eco-700', textSize: 'text-base' },
    { label: 'Daily Rate', value: record.daily_rate, color: 'text-gray-700', textSize: 'text-sm' },
    { label: 'Hourly Rate', value: record.hourly_rate, color: 'text-gray-700', textSize: 'text-sm' },
    { label: 'Overtime Hourly Rate', value: record.overtime_hourly_rate, color: 'text-amber-600', textSize: 'text-sm' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-eco-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                User Pay Rate
              </h2>
              <p className="text-eco-100 text-[10px] font-bold uppercase tracking-widest">Pay Rate Detail</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Active status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              record.is_active
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${record.is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
              {record.is_active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Employee */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Employee</p>
              <p className="text-sm font-black text-gray-900 leading-tight">{record.user_name || '---'}</p>
            </div>
          </div>

          {/* Effective Period */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Effective From</p>
                <p className="text-sm font-black text-gray-900">{formatDateOnly(record.effective_from) || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Effective Until</p>
                <p className="text-sm font-black text-gray-900">{formatDateOnly(record.effective_until) || '---'}</p>
              </div>
            </div>
          </div>

          {/* Rate Details */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">
              Compensation Rates
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
              {rateItems.map(({ label, value, color, textSize }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-eco-500" /> {label}
                  </span>
                  <span className={`${textSize} font-black ${color}`}>{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Created: <span className="font-bold text-gray-600">{formatDateOnly((record as any).created_at)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated: <span className="font-bold text-gray-600">{formatDateOnly((record as any).updated_at)}</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100 shrink-0 gap-3">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 hover:border-eco-400 hover:text-eco-700 text-gray-700 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPayRateDetailModal;
