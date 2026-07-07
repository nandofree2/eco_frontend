import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { FinancialTransaction, PaginationMeta, Customer } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useFinancialTransaction = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [transactionDateFrom, setTransactionDateFrom] = useState<string>('');
  const [transactionDateTo, setTransactionDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [transactionForDetail, setTransactionForDetail] = useState<FinancialTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);

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

  const loadTransactions = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, customer = customerFilter, dateFrom = transactionDateFrom, dateTo = transactionDateTo) => {
    setLoading(true);
    try {
      const response = await api.financial_transactions.list(search, sort, page, perPage);
      const transactions = response.data || [];
      const uniqueTransactions = transactions.filter((transaction, index) => transactions.findIndex(i => i.id === transaction.id) === index);

      setTransactions(uniqueTransactions);
      setPagination(response.meta || null);
    } catch (err: any) {
      setTransactions([]);
      setPagination(null);
      addToast('error', err.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, customerFilter, transactionDateFrom, transactionDateTo, addToast]);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await api.customers.list('', '', 1, 100);
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Debounced search/filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadTransactions(searchTerm, sortBy, 1, customerFilter, transactionDateFrom, transactionDateTo);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, customerFilter, transactionDateFrom, transactionDateTo]);

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
    loadTransactions(searchTerm, sortBy, page, customerFilter, transactionDateFrom, transactionDateTo);
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
    transactions, customers, loading, searchTerm, setSearchTerm, customerFilter, setCustomerFilter, transactionDateFrom, setTransactionDateFrom, transactionDateTo, setTransactionDateTo, sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination,
    isModalOpen, setModalOpen, selectedTransaction, setSelectedTransaction, transactionForDetail, setTransactionForDetail, transactionToDelete, setTransactionToDelete, actionLoading, deleteLoading, serverErrors, setServerErrors,
    toasts, loadTransactions, toggleSort, handlePageChange, formatDate, formatCurrency
  };
};
