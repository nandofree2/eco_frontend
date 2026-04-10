import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { City, PaginationMeta } from '../types';
import SEO from '../components/SEO';
import { 
  Plus, Search, Edit2, Trash2, MapPin, 
  ArrowUpDown, AlertTriangle, CheckCircle2, 
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Hash, Building2
} from 'lucide-react';
import CityModal from '../components/CityModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const CityList: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  
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

  const loadCities = useCallback(async (search = searchTerm, sort = sortBy, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.cities.list(search, sort, page, perPage);
      setCities(response.data);
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
      loadCities(searchTerm, sortBy, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortBy]);

  // Handle page changes
  useEffect(() => {
    if (currentPage !== 1) {
        loadCities(searchTerm, sortBy, currentPage);
    }
  }, [currentPage]);

  const handleCreateOrUpdate = async (formData: Partial<City>) => {
    setActionLoading(true);
    setServerErrors(null);
    try {
        if (selectedCity) {
            await api.cities.update(selectedCity.id, formData);
            addToast('success', 'City updated successfully.');
        } else {
            await api.cities.create(formData);
            addToast('success', 'New city created.');
        }
        setModalOpen(false);
        loadCities(searchTerm, sortBy, 1);
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
    if (!cityToDelete) return;
    setDeleteLoading(true);
    try {
        await api.cities.delete(cityToDelete.id);
        addToast('warning', `City "${cityToDelete.name}" removed.`);
        setDeleteModalOpen(false);
        loadCities(searchTerm, sortBy, 1);
    } catch (err: any) {
        addToast('error', err.message || 'Delete failed.');
    } finally {
        setDeleteLoading(false);
        setCityToDelete(null);
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

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO 
        title="Cities Management" 
        description="Manage cities and municipalities for your platform."
      />
      <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
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
                <Building2 className="w-7 h-7 text-eco-600" /> Cities & Municipalities
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage cities and municipalities for your platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={() => loadCities(searchTerm, sortBy, currentPage)} className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search name or code..." 
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
            <button onClick={() => { setSelectedCity(null); setServerErrors(null); setModalOpen(true); }} className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95">
                <Plus className="w-5 h-5" />
                <span>Add City</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5" /> Context
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="text-xs font-medium text-gray-500">
                    Displaying <span className="text-gray-900 font-bold">{cities.length}</span> cities
                </div>
            </div>
            {searchTerm && (
                <div className="text-[10px] font-bold text-eco-600 uppercase tracking-widest italic">
                    Filtering by: "{searchTerm}"
                </div>
            )}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('name')}>
                            <div className="flex items-center gap-2">City Name <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('code')}>
                            <div className="flex items-center justify-center gap-2">Code <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Province</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading && cities.length === 0 ? (
                        Array.from({length: 4}).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={5} className="px-6 py-6"><div className="h-5 bg-gray-100 rounded-lg w-full"></div></td>
                            </tr>
                        ))
                    ) : cities.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-5" />
                                <p className="font-bold text-lg">No cities found.</p>
                                <p className="text-sm">Try adjusting your search or add a new city.</p>
                            </td>
                        </tr>
                    ) : (
                        cities.map((city) => (
                            <tr key={city.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors">{city.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-mono font-bold border border-gray-200">
                                        <Hash className="w-3 h-3" /> {city.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-3.5 h-3.5 text-eco-500" />
                                        {city.province?.name || 'Unknown'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-500 italic line-clamp-1 max-w-xs">{city.description || 'No description provided.'}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                        <button onClick={() => { setSelectedCity(city); setServerErrors(null); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100" title="Edit City">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => { setCityToDelete(city); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100" title="Delete City">
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
                    Record <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span> 
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
                                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                                        currentPage === pageNum 
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

      <CityModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateOrUpdate} city={selectedCity} loading={actionLoading} serverErrors={serverErrors} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete City" message={`Are you sure you want to remove "${cityToDelete?.name}"? This action cannot be undone.`} loading={deleteLoading} />
    </div>
  );
};

export default CityList;
