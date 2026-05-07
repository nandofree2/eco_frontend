import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { SalesOrder, PaginationMeta, Branch, Customer } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useSalesOrder = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [orderForDetail, setOrderForDetail] = useState<SalesOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);

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

  const loadOrders = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, branch = branchFilter, customer = customerFilter) => {
    setLoading(true);
    try {
      const response = await api.sales_orders.list(search, sort, page, perPage, branch, customer);
      setOrders(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load sales orders.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, branchFilter, customerFilter, addToast]);

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
      loadOrders(searchTerm, sortBy, 1, branchFilter, customerFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, branchFilter, customerFilter]);

  // Page changes
  useEffect(() => {
    if (currentPage !== 1) {
      loadOrders(searchTerm, sortBy, currentPage, branchFilter, customerFilter);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedOrder) {
        await api.sales_orders.update(selectedOrder.id, formData);
        addToast('success', 'Sales order updated successfully.');
      } else {
        await api.sales_orders.create(formData);
        addToast('success', 'New sales order created.');
      }
      setModalOpen(false);
      loadOrders(searchTerm, sortBy, 1, branchFilter, customerFilter);
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
    if (!orderToDelete) return;
    setDeleteLoading(true);
    try {
      await api.sales_orders.delete(orderToDelete.id);
      addToast('success', 'Sales order removed.');
      setDeleteModalOpen(false);
      loadOrders(searchTerm, sortBy, 1, branchFilter, customerFilter);
    } catch (err: any) {
      const type = err.status === 422 ? 'warning' : 'error';
      addToast(type, err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setOrderToDelete(null);
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
    sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination,
    isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen,
    isDeleteModalOpen, setDeleteModalOpen, selectedOrder, setSelectedOrder,
    orderForDetail, setOrderForDetail, orderToDelete, setOrderToDelete,
    actionLoading, deleteLoading, serverErrors, setServerErrors,
    toasts, loadOrders, handleCreateOrUpdate, confirmDelete,
    toggleSort, handlePageChange, formatDate, formatCurrency
  };
};
