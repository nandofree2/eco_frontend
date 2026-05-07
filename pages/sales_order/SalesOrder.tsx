import React from 'react';
import { useSalesOrder } from './SalesOrderScript';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, ShoppingCart,
  ArrowUpDown, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter, Building2, Users, X, AlertTriangle
} from 'lucide-react';
import SalesOrderModal from './SalesOrderModal';
import SalesOrderDetailModal from './SalesOrderDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const SalesOrder: React.FC = () => {
  const {
    orders, branches, customers, loading, searchTerm, setSearchTerm,
    branchFilter, setBranchFilter, customerFilter, setCustomerFilter,
    sortBy, pagination, isModalOpen, setModalOpen,
    isDetailModalOpen, setDetailModalOpen, isDeleteModalOpen, setDeleteModalOpen,
    selectedOrder, setSelectedOrder, orderForDetail, setOrderForDetail,
    orderToDelete, setOrderToDelete, actionLoading, deleteLoading,
    serverErrors, setServerErrors, toasts, loadOrders,
    handleCreateOrUpdate, confirmDelete, toggleSort, handlePageChange,
    formatDate, formatCurrency, currentPage, perPage
  } = useSalesOrder();

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Sales Orders"
        description="Manage sales orders across different branches and customers."
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
            <ShoppingCart className="w-7 h-7 text-eco-600" /> Sales Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage sales orders across different branches and customers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadOrders(searchTerm, sortBy, currentPage, branchFilter, customerFilter)}
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
              placeholder="Search code or description..."
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

          {/* Branch Filter */}
          <div className="relative group">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" />
            <select
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-44 text-sm shadow-sm appearance-none font-bold text-gray-700"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {branchFilter && (
              <button onClick={() => setBranchFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Filter">
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:hidden">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Customer Filter */}
          <div className="relative group">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" />
            <select
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-44 text-sm shadow-sm appearance-none font-bold text-gray-700"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {customerFilter && (
              <button onClick={() => setCustomerFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Filter">
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:hidden">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* New Order Button */}
          <button
            onClick={() => { setSelectedOrder(null); setServerErrors(null); setModalOpen(true); }}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Order</span>
          </button>
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
              Displaying <span className="text-gray-900 font-bold">{orders.length}</span> records
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
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('grand_total')}>
                  <div className="flex items-center justify-end gap-2">Grand Total <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && orders.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No sales orders found.</p>
                    <p className="text-sm">Create a new sales order to get started.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setOrderForDetail(order); setDetailModalOpen(true); }}
                        className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm"
                      >
                        {order.code || order.id?.slice(0, 8)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Building2 className="w-4 h-4 text-gray-400" /> {order.branch_name || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Users className="w-4 h-4 text-gray-400" /> {order.customer_name || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-white text-gray-900 border border-gray-200 shadow-sm">
                        {order.sales_order_items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-eco-700">{formatCurrency(order.grand_total)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button
                          onClick={() => { setSelectedOrder(order); setServerErrors(null); setModalOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                          title="Edit Order"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setOrderToDelete(order); setDeleteModalOpen(true); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Modals */}
      <SalesOrderModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        order={selectedOrder}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <SalesOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        order={orderForDetail}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Sales Order"
        message="Are you sure you want to remove this sales order? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};

export default SalesOrder;
