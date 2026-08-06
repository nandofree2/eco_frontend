import React from 'react';
import { usePayroll } from './payrollScript';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, Receipt,
  ArrowUpDown, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter, DollarSign, Calendar, Tag, AlertTriangle
} from 'lucide-react';
import PayrollModal from './PayrollModal';
import PayrollDetailModal from './PayrollDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import ApproveConfirmModal from '../../components/ApproveConfirmModal';
import PayrollPaymentModal from './PayrollPaymentModal';

const Payroll: React.FC = () => {
  const {
    payrolls, salaries, loading, searchTerm, setSearchTerm, salaryFilter, setSalaryFilter, sortBy, pagination, isModalOpen,
    setModalOpen, isDetailModalOpen, setDetailModalOpen, isDeleteModalOpen, setDeleteModalOpen, selectedPayroll, setSelectedPayroll,
    payrollForDetail, setPayrollForDetail, payrollToDelete, setPayrollToDelete, actionLoading, deleteLoading, serverErrors,
    setServerErrors, toasts, StatusPayroll, loadPayrolls, handleCreateOrUpdate, confirmDelete, toggleSort, handlePageChange,
    formatDate, currentPage, perPage, isApproveModalOpen, setApproveModalOpen, payrollToApprove, setPayrollToApprove, confirmApprove,
    approveLoading, handleApprove, handlePayment, handlePaymentDate, isPaymentModalOpen, setPaymentModalOpen, payrollToPayment, setPayrollToPayment,
    paymentLoading
  } = usePayroll();

  const getStatusBadge = (status: string | number) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case '1':
      case 'approved':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase border bg-blue-50 text-blue-700 border-blue-100">Approved</span>;
      case '2':
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase border bg-red-50 text-red-700 border-red-100">Rejected</span>;
      case '3':
      case 'paid':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase border bg-green-50 text-green-700 border-green-100">Paid</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase border bg-gray-100 text-gray-700 border-gray-200">Draft</span>;
    }
  };

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Payroll Records"
        description="Manage company payroll records, salary allowances, reductions, and net payouts."
      />

      {/* Toasts */}
      <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-eco-600" /> Payroll Records
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee salary payrolls and payouts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadPayrolls(searchTerm, sortBy, currentPage, salaryFilter)}
            className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search payroll title..."
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-64 shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Search">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative group">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" />
            <select
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-44 text-sm shadow-sm appearance-none font-bold text-gray-700"
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
            >
              <option value="">All Salaries</option>
              {salaries.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {salaryFilter && (
              <button onClick={() => setSalaryFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Filter">
                <XCircle className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:hidden">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          <button
            onClick={() => { setSelectedPayroll(null); setServerErrors(null); setModalOpen(true); }}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Payroll</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Registry Filter
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-xs font-medium text-gray-500">
              Displaying <span className="text-gray-900 font-bold">{payrolls.length}</span> records
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('start_date')}>
                  <div className="flex items-center gap-2">Period <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Salary Template</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Allowances</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Reductions</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Net Salary</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && payrolls.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <Receipt className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No Payroll records found.</p>
                    <p className="text-sm">Create a new Payroll to get started.</p>
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setPayrollForDetail(payroll); setDetailModalOpen(true); }}
                        className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm text-left block"
                      >
                        {payroll.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className='text-xs'> {formatDate(payroll.start_date)} - {formatDate(payroll.end_date)}</span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-emerald-600">
                        {payroll.salary_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-bold text-emerald-600">
                        {formatCurrency(payroll.total_allowances)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-bold text-rose-600">
                        {formatCurrency(payroll.total_reductions)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-black text-gray-900">
                        {formatCurrency(payroll.total_net_salary)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(payroll.status_payroll)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Record <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span>
              <span className="mx-2">of</span>
              <span className="text-eco-600">{pagination.total_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (currentPage > 3 && pagination.total_pages > 5) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > pagination.total_pages) pageNum = pagination.total_pages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                        ? 'bg-eco-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-eco-500 hover:text-eco-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <PayrollModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        payroll={selectedPayroll}
        loading={actionLoading}
        serverErrors={serverErrors}
      />
      <PayrollDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        payroll={payrollForDetail}
        onApprove={handleApprove}
        approveLoading={approveLoading}
        onPayment={handlePayment}
        paymentLoading={paymentLoading}
        onEdit={(p) => { setDetailModalOpen(false); setSelectedPayroll(p); setServerErrors(null); setModalOpen(true); }}
        onDelete={(p) => { setDetailModalOpen(false); setPayrollToDelete(p); setDeleteModalOpen(true); }}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Payroll Record"
        message={`Are you sure you want to permanently delete payroll "${payrollToDelete?.name}"?`}
        loading={deleteLoading}
      />
      <ApproveConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={confirmApprove}
        title="Approve Payroll"
        message="Are you sure you want to approve this Payroll? Once approved, it cannot be edited or deleted."
        loading={approveLoading}
      />
      <PayrollPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentDate}
        payroll={payrolls.find(p => p.id === payrollToPayment) || null}
        loading={paymentLoading}
        serverErrors={serverErrors}
      />
    </div>
  );
};

export default Payroll;