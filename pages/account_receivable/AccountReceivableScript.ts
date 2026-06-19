import { useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../../services/api';
import { AccountReceivable, PaginationMeta, ApprovalStatus, Customer, Invoice } from '../../types';
import { AbilityContext } from '../../context/AbilityContext';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const useAccountReceivable = () => {
  const [accountReceivables, setAccountReceivables] = useState<AccountReceivable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [approvalFilter, setApprovalFilter] = useState<string>('');
  
  const [sortBy, setSortBy] = useState<string>('created_at desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDetailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedAR, setSelectedAR] = useState<AccountReceivable | null>(null);
  
  const [serverErrors, setServerErrors] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);

  const ability = useContext(AbilityContext);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const loadData = useCallback(async (
    query: string = searchTerm,
    sort: string = sortBy,
    page: number = currentPage,
    approval: string = approvalFilter,
    customer: string = customerFilter
  ) => {
    try {
      setLoading(true);
      const res = await api.account_receivables.list(query, sort, page, perPage, approval, customer);
      setAccountReceivables(res.data);
      setPagination(res.meta);
    } catch (error: any) {
      showToast(error.message || 'Failed to load account receivables', 'error');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  const loadCustomers = async () => {
    try {
      const res = await api.customers.list('', 'name asc', 1, 100);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadCustomers();
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadData(searchTerm, sortBy, newPage, approvalFilter, customerFilter);
  };

  const toggleSort = (field: string) => {
    const isAsc = sortBy === `${field} asc`;
    const newSort = isAsc ? `${field} desc` : `${field} asc`;
    setSortBy(newSort);
    loadData(searchTerm, newSort, currentPage, approvalFilter, customerFilter);
  };

  const createAR = async (data: Partial<AccountReceivable>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      await api.account_receivables.create(data);
      showToast('Account Receivable created successfully', 'success');
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      setServerErrors(error.errors || { general: [error.message] });
      showToast(error.message || 'Failed to create', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const updateAR = async (id: string, data: Partial<AccountReceivable>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      await api.account_receivables.update(id, data);
      showToast('Account Receivable updated successfully', 'success');
      setModalOpen(false);
      setSelectedAR(null);
      loadData();
    } catch (error: any) {
      setServerErrors(error.errors || { general: [error.message] });
      showToast(error.message || 'Failed to update', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAR = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.account_receivables.delete(id);
      showToast('Account Receivable deleted successfully', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  };

  const approveAR = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this Account Receivable? This will deduct the remaining bill of the invoice.")) return;
    setApproveLoading(true);
    try {
      await api.account_receivables.approve(id);
      showToast('Account Receivable approved successfully', 'success');
      setDetailOpen(false);
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to approve', 'error');
    } finally {
      setApproveLoading(false);
    }
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
  };

  return {
    accountReceivables, customers, loading, actionLoading, approveLoading,
    searchTerm, setSearchTerm, customerFilter, setCustomerFilter,
    approvalFilter, setApprovalFilter, sortBy, toggleSort,
    currentPage, perPage, pagination, handlePageChange,
    isModalOpen, setModalOpen, isDetailOpen, setDetailOpen,
    selectedAR, setSelectedAR,
    serverErrors, toasts, loadData,
    createAR, updateAR, deleteAR, approveAR, formatCurrency, ability, ApprovalStatus
  };
};
