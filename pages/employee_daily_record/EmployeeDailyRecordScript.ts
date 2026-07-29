import { useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../../services/api';
import { EmployeeDailyRecord, PaginationMeta } from '../../types';
import { AbilityContext } from '../../context/AbilityContext';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const useEmployeeDailyRecord = () => {
  const [employeeDailyRecords, setEmployeeDailyRecords] = useState<EmployeeDailyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('attendance_date desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(30);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedEDR, setSelectedEDR] = useState<EmployeeDailyRecord | null>(null);
  const [recordForDetail, setRecordForDetail] = useState<EmployeeDailyRecord | null>(null);

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
      const res = await api.employee_daily_records.list(query, sort, page, perPage);
      setEmployeeDailyRecords(res.data);
      setPagination(res.meta);
    } catch (error: any) {
      addToast(error.message || 'Failed to load Employee Daily Records', 'error');
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

  const createEDR = async (data: Partial<EmployeeDailyRecord>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      await api.employee_daily_records.create(data);
      addToast('Employee Daily Record created successfully', 'success');
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      setServerErrors(error.errors || { general: [error.message] });
      addToast(error.message || 'Failed to create', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const updateEDR = async (id: string, data: Partial<EmployeeDailyRecord>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
      await api.employee_daily_records.update(id, data);
      addToast('Employee Daily Record updated successfully', 'success');
      setModalOpen(false);
      setSelectedEDR(null);
      loadData();
    } catch (error: any) {
      setServerErrors(error.errors || { general: [error.message] });
      addToast(error.message || 'Failed to update', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<EmployeeDailyRecord>) => {
    if (selectedEDR?.id) {
      await updateEDR(selectedEDR.id, data);
    } else {
      await createEDR(data);
    }
  };

  return {
    employeeDailyRecords, loading, actionLoading, searchTerm, setSearchTerm, sortBy, toggleSort, currentPage, perPage, pagination, handlePageChange, isModalOpen, setModalOpen,
    isDetailModalOpen, setDetailModalOpen, selectedEDR, setSelectedEDR, recordForDetail, setRecordForDetail, serverErrors, setServerErrors,
    toasts, loadData, createEDR, updateEDR, handleCreateOrUpdate, ability
  };
};
