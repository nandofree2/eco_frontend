import React from 'react';
import { EmployeeDailyRecord } from '../../types';
import {
  X, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Edit2, FileText, Timer
} from 'lucide-react';

interface EmployeeDailyRecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeDailyRecord | null;
  onEdit?: (record: EmployeeDailyRecord) => void;
  canEdit?: boolean;
}

const EmployeeDailyRecordDetailModal: React.FC<EmployeeDailyRecordDetailModalProps> = ({
  isOpen, onClose, record, onEdit, canEdit = true
}) => {
  if (!isOpen || !record) return null;

  const getStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'present') {
      return {
        label: 'Present',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      };
    } else if (s === 'absent') {
      return {
        label: 'Absent',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <XCircle className="w-4 h-4 text-rose-600" />
      };
    } else if (s === 'sick_leave' || s === 'sick leave') {
      return {
        label: 'Sick Leave',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
      };
    }
    return {
      label: status || 'Unknown',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: null
    };
  };

  const badge = getStatusBadge(record.status_attendance);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Employee Daily Record Details</h2>
              <p className="text-eco-100 text-xs font-medium">Viewing record details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-xl"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Attendance Date */}
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-eco-100 text-eco-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Attendance Date</p>
                <h3 className="text-sm font-black text-gray-900 leading-tight">{record.attendance_date || '---'}</h3>
              </div>
            </div>

            {/* Status Attendance */}
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status Attendance</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Time & Overtime Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Check In */}
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Check In</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.check_in || '---'}</p>
              </div>
            </div>

            {/* Check Out */}
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Check Out</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.check_out || '---'}</p>
              </div>
            </div>

            {/* Overtime Hours */}
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Overtime</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.overtime_hours ?? 0} hrs</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description / Notes</p>
              <p className="text-xs font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                {record.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
          >
            Close
          </button>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="bg-eco-600 hover:bg-eco-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDailyRecordDetailModal;
