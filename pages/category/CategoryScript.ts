import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Category, PaginationMeta } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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

  const loadCategories = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.categories.list(search, sort, page, perPage);
      setCategories(response.data);
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
      loadCategories(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1) {
      loadCategories(searchTerm, sortBy, currentPage);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<Category>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedCategory) {
        await api.categories.update(selectedCategory.id, formData);
        addToast('success', 'Category updated successfully.');
      } else {
        await api.categories.create(formData);
        addToast('success', 'New category created.');
      }
      setModalOpen(false);
      loadCategories(searchTerm, sortBy, 1);
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
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await api.categories.delete(categoryToDelete.id);
      addToast('warning', `Category "${categoryToDelete.name}" removed.`);
      setDeleteModalOpen(false);
      loadCategories(searchTerm, sortBy, 1);
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setCategoryToDelete(null);
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
    categories,
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
    isDeleteModalOpen,
    setDeleteModalOpen,
    selectedCategory,
    setSelectedCategory,
    categoryToDelete,
    setCategoryToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadCategories,
    handleCreateOrUpdate,
    confirmDelete,
    toggleSort,
    handlePageChange
  };
};
