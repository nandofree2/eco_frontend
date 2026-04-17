import React from 'react';
import { useAdjustmentProduct } from './AdjustmentProductScript';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, SlidersHorizontal,
  ArrowUpDown, CheckCircle2,
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Building2, X, AlertTriangle
} from 'lucide-react';
import AdjustmentProductModal from './AdjustmentProductModal';
import AdjustmentProductDetailModal from './AdjustmentProductDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const AdjustmentProduct: React.FC = () => {
  const {
    adjustments,
    branches,
    loading,
    searchTerm,
    setSearchTerm,
    branchFilter,
    setBranchFilter,
    sortBy,
    pagination,
    isModalOpen,
    setModalOpen,
    isDetailModalOpen,
    setDetailModalOpen,
    isDeleteModalOpen,
    setDeleteModalOpen,
    selectedAdjustment,
    setSelectedAdjustment,
    adjustmentForDetail,
    setAdjustmentForDetail,
    adjustmentToDelete,
    setAdjustmentToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadAdjustments,
    handleCreateOrUpdate,
    handleApprove,
    confirmDelete,
    toggleSort,
    handlePageChange,
    formatDate,
    currentPage,
    perPage,
    AdjustmentType,
    ApprovalStatus
  } = useAdjustmentProduct();

  return (
    <div className="space-y-4 relative min-h-[500px]">
      <SEO
        title="Stock Adjustments"
        description="Manage product stock adjustments across different branches."
      />
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

      <div className="space-y-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-eco-600" /> Stock Adjustments
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => loadAdjustments(searchTerm, sortBy, currentPage, branchFilter)} className="p-1.5 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-lg transition-all border border-gray-200 bg-white shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-56 text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={() => { setSelectedAdjustment(null); setServerErrors(null); setModalOpen(true); }} className="bg-eco-600 hover:bg-eco-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all shadow-md shadow-eco-200 active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-2 items-stretch lg:items-center">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
            <div className="relative flex-1 sm:flex-none">
              <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                className="w-full sm:w-48 pl-8 pr-6 py-1.5 bg-gray-50 border-none rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-bold text-gray-700 appearance-none cursor-pointer"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            {branchFilter && (
              <button
                onClick={() => setBranchFilter('')}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all bg-gray-50"
                title="Clear Filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-1.5 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3 h-3" /> Context
            </div>
            <div className="h-3 w-px bg-gray-200"></div>
            <div className="text-[10px] font-medium text-gray-500">
              <span className="text-gray-900 font-bold">{adjustments.length}</span> records
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('created_at')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-2.5 h-2.5 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branch</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Items</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && adjustments.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (
                adjustments.map((adj) => (
                  <tr key={adj.id} className="group hover:bg-eco-50/20 transition-all duration-200">
                    <td className="px-4 py-2">
                      <button
                        onClick={() => { setAdjustmentForDetail(adj); setDetailModalOpen(true); }}
                        className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-[13px] whitespace-nowrap"
                      >
                        {formatDate(adj.created_at)}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
                        {adj.branch_name}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${adj.adjustment_type === AdjustmentType.In
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {adj.adjustment_type === AdjustmentType.In ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${adj.approval_status === ApprovalStatus.Approved ? 'bg-green-100 text-green-700' :
                        adj.approval_status === ApprovalStatus.Pending ? 'bg-amber-100 text-amber-700' :
                          adj.approval_status === ApprovalStatus.Rejected ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {adj.approval_status?.toUpperCase() || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[12px] text-gray-700 line-clamp-1">{adj.description || '---'}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-50 text-gray-700 border border-gray-200">
                        {adj.adjustment_product_items?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {adj.approval_status !== ApprovalStatus.Approved ? (
                          <>
                            <button
                              onClick={() => handleApprove(adj.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Approve"
                              disabled={actionLoading}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setSelectedAdjustment(adj); setServerErrors(null); setModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setAdjustmentToDelete(adj); setDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span>-<span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span>
              <span className="mx-1">of</span>
              <span className="text-eco-600">{pagination.total_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdjustmentProductModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        adjustment={selectedAdjustment}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <AdjustmentProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        adjustment={adjustmentForDetail}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Stock Adjustment"
        message={`Are you sure you want to remove this stock adjustment? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdjustmentProduct;
