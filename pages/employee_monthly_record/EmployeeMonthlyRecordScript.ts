import { useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../../services/api';
import { EmployeeMonthlyRecord, PaginationMeta } from '../../types';
import { AbilityContext } from '../../context/AbilityContext';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const useEmployeeMonthlyRecord = () => {
  const [employeeMonthlyRecords, setEmployeeMonthlyRecords] = useState<EmployeeMonthlyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(30);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedEMR, setSelectedEMR] = useState<EmployeeMonthlyRecord | null>(null);
  const [recordForDetail, setRecordForDetail] = useState<EmployeeMonthlyRecord | null>(null);

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
    page: number = currentPage,

  ) => {
    try {
      setLoading(true);
      const res = await api.employee_monthly_records.list(query, sort, page, perPage);
      setEmployeeMonthlyRecords(res.data);
      setPagination(res.meta);
    } catch (error: any) {
      addToast(error.message || 'Failed to load Employee Monthly Records', 'error');
    } finally {
      setLoading(false);
    }
  }, [perPage]);


  useEffect(() => {
    loadData();
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

  return {
    employeeMonthlyRecords, loading, actionLoading, searchTerm, setSearchTerm, sortBy, toggleSort, currentPage, perPage, pagination, handlePageChange, isModalOpen, setModalOpen,
    isDetailModalOpen, setDetailModalOpen, selectedEMR, setSelectedEMR, recordForDetail, setRecordForDetail, serverErrors, setServerErrors,
    toasts, loadData, ability
  };
};
