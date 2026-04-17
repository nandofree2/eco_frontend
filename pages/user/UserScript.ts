import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { User, PaginationMeta, Role, UserStatus } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

  const loadData = useCallback(async (search = searchTerm, roleName = selectedRoleName, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      // Fetch users with search, role filter and sort params tested against Ransack backend
      const userRes = await api.users.list(search, sort, page, perPage, roleName);
      setUsers(userRes.data);
      setPagination(userRes.meta);

      // Lazy load roles for filter dropdown
      // Note: we check if roles are already loaded in the useEffect below
    } catch (err: any) {
      addToast('error', err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRoleName, sortBy, currentPage, perPage, addToast]);

  const loadRoles = useCallback(async () => {
    try {
      const roleList = await api.roles.role_list();
      setRoles(roleList);
    } catch (err: any) {
      console.error('Failed to load roles:', err);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Handle Search and Role Filter Changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadData(searchTerm, selectedRoleName, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedRoleName, sortBy, loadData]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1 || (searchTerm === '' && selectedRoleName === '')) {
      loadData(searchTerm, selectedRoleName, sortBy, currentPage);
    }
  }, [currentPage, loadData, searchTerm, selectedRoleName, sortBy]);

  const handleCreateOrUpdate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedUser) {
        await api.users.update(selectedUser.id, formData);
        addToast('success', 'User profile updated successfully.');
      } else {
        await api.users.create(formData);
        addToast('success', 'New system user created.');
      }
      setModalOpen(false);
      loadData();
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
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await api.users.delete(userToDelete.id);
      addToast('warning', `User "${userToDelete.name}" removed.`);
      setDeleteModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setUserToDelete(null);
    }
  };

  const toggleSort = (field: string) => {
    setSortBy(prev => {
      const [currField, currDir] = prev.split(' ');
      const newDir = currField === field && currDir === 'asc' ? 'desc' : 'asc';
      setCurrentPage(1);
      return `${field} ${newDir}`;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  const getRoleColor = (roleName: any) => {
    const name = String(roleName || '').toLowerCase();
    if (name.includes('owner')) return 'bg-red-50 text-red-700 border-red-100';
    if (name.includes('admin')) return 'bg-eco-50 text-eco-700 border-eco-100';
    if (name.includes('manager')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return {
    users,
    roles,
    loading,
    searchTerm,
    setSearchTerm,
    selectedRoleName,
    setSelectedRoleName,
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
    isDetailModalOpen,
    setDetailModalOpen,
    selectedUser,
    setSelectedUser,
    userDetail,
    setUserDetail,
    userToDelete,
    setUserToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadData,
    handleCreateOrUpdate,
    confirmDelete,
    toggleSort,
    handlePageChange,
    getRoleColor,
    UserStatus
  };
};
