import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { CustomerProduct, PaginationMeta, Customer } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useCustomerProduct = () => {
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Loading & Error States
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);


  const addToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  
  const loadCustomerProducts = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.customer_products.list(search, sort, page, perPage);
      const customerProducts = response.data || [];
      // const uniqueCustomerProducts = customerProducts.filter((product, index) => customerProducts.findIndex(i => i.id === product.id) === index);

      setCustomerProducts(response.data || []);
      setPagination(response.meta || null);
    } catch (err: any) {
      setCustomerProducts([]);
      setPagination(null);
      addToast('error', err.message || 'Failed to load customer products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, addToast]);

  // Debounced search/filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadCustomerProducts(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

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
    loadCustomerProducts(searchTerm, sortBy, page);
  };

  return {
    customerProducts, loading, searchTerm, setSearchTerm, sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination, actionLoading, serverErrors, setServerErrors, toasts, loadCustomerProducts, toggleSort, handlePageChange
  };
};
