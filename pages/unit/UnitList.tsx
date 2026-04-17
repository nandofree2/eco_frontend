import React from 'react';
import { useUnitList } from './UnitScript';
import SEO from '../../components/SEO';
import {
    Plus, Search, Edit2, Trash2, Scale,
    ArrowUpDown, AlertTriangle, CheckCircle2,
    XCircle, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import UnitModal from './UnitModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const UnitList: React.FC = () => {
    const {
        units,
        loading,
        searchTerm,
        setSearchTerm,
        sortBy,
        currentPage,
        perPage,
        pagination,
        isModalOpen,
        setModalOpen,
        isDeleteModalOpen,
        setDeleteModalOpen,
        selectedUnit,
        unitToDelete,
        actionLoading,
        deleteLoading,
        serverErrors,
        highlightedId,
        toasts,
        loadUnits,
        handleCreateOrUpdate,
        confirmDelete,
        openDeleteModal,
        toggleSort,
        openModal,
        handlePageChange
    } = useUnitList();

    return (
        <div className="space-y-6 relative min-h-[500px]">
            <SEO
                title="Measurement Standards"
                description="Configure global units and packaging metrics for your sustainable products."
            />
            {/* Toast Notification Layer */}
            <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                    'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                        {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                        <p className="text-sm font-bold">{toast.message}</p>
                    </div>
                ))}
            </div>

            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Scale className="w-7 h-7 text-eco-600" />
                        Measurement Standards
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Configure global units and packaging metrics.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadUnits()}
                        className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name, code or abbreviation..."
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-72"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-eco-600 hover:bg-eco-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Unit</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors"
                                    onClick={() => toggleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        Name Standard
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-gray-900 transition-colors"
                                    onClick={() => toggleSort('code')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Code
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Abbr</th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-gray-900 transition-colors"
                                    onClick={() => toggleSort('quantity')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Base Quantity
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Context</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && units.length === 0 ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-5">
                                            <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="max-w-xs mx-auto text-gray-400">
                                            <Scale className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                            <p className="font-bold text-lg">No Results Found</p>
                                            <p className="text-sm mt-1">Try refining your search or create a new unit of measurement.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                units.map((unit) => (
                                    <tr
                                        key={unit.id}
                                        className={`group hover:bg-eco-50/30 transition-all duration-300 ${highlightedId === unit.id ? 'bg-green-50 animate-pulse' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">{unit.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono font-bold">
                                                {unit.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-500 font-bold italic">{unit.abbreviation}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-900 font-extrabold">{unit.quantity.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-400 text-xs italic line-clamp-1 max-w-[150px]" title={unit.description}>
                                                {unit.description || 'No description provided.'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(unit)}
                                                    className="p-2 text-eco-600 hover:bg-eco-100 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(unit)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete"
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

                {/* Pagination Controls */}
                {pagination && pagination.total_pages > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">{((currentPage - 1) * perPage) + 1}</span> to{' '}
                            <span className="font-bold text-gray-900">
                                {Math.min(currentPage * perPage, pagination.total_count)}
                            </span> of{' '}
                            <span className="font-bold text-gray-900">{pagination.total_count}</span> results
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-eco-600 disabled:opacity-50 disabled:hover:bg-white transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Simple Page Indicator */}
                            <div className="flex items-center gap-1 px-2">
                                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                                    .filter(page => {
                                        return (
                                            page === 1 ||
                                            page === pagination.total_pages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        );
                                    })
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${currentPage === page
                                                        ? 'bg-eco-600 text-white shadow-md'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-eco-500 hover:text-eco-600'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.total_pages || loading}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-eco-600 disabled:opacity-50 disabled:hover:bg-white transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Form Modal */}
            <UnitModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                unit={selectedUnit}
                loading={actionLoading}
                serverErrors={serverErrors}
            />

            {/* Polish Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Measurement Standard"
                message={`Are you absolutely sure you want to remove "${unitToDelete?.name}"? This action cannot be undone and may affect associated products.`}
                loading={deleteLoading}
            />
        </div>
    );
};

export default UnitList;