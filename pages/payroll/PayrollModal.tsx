import React, { useState, useEffect, useRef } from 'react';
import { Payroll } from '../../types';
import { X, Receipt, AlertCircle, Loader2, Calendar, FileText, DollarSign } from 'lucide-react';
import { formatYmdToDmy, parseDmyToYmd, formatDateInput } from '../../services/helper';
import SearchableDropdownSalary from '../../components/SearchableDropdownSalary';
import { api } from '../../services/api';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  payroll: Payroll | null;
  loading: boolean;
  serverErrors: Record<string, string[]> | null;
}

const PayrollModal: React.FC<PayrollModalProps> = ({
  isOpen, onClose, onSubmit, payroll, loading, serverErrors
}) => {
  const [salaryId, setSalaryId] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const startDatePickerRef = useRef<HTMLInputElement>(null);

  const [endDate, setEndDate] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const endDatePickerRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (payroll) {
        setSalaryId(payroll.salary_id || '');
        setName(payroll.name || '');

        const startYmd = payroll.start_date ? payroll.start_date.split('T')[0] : '';
        setStartDate(startYmd);
        setStartDateInput(formatYmdToDmy(startYmd));

        const endYmd = payroll.end_date ? payroll.end_date.split('T')[0] : '';
        setEndDate(endYmd);
        setEndDateInput(formatYmdToDmy(endYmd));

      } else {
        setSalaryId('');
        setName('');
        setStartDate('');
        setStartDateInput('');
        setEndDate('');
        setEndDateInput('');
      }
      setErrors({});
    }
  }, [isOpen, payroll]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!salaryId) newErrors.salary_id = 'Salary is required';
    if (!name.trim()) newErrors.name = 'Name is required';

    if (!startDateInput) {
      newErrors.start_date = 'Start date is required';
    } else if (!startDate) {
      newErrors.start_date = 'Start date must be in DD/MM/YYYY format';
    }

    if (!endDateInput) {
      newErrors.end_date = 'End date is required';
    } else if (!endDate) {
      newErrors.end_date = 'End date must be in DD/MM/YYYY format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (
    val: string,
    prevVal: string,
    setInput: (s: string) => void,
    setDate: (s: string) => void
  ) => {
    const formatted = formatDateInput(val, prevVal);
    setInput(formatted);
    if (formatted.replace(/[^0-9]/g, '').length === 8) {
      const ymd = parseDmyToYmd(formatted);
      setDate(ymd || '');
    } else {
      setDate('');
    }
  };

  const handlePickerChange = (
    ymd: string,
    setInput: (s: string) => void,
    setDate: (s: string) => void
  ) => {
    if (!ymd) return;
    setDate(ymd);
    setInput(formatYmdToDmy(ymd));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = {
      salary_id: salaryId,
      name: name,
      start_date: startDate,
      end_date: endDate,
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {payroll ? 'Edit Payroll' : 'New Payroll'}
              </h2>
              <p className="text-eco-100 text-xs font-medium">
                {payroll ? 'Update existing payroll record' : 'Create new payroll record'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="payroll-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SearchableDropdownSalary
                  label="Salary"
                  onSearch={api.salaries.salary_list}
                  value={salaryId}
                  onChange={(id) => setSalaryId(id)}
                  placeholder="Search Salary..."
                  error={!!errors.salary_id}
                  required={true}
                  compact={true}
                  initialName={payroll?.salary_name || payroll?.salary?.name}
                />
                {(errors.salary_id || serverErrors?.salary_id) && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.salary_id || serverErrors?.salary_id?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-eco-600" /> Payroll Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 border ${errors.name || serverErrors?.name ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-eco-500/20'} rounded-xl outline-none focus:ring-2 transition-all text-xs font-medium text-gray-800`}
                  placeholder="e.g. Monthly Payroll August 2026"
                />
                {(errors.name || serverErrors?.name) && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.name || serverErrors?.name?.[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-eco-600" /> Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={startDateInput}
                    onChange={(e) => handleDateChange(e.target.value, startDateInput, setStartDateInput, setStartDate)}
                    className={`w-full pl-3 pr-10 py-2 bg-gray-50 border ${errors.start_date || serverErrors?.start_date ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium text-gray-800`}
                  />
                  <button
                    type="button"
                    onClick={() => startDatePickerRef.current?.showPicker?.()}
                    className="absolute right-2 text-gray-400 hover:text-eco-600 transition-colors p-1"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    ref={startDatePickerRef}
                    value={startDate}
                    onChange={(e) => handlePickerChange(e.target.value, setStartDateInput, setStartDate)}
                    className="sr-only"
                  />
                </div>
                {(errors.start_date || serverErrors?.start_date) && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.start_date || serverErrors?.start_date?.[0]}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-eco-600" /> End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={endDateInput}
                    onChange={(e) => handleDateChange(e.target.value, endDateInput, setEndDateInput, setEndDate)}
                    className={`w-full pl-3 pr-10 py-2 bg-gray-50 border ${errors.end_date || serverErrors?.end_date ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium text-gray-800`}
                  />
                  <button
                    type="button"
                    onClick={() => endDatePickerRef.current?.showPicker?.()}
                    className="absolute right-2 text-gray-400 hover:text-eco-600 transition-colors p-1"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    ref={endDatePickerRef}
                    value={endDate}
                    onChange={(e) => handlePickerChange(e.target.value, setEndDateInput, setEndDate)}
                    className="sr-only"
                  />
                </div>
                {(errors.end_date || serverErrors?.end_date) && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.end_date || serverErrors?.end_date?.[0]}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="payroll-form"
            disabled={loading}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              payroll ? 'Update Payroll' : 'Create Payroll'
            )}
          </button>
        </div>
      </div >
    </div >
  );
};

export default PayrollModal;
