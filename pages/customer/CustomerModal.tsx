import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Users, AlertCircle, Phone, MapPin } from 'lucide-react';
import { Customer, Membership } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  customer?: Customer | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSubmit, customer, loading, serverErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    membership: Membership.Regular,
    description: ''
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number || '',
        address: customer.address || '',
        membership: customer.membership ?? Membership.Regular,
        description: customer.description || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        membership: Membership.Regular,
        description: ''
      });
    }
  }, [customer, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.name) nameRef.current?.focus();
      else if (serverErrors.email) emailRef.current?.focus();
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const hasError = (field: string) => serverErrors && serverErrors[field];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            {customer ? 'Edit Customer' : 'New Customer'}
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
          onSubmit(formData);
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
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold mb-1 ${hasError('email') ? 'text-red-600' : 'text-gray-700'}`}>Email Address</label>
              <input
                ref={emailRef}
                type="email"
                required
                className={`w-full px-4 py-2 border rounded-xl outline-none transition-all ${hasError('email') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1 ${hasError('phone_number') ? 'text-red-600' : 'text-gray-700'}`}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-all ${hasError('phone_number') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="e.g. +123456789"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Membership</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none"
              value={formData.membership}
              onChange={(e) => setFormData({ ...formData, membership: Number(e.target.value) as Membership })}
            >
              <option value={Membership.Regular}>Regular</option>
              <option value={Membership.Member}>Member</option>
              <option value={Membership.VIP}>VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none min-h-[80px]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full street address..."
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-transform">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-eco-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
