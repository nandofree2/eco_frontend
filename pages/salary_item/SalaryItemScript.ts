import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { SalaryItem, PaginationMeta, } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useSalaryItem = () => {
  const [salary_items, setSalaryItems] = useState<SalaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalaryItem, setSelectedSalaryItem] = useState<SalaryItem | null>(null);
  const [salaryItemToDelete, setSalaryItemToDelete] = useState<SalaryItem | null>(null);

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

  const loadSalaries = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.salary_items.list(search, sort, page, perPage);
      setSalaryItems(response.data);
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
      loadSalaries(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  const handleCreateOrUpdate = async (formData: Partial<SalaryItem>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedSalaryItem) {
        await api.salary_items.update(selectedSalaryItem.id, formData);
        addToast('success', 'Salary item updated.');
      } else {
        await api.salary_items.create(formData);
        addToast('success', 'New salary item registered.');
      }
      setModalOpen(false);
      loadSalaries(searchTerm, sortBy, 1);
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
    if (!salaryItemToDelete) return;
    setDeleteLoading(true);
    try {
      await api.salaries.delete(salaryItemToDelete.id);
      addToast('warning', `Salary "${salaryItemToDelete.name}" removed from registry.`);
      setDeleteModalOpen(false);
      loadSalaries(searchTerm, sortBy, 1);
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setSalaryItemToDelete(null);
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
    loadSalaries(searchTerm, sortBy, page);
  };

  return {
    salary_items, loading, searchTerm, setSearchTerm, sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination,
    isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen, isDeleteModalOpen, setDeleteModalOpen, selectedSalaryItem,
    setSelectedSalaryItem, salaryItemToDelete, setSalaryItemToDelete, actionLoading, deleteLoading, serverErrors, setServerErrors, toasts,
    addToast, loadSalaries, handleCreateOrUpdate, confirmDelete, toggleSort, handlePageChange
  };
};
