import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { EmployeeDailyRecord } from '../../types';

interface EmployeeDailyRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeDailyRecord | null;
  onSave: (data: any) => void;
  loading: boolean;
  errors: any;
}

const EmployeeDailyRecordModal: React.FC<EmployeeDailyRecordModalProps> = ({
  isOpen, onClose, record, onSave, loading, errors
}) => {
  // Helper to format Date object to YYYY-MM-DD for date input
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    attendance_date: getTodayISO(),
    check_in: '',
    check_out: '',
    status_attendance: 'present',
    overtime_hours: 0,
    description: '',
  });

  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({
        attendance_date: record.attendance_date ? record.attendance_date.split('T')[0] : getTodayISO(),
        check_in: record.check_in || '',
        check_out: record.check_out || '',
        status_attendance: record.status_attendance || 'present',
        overtime_hours: record.overtime_hours ?? 0,
        description: record.description || '',
      });
    } else {
      setFormData({
        attendance_date: getTodayISO(),
        check_in: '',
        check_out: '',
        status_attendance: 'present',
        overtime_hours: 0,
        description: '',
      });
    }
    setValidationWarning(null);
  }, [record, isOpen]);

  // Validation warning check
  useEffect(() => {
    if (formData.check_in && formData.check_out && formData.check_in > formData.check_out) {
      setValidationWarning('Check-out time is earlier than Check-in time.');
    } else if (formData.overtime_hours < 0) {
      setValidationWarning('Overtime hours cannot be negative.');
    } else {
      setValidationWarning(null);
    }
  }, [formData.check_in, formData.check_out, formData.overtime_hours]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {record ? 'Edit Employee Daily Record' : 'New Employee Daily Record'}
              </h2>
              <p className="text-eco-100 text-xs font-medium">
                {record ? 'Update daily attendance details' : 'Record new attendance & overtime data'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Backend / Server Errors */}
          {errors?.general && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <ul className="text-xs font-medium space-y-1">
                {errors.general.map((err: string, i: number) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* Validation Warning Alert */}
          {validationWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-semibold animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationWarning}</span>
            </div>
          )}

          <form id="edr-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attendance Date */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Attendance Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.attendance_date}
                  onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all text-xs font-medium text-gray-800 cursor-pointer"
                  required
                />
                {errors?.attendance_date && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.attendance_date[0]}</p>}
              </div>

              {/* Status Attendance */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Status Attendance <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status_attendance}
                  onChange={(e) => setFormData({ ...formData, status_attendance: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all text-xs font-medium text-gray-800"
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="sick_leave">Sick Leave</option>
                </select>
                {errors?.status_attendance && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.status_attendance[0]}</p>}
              </div>

              {/* Check In */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Check In
                </label>
                <input
                  type="time"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all text-xs font-medium text-gray-800 cursor-pointer"
                />
                {errors?.check_in && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.check_in[0]}</p>}
              </div>

              {/* Check Out */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Check Out
                </label>
                <input
                  type="time"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all text-xs font-medium text-gray-800 cursor-pointer"
                />
                {errors?.check_out && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.check_out[0]}</p>}
              </div>

              {/* Overtime Hours */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Overtime Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.overtime_hours}
                  onChange={(e) => setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all text-xs font-medium text-gray-800"
                  placeholder="0"
                />
                {errors?.overtime_hours && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.overtime_hours[0]}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all text-xs font-medium text-gray-800"
                  placeholder="Enter additional notes or description..."
                />
                {errors?.description && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.description[0]}</p>}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
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
            form="edr-form"
            disabled={loading}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              record ? 'Update Record' : 'Save Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDailyRecordModal;
