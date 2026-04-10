import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Product, ProductStatus, ProductType, PaginationMeta } from '../../types';
import SEO from '../../components/SEO';
import { 
  Plus, Search, Edit2, Trash2, Package, 
  AlertCircle, RefreshCw, ArrowUpDown, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, AlertTriangle, Filter, Tag, DollarSign, Layers, X
} from 'lucide-react';
import ProductModal from '../../components/ProductModal';
import ProductDetailModal from '../../components/ProductDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForDetail, setProductForDetail] = useState<Product | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  // Feedback States
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const loadProducts = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, status = statusFilter, type = typeFilter) => {
    setLoading(true);
    try {
      const response = await api.products.list(search, sort, page, perPage, status, type);
      setProducts(response.data);
      setPagination(response.meta);
    } catch (error: any) {
      console.error(error);
      addToast('error', error.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, statusFilter, typeFilter]);

  // Handle Search and Sort with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadProducts(searchTerm, sortBy, 1, statusFilter, typeFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, statusFilter, typeFilter]);

  // Handle page changes
  useEffect(() => {
    loadProducts(searchTerm, sortBy, currentPage, statusFilter, typeFilter);
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<Product>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedProduct) {
        await api.products.update(selectedProduct.id, formData);
        addToast('success', 'Product updated successfully.');
      } else {
        await api.products.create(formData);
        addToast('success', 'New product added to catalog.');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setServerErrors(err.errors);
        addToast('error', 'Validation failed.');
      } else {
        addToast('error', err.message || 'Operation failed.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await api.products.delete(productToDelete.id);
      addToast('warning', `Product "${productToDelete.name}" removed.`);
      setDeleteModalOpen(false);
      loadProducts();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
      setProductToDelete(null);
    }
  };

  const toggleSort = (field: string) => {
    setSortBy(prev => {
      const [currField, currDir] = prev.split(' ');
      const newDir = currField === field && currDir === 'asc' ? 'desc' : 'asc';
      setCurrentPage(1);
      return `${field} ${newDir}`;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  return (
    <div className="product-tree-container relative min-h-[500px]">
      <SEO 
        title="Product Catalog" 
        description="Manage your sustainable product inventory, pricing, and distribution."
      />
      {/* Toast Notifications */}
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

      <div className="mb-0 space-y-1">
        {/* Title and Primary Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-eco-100 rounded-2xl">
                <Package className="w-8 h-8 text-eco-600" />
              </div>
              Product
            </h1>
          </div>
          <button 
            onClick={() => { setSelectedProduct(null); setServerErrors(null); setModalOpen(true); }}
            className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-gray-200 active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-eco-500/20 transition-all font-medium text-gray-900 placeholder:text-gray-400"
              placeholder="Search by name or product code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select 
                className="w-full sm:w-44 pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value={ProductStatus.Active}>Active</option>
                <option value={ProductStatus.Unreleased}>Unreleased</option>
                <option value={ProductStatus.Expired}>Expired</option>
                <option value={ProductStatus.Deactive}>Deactive</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select 
                className="w-full sm:w-44 pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value={ProductType.Storable}>Storable</option>
                <option value={ProductType.Service}>Service</option>
                <option value={ProductType.Preorder}>Preorder</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => loadProducts()}
                className="p-3 text-gray-500 hover:text-eco-600 hover:bg-eco-50 rounded-2xl transition-all bg-gray-50"
                title="Refresh Table"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {(searchTerm || statusFilter || typeFilter) && (
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); }}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all bg-gray-50"
                  title="Clear All Filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
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
                    Displaying <span className="text-gray-900 font-bold">{products.length}</span> results
                </div>
            </div>
            {searchTerm && (
                <div className="text-[10px] font-bold text-eco-600 uppercase tracking-widest italic">
                    Filtered by: "{searchTerm}"
                </div>
            )}
        </div>

        <div className="table-container overflow-x-auto">
            <table className="data-table w-full text-left">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('name')}>
                            <div className="flex items-center gap-2">Product Info <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('code')}>
                            <div className="flex items-center gap-2">Code <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Category / Hierarchy</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">TYPE</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('base_price')}>
                            <div className="flex items-center gap-2">Base Price <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading && products.length === 0 ? (
                        Array.from({length: 5}).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={7} className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td>
                            </tr>
                        ))
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-24 text-center text-gray-400">
                                <Package className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                <p className="font-bold text-lg text-gray-500">No products match your search.</p>
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id} className="group hover:bg-eco-50/30 transition-all duration-300">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm flex items-center justify-center">
                                            {product.cover_image_url ? (
                                                <img src={product.cover_image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="truncate max-w-[150px]">
                                            <button 
                                                onClick={() => { setProductForDetail(product); setDetailModalOpen(true); }}
                                                className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-left"
                                            >
                                                {product.name}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono font-bold bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-gray-600">
                                        {product.code || product.sku || '---'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg">
                                        <Tag className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {product.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg">
                                        <Layers className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {ProductType[product.product_type]}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                        product.status_product === ProductStatus.Active ? 'bg-green-100 text-green-700' : 
                                        product.status_product === ProductStatus.Unreleased ? 'bg-gray-100 text-gray-500' :
                                        product.status_product === ProductStatus.Expired ? 'bg-red-100 text-red-700' : 
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {ProductStatus[product.status_product]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-extrabold text-gray-900">
                                    <div className="flex items-center justify-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5 text-eco-600" />
                                        <span>{Number(product.base_price || 0).toFixed(2)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => { setSelectedProduct(product); setServerErrors(null); setModalOpen(true); }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Modify Entry"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => { setProductToDelete(product); setDeleteModalOpen(true); }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Entry"
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

        {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span> to{' '}
                    <span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span> 
                    <span className="mx-2">of</span> 
                    <span className="text-eco-600">{pagination.total_count}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-eco-50 disabled:opacity-30 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-eco-50 disabled:opacity-30 transition-all"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleCreateOrUpdate} 
        product={selectedProduct} 
        loading={actionLoading} 
        serverErrors={serverErrors} 
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        product={productForDetail}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Permanently Delete Product?"
        message={`Are you sure you want to remove "${productToDelete?.name}"? This action is irreversible.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProductList;