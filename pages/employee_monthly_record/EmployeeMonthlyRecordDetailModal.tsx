import React from 'react';
import { EmployeeMonthlyRecord } from '../../types';
import {
  X, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Edit2, FileText, Timer, Package
} from 'lucide-react';

interface EmployeeMonthlyRecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeMonthlyRecord | null;
}

const EmployeeMonthlyRecordDetailModal: React.FC<EmployeeMonthlyRecordDetailModalProps> = ({
  isOpen, onClose, record
}) => {
  if (!isOpen || !record) return null;


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Monthly Record Details [ {record.month_date || '---'} ]</h2>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Days Present</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.total_days_present || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Days Absent</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.total_days_absent || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Sick Leave</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.total_days_sick ?? 0}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Overtime</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{record.total_overtime_hours ?? 0} hrs</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Daily Records</h3>

            <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-3">Attendance Date</div>
              <div className="col-span-2 text-center">Check In</div>
              <div className="col-span-2 text-center">Check Out</div>
              <div className="col-span-2 text-center">Overtime</div>
              <div className="col-span-2 text-center">Status</div>

            </div>

            <div className="space-y-1.5">
              {record.employee_daily_records?.map((item, index) => {
                const attrs = (item as any).attributes || item;
                return (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-bold text-gray-900">{attrs.attendance_date}</p>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-xs font-bold text-gray-700">{attrs.check_in || '-'}</span>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-xs font-bold text-gray-700">{attrs.check_out || '-'}</span>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-xs font-bold text-gray-700">{attrs.overtime_hours} hrs</span>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-xs font-bold text-gray-700">{attrs.status_attendance}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonthlyRecordDetailModal;
