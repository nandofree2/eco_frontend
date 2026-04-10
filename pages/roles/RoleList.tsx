import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Role, PaginationMeta } from '../../types';
import SEO from '../../components/SEO';
import { 
  Plus, Search, Edit2, Trash2, Shield, 
  ArrowUpDown, AlertTriangle, CheckCircle2, 
  XCircle, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import RoleModal from '../../components/RoleModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const loadData = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const res = await api.roles.list(search, sort, page, perPage);
      setRoles(res.data);
      setPagination(res.meta);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, currentPage, perPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== '') setCurrentPage(1);
      loadData(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  useEffect(() => { loadData(searchTerm, sortBy, currentPage); }, [currentPage]);

  const handleCreateOrUpdate = async (formData: any) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
        if (selectedRole) {
            await api.roles.update(selectedRole.id, formData);
            addToast('success', 'Role updated successfully.');
        } else {
            await api.roles.create(formData);
            addToast('success', 'New role created.');
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
    if (!roleToDelete) return;
    setDeleteLoading(true);
    try {
        await api.roles.delete(roleToDelete.id);
        addToast('warning', `Role "${roleToDelete.name}" removed.`);
        setDeleteModalOpen(false);
        loadData();
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
        setCurrentPage(1);
        return `${field} ${newDir}`;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO 
        title="Roles & Authorization" 
        description="Configure permission groups and resource access levels for your marketplace platform."
      />
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Shield className="w-7 h-7 text-eco-600" /> Roles & Authorization
            </h1>
            <p className="text-gray-500 text-sm mt-1">Configure permission groups and resource access levels.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={() => loadData()} className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
                <input type="text" placeholder="Search role name..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-72" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setSelectedRole(null); setServerErrors(null); setModalOpen(true); }} className="bg-eco-600 hover:bg-eco-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95">
                <Plus className="w-5 h-5" />
                <span>Add Role</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors" onClick={() => toggleSort('name')}>
                            <div className="flex items-center gap-2">Group Name <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Scope Description</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Resources</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading && roles.length === 0 ? (
                        Array.from({length: 3}).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                            </tr>
                        ))
                    ) : roles.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400"><Shield className="w-12 h-12 mx-auto mb-4 opacity-10" /><p className="font-bold">No Roles Defined</p></td></tr>
                    ) : (
                        roles.map((role) => (
                            <tr key={role.id} className="group hover:bg-eco-50/30 transition-all duration-300">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{role.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-500 text-sm italic">{role.description || 'No description provided.'}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{Object.keys(role.permissions || {}).length} Attached</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setSelectedRole(role); setServerErrors(null); setModalOpen(true); }} className="p-2 text-eco-600 hover:bg-eco-100 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => { setRoleToDelete(role); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
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
                <div className="text-sm text-gray-500">Showing page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{pagination.total_pages}</span></div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-eco-600 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-eco-600 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
        )}
      </div>

      <RoleModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateOrUpdate} role={selectedRole} loading={actionLoading} serverErrors={serverErrors} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Role" message={`Are you sure you want to delete the "${roleToDelete?.name}" role? Users assigned to this role may lose access.`} loading={deleteLoading} />
    </div>
  );
};

export default RoleList;