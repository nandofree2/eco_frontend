import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Product, PaginationMeta, ProductType } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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

  const loadProducts = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.products.list(search, sort, page, perPage);
      setProducts(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, addToast]);

  // Handle Search and Sort with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadProducts(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1) {
      loadProducts(searchTerm, sortBy, currentPage);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<Product>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedProduct) {
        await api.products.update(selectedProduct.id, formData);
        addToast('success', 'Product specifications updated.');
      } else {
        await api.products.create(formData);
        addToast('success', 'New product asset registered.');
      }
      setModalOpen(false);
      loadProducts(searchTerm, sortBy, 1);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setServerErrors(err.errors);
        addToast('error', 'Validation protocol failed.');
      } else {
        addToast('error', err.message || 'Action failed.');
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
      addToast('warning', `Product "${productToDelete.name}" removed from registry.`);
      setDeleteModalOpen(false);
      loadProducts(searchTerm, sortBy, 1);
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setProductToDelete(null);
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

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    perPage,
    pagination,
    isModalOpen,
    setModalOpen,
    isDetailModalOpen,
    setDetailModalOpen,
    isDeleteModalOpen,
    setDeleteModalOpen,
    selectedProduct,
    setSelectedProduct,
    productToDelete,
    setProductToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadProducts,
    handleCreateOrUpdate,
    confirmDelete,
    toggleSort,
    handlePageChange
  };
};
