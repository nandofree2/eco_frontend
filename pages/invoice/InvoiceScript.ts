import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Invoice, PaginationMeta, Branch, Customer, PaymentStatus, DeadlineStatus } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useInvoice = () => {
  const [orders, setOrders] = useState<Invoice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Invoice | null>(null);
  const [orderForDetail, setOrderForDetail] = useState<Invoice | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Invoice | null>(null);

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

  const loadOrders = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, branch = branchFilter, customer = customerFilter, deadline = deadlineFilter, payment = paymentFilter) => {
    setLoading(true);
    try {
      const response = await api.invoices.list(search, sort, page, perPage, branch, customer, deadline, payment);
      setOrders(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, branchFilter, customerFilter, deadlineFilter, paymentFilter, addToast]);

  const loadBranches = useCallback(async () => {
    try {
      const data = await api.branches.branch_list();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await api.customers.list('', '', 1, 100);
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }, []);

  useEffect(() => {
    loadBranches();
    loadCustomers();
  }, [loadBranches, loadCustomers]);

  // Debounced search/filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadOrders(searchTerm, sortBy, 1, branchFilter, customerFilter, deadlineFilter, paymentFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, branchFilter, customerFilter, deadlineFilter, paymentFilter]);

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
    loadOrders(searchTerm, sortBy, page);
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
    orders, branches, customers, loading, searchTerm, setSearchTerm,
    branchFilter, setBranchFilter, customerFilter, setCustomerFilter,
    deadlineFilter, setDeadlineFilter, paymentFilter, setPaymentFilter,
    sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination,
    isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen,
    isDeleteModalOpen, setDeleteModalOpen, selectedOrder, setSelectedOrder,
    orderForDetail, setOrderForDetail, orderToDelete, setOrderToDelete,
    actionLoading, deleteLoading, serverErrors, setServerErrors,
    toasts, PaymentStatus, DeadlineStatus, loadOrders,
    toggleSort, handlePageChange, formatDate, formatCurrency
  };
};
