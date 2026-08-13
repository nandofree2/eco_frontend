import { useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../../services/api';
import { UserPayRate, PaginationMeta, User } from '../../types';
import { AbilityContext } from '../../context/AbilityContext';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const useUserPayRate = () => {
  const [userPayRates, setUserPayRates] = useState<UserPayRate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [sortBy, setSortBy] = useState<string>('created_at desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedUserPayRate, setSelectedUserPayRate] = useState<UserPayRate | null>(null);
  const [recordForDetail, setRecordForDetail] = useState<UserPayRate | null>(null);

  const [serverErrors, setServerErrors] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const ability = useContext(AbilityContext);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const loadData = useCallback(async (
    query: string = searchTerm,
    sort: string = sortBy,
    page: number = currentPage
  ) => {
    try {
      setLoading(true);
      const res = await api.user_pay_rates.list(query, sort, page, perPage);
      setUserPayRates(res.data);
      setPagination(res.meta);
    } catch (error: any) {
      addToast(error.message || 'Failed to load user pay rates', 'error');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  const loadUsers = async () => {
    try {
      const res = await api.users.list('', 'name asc', 1, 10);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadUsers();
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadData(searchTerm, sortBy, newPage);
  };

  const toggleSort = (field: string) => {
    const isAsc = sortBy === `${field} asc`;
    const newSort = isAsc ? `${field} desc` : `${field} asc`;
    setSortBy(newSort);
    loadData(searchTerm, newSort, currentPage);
  };

  const createUserPayRate = async (data: Partial<UserPayRate>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      await api.user_pay_rates.create(data);
      addToast('User Pay Rate created successfully', 'success');
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      setServerErrors(error.errors || { general: [error.message] });
      addToast(error.message || 'Failed to create', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const updateUserPayRate = async (id: string, data: Partial<UserPayRate>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      await api.user_pay_rates.update(id, data);
      addToast('User Pay Rate updated successfully', 'success');
      setModalOpen(false);
      setSelectedUserPayRate(null);
      loadData();
    } catch (error: any) {
      setServerErrors(error.errors || { general: [error.message] });
      addToast(error.message || 'Failed to update', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<UserPayRate>) => {
    if (selectedUserPayRate?.id) {
      await updateUserPayRate(selectedUserPayRate.id, data);
    } else {
      await createUserPayRate(data);
    }
  };


  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
  };

  return {
    userPayRates, users, loading, actionLoading, searchTerm, setSearchTerm, sortBy, toggleSort, currentPage, perPage, pagination, handlePageChange, isModalOpen,
    setModalOpen, isDetailModalOpen, setDetailModalOpen, selectedUserPayRate, setSelectedUserPayRate, recordForDetail, setRecordForDetail, serverErrors, setServerErrors,
    toasts, loadData, createUserPayRate, updateUserPayRate, handleCreateOrUpdate, formatCurrency, ability,
  };
};
