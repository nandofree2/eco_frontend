import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Package, Tag, AlertCircle, ImagePlus, XCircle } from 'lucide-react';
import { SalaryItem, SalaryType, CalculationType } from '../../types';
import { api } from '../../services/api';

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  salary_item?: SalaryItem | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const SalaryModal: React.FC<SalaryModalProps> = ({ isOpen, onClose, onSubmit, salary_item, loading, serverErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    salary_type: SalaryType.Allowance,
    calculation_type: CalculationType.Fixed,
    amount: 0,
    description: '',
  });

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (salary_item) {
      setFormData({
        name: salary_item.name,
        salary_type: salary_item.salary_type,
        calculation_type: salary_item.calculation_type,
        amount: salary_item.amount,
        description: salary_item.description || '',
      });
    } else {
      setFormData({
        name: '',
        salary_type: SalaryType.Allowance,
        calculation_type: CalculationType.Fixed,
        amount: 0,
        description: '',
      });
    }
  }, [salary_item, isOpen]);

  useEffect(() => {
    if (serverErrors?.name) nameRef.current?.focus();
  }, [serverErrors]);

  if (!isOpen) return null;

  const hasError = (field: string) => serverErrors && serverErrors[field];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = { ...formData };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[95vh] flex flex-col">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            {salary_item ? 'Modify Salary Identity' : 'Register New Salary'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-transform active:scale-90"><X className="w-6 h-6" /></button>
        </div>

        {serverErrors && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">Validation Protocol Failure</p>
              <div className="mt-0.5 space-y-0.5">
                {Object.entries(serverErrors).map(([field, messages]) => (
                  <p key={field} className="text-xs text-red-600 leading-relaxed">
                    <span className="capitalize font-bold">{field.replace('_', ' ')}</span>: {(messages as string[]).join(', ')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2">
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('name') ? 'text-red-600' : 'text-gray-400'}`}>Name</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  ref={nameRef}
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all ${hasError('name') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="bonus, bpjs"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('salary_type') ? 'text-red-600' : 'text-gray-400'}`}>Salary Type</label>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1.5 border border-gray-100">
                <button type="button" onClick={() => setFormData({ ...formData, salary_type: SalaryType.Allowance })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.salary_type === SalaryType.Allowance ? 'bg-white text-eco-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Allowance
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, salary_type: SalaryType.Reduction })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.salary_type === SalaryType.Reduction ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Deduction
                </button>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Calculation Type</label>
              <div className="relative">
                <select
                  value={formData.calculation_type}
                  onChange={(e) => setFormData({ ...formData, calculation_type: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all appearance-none ${hasError('calculation_type') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                >
                  <option value={CalculationType.Fixed}>Fixed</option>
                  <option value={CalculationType.PercentOfTotalPayRate}>Percent of Total Pay Rate</option>
                  <option value={CalculationType.HourlyFix}>Hourly Fix</option>
                  <option value={CalculationType.HourlyPayRate}>Hourly Pay Rate</option>
                  <option value={CalculationType.OvertimeHourlyFix}>Overtime Hourly Fix</option>
                  <option value={CalculationType.OvertimeHourlyPayRate}>Overtime Hourly Pay Rate</option>
                  <option value={CalculationType.DailyPresentFix}>Daily Present Fix</option>
                  <option value={CalculationType.DailyPresentPayRate}>Daily Present Pay Rate</option>
                  <option value={CalculationType.DailySickFix}>Daily Sick Fix</option>
                  <option value={CalculationType.DailySickPayRate}>Daily Sick Pay Rate</option>
                  <option value={CalculationType.DailyAbsentFix}>Daily Absent Fix</option>
                  <option value={CalculationType.DailyAbsentPayRate}>Daily Absent Pay Rate</option>
                  <option value={CalculationType.MonthlyFix}>Monthly Fix</option>
                  <option value={CalculationType.MonthlyPayRate}>Monthly Pay Rate</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('amount') ? 'text-red-600' : 'text-gray-400'}`}>Amount</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                ref={nameRef}
                type="number"
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all ${hasError('amount') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Detailed Description</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 min-h-[100px] text-sm font-medium transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context regarding product origin, usage, or specifications..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-eco-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all text-sm uppercase tracking-widest">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {salary_item ? 'update' : 'Execute Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryModal;
