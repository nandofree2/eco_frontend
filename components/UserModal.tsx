import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, User as UserIcon, AlertCircle } from 'lucide-react';
import { User, Role, UserStatus } from '../types';
import { api } from '../services/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user, loading, serverErrors }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_id: '',
    status_user: UserStatus.Active
  });

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      api.roles.role_list().then(setRoles).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role_id: user.role_id || '',
        status_user: user.status_user ?? UserStatus.Active
      });
    } else {
      setFormData({ 
        name: '', 
        email: '', 
        role_id: roles[0]?.id || '',
        status_user: UserStatus.Active
      });
    }
  }, [user, roles, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.email) emailRef.current?.focus();
      else if (serverErrors.name) nameRef.current?.focus();
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const hasError = (field: string) => serverErrors && serverErrors[field];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {user ? 'Edit Identity' : 'New System User'}
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

        <form onSubmit={(e) => { 
          e.preventDefault(); 
          const submissionData = {
            ...formData,
            role_id: formData.role_id || null
          };
          onSubmit(submissionData); 
        }} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-1 ${hasError('name') ? 'text-red-600' : 'text-gray-700'}`}>Full Name</label>
            <input
              ref={nameRef}
              type="text"
              required
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all ${hasError('name') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1 ${hasError('email') ? 'text-red-600' : 'text-gray-700'}`}>Email Address</label>
            <input
              ref={emailRef}
              type="email"
              required
              disabled={Boolean(user)}
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all ${Boolean(user) ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${hasError('email') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {hasError('email') && <p className="mt-1 text-xs text-red-500 font-bold">Email {serverErrors?.email?.join(', ')}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none"
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                >
                    <option value="" disabled>Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none"
                    value={formData.status_user}
                    onChange={(e) => setFormData({...formData, status_user: e.target.value as UserStatus})}
                >
                    <option value={UserStatus.Active}>Active</option>
                    <option value={UserStatus.Inactive}>Inactive</option>
                    <option value={UserStatus.Suspended}>Suspended</option>
                </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-transform">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-eco-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {user ? 'Update Profile' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;