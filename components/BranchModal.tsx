import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Building2, AlertCircle, MapPin, Phone, Activity } from 'lucide-react';
import { Branch, City, BranchStatus } from '../types';
import { api } from '../services/api';
import SearchableDropdown from './SearchableDropdown';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Branch>) => Promise<void>;
  branch?: Branch | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSubmit, branch, loading, serverErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city_id: '',
    address: '',
    phone: '',
    status_branch: BranchStatus.Active,
    description: ''
  });
  const [initialCityName, setInitialCityName] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        code: branch.code || '',
        city_id: branch.city_id || '',
        address: branch.address || '',
        phone: branch.phone || '',
        status_branch: branch.status_branch ?? BranchStatus.Active,
        description: branch.description || ''
      });
      setInitialCityName(branch.city?.name || '');
    } else {
      setFormData({ 
        name: '', 
        code: '', 
        city_id: '', 
        address: '', 
        phone: '', 
        status_branch: BranchStatus.Active,
        description: '' 
      });
      setInitialCityName('');
    }
  }, [branch, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.name) nameRef.current?.focus();
      else if (serverErrors.code) codeRef.current?.focus();
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      city_id: formData.city_id || null
    };
    await onSubmit(submissionData);
  };

  const hasError = (field: string) => serverErrors && serverErrors[field];

  const handleCitySearch = async (q: string) => {
    return await api.cities.city_list(q);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {branch ? 'Edit Branch' : 'New Branch'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <SearchableDropdown
            label="City"
            required
            placeholder="Search city..."
            value={formData.city_id}
            initialName={initialCityName}
            onSearch={handleCitySearch}
            onChange={(id) => setFormData({ ...formData, city_id: id })}
            error={!!hasError('city_id')}
          />
          {hasError('city_id') && (
            <p className="mt-1 text-xs text-red-500 font-bold">City {serverErrors?.city_id?.join(', ')}</p>
          )}

          <div>
            <label className={`block text-sm font-bold mb-1 ${hasError('name') ? 'text-red-600' : 'text-gray-700'}`}>Branch Name</label>
            <input
              ref={nameRef}
              type="text"
              required
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all ${
                hasError('name') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
              }`}
              placeholder="e.g. Main Office"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {hasError('name') && (
              <p className="mt-1 text-xs text-red-500 font-bold">Name {serverErrors?.name?.join(', ')}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1 ${hasError('code') ? 'text-red-600' : 'text-gray-700'}`}>Branch Code</label>
            <input
              ref={codeRef}
              type="text"
              required
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all font-mono ${
                hasError('code') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
              }`}
              placeholder="e.g. BR001"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            {hasError('code') && (
              <p className="mt-1 text-xs text-red-500 font-bold">Code {serverErrors?.code?.join(', ')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all"
                placeholder="Full address..."
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all"
                placeholder="Phone number..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-eco-500" /> Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all bg-white"
              value={formData.status_branch}
              onChange={(e) => setFormData({ ...formData, status_branch: parseInt(e.target.value) })}
            >
              <option value={BranchStatus.Active}>Active</option>
              <option value={BranchStatus.Inactive}>Inactive</option>
              <option value={BranchStatus.Suspended}>Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all"
              placeholder="Provide context for this branch..."
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-eco-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {branch ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchModal;
