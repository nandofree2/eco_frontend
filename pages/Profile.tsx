import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import SEO from '../components/SEO';
import { 
  User as UserIcon, Mail, Shield, Save, 
  Loader2, Lock, Eye, EyeOff, CheckCircle2, 
  AlertCircle, KeyRound, Clock, Info
} from 'lucide-react';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.users.getProfile();
      setUser(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
      });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setFieldErrors({});
    try {
      const updated = await api.users.updateProfile(user.id, { 
        name: formData.name, 
        email: formData.email 
      });
      setUser(updated);
      showToast('success', 'Profile information updated successfully');
    } catch (err: any) {
      if (err.status === 422) setFieldErrors(err.errors);
      showToast('error', err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passData.newPassword !== passData.confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    
    setSaving(true);
    setFieldErrors({});
    try {
      await api.users.changePassword(user.id, {
        current_password: passData.currentPassword,
        password: passData.newPassword,
        password_confirmation: passData.confirmPassword
      });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Password updated successfully');
    } catch (err: any) {
      if (err.status === 422) setFieldErrors(err.errors || {});
      showToast('error', err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-eco-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Retrieving Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <SEO 
        title="My Profile" 
        description="Manage your personal account information and security settings."
      />
      {toast && (
        <div className={`fixed top-20 right-6 z-[200] p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          <p className="text-sm font-bold">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-eco-100 border-4 border-white shadow-xl flex items-center justify-center text-eco-700 text-4xl font-black">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="px-3 py-1 bg-eco-50 text-eco-700 border border-eco-100 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {user?.role?.name || 'Authorized User'}
              </span>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-eco-600" />
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Account Information</h3>
            </div>
            <form onSubmit={handleUpdateInfo} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all font-bold text-gray-800"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-2 text-xs text-red-500 font-bold">{fieldErrors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="email"
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none cursor-not-allowed font-bold text-gray-400"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-2 text-xs text-red-500 font-bold">{fieldErrors.email[0]}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-eco-600 hover:bg-eco-700 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-eco-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 text-amber-600">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Security & Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all font-bold"
                    value={passData.currentPassword}
                    onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.current_password && <p className="mt-2 text-xs text-red-500 font-bold">Current password {fieldErrors.current_password[0]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type={showPass ? "text" : "password"}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all font-bold"
                      value={passData.newPassword}
                      onChange={e => setPassData({...passData, newPassword: e.target.value})}
                    />
                  </div>
                  {fieldErrors.password && <p className="mt-2 text-xs text-red-500 font-bold">Password {fieldErrors.password[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type={showPass ? "text" : "password"}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all font-bold"
                      value={passData.confirmPassword}
                      onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                  Update Security
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-eco-600 to-eco-800 rounded-3xl p-8 text-white shadow-xl shadow-eco-200">
            <h4 className="text-lg font-black uppercase tracking-widest mb-4">Platform Identity</h4>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">User ID</p>
                <p className="font-mono text-sm font-bold opacity-90 truncate">#{user?.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Assigned Role</p>
                <p className="text-sm font-bold opacity-90">{user?.role?.name || 'Authorized Member'}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-medium leading-relaxed opacity-70 italic">
                  "Your account is protected by enterprise-grade encryption. Ensure your password is at least 8 characters long with a mix of symbols."
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <h5 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Activity Log</h5>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Last profile update was performed via the web management interface. 
              <br/><br/>
              Session remains valid for another 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;