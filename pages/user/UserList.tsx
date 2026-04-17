import React from 'react';
import { useUserList } from './UserScript';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, UserCircle,
  ArrowUpDown, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, ChevronLeft, ChevronRight, Mail, Filter, ShieldCheck, Clock, Shield
} from 'lucide-react';
import UserModal from './UserModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import UserDetailModal from './UserDetailModal';

const UserList: React.FC = () => {
  const { users, roles, loading, searchTerm, setSearchTerm, selectedRoleName, setSelectedRoleName, sortBy, currentPage, perPage, pagination, isModalOpen, setModalOpen, isDeleteModalOpen, setDeleteModalOpen, isDetailModalOpen, setDetailModalOpen, selectedUser, setSelectedUser, userDetail, setUserDetail, userToDelete, setUserToDelete, actionLoading, deleteLoading, serverErrors, setServerErrors, toasts, loadData, handleCreateOrUpdate, confirmDelete, toggleSort, handlePageChange, getRoleColor, UserStatus
  } = useUserList();

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="System Identities"
        description="Manage employee access, authentication, and platform roles for your marketplace."
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

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <UserCircle className="w-7 h-7 text-eco-600" /> System Identities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee access, authentication, and platform roles.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Role Filter Dropdown */}
          <div className="relative group min-w-[180px]">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <select
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full shadow-sm appearance-none font-medium text-gray-700 text-sm"
              value={selectedRoleName}
              onChange={(e) => setSelectedRoleName(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search name or email..."
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
          <button onClick={() => { setSelectedUser(null); setServerErrors(null); setModalOpen(true); }} className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Filters Header */}
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Filter Active
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-xs font-medium text-gray-500">
              Displaying <span className="text-gray-900 font-bold">{users.length}</span> active records
            </div>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
            Query: {searchTerm || 'None'} | Role: {selectedRoleName || 'All'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">Identity <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Access Authorization</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Platform Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Operation Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && users.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-6"><div className="h-5 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20"><UserCircle className="w-16 h-16 mx-auto mb-4 opacity-5" /><p className="font-bold text-lg">No identities match your search.</p><p className="text-sm">Try adjusting your role filter or search query.</p></td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-eco-50 to-eco-100 flex items-center justify-center text-eco-700 font-extrabold shadow-sm border border-eco-200/50 cursor-pointer hover:scale-105 transition-transform" onClick={() => { setUserDetail(user); setDetailModalOpen(true); }}>{user.name.charAt(0)}</div>
                        <div>
                          <p
                            className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors cursor-pointer hover:underline decoration-eco-500/30 underline-offset-4"
                            onClick={() => { setUserDetail(user); setDetailModalOpen(true); }}
                          >
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5"><Mail className="w-3 h-3" />{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border uppercase tracking-widest ${getRoleColor(user.role?.name || user.role_name || '')}`}>
                          {user.role?.name || user.role_name || 'Observer'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <ShieldCheck className="w-3 h-3 text-eco-500" />
                          System Policy Assigned
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${user.status_user === UserStatus.Active ? 'bg-green-50 text-green-700 border-green-100' :
                          user.status_user === UserStatus.Inactive ? 'bg-gray-50 text-gray-700 border-gray-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          {user.status_user === UserStatus.Active ? 'Active' :
                            user.status_user === UserStatus.Inactive ? 'Inactive' :
                              'Suspended'}
                        </span>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">Last Login</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button
                          onClick={() => { setSelectedUser(user); setServerErrors(null); setModalOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setUserToDelete(user); setDeleteModalOpen(true); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                          title="Revoke Access"
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
              Record <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span>
              <span className="mx-2">of</span>
              <span className="text-eco-600">{pagination.total_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 hover:border-eco-200 shadow-sm disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1 overflow-x-auto max-w-[200px]">
                {Array.from({ length: pagination.total_pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0 ${currentPage === i + 1 ? 'bg-eco-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-eco-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.total_pages || loading}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 hover:border-eco-200 shadow-sm disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <UserModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateOrUpdate} user={selectedUser} loading={actionLoading} serverErrors={serverErrors} />
      <UserDetailModal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} user={userDetail} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Revoke User Access" message={`WARNING: This will permanently block "${userToDelete?.name}" from accessing the platform. All associated session tokens will be invalidated.`} loading={deleteLoading} />
    </div>
  );
};

export default UserList;
