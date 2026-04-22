import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Package, Tag, Layers, Scale, AlertCircle } from 'lucide-react';
import { Product, Category, UnitOfMeasurement, ProductType, ProductStatus } from '../../types';
import { api } from '../../services/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  product?: Product | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSubmit, product, loading, serverErrors }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    unit_of_measurement_id: '',
    product_type: ProductType.Physical,
    status_product: ProductStatus.Unreleased,
    description: '',
    base_price: 0
  });

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.categories.list('', 'name asc', 1, 100),
        api.units.list('', 'name asc', 1, 100)
      ]).then(([catRes, unitRes]) => {
        setCategories(catRes.data);
        setUnits(unitRes.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category_id: product.category_id || '',
        unit_of_measurement_id: product.unit_of_measurement_id || '',
        product_type: product.product_type ?? ProductType.Physical,
        status_product: product.status_product ?? ProductStatus.Unreleased,
        description: product.description || '',
        base_price: product.base_price || 0
      });
    } else {
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        unit_of_measurement_id: units[0]?.id || '',
        product_type: ProductType.Physical,
        status_product: ProductStatus.Unreleased,
        description: '',
        base_price: 0
      });
    }
  }, [product, categories, units, isOpen]);

  useEffect(() => {
    if (serverErrors?.name) nameRef.current?.focus();
  }, [serverErrors]);

  if (!isOpen) return null;

  const hasError = (field: string) => serverErrors && serverErrors[field];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product ? 'Modify Product Identity' : 'Register New Product'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-transform active:scale-90"><X className="w-6 h-6" /></button>
        </div>

        {serverErrors && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">Validation Protocol Failure</p>
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

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2">
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('name') ? 'text-red-600' : 'text-gray-400'}`}>Product Name</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  ref={nameRef}
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all ${hasError('name') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Arabica Beans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Classification</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 appearance-none font-medium"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Measuring Unit</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 appearance-none font-medium"
                  value={formData.unit_of_measurement_id}
                  onChange={(e) => setFormData({ ...formData, unit_of_measurement_id: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation || u.code})</option>)}
                </select>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Product Type</label>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1.5 border border-gray-100">
                <button type="button" onClick={() => setFormData({ ...formData, product_type: ProductType.Physical })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.product_type === ProductType.Physical ? 'bg-white text-eco-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Physical
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, product_type: ProductType.Service })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.product_type === ProductType.Service ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Service
                </button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Status Product</label>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1.5 border border-gray-100">
                <button type="button" onClick={() => setFormData({ ...formData, status_product: ProductStatus.Unreleased })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.status_product === ProductStatus.Unreleased ? 'bg-white text-eco-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Unreleased
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, status_product: ProductStatus.Active })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.status_product === ProductStatus.Active ? 'bg-white text-eco-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Active
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, status_product: ProductStatus.Expired })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.status_product === ProductStatus.Expired ? 'bg-white text-eco-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Expired
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, status_product: ProductStatus.Deactive })} className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all ${formData.status_product === ProductStatus.Deactive ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                  Deactive
                </button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Base Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 font-bold text-gray-700"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Detailed Description</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 min-h-[100px] text-sm font-medium transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context regarding product origin, usage, or specifications..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-eco-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all text-sm uppercase tracking-widest">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {product ? 'Commit Changes' : 'Execute Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
