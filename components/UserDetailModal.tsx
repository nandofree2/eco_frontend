import React from 'react';
import { X, User as UserIcon, Mail, Shield, Calendar, Clock, UserCheck, Activity } from 'lucide-react';
import { User } from '../types';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

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

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-blue-100 text-blue-700 border-blue-200';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Details
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
              <UserIcon className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status_user)}`}>
                  {(user.status_user || '').toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  {user.role_name || 'No Role'}
                </span>
              </div>
              <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                System Information
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Creator
                  </span>
                  <span className="text-sm font-bold text-gray-900">{user.creator_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Created At
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Updated At
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Abilities Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Current Abilities
              </h4>
              <div className="space-y-3">
                {user.current_abilities && typeof user.current_abilities === 'object' && !Array.isArray(user.current_abilities) ? (
                  Object.entries(user.current_abilities).map(([resource, actions]) => (
                    <div key={resource} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-1.5">
                        <span className="text-xs font-bold text-eco-700 uppercase tracking-wider">{resource}</span>
                        <span className="text-[10px] bg-eco-100 text-eco-600 px-1.5 py-0.5 rounded font-bold">
                          {(actions as string[]).length} Actions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(actions as string[]).map((action: string, idx: number) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] font-medium text-gray-600 shadow-sm"
                          >
                            {action.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : user.current_abilities && Array.isArray(user.current_abilities) && user.current_abilities.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-2">
                    {user.current_abilities.map((ability: any, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-mono font-bold text-gray-600 shadow-sm"
                      >
                        {ability.action} {ability.subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
                    <Shield className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 italic">No specific abilities assigned</p>
                  </div>
                )}
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

export default UserDetailModal;
