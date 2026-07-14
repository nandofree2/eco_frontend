import React from 'react';
import { useAccountReceivable } from './AccountReceivableScript';
import { formatDateOnly } from '../../services/helper';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, Receipt,
  ArrowUpDown, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter, Users, X, AlertTriangle, Check
} from 'lucide-react';
import AccountReceivableModal from './AccountReceivableModal';
import AccountReceivableDetailModal from './AccountReceivableDetailModal';
import ApproveConfirmModal from '../../components/ApproveConfirmModal';

const AccountReceivable: React.FC = () => {
  const {
    accountReceivables, loading, searchTerm, setSearchTerm, customerFilter, setCustomerFilter, approvalFilter,
    setApprovalFilter, sortBy, pagination, isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen, selectedAR, setSelectedAR,
    recordForDetail, setRecordForDetail, toasts, loadData, ability, ApprovalStatus, toggleSort, handlePageChange, formatCurrency,
    currentPage, perPage, handleCreateOrUpdate, actionLoading, approveLoading, serverErrors, setServerErrors, handleApprove,
    isApproveModalOpen, setApproveModalOpen, confirmApprove
  } = useAccountReceivable();

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Account Receivables"
        description="Manage account receivables and customer payments."
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
            <Receipt className="w-7 h-7 text-eco-600" /> Account Receivables
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage payments and outstanding invoices.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData(searchTerm, sortBy, currentPage, approvalFilter, customerFilter)}
            className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by AR or Invoice Code..."
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

          {/* Customer Filter */}
          <div className="relative group">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by Customer Name..."
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-44 shadow-sm text-sm"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
            {customerFilter && (
              <button onClick={() => setCustomerFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Filter">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Approval Filter */}
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" />
            <select
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-44 text-sm shadow-sm appearance-none font-bold text-gray-700"
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {approvalFilter && (
              <button onClick={() => setApprovalFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Filter">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {ability.can('create', 'AccountReceivable') && (
            <button
              onClick={() => { setSelectedAR(null); setServerErrors(null); setModalOpen(true); }}
              className="bg-eco-600 hover:bg-eco-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Registry Filter
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-xs font-medium text-gray-500">
              Displaying <span className="text-gray-900 font-bold">{accountReceivables.length}</span> records
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('code')}>
                  <div className="flex items-center gap-2">Code <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && accountReceivables.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : accountReceivables.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <Receipt className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No Account Receivables found.</p>
                    <p className="text-sm">Create a new record to get started.</p>
                  </td>
                </tr>
              ) : (
                accountReceivables.map((ar) => (
                  <tr key={ar.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <span
                        className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm cursor-pointer"
                        onClick={() => { setRecordForDetail(ar); setDetailModalOpen(true); }}
                      >
                        {ar.code || ar.id?.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {ar.customer_name || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {ar.invoice_code || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {formatCurrency(ar.amount)}
                        {ar.deposit_used && ar.deposit_used > 0 ? ` + ${formatCurrency(ar.deposit_used)} (Deposit)` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium capitalize">
                        {ar.payment_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {formatDateOnly(ar.payment_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${ar.approval_status === ApprovalStatus.Approved ? 'bg-green-50 text-green-700 border-green-100' :
                        ar.approval_status === ApprovalStatus.Rejected ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                        {ar.approval_status?.toUpperCase() || 'DRAFT'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      <AccountReceivableModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateOrUpdate}
        record={selectedAR}
        loading={actionLoading}
        errors={serverErrors}
      />

      <AccountReceivableDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        record={recordForDetail}
        onApprove={handleApprove}
        approveLoading={approveLoading}
        onEdit={() => { setSelectedAR(recordForDetail); setServerErrors(null); setDetailModalOpen(false); setModalOpen(true); }}
        canEdit={ability.can('update', 'AccountReceivable')}
        canApprove={ability.can('approve', 'AccountReceivable')}
      />
      <ApproveConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={confirmApprove}
        title="Approve Account Receivable"
        message="Are you sure you want to approve this account receivable? Once approved, it cannot be edited or deleted."
        loading={approveLoading}
      />
    </div>
  );
};

export default AccountReceivable;
