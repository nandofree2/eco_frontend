import React from 'react';
import { X, Users, Mail, Phone, MapPin, Calendar, Clock, Activity } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMembershipBadge = (membership?: number) => {
    switch (membership) {
      case 0: return { label: 'REGULAR', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      case 1: return { label: 'MEMBER', color: 'bg-green-100 text-green-700 border-green-200' };
      case 2: return { label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      default: return { label: 'REGULAR', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Details
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Info */}
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="w-24 h-24 rounded-full bg-eco-50 flex items-center justify-center text-eco-600 border-4 border-white shadow-lg shrink-0">
              <Users className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMembershipBadge(customer.membership).color}`}>
                  {getMembershipBadge(customer.membership).label}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact & Address Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Contact Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Address</p>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {customer.address || 'No address provided'}
                  </p>
                </div>
                {customer.description && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Notes / Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                      "{customer.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                System Information
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Created At
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(customer.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Updated At
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(customer.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
