import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { AdjustmentProduct, PaginationMeta, Branch, AdjustmentType, ApprovalStatus } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useAdjustmentProduct = () => {
  const [adjustments, setAdjustments] = useState<AdjustmentProduct[]>([]);
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
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentProduct | null>(null);
  const [adjustmentForDetail, setAdjustmentForDetail] = useState<AdjustmentProduct | null>(null);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState<AdjustmentProduct | null>(null);

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

  const loadAdjustments = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, branch = branchFilter) => {
    setLoading(true);
    try {
      const response = await api.adjustment_products.list(search, sort, page, perPage, branch);
      setAdjustments(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load stock adjustments.');
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
      loadAdjustments(searchTerm, sortBy, 1, branchFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, branchFilter]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1) {
      loadAdjustments(searchTerm, sortBy, currentPage, branchFilter);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<AdjustmentProduct>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedAdjustment) {
        await api.adjustment_products.update(selectedAdjustment.id, formData);
        addToast('success', 'Adjustment updated successfully.');
      } else {
        await api.adjustment_products.create(formData);
        addToast('success', 'New stock adjustment created.');
      }
      setModalOpen(false);
      loadAdjustments(searchTerm, sortBy, 1, branchFilter);
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

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await api.adjustment_products.approve(id);
      addToast('success', 'Adjustment approved successfully.');
      loadAdjustments(searchTerm, sortBy, currentPage, branchFilter);
    } catch (err: any) {
      addToast('error', err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!adjustmentToDelete) return;
    setDeleteLoading(true);
    try {
      await api.adjustment_products.delete(adjustmentToDelete.id);
      addToast('success', `Adjustment record removed.`);
      setDeleteModalOpen(false);
      loadAdjustments(searchTerm, sortBy, 1, branchFilter);
    } catch (err: any) {
      const type = err.status === 422 ? 'warning' : 'error';
      addToast(type, err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setAdjustmentToDelete(null);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    adjustments, branches, loading, searchTerm, setSearchTerm, branchFilter, setBranchFilter, sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination, isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen, isDeleteModalOpen, setDeleteModalOpen, selectedAdjustment, setSelectedAdjustment, adjustmentForDetail, setAdjustmentForDetail, adjustmentToDelete, setAdjustmentToDelete, actionLoading, deleteLoading, serverErrors, setServerErrors, toasts, loadAdjustments, handleCreateOrUpdate, handleApprove, confirmDelete, toggleSort, handlePageChange, formatDate, AdjustmentType, ApprovalStatus
  };
};
