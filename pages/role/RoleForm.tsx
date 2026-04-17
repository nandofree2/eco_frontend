import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Role } from '../../types';
import SEO from '../../components/SEO';
import { ArrowLeft, Shield, Check, Menu as MenuIcon, AlertCircle, Info } from 'lucide-react';
import { Action, Subject } from '../../services/ability';

const RESOURCES: Subject[] = ['User', 'Role', 'UnitOfMeasurement', 'Product', 'Category', 'Dashboard', 'Province', 'City', 'Branch'];
const ACTIONS: Action[] = ['manage', 'read', 'create', 'update', 'destroy', 'see_menu'];

const RoleForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<Role, 'id' | 'created_at'>>({
    name: '',
    description: '',
    permissions: {}
  });

  useEffect(() => {
    const initData = async () => {
      if (!isEdit) {
        const initialPerms: Record<string, string[]> = {};
        RESOURCES.forEach(res => { initialPerms[res] = []; });
        setFormData(prev => ({ ...prev, permissions: initialPerms }));
      } else if (id) {
        setLoading(true);
        try {
          const role = await api.roles.get(id);
          setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || {}
          });
        } catch (err) {
          console.error('Failed to load role', err);
        } finally {
          setLoading(false);
        }
      }
    };
    initData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      if (isEdit && id) {
        await api.roles.update(id, formData);
      } else {
        await api.roles.create(formData);
      }
      navigate('/roles');
    } catch (error) {
      console.error(error);
      alert('Failed to save role');
    } finally {
      setSaveLoading(false);
    }
  };

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

  const toggleRow = (resource: string) => {
    const current = formData.permissions[resource] || [];
    const isFull = current.length === ACTIONS.length;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: isFull ? [] : [...ACTIONS]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-600 mb-4"></div>
        <p className="text-gray-500 font-bold">Fetching Policy Details...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <SEO
        title={isEdit ? 'Update Authorization Policy' : 'Create Access Role'}
        description="Configure fine-grained access control and permissions for your platform roles."
      />
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-eco-600 px-8 py-6 flex items-center justify-between text-white">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8" />
              {isEdit ? 'Update Authorization Policy' : 'Create Access Role'}
            </h1>
            <p className="text-eco-50 text-sm mt-1 opacity-80">Define resource permissions and UI visibility.</p>
          </div>
          <button onClick={() => navigate('/roles')} className="bg-eco-700 hover:bg-eco-800 p-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-eco-800/20">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                Role Identifier
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all font-bold text-gray-800"
                placeholder="e.g. Regional Auditor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">Functional Scope</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all text-gray-600"
                placeholder="Describe the intended use of this role..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-eco-100 text-eco-600 rounded-lg">
                  <MenuIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Permission Matrix</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-eco-500 rounded-full"></div> Allowed</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-200 rounded-full"></div> Denied</div>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden shadow-inner">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Target Resource</th>
                    {ACTIONS.map(action => (
                      <th key={action} className="px-3 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest min-w-[80px]">
                        {action.replace('_', ' ')}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-xs font-bold text-eco-600 uppercase tracking-widest">Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/40">
                  {RESOURCES.map((resource) => {
                    const perms = formData.permissions[resource] || [];
                    const isFull = perms.length === ACTIONS.length;
                    return (
                      <tr key={resource} className="hover:bg-eco-50/20 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-bold text-gray-900 text-sm">{resource}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">System Entity</p>
                        </td>
                        {ACTIONS.map(action => (
                          <td key={action} className="px-3 py-5 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(resource, action)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto transition-all border-2 ${perms.includes(action)
                                  ? 'bg-eco-600 border-eco-600 text-white shadow-lg shadow-eco-100 active:scale-90'
                                  : 'bg-white border-gray-100 text-transparent hover:border-eco-200'
                                }`}
                            >
                              <Check className="w-4 h-4" strokeWidth={4} />
                            </button>
                          </td>
                        ))}
                        <td className="px-6 py-5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRow(resource)}
                            className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full transition-all tracking-wider ${isFull
                                ? 'bg-eco-100 text-eco-700 shadow-sm border border-eco-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                          >
                            {isFull ? 'FULL ACCESS' : 'GRANT ALL'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-800 mb-1">Authorization Guard</p>
              <p className="text-amber-700 opacity-90 leading-relaxed italic">
                By default, the <strong>manage</strong> action provides override access for all operations on a resource.
                <strong>see_menu</strong> controls visibility in the left sidebar navigation.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="bg-eco-600 hover:bg-eco-700 text-white font-bold px-10 py-3.5 rounded-2xl transition-all shadow-xl shadow-eco-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {saveLoading ? <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5" /> : null}
              {saveLoading ? 'Syncing Policy...' : 'Commit Authorization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RoleForm;
