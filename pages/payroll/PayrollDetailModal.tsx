import React, { useState } from 'react';
import { Payroll, PayrollDetailItem } from '../../types';
import { X, Receipt, Calendar, FileText, DollarSign, CheckCircle2, AlertCircle, Edit2, Trash2, Tag, Clock, XCircle, ChevronDown, ChevronRight, User as UserIcon } from 'lucide-react';

interface PayrollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: Payroll | null;
  onEdit?: (payroll: Payroll) => void;
  onDelete?: (payroll: Payroll) => void;
  onApprove?: (payrollId: string) => void;
  onPayment?: (payrollId: string) => void;
  approveLoading?: boolean;
  paymentLoading?: boolean;
}

const PayrollDetailModal: React.FC<PayrollDetailModalProps> = ({
  isOpen, onClose, payroll, onEdit, onDelete, onApprove, approveLoading, onPayment, paymentLoading
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [openUsers, setOpenUsers] = useState<Record<string, boolean>>({});
  const [openSnapshots, setOpenSnapshots] = useState<Record<string, boolean>>({});

  if (!isOpen || !payroll) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  const statusConfig = {
    draft: { label: 'Draft', icon: Clock, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    approved: { label: 'Approved', icon: CheckCircle2, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
    rejected: { label: 'Rejected', icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400' },
    paid: { label: 'Paid', icon: DollarSign, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
  };
  const status = statusConfig[payroll.status_payroll as keyof typeof statusConfig] || statusConfig.draft;

  const toggleUser = (userName: string) => {
    setOpenUsers(prev => ({ ...prev, [userName]: !prev[userName] }));
  };

  const toggleSnapshot = (userName: string) => {
    setOpenSnapshots(prev => ({ ...prev, [userName]: !prev[userName] }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="bg-eco-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Payroll - {payroll.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.border} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Salary Template</span>
                <span className="text-sm font-black text-gray-900">{payroll.salary_name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Salary Details</span>
                <span className="text-sm font-black text-gray-900">{payroll.salary_details?.map((detail: any) => detail.name).join(', ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Start Date</span>
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-eco-600" /> {formatDate(payroll.start_date)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">End Date</span>
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-eco-600" /> {formatDate(payroll.end_date)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Payment Date</span>
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-eco-600" /> {formatDate(payroll.payment_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200 text-left"
            >
              <div className="flex items-center gap-2">
                {!isDetailsOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                <span className="font-bold text-sm text-gray-700 uppercase tracking-wider">Payroll Details</span>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                {payroll.payroll_details?.length || 0} Employees
              </span>
            </button>

            {!isDetailsOpen && (
              <div className="p-4 space-y-4 bg-white">
                {(!payroll.payroll_details || payroll.payroll_details.length === 0) ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payroll details available.</p>
                ) : (
                  payroll.payroll_details.map((detail, idx) => {
                    const isUserOpen = !!openUsers[detail.name];
                    const isSnapshotOpen = !!openSnapshots[detail.name];
                    return (
                      <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleUser(detail.name)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            {isUserOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                            <UserIcon className="w-4 h-4 text-eco-600" />
                            <span className="font-bold text-sm text-gray-800">{detail.name}</span>
                          </div>
                          <span className="text-sm font-black text-eco-600">{formatCurrency(detail.net_salary)}</span>
                        </button>

                        {isUserOpen && (
                          <div className="p-3 border-t border-gray-100 space-y-3 bg-white">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 bg-emerald-50/30 border border-emerald-100/50 rounded-lg">
                                <span className="text-emerald-600 block font-medium">Total Allowance</span>
                                <span className="font-bold text-emerald-700">{formatCurrency(detail.total_allowance)}</span>
                              </div>
                              <div className="p-2 bg-rose-50/30 border border-rose-100/50 rounded-lg">
                                <span className="text-rose-600 block font-medium">Total Reduction</span>
                                <span className="font-bold text-rose-700">{formatCurrency(detail.total_reduction)}</span>
                              </div>
                            </div>

                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleSnapshot(detail.name)}
                                className="w-full flex items-center justify-between p-2 bg-gray-50/30 hover:bg-gray-50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-1.5">
                                  {isSnapshotOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Items Breakdown</span>
                                </div>
                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                                  {detail.items_snapshot?.length || 0} Items
                                </span>
                              </button>

                              {isSnapshotOpen && (
                                <div className="p-2 border-t border-gray-100 bg-gray-50/10 space-y-1">
                                  {(!detail.items_snapshot || detail.items_snapshot.length === 0) ? (
                                    <p className="text-[11px] text-gray-400 text-center py-2">No items in snapshot.</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-[11px] text-gray-600">
                                        <thead>
                                          <tr className="border-b border-gray-100 text-gray-400 font-bold">
                                            <th className="py-1">Name</th>
                                            <th className="py-1">Calc Type</th>
                                            <th className="py-1 text-right">Rate</th>
                                            <th className="py-1 text-right">Qty</th>
                                            <th className="py-1 text-right">Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.items_snapshot.map((item, itemIdx) => (
                                            <tr key={itemIdx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                              <td className="py-1.5 font-medium text-gray-800">{item.name}</td>
                                              <td className="py-1.5 text-gray-500 capitalize">{item.calculation_type?.replace('_', ' ') || '-'}</td>
                                              <td className="py-1.5 text-right">{formatCurrency(item.rate)}</td>
                                              <td className="py-1.5 text-right font-medium">{item.qty}</td>
                                              <td className="py-1.5 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Financial Breakdown</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Total Allowances</span>
                <p className="text-lg font-black text-emerald-700">{formatCurrency(payroll.total_allowances)}</p>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Total Reductions</span>
                <p className="text-lg font-black text-rose-700">{formatCurrency(payroll.total_reductions)}</p>
              </div>

              <div className="p-4 bg-eco-50 rounded-2xl border border-eco-200">
                <span className="text-[10px] font-bold text-eco-700 uppercase tracking-wider block mb-1">Total Net Salary</span>
                <p className="text-lg font-black text-eco-800">{formatCurrency(payroll.total_net_salary)}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Created At: <strong className="text-gray-700">{formatDate(payroll.created_at)}</strong></span>
            <span>Last Updated: <strong className="text-gray-700">{formatDate(payroll.updated_at)}</strong></span>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          {payroll.status_payroll !== 'approved' && onApprove && (
            <button
              onClick={() => onApprove(payroll.id)}
              disabled={approveLoading}
              className="px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 border border-transparent hover:border-green-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> {approveLoading ? 'Approving...' : 'Approve'}
            </button>
          )}
          {payroll.status_payroll === 'approved' && onPayment && (
            <button
              onClick={() => onPayment(payroll.id)}
              disabled={paymentLoading}
              className="px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 border border-transparent hover:border-green-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> {paymentLoading ? 'Paying...' : 'Confirm Payment Date'}
            </button>
          )}
          {payroll.status_payroll !== 'approved' && onEdit && (
            <button onClick={() => onEdit(payroll)} className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
          {payroll.status_payroll !== 'approved' && onDelete && (
            <button
              onClick={() => onDelete(payroll)}
              className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-transparent hover:border-red-200 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailModal;
