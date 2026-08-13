import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { UserPayRate } from '../../types';
import SearchableDropdown from '../../components/SearchableDropdown';
import { api } from '../../services/api';

interface UserPayrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UserPayRate | null;
  onSave: (data: any) => void;
  loading: boolean;
  errors: any;
}

const UserPayrateModal: React.FC<UserPayrateModalProps> = ({
  isOpen, onClose, record, onSave, loading, errors
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    monthly_rate: 0,
    daily_rate: 0,
    hourly_rate: 0,
    overtime_hourly_rate: 0,
    effective_from: new Date().toISOString().split('T')[0],
    effective_until: new Date().toISOString().split('T')[0],
    is_active: true,
  });

  useEffect(() => {
    if (record) {
      setFormData({
        user_id: record.user_id,
        user_name: record.user_name || '',
        monthly_rate: record.monthly_rate,
        daily_rate: record.daily_rate,
        hourly_rate: record.hourly_rate,
        overtime_hourly_rate: record.overtime_hourly_rate,
        effective_from: record.effective_from,
        effective_until: record.effective_until,
        is_active: record.is_active,
      });
    } else {
      setFormData({
        user_id: '',
        user_name: '',
        monthly_rate: 0,
        daily_rate: 0,
        hourly_rate: 0,
        overtime_hourly_rate: 0,
        effective_from: new Date().toISOString().split('T')[0],
        effective_until: new Date().toISOString().split('T')[0],
        is_active: true,
      });
    }
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      user_id: formData.user_id,
      monthly_rate: Number(formData.monthly_rate),
      daily_rate: Number(formData.daily_rate),
      hourly_rate: Number(formData.hourly_rate),
      overtime_hourly_rate: Number(formData.overtime_hourly_rate),
      effective_from: formData.effective_from,
      effective_until: formData.effective_until,
      is_active: formData.is_active,
    });
  };

  const safeErrors = errors || {};

  const rateFields = [
    { key: 'monthly_rate' as const, label: 'Monthly Rate', required: true },
    { key: 'daily_rate' as const, label: 'Daily Rate', required: false },
    { key: 'hourly_rate' as const, label: 'Hourly Rate', required: false },
    { key: 'overtime_hourly_rate' as const, label: 'Overtime Hourly Rate', required: false },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {record ? 'Edit User Pay Rate' : 'New User Pay Rate'}
              </h2>
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">
                {record ? 'Update existing pay rate' : 'Set employee compensation rates'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {safeErrors?.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <ul className="text-xs font-medium space-y-1">
                {safeErrors.general.map((err: string, i: number) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <form id="upr-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <SearchableDropdown
                  label="Employee"
                  onSearch={async (q: string) => { const res = await api.users.user_pay_rate_list(q); return res.data; }}
                  value={formData.user_id}
                  onChange={(id, name) => setFormData({ ...formData, user_id: id, user_name: name })}
                  placeholder="Search employee..."
                  error={!!safeErrors.user_id}
                  required={true}
                  initialName={formData.user_name}
                  compact={true}
                />
                {safeErrors.user_id && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {safeErrors.user_id}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full h-[30px] px-3 py-1.5 bg-gray-50 border border-gray-200 focus:ring-eco-500/20 rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium text-gray-800 cursor-pointer"
                  required
                />
                {safeErrors?.effective_from && (
                  <p className="text-red-500 text-[10px] mt-0.5 font-medium">{safeErrors.effective_from[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">
                  Effective Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effective_until}
                  onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full h-[30px] px-3 py-1.5 bg-gray-50 border border-gray-200 focus:ring-eco-500/20 rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium text-gray-800 cursor-pointer"
                  required
                />
                {safeErrors?.effective_until && (
                  <p className="text-red-500 text-[10px] mt-0.5 font-medium">{safeErrors.effective_until[0]}</p>
                )}
              </div>
            </div>

            {/* Rate Fields */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">
                Compensation Rates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rateFields.map(({ key, label, required }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Rp</span>
                      <input
                        type="number"
                        step="any"
                        value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium"
                        placeholder="0"
                        required={required}
                        min="0"
                      />
                    </div>
                    {safeErrors?.[key] && (
                      <p className="text-red-500 text-[10px] mt-0.5 font-medium">{safeErrors[key][0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-eco-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-eco-600"></div>
              </label>
              <span className="text-xs font-bold text-gray-700">Active Rate</span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upr-form"
            disabled={loading || (!record && !formData.user_id)}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            ) : (
              record ? 'Update Record' : 'Save Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPayrateModal;
