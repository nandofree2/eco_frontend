import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { DeliveryOrder, PaginationMeta, Branch, Customer, ApprovalStatus } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useDeliveryOrder = () => {
  const [approveLoading, setApproveLoading] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
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
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [orderForDetail, setOrderForDetail] = useState<DeliveryOrder | null>(null);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [deliveryOrderToApprove, setDeliveryOrderToApprove] = useState<string | null>(null);

  // Loading & Error States
  const [actionLoading, setActionLoading] = useState(false);
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
      const response = await api.delivery_orders.list(search, sort, page, perPage, branch, customer);
      setOrders(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load delivery orders.');
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

  const handleCreateOrUpdate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedOrder) {
        await api.delivery_orders.update(selectedOrder.id, formData);
        addToast('success', 'delivery order updated successfully.');
      } else {
        await api.delivery_orders.create(formData);
        addToast('success', 'New delivery order created.');
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
    loadOrders(searchTerm, sortBy, page, branchFilter, customerFilter);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleApprove = (id: string) => {
    setDeliveryOrderToApprove(id);
    setApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!deliveryOrderToApprove) return;
    setApproveLoading(true);
    try {
      await api.delivery_orders.approve(deliveryOrderToApprove);
      addToast('success', 'Delivery order approved successfully.');
      setOrderForDetail(prev => prev && prev.id === deliveryOrderToApprove ? { ...prev, approval_status: ApprovalStatus.Approved } : prev);
      setApproveModalOpen(false);
      loadOrders(searchTerm, sortBy, currentPage, branchFilter, customerFilter);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to approve sales order.');
    } finally {
      setApproveLoading(false);
      setDeliveryOrderToApprove(null);
    }
  };

  return {
    orders, branches, customers, loading, searchTerm, setSearchTerm, branchFilter, setBranchFilter, customerFilter, setCustomerFilter,
    sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination, isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen,
    selectedOrder, setSelectedOrder, orderForDetail, setOrderForDetail, actionLoading, approveLoading, serverErrors, setServerErrors,
    toasts, ApprovalStatus, loadOrders, handleCreateOrUpdate, handleApprove, toggleSort, handlePageChange, formatDate, isApproveModalOpen,
    confirmApprove
  };
};
