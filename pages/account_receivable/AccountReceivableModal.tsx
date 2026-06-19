import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Receipt } from 'lucide-react';
import { AccountReceivable, PaymentType } from '../../types';
import SearchableDropdown from '../../components/SearchableDropdownAccountReceivable';
import { api } from '../../services/api';

interface AccountReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AccountReceivable | null;
  onSave: (data: any) => void;
  loading: boolean;
  errors: any;
}

const AccountReceivableModal: React.FC<AccountReceivableModalProps> = ({
  isOpen, onClose, record, onSave, loading, errors
}) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_address: '',
    customer_deposit: '',
    invoice_id: '',
    invoice_code: '',
    amount: '',
    payment_type: 'cash' as PaymentType,
    payment_date: new Date().toISOString().split('T')[0]
  });

  const [paymentRemaining, setPaymentRemaining] = useState<number>(0);
  const [customerDeposit, setCustomerDeposit] = useState<number>(0);
  const [invoicesForCustomer, setInvoicesForCustomer] = useState<any[]>([]);

  useEffect(() => {
    if (record) {
      setFormData({
        customer_id: '', // dropdowns use initialName for display in edit mode
        customer_name: record.customer_name || '',
        customer_address: (record as any).customer_address || '',
        customer_deposit: (record as any).customer_deposit?.toString() || '',
        invoice_id: (record as any).invoice_id || '',
        invoice_code: record.invoice_code || '',
        amount: record.amount.toString(),
        payment_type: record.payment_type || 'cash',
        payment_date: record.payment_date || new Date().toISOString().split('T')[0]
      });
      // Use fields now included in the serializer response
      setPaymentRemaining(Number((record as any).payment_remaining) || 0);
      setCustomerDeposit(Number((record as any).customer_deposit) || 0);
    } else {
      setFormData({
        customer_id: '',
        customer_name: '',
        customer_address: '',
        customer_deposit: '',
        invoice_id: '',
        invoice_code: '',
        amount: '',
        payment_type: 'cash',
        payment_date: new Date().toISOString().split('T')[0]
      });
      setPaymentRemaining(0);
      setCustomerDeposit(0);
      setInvoicesForCustomer([]);
    }
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleCustomerChange = async (id: string, name?: string, customerAddress?: string, customerDeposit?: number) => {
    const deposit = Number(customerDeposit ?? 0);

    setFormData(prev => ({
      ...prev,
      customer_id: id,
      customer_name: name || '',
      customer_address: customerAddress || '',
      customer_deposit: deposit ? deposit.toString() : '',
      invoice_id: '',
      invoice_code: '',
      amount: '',
    }));
    setPaymentRemaining(0);
    setCustomerDeposit(deposit);
    setInvoicesForCustomer([]);

    if (id) {
      try {
        const res = await api.invoices.invoice_list_by_customer(id);
        setInvoicesForCustomer(res);
      } catch (err) {
        console.error("Failed to load invoices", err);
      }
    }
  };

  const handleInvoiceChange = (id: string, name?: string) => {
    const selectedInvoice = invoicesForCustomer.find(i => i.id === id);
    const invoiceDeposit = selectedInvoice?.customer_deposit ?? customerDeposit;

    if (selectedInvoice) {
      setPaymentRemaining(Number(selectedInvoice.payment_remaining) || 0);
      setCustomerDeposit(Number(invoiceDeposit) || 0);
      setFormData(prev => ({ ...prev, customer_deposit: String(Number(invoiceDeposit) || 0) }));
    }
    setFormData(prev => ({ ...prev, invoice_id: id, invoice_code: name || '', amount: '' }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const remainingBill = Math.max(0, paymentRemaining - customerDeposit);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (Number(val) > remainingBill && !record) { // Only restrict if new record
      val = remainingBill.toString();
    }
    setFormData(prev => ({ ...prev, amount: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      invoice_id: formData.invoice_id || (record as any)?.invoice_id,
      amount: Number(formData.amount),
      payment_type: formData.payment_type,
      payment_date: formData.payment_date,
      approval_status: 'draft' // default
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {record ? 'Edit Account Receivable' : 'New Account Receivable'}
              </h2>
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">
                {record ? 'Update existing record' : 'Record a customer payment'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {errors?.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <ul className="text-xs font-medium space-y-1">
                {errors.general.map((err: string, i: number) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <form id="ar-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableDropdown
                label="Customer"
                value={formData.customer_id}
                initialName={formData.customer_name}
                onChange={handleCustomerChange}
                onSearch={async (q) => {
                  const res = await api.customers.customer_list(q);
                  return res.map(c => ({
                    id: c.id,
                    name: c.name,
                    customer_address: (c as any).address || '',
                    customer_deposit: Number((c as any).deposit ?? (c as any).customer_deposit ?? 0)
                  }));
                }}
                placeholder="Select Customer..."
                required
                compact={true}
              />

              <SearchableDropdown
                label="Invoice"
                value={formData.invoice_id}
                initialName={formData.invoice_code}
                onChange={handleInvoiceChange}
                onSearch={async (q) => {
                  return invoicesForCustomer
                    .filter(i => (i.code || '').toLowerCase().includes(q.toLowerCase()))
                    .map(i => ({ id: i.id, name: i.code }));
                }}
                placeholder={formData.customer_id ? "Select Invoice..." : "Select Customer First"}
                dependencies={[invoicesForCustomer]}
                required
                compact={true}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full h-[30px] px-3 py-1.5 bg-gray-50 border border-gray-200 focus:ring-eco-500/20 rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium text-gray-800 cursor-pointer"
                  required
                />
                {errors?.payment_date && (
                  <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.payment_date[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  Payment Remaining
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Rp</span>
                  <input
                    type="text"
                    value={formatCurrency(paymentRemaining).replace(/Rp\s?/, '')}
                    readOnly
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg outline-none text-xs font-bold text-gray-900 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  Customer Deposit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Rp</span>
                  <input
                    type="text"
                    initialName={formData.customer_deposit}
                    value={formatCurrency(customerDeposit).replace(/Rp\s?/, '')}
                    readOnly
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg outline-none text-xs font-bold text-blue-600 cursor-not-allowed"
                  />
                </div>
              </div>



              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium"
                    placeholder="0"
                    required
                    min="1"
                    max={!record ? remainingBill : undefined}
                  />
                </div>
                {errors?.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount[0]}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Payment Type</label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as PaymentType })}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium appearance-none"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                </select>
                {errors?.payment_type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.payment_type[0]}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  Customer Address
                </label>
                <input
                  type="text"
                  value={formData.customer_address}
                  readOnly
                  placeholder="—"
                  className="w-full px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg outline-none text-xs font-medium text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ar-form"
            disabled={loading || (!record && (!formData.customer_id || !formData.invoice_id))}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            ) : (
              record ? 'Update Record' : 'Save Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivableModal;
