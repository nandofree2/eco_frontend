import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Payroll, Salary, PaginationMeta, StatusPayroll } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const usePayroll = () => {
  const [approveLoading, setApproveLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryFilter, setSalaryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('start_date desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payrollToApprove, setPayrollToApprove] = useState<string | null>(null);
  const [payrollToPayment, setPayrollToPayment] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [payrollForDetail, setPayrollForDetail] = useState<Payroll | null>(null);
  const [payrollToDelete, setPayrollToDelete] = useState<Payroll | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const loadPayrolls = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage, salary = salaryFilter) => {
    setLoading(true);
    try {
      const response = await api.payrolls.list(search, sort, page, perPage, salary);
      setPayrolls(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage, salaryFilter, addToast]);

  const loadSalaries = useCallback(async () => {
    try {
      const response = await api.salaries.list('', '', 1, 100);
      setSalaries(response.data);
    } catch (err) {
      console.error('Failed to load salaries:', err);
    }
  }, []);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadPayrolls(searchTerm, sortBy, 1, salaryFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy, salaryFilter]);

  const handleCreateOrUpdate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (selectedPayroll) {
        await api.payrolls.update(selectedPayroll.id, formData);
        addToast('success', 'Payroll updated successfully.');
      } else {
        await api.payrolls.create(formData);
        addToast('success', 'New payroll record created.');
      }
      setModalOpen(false);
      loadPayrolls(searchTerm, sortBy, 1, salaryFilter);
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
  const handlePaymentDate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      if (payrollToPayment) {
        await api.payrolls.payment(payrollToPayment, formData);
        addToast('success', 'Payroll updated successfully.');
        const updated = await api.payrolls.get(payrollToPayment);
        setPayrollForDetail(updated);
      }
      setPaymentModalOpen(false);
      loadPayrolls(searchTerm, sortBy, 1, salaryFilter);
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
    if (!payrollToDelete) return;
    setDeleteLoading(true);
    try {
      await api.payrolls.delete(payrollToDelete.id);
      addToast('warning', `Payroll "${payrollToDelete.name}" removed.`);
      setDeleteModalOpen(false);
      loadPayrolls(searchTerm, sortBy, 1, salaryFilter);
    } catch (err: any) {
      addToast('error', err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
      setPayrollToDelete(null);
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
    loadPayrolls(searchTerm, sortBy, page, salaryFilter);
  };
  const handleApprove = (id: string) => {
    setPayrollToApprove(id);
    setApproveModalOpen(true);
  };
  const handlePayment = (id: string) => {
    setPayrollToPayment(id);
    setPaymentModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!payrollToApprove) return;
    setApproveLoading(true);
    try {
      await api.payrolls.approve(payrollToApprove);
      addToast('success', 'Payroll approved successfully.');
      setPayrollForDetail(prev => prev && prev.id === payrollToApprove ? { ...prev, status_payroll: StatusPayroll.Approved } : prev);
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      loadPayrolls(searchTerm, sortBy, currentPage, salaryFilter);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to approve payroll.');
    } finally {
      setApproveLoading(false);
      setPayrollToApprove(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return {
    payrolls, salaries, loading, searchTerm, setSearchTerm, salaryFilter, setSalaryFilter, sortBy, setSortBy, currentPage, setCurrentPage,
    perPage, pagination, isModalOpen, setModalOpen, isDetailModalOpen, setDetailModalOpen, isDeleteModalOpen, setDeleteModalOpen,
    selectedPayroll, setSelectedPayroll, payrollForDetail, setPayrollForDetail, payrollToDelete, setPayrollToDelete, actionLoading,
    deleteLoading, serverErrors, setServerErrors, toasts, StatusPayroll, loadPayrolls, handleCreateOrUpdate, confirmDelete, handleApprove,
    toggleSort, handlePageChange, formatDate, isApproveModalOpen, setApproveModalOpen, payrollToApprove, setPayrollToApprove, confirmApprove,
    approveLoading, isPaymentModalOpen, setPaymentModalOpen, payrollToPayment, setPayrollToPayment, paymentLoading, handlePayment, handlePaymentDate
  };
};
