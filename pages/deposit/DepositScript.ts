import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Deposit, PaginationMeta, Customer } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useDeposit = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [depositDateFrom, setDepositDateFrom] = useState<string>('');
  const [depositDateTo, setDepositDateTo] = useState<string>('');
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

  const loadDeposits = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, depositDateFrom, depositDateTo) => {
    setLoading(true);
    try {
      const response = await api.deposits.list(search, sort, page, perPage, depositDateFrom, depositDateTo);
      const deposits = response.data || [];
      const uniqueDeposits = deposits.filter((deposit, index) => deposits.findIndex(i => i.id === deposit.id) === index);

      setDeposits(uniqueDeposits);
      setPagination(response.meta || null);
    } catch (err: any) {
      setDeposits([]);
      setPagination(null);
      addToast('error', err.message || 'Failed to load deposits.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, depositDateFrom, depositDateTo, addToast]);

  // Debounced search/filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadDeposits(searchTerm, sortBy, 1, depositDateFrom, depositDateTo);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, depositDateFrom, depositDateTo]);

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
    loadDeposits(searchTerm, sortBy, page, depositDateFrom, depositDateTo);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  return {
    deposits, loading, searchTerm, setSearchTerm, depositDateFrom, setDepositDateFrom, depositDateTo, setDepositDateTo, sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination, actionLoading, serverErrors, setServerErrors, toasts, loadDeposits, toggleSort, handlePageChange, formatDate, formatCurrency
  };
};
