import React from 'react';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, Boxes,
  ArrowUpDown, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Eye, Package, Building2
} from 'lucide-react';
import StockProductModal from './StockProductModal';
import StockProductDetailModal from './StockProductDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useStockProduct } from './StockProductScript';

const StockProduct: React.FC = () => {
  const {
    stockProducts,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    currentPage,
    pagination,
    isModalOpen,
    setModalOpen,
    isDetailModalOpen,
    setDetailModalOpen,
    isDeleteModalOpen,
    setDeleteModalOpen,
    selectedStockProduct,
    setSelectedStockProduct,
    stockProductToDelete,
    setStockProductToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadStockProducts,
    handleCreateOrUpdate,
    confirmDelete,
    toggleSort,
    handlePageChange
  } = useStockProduct();

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Inventory Tracking"
        description="Monitor physical and marketing stock levels across all branches."
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-eco-600" /> Inventory Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor physical and marketing stock levels across branches.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => loadStockProducts()} className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search product or branch..."
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => { setSelectedStockProduct(null); setServerErrors(null); setModalOpen(true); }} className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Track Stock</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Context
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-xs font-medium text-gray-500">
              Displaying <span className="text-gray-900 font-bold">{stockProducts.length}</span> tracking entries
            </div>
          </div>
          {searchTerm && (
            <div className="text-[10px] font-bold text-eco-600 uppercase tracking-widest italic">
              Filtering by: "{searchTerm}"
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('product_name')}>
                  <div className="flex items-center gap-2">Product Name <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('branch_name')}>
                  <div className="flex items-center gap-2">Branch <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">In-Hand (Physical)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Available (Marketing)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && stockProducts.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-5 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : stockProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <Boxes className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No stock records found.</p>
                    <p className="text-sm">Try adjusting your search or track new inventory levels.</p>
                  </td>
                </tr>
              ) : (
                stockProducts.map((stock_product) => (
                  <tr key={stock_product.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100/50">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors">{stock_product.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-3.5 h-3.5 text-eco-500" />
                        {stock_product.branch_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border transition-all ${stock_product.physical_stock <= 5 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {stock_product.physical_stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border transition-all ${stock_product.marketing_stock <= 5 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {stock_product.marketing_stock} units
                      </span>
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
              Record <span className="text-gray-900">{((currentPage - 1) * 10) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * 10, pagination.total_count)}</span>
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

      <StockProductModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateOrUpdate} stockProduct={selectedStockProduct} loading={actionLoading} serverErrors={serverErrors} />
      <StockProductDetailModal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} stockProduct={selectedStockProduct} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Purge Stock Record" message={`Are you sure you want to stop tracking stock for "${selectedStockProduct?.product_name}" at "${selectedStockProduct?.branch_name}"?`} loading={deleteLoading} />
    </div>
  );
};

export default StockProduct;
