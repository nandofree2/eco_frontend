import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { UnitOfMeasurement, PaginationMeta } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useUnitList = () => {
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
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
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasurement | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<UnitOfMeasurement | null>(null);

  // Loading & Error States
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const loadUnits = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.units.list(search, sort, page, perPage);
      setUnits(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, addToast]);

  // Live Search with 0.5s delay
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
      }
      loadUnits(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, loadUnits]);

  // Handle page changes
  useEffect(() => {
    loadUnits(searchTerm, sortBy, currentPage);
  }, [currentPage, loadUnits, searchTerm, sortBy]);

  const handleCreateOrUpdate = async (formData: Partial<UnitOfMeasurement>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      let result: UnitOfMeasurement;
      if (selectedUnit) {
        result = await api.units.update(selectedUnit.id, formData);
        addToast('success', `Successfully updated unit: ${result.name}`);
      } else {
        result = await api.units.create(formData);
        addToast('success', `Successfully created unit: ${result.name}`);
      }

      setHighlightedId(result.id);
      loadUnits(); // Reload to get correct ordering/pagination

      setModalOpen(false);
      setTimeout(() => setHighlightedId(null), 5000);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setServerErrors(err.errors);
        addToast('error', 'Validation failed. Please check the fields.');
      } else {
        addToast('error', err.message || 'Action failed.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;

    setDeleteLoading(true);
    try {
      await api.units.delete(unitToDelete.id);
      addToast('warning', `Unit "${unitToDelete.name}" has been permanently removed.`);
      setDeleteModalOpen(false);
      loadUnits(); // Reload
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed. This unit might be linked to existing products.');
    } finally {
      setDeleteLoading(false);
      setUnitToDelete(null);
    }
  };

  const openDeleteModal = (unit: UnitOfMeasurement) => {
    setUnitToDelete(unit);
    setDeleteModalOpen(true);
  };

  const toggleSort = (field: string) => {
    setSortBy(prev => {
      const [currField, currDir] = prev.split(' ');
      const newDir = currField === field && currDir === 'asc' ? 'desc' : 'asc';
      setCurrentPage(1); // Reset to first page on sort
      return `${field} ${newDir}`;
    });
  };

  const openModal = (unit: UnitOfMeasurement | null = null) => {
    setSelectedUnit(unit);
    setServerErrors(null);
    setModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  return {
    units,
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
    selectedUnit,
    setSelectedUnit,
    unitToDelete,
    setUnitToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    highlightedId,
    toasts,
    loadUnits,
    handleCreateOrUpdate,
    confirmDelete,
    openDeleteModal,
    toggleSort,
    openModal,
    handlePageChange
  };
};
