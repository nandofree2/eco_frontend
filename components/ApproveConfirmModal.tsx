import React from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';

interface ApproveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  loading: boolean;
}

const ApproveConfirmModal: React.FC<ApproveConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, message, loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 bg-green-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {loading ? 'Approving...' : 'Confirm Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveConfirmModal;
