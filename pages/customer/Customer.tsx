import React from 'react';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, Users,
  ArrowUpDown, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Mail, Phone, Eye
} from 'lucide-react';
import CustomerModal from './CustomerModal';
import CustomerDetailModal from './CustomerDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useCustomer } from './CustomerScript';

const Customer: React.FC = () => {
  const {
    customers,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    currentPage,
    pagination,
    isModalOpen,
    setModalOpen,
    isDetailModalOpen,
    setDetailModalOpen,
    isDeleteModalOpen,
    setDeleteModalOpen,
    selectedCustomer,
    setSelectedCustomer,
    customerToDelete,
    setCustomerToDelete,
    actionLoading,
    deleteLoading,
    serverErrors,
    setServerErrors,
    toasts,
    loadCustomers,
    handleCreateOrUpdate,
    confirmDelete,
    toggleSort,
    handlePageChange
  } = useCustomer();

  const getMembershipBadge = (membership?: number) => {
    switch (membership) {
      case 0: return { label: 'REGULAR', color: 'bg-gray-50 text-gray-600 border-gray-100' };
      case 1: return { label: 'MEMBER', color: 'bg-green-50 text-green-700 border-green-100' };
      case 2: return { label: 'VIP', color: 'bg-purple-50 text-purple-700 border-purple-100' };
      default: return { label: 'REGULAR', color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Customer Management"
        description="View and manage your registered customers and their memberships."
      />

      {/* Toasts */}
      <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-eco-600" /> Registry of Customers
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer profiles and loyalty tiers.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => loadCustomers()} className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search name, email or phone..."
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
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
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Registry Filter
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-xs font-medium text-gray-500">
              Displaying <span className="text-gray-900 font-bold">{customers.length}</span> individual accounts
            </div>
          </div>
          {searchTerm && (
            <div className="text-[10px] font-bold text-eco-600 uppercase tracking-widest italic">
              Lookup query: "{searchTerm}"
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">Customer Name <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Identity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Membership</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && customers.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-6"><div className="h-5 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No customers found.</p>
                    <p className="text-sm">Try using different search keywords or add a new entry.</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-eco-600/10 text-eco-600 flex items-center justify-center font-bold text-sm shadow-sm border border-eco-600/10 uppercase tracking-tighter">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors capitalize">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border transition-all ${getMembershipBadge(customer.membership).color}`}>
                        {getMembershipBadge(customer.membership).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button onClick={() => { setSelectedCustomer(customer); setDetailModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100" title="Full View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedCustomer(customer); setServerErrors(null); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100" title="Edit Access">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setCustomerToDelete(customer); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100" title="Revoke Profile">
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
              Record <span className="text-gray-900">{((currentPage - 1) * 10) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * 10, pagination.total_count)}</span>
              <span className="mx-2">of</span>
              <span className="text-eco-600">{pagination.total_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (currentPage > 3 && pagination.total_pages > 5) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > pagination.total_pages) pageNum = pagination.total_pages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                        ? 'bg-eco-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-eco-500 hover:text-eco-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateOrUpdate} customer={selectedCustomer} loading={actionLoading} serverErrors={serverErrors} />
      <CustomerDetailModal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} customer={selectedCustomer} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Confirm Revocation" message={`Are you sure you want to remove the record for "${customerToDelete?.name}"? All membership history will be archived.`} loading={deleteLoading} />
    </div>
  );
};

export default Customer;
