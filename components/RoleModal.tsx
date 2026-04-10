import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Shield, AlertCircle, Check } from 'lucide-react';
import { Role } from '../types';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  role?: Role | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const RESOURCES = ['User', 'Role', 'UnitOfMeasurement', 'Product', 'Category', 'Province', 'City', 'Branch'];
const ACTIONS = ['manage', 'read', 'create', 'update', 'destroy', 'see_menu'];

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSubmit, role, loading, serverErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, string[]>
  });

  useEffect(() => {
    if (role) {
      // Deep clone permissions to avoid reference sharing
      const initialPerms: Record<string, string[]> = {};
      RESOURCES.forEach(res => {
          // Fix: Convert 'string[]' to 'string' requires 'unknown' cast for legacy data support
          initialPerms[res] = Array.isArray(role.permissions?.[res]) 
            ? [...role.permissions[res]] 
            : (typeof role.permissions?.[res] === 'string' ? [role.permissions[res] as unknown as string] : []);
      });

      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: initialPerms
      });
    } else {
      const initialPerms: Record<string, string[]> = {};
      RESOURCES.forEach(res => initialPerms[res] = []);
      setFormData({ name: '', description: '', permissions: initialPerms });
    }
  }, [role, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (resource: string, action: string) => {
    setFormData(prev => {
      const currentActions = prev.permissions[resource] || [];
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter(a => a !== action)
        : [...currentActions, action];
      return {
        ...prev,
        permissions: { ...prev.permissions, [resource]: updatedActions }
      };
    });
  };

  const toggleAll = (resource: string) => {
      setFormData(prev => {
          const current = prev.permissions[resource] || [];
          const allSelected = current.length === ACTIONS.length;
          return {
              ...prev,
              permissions: { ...prev.permissions, [resource]: allSelected ? [] : [...ACTIONS] }
          };
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {role ? 'Edit Role Authorization' : 'New System Role'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-transform active:scale-90"><X className="w-6 h-6" /></button>
        </div>

        {serverErrors && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">Validation Failed</p>
                    <div className="mt-0.5 space-y-0.5">
                        {Object.entries(serverErrors).map(([field, messages]) => (
                            <p key={field} className="text-xs text-red-600 leading-relaxed">
                                <span className="capitalize font-bold">{field.replace('_', ' ')}</span>: {(messages as string[]).join(', ')}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Manager"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Store manager with catalog access"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                            {ACTIONS.map(a => (
                                <th key={a} className="px-2 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{a.replace('_', ' ')}</th>
                            ))}
                            <th className="px-4 py-3 text-xs font-bold text-eco-600 uppercase tracking-widest text-center">Batch</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RESOURCES.map(res => {
                            const perms = formData.permissions[res] || [];
                            const isAll = perms.length === ACTIONS.length;
                            return (
                                <tr key={res} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-4 font-bold text-gray-900 text-sm">{res}</td>
                                    {ACTIONS.map(action => (
                                        <td key={action} className="px-2 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => togglePermission(res, action)}
                                                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all mx-auto ${perms.includes(action) ? 'bg-eco-500 border-eco-500 text-white shadow-md shadow-eco-100' : 'bg-white border-gray-200 hover:border-eco-400'}`}
                                            >
                                                {perms.includes(action) && <Check className="w-4 h-4" strokeWidth={3} />}
                                            </button>
                                        </td>
                                    ))}
                                    <td className="px-4 py-4 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => toggleAll(res)}
                                            className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all uppercase tracking-tighter ${isAll ? 'bg-eco-100 text-eco-700' : 'bg-gray-100 text-gray-500 hover:bg-eco-50 hover:text-eco-600'}`}
                                        >
                                            {isAll ? 'Clear' : 'All'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-white active:scale-95 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-eco-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;