import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Role, PaginationMeta } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useRole = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

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

  const loadRoles = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.roles.list(search, sort, page, perPage);
      setRoles(response.data);
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
      loadRoles(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1) {
      loadRoles(searchTerm, sortBy, currentPage);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<Role>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedRole) {
        await api.roles.update(selectedRole.id, formData);
        addToast('success', 'Role permissions updated.');
      } else {
        await api.roles.create(formData);
        addToast('success', 'New system role defined.');
      }
      setModalOpen(false);
      loadRoles(searchTerm, sortBy, 1);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setServerErrors(err.errors);
        addToast('error', 'Validation protocol failure.');
      } else {
        addToast('error', err.message || 'Action failed.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleteLoading(true);
    try {
      await api.roles.delete(roleToDelete.id);
      addToast('warning', `Role "${roleToDelete.name}" purged.`);
      setDeleteModalOpen(false);
      loadRoles(searchTerm, sortBy, 1);
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setRoleToDelete(null);
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
    navigate,
    roles,
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
    selectedRole,
    setSelectedRole,
    roleToDelete,
    setRoleToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadRoles,
    handleCreateOrUpdate,
    confirmDelete,
    toggleSort,
    handlePageChange
  };
};
