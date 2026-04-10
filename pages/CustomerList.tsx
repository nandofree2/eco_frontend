import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Customer, PaginationMeta, Membership } from '../types';
import SEO from '../components/SEO';
import { 
  Plus, Search, Edit2, Trash2, Users, 
  ArrowUpDown, AlertTriangle, CheckCircle2, 
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Mail, Filter, Phone, MapPin, UserCheck
} from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CustomerDetailModal from '../components/CustomerDetailModal';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembership, setSelectedMembership] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetail, setCustomerDetail] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Loading & Error States
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const loadData = useCallback(async (search = searchTerm, membership = selectedMembership, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const res = await api.customers.list(search, sort, page, perPage, membership);
      setCustomers(res.data);
      setPagination(res.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedMembership, sortBy, currentPage, perPage]);

  // Handle Search and Filter Changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadData(searchTerm, selectedMembership, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedMembership, sortBy]);

  // Handle page changes
  useEffect(() => { 
    if (currentPage !== 1 || (searchTerm === '' && selectedMembership === '')) {
        loadData(searchTerm, selectedMembership, sortBy, currentPage); 
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
        if (selectedCustomer) {
            await api.customers.update(selectedCustomer.id, formData);
            addToast('success', 'Customer updated successfully.');
        } else {
            await api.customers.create(formData);
            addToast('success', 'New customer created.');
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
    if (!customerToDelete) return;
    setDeleteLoading(true);
    try {
        await api.customers.delete(customerToDelete.id);
        addToast('warning', `Customer "${customerToDelete.name}" removed.`);
        setDeleteModalOpen(false);
        loadData();
    } catch (err: any) {
        addToast('error', err.message || 'Delete failed.');
    } finally {
        setDeleteLoading(false);
        setCustomerToDelete(null);
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

  const getMembershipBadge = (membership?: number) => {
    switch (membership) {
      case 0: return { label: 'REGULAR', color: 'bg-gray-50 text-gray-700 border-gray-100' };
      case 1: return { label: 'MEMBER', color: 'bg-green-50 text-green-700 border-green-100' };
      case 2: return { label: 'VIP', color: 'bg-purple-50 text-purple-700 border-purple-100' };
      default: return { label: 'REGULAR', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO 
        title="Customer Management" 
        description="Manage your customer relationships, leads, and contact information."
      />
      
      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-eco-600" /> Customers
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage relationships, leads, and contact information.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <button 
                onClick={() => loadData()} 
                className="p-2.5 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm"
                title="Refresh Table"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Membership Filter */}
            <div className="relative group min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
                <select
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full shadow-sm appearance-none font-medium text-gray-700 text-sm"
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                >
                    <option value="">All Membership</option>
                    <option value="0">Regular</option>
                    <option value="1">Member</option>
                    <option value="2">VIP</option>
                </select>
            </div>

            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search name, email, phone..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-64 shadow-sm" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                        <XCircle className="w-4 h-4" />
                    </button>
                )}
            </div>
            <button onClick={() => { setSelectedCustomer(null); setServerErrors(null); setModalOpen(true); }} className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95">
                <Plus className="w-5 h-5" />
                <span>Add Customer</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('name')}>
                            <div className="flex items-center gap-2">Customer <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Membership</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading && customers.length === 0 ? (
                        Array.from({length: 4}).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-6 py-6"><div className="h-5 bg-gray-100 rounded-lg w-full"></div></td>
                            </tr>
                        ))
                    ) : customers.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20"><Users className="w-16 h-16 mx-auto mb-4 opacity-5" /><p className="font-bold text-lg">No customers found.</p></td></tr>
                    ) : (
                        customers.map((customer) => (
                            <tr key={customer.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-eco-50 to-eco-100 flex items-center justify-center text-eco-700 font-extrabold shadow-sm border border-eco-200/50 cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => { setCustomerDetail(customer); setDetailModalOpen(true); }}
                                        >
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p 
                                                className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors cursor-pointer hover:underline decoration-eco-500/30 underline-offset-4"
                                                onClick={() => { setCustomerDetail(customer); setDetailModalOpen(true); }}
                                            >
                                                {customer.name}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin className="w-3 h-3" />{customer.address || 'No address'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-700 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" />{customer.email}</p>
                                        {customer.phone && <p className="text-sm text-gray-700 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{customer.phone}</p>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-widest ${getMembershipBadge(customer.membership).color}`}>
                                        {getMembershipBadge(customer.membership).label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                        <button 
                                            onClick={() => { setSelectedCustomer(customer); setServerErrors(null); setModalOpen(true); }} 
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                                            title="Edit Customer"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => { setCustomerToDelete(customer); setDeleteModalOpen(true); }} 
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                                            title="Delete Customer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span> of <span className="text-eco-600">{pagination.total_count}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1 || loading} 
                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 hover:border-eco-200 shadow-sm disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                        {Array.from({length: pagination.total_pages}).map((_, i) => (
                            <button 
                                key={i} 
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-eco-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-eco-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === pagination.total_pages || loading} 
                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 hover:border-eco-200 shadow-sm disabled:opacity-30 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
      </div>

      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleCreateOrUpdate} 
        customer={selectedCustomer} 
        loading={actionLoading} 
        serverErrors={serverErrors} 
      />
      <CustomerDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
        customer={customerDetail} 
      />
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Customer" 
        message={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone.`} 
        loading={deleteLoading} 
      />
    </div>
  );
};

export default CustomerList;
