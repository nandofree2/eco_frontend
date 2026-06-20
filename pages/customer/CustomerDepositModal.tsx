import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import {
  X, Banknote, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Wallet
} from 'lucide-react';

interface CustomerDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: (amount: number) => Promise<void>;
  loading: boolean;
}

const CustomerDepositModal: React.FC<CustomerDepositModalProps> = ({
  isOpen, onClose, customer, onConfirm, loading
}) => {
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setShowConfirm(false);
      setError('');
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
  };

  const numericAmount = Number(amount) || 0;
  const currentDeposit = customer.deposit ?? 0;
  const newTotal = currentDeposit + numericAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmount(raw);
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      setError('Please enter a deposit amount greater than 0.');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    await onConfirm(numericAmount);
    setShowConfirm(false);
  };

  return (
    <>
      {/* Form Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Add Deposit - {customer.name}
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-transform active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Current saldo */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-11 h-11 rounded-lg bg-eco-100 text-eco-600 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Current Deposit Saldo</p>
                <p className="text-lg font-black text-eco-700 leading-tight">{formatCurrency(currentDeposit)}</p>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className={`block text-sm font-bold mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}>Add Deposit Amount</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={amount ? Number(amount).toLocaleString('id-ID') : ''}
                  onChange={handleAmountChange}
                  placeholder="e.g. 50000"
                  className={`w-full pl-10 pr-16 py-2 border rounded-xl outline-none transition-all ${error ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">IDR</span>
              </div>
              {error && <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
            </div>

            {/* Live preview */}
            <div className="bg-gradient-to-br from-eco-50 to-gray-50 rounded-xl border border-eco-100 p-4 space-y-2">
              <p className="text-[10px] font-bold text-eco-700 uppercase tracking-widest mb-1">Live Preview</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Current</span>
                <span className="font-bold text-gray-700">{formatCurrency(currentDeposit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Adding</span>
                <span className="font-bold text-eco-600">+ {formatCurrency(numericAmount)}</span>
              </div>
              <div className="border-t border-eco-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-black text-gray-900 uppercase">New Total</span>
                <span className="text-lg font-black text-eco-700">{formatCurrency(newTotal)}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-transform">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-eco-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-eco-700 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all">
                <ArrowRight className="w-5 h-5" /> Continue
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal (stacked) */}
      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-eco-100 flex items-center justify-center text-eco-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Deposit</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You are adding <span className="font-black text-eco-700">{formatCurrency(numericAmount)}</span> to <span className="font-bold text-gray-900">{customer.name}</span>.
              </p>

              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Previous Deposit</span>
                  <span className="text-sm font-bold text-gray-700">{formatCurrency(currentDeposit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-eco-600 uppercase tracking-widest">Added Amount</span>
                  <span className="text-sm font-bold text-eco-600">+ {formatCurrency(numericAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900 uppercase">New Deposit Total</span>
                  <span className="text-lg font-black text-eco-700">{formatCurrency(newTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="flex-1 bg-eco-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-eco-200 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Confirm Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerDepositModal;
