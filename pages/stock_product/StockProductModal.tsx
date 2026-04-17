import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StockProduct, Branch } from '../../types';
import { X, Save, Loader2, AlertCircle, Info, Boxes, Building2, Package } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';

interface StockProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<StockProduct>) => Promise<void>;
  stockProduct?: StockProduct | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const StockProductModal: React.FC<StockProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stockProduct,
  loading,
  serverErrors
}) => {
  const isEdit = Boolean(stockProduct);

  const [formData, setFormData] = useState<Partial<StockProduct>>({
    product_id: '',
    branch_id: '',
    physical_stock: 0,
    marketing_stock: 0
  });

  const [initialProductName, setInitialProductName] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (stockProduct) {
        setFormData({
          product_id: stockProduct.product_id,
          branch_id: stockProduct.branch_id,
          physical_stock: stockProduct.physical_stock,
          marketing_stock: stockProduct.marketing_stock
        });
        setInitialProductName(stockProduct.product_name || '');
      } else {
        setFormData({
          product_id: '',
          branch_id: '',
          physical_stock: 0,
          marketing_stock: 0
        });
        setInitialProductName('');
      }
      loadBranches();
    }
  }, [stockProduct, isOpen]);

  const loadBranches = async () => {
    setBranchesLoading(true);
    try {
      const data = await api.branches.branch_list();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setBranchesLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      physical_stock: Number(formData.physical_stock),
      marketing_stock: Number(formData.marketing_stock)
    };

    await onSubmit(submissionData);
  };

  const hasError = (field: string) => serverErrors && serverErrors[field] && serverErrors[field].length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            {isEdit ? 'Update Stock Record' : 'New Stock Record'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {serverErrors && Object.keys(serverErrors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">Action Required</p>
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

          <form id="stock-product-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" /> Stock Details
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <SearchableDropdown
                    label="Product"
                    required
                    value={formData.product_id || ''}
                    error={hasError('product_id')}
                    placeholder="Find Product..."
                    initialName={initialProductName}
                    onSearch={(q) => api.products.product_list(q)}
                    onChange={(id, name) => {
                      setFormData(prev => ({ ...prev, product_id: id }));
                      if (name) setInitialProductName(name);
                    }}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${hasError('branch_id') ? 'text-red-600' : 'text-gray-700'}`}>
                    <Building2 className="w-4 h-4" /> Branch <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all font-medium bg-white ${hasError('branch_id') ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
                      }`}
                    disabled={branchesLoading}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                  {branchesLoading && <p className="mt-1 text-xs text-eco-600 animate-pulse">Loading branches...</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-bold mb-1 ${hasError('physical_stock') ? 'text-red-600' : 'text-gray-700'}`}>
                      Physical Stock <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Package className="w-4 h-4" /></div>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.physical_stock}
                        onChange={(e) => setFormData({ ...formData, physical_stock: parseInt(e.target.value) || 0 })}
                        className={`w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none transition-all font-bold ${hasError('physical_stock') ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-1 ${hasError('marketing_stock') ? 'text-red-600' : 'text-gray-700'}`}>
                      Marketing Stock <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Package className="w-4 h-4" /></div>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.marketing_stock}
                        onChange={(e) => setFormData({ ...formData, marketing_stock: parseInt(e.target.value) || 0 })}
                        className={`w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none transition-all font-bold ${hasError('marketing_stock') ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            form="stock-product-form"
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-eco-600 hover:bg-eco-700 text-white font-bold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-eco-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEdit ? 'Update Stock' : 'Create Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockProductModal;
