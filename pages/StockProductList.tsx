import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { StockProduct, PaginationMeta, Branch } from '../types';
import SEO from '../components/SEO';
import { 
  Search, Edit2, Trash2, Boxes, 
  ArrowUpDown, AlertTriangle, CheckCircle2, 
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Package, Building2, X
} from 'lucide-react';
import StockProductModal from '../components/StockProductModal';
import StockProductDetailModal from '../components/StockProductDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const StockProductList: React.FC = () => {
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<StockProduct | null>(null);
  const [stockProductForDetail, setStockProductForDetail] = useState<StockProduct | null>(null);
  const [stockProductToDelete, setStockProductToDelete] = useState<StockProduct | null>(null);
  
  // Loading & Error States
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const loadStockProducts = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, branch = branchFilter) => {
    setLoading(true);
    try {
      const response = await api.stock_products.list(search, sort, page, perPage, branch);
      setStockProducts(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load stock products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, branchFilter, addToast]);

  const loadBranches = useCallback(async () => {
    try {
      const data = await api.branches.branch_list();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches for filter:', err);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  // Handle Search and Sort with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadStockProducts(searchTerm, sortBy, 1, branchFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, branchFilter]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1) {
        loadStockProducts(searchTerm, sortBy, currentPage, branchFilter);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<StockProduct>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
        if (selectedStockProduct) {
            await api.stock_products.update(selectedStockProduct.id, formData);
            addToast('success', 'Stock updated successfully.');
        } else {
            await api.stock_products.create(formData);
            addToast('success', 'New stock record created.');
        }
        setModalOpen(false);
        loadStockProducts(searchTerm, sortBy, 1, branchFilter);
    } catch (err: any) {
        if (err.status === 422 && err.errors) {
            setServerErrors(err.errors);
            addToast('error', 'Validation failed.');
        } else {
            addToast('error', err.message || 'Action failed.');
        }
    } finally {
        setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!stockProductToDelete) return;
    setDeleteLoading(true);
    try {
        await api.stock_products.delete(stockProductToDelete.id);
        addToast('warning', `Stock record removed.`);
        setDeleteModalOpen(false);
        loadStockProducts(searchTerm, sortBy, 1, branchFilter);
    } catch (err: any) {
        addToast('error', err.message || 'Delete failed.');
    } finally {
        setDeleteLoading(false);
        setStockProductToDelete(null);
    }
  };

  const toggleSort = (field: string) => {
    setSortBy(prev => {
        const [currField, currDir] = prev.split(' ');
        const newDir = currField === field && currDir === 'asc' ? 'desc' : 'asc';
        return `${field} ${newDir}`;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO 
        title="Stock Inventory" 
        description="Manage product stock levels across different branches."
      />
      <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
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
                <Boxes className="w-7 h-7 text-eco-600" /> Stock Inventory
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage product stock levels across different branches.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={() => loadStockProducts(searchTerm, sortBy, currentPage, branchFilter)} className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search product name..." 
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
        </div>
      </div>

      <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
          <div className="relative flex-1 sm:flex-none">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select 
              className="w-full sm:w-64 pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
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
              className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all bg-gray-50"
              title="Clear Filter"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                    Displaying <span className="text-gray-900 font-bold">{stockProducts.length}</span> records
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Branch</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('physical_stock')}>
                            <div className="flex items-center justify-center gap-2">Physical Stock <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('marketing_stock')}>
                            <div className="flex items-center justify-center gap-2">Marketing Stock <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading && stockProducts.length === 0 ? (
                        Array.from({length: 4}).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={5} className="px-6 py-6"><div className="h-5 bg-gray-100 rounded-lg w-full"></div></td>
                            </tr>
                        ))
                    ) : stockProducts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                                <Boxes className="w-16 h-16 mx-auto mb-4 opacity-5" />
                                <p className="font-bold text-lg">No stock records found.</p>
                                <p className="text-sm">Try adjusting your search or add a new stock record.</p>
                            </td>
                        </tr>
                    ) : (
                        stockProducts.map((stock) => (
                            <tr key={stock.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <button 
                                                onClick={() => { setStockProductForDetail(stock); setDetailModalOpen(true); }}
                                                className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-left"
                                            >
                                                {stock.product_name}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <Building2 className="w-3.5 h-3.5 text-eco-500" />
                                        {stock.branch_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                                        stock.physical_stock <= 5 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-700 border border-gray-200'
                                    }`}>
                                        {stock.physical_stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gray-50 text-gray-700 border border-gray-200">
                                        {stock.marketing_stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                        <button onClick={() => { setSelectedStockProduct(stock); setServerErrors(null); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100" title="Edit Stock">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => { setStockProductToDelete(stock); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100" title="Delete Stock">
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
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
      </div>

      <StockProductModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleCreateOrUpdate} 
        stockProduct={selectedStockProduct} 
        loading={actionLoading} 
        serverErrors={serverErrors} 
      />

      <StockProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        stockProduct={stockProductForDetail}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Stock Record" 
        message={`Are you sure you want to remove this stock record? This action cannot be undone.`} 
        loading={deleteLoading} 
      />
    </div>
  );
};

export default StockProductList;
