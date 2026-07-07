import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import {
  X, Banknote, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Wallet, MinusCircle, PlusCircle, Calendar,
  FileText
} from 'lucide-react';

interface CustomerDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: (amount: number, paymentType: string, depositType: string, description: string, depositDate: string) => Promise<void>;
  loading: boolean;
}

const CustomerDepositModal: React.FC<CustomerDepositModalProps> = ({
  isOpen, onClose, customer, onConfirm, loading
}) => {
  const [amount, setAmount] = useState('');
  const [depositType, setDepositType] = useState('topup');
  const [paymentType, setPaymentType] = useState('cash');
  const [showConfirm, setShowConfirm] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setShowConfirm(false);
      setError('');
      setDepositDate(new Date().toISOString().split('T')[0]);
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
  const currentDeposit = Number(customer.deposit) ?? 0;
  const newTotal = depositType == 'topup' ? currentDeposit + numericAmount : currentDeposit - numericAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmount(raw);
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositType === 'refund' && numericAmount > currentDeposit) {
      setError('Refund amount cannot be greater than current deposit.');
      return;
    }
    if (numericAmount <= 0) {
      setError('Please enter a deposit amount greater than 0.');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    await onConfirm(numericAmount, paymentType, depositType, description, depositDate);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
          <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Create Deposit - {customer.name}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-11 h-11 rounded-lg bg-eco-100 text-eco-600 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Current Deposit Saldo</p>
                <p className="text-lg font-black text-eco-700 leading-tight">{formatCurrency(currentDeposit)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Payment Type</label>
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${paymentType === 'cash' ? 'bg-eco-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                      }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Cash
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('transfer')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${paymentType === 'transfer' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                      }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Transfer
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Deposit Type</label>
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => setDepositType('topup')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${depositType === 'topup' ? 'bg-eco-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                      }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Topup
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositType('refund')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${depositType === 'refund' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                      }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    Refund
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Deposit Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 text-sm font-medium text-gray-700 bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}>Amount</label>
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
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Description / Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tambahkan catatan di sini (misal: Sisa pembayaran PO #0012, Tarik tunai deposit, dll)..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 text-sm text-gray-700 placeholder-gray-400 transition-all resize-none"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-eco-50 to-gray-50 rounded-xl border border-eco-100 p-4 space-y-2">
              <p className="text-[10px] font-bold text-eco-700 uppercase tracking-widest mb-1">Live Preview</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Current</span>
                <span className="font-bold text-gray-700">{formatCurrency(currentDeposit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                {depositType === 'topup' ? (
                  <>
                    <span className="text-gray-500 font-medium">Add</span>
                    <span className="font-bold text-eco-600">+ {formatCurrency(numericAmount)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 font-medium">Refund</span>
                    <span className="font-bold text-red-600">- {formatCurrency(numericAmount)}</span>
                  </>
                )}
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
            <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Confirm Deposit - {customer.name}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                {depositType === 'topup' ? (
                  <>
                    <span>You are adding </span>
                    <span className="font-black text-eco-700">{formatCurrency(numericAmount)}</span>
                    <span> to </span>
                    <span className="font-bold text-gray-900">{customer.name}</span>.
                  </>
                ) : (
                  <>
                    <span>You are refunding </span>
                    <span className="font-black text-red-700">{formatCurrency(numericAmount)}</span>
                    <span> from </span>
                    <span className="font-bold text-gray-900">{customer.name}</span>.
                  </>
                )}
              </p>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Previous Deposit</span>
                  <span className="text-sm font-bold text-gray-700">{formatCurrency(currentDeposit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  {depositType === 'topup' ? (
                    <>
                      <span className="text-xs font-bold text-eco-600 uppercase tracking-widest">Added Amount</span>
                      <span className="text-sm font-bold text-eco-600">+ {formatCurrency(numericAmount)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Refunded Amount</span>
                      <span className="text-sm font-bold text-red-600">- {formatCurrency(numericAmount)}</span>
                    </>
                  )}
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
