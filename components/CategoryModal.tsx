import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Tags, AlertCircle } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  category?: Category | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSubmit, category, loading, serverErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: ''
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        sku: category.sku || '',
        description: category.description || ''
      });
    } else {
      setFormData({ name: '', sku: '', description: '' });
    }
  }, [category, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.name) nameRef.current?.focus();
      else if (serverErrors.sku) skuRef.current?.focus();
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const hasError = (field: string) => serverErrors && serverErrors[field];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tags className="w-5 h-5" />
            {category ? 'Edit Catalog Category' : 'New Catalog Category'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-1 ${hasError('name') ? 'text-red-600' : 'text-gray-700'}`}>Category Name</label>
            <input
              ref={nameRef}
              type="text"
              required
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all ${
                hasError('name') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
              }`}
              placeholder="e.g. Organic Produce"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {hasError('name') && (
              <p className="mt-1 text-xs text-red-500 font-bold">Name {serverErrors?.name?.join(', ')}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1 ${hasError('sku') ? 'text-red-600' : 'text-gray-700'}`}>Category SKU Prefix</label>
            <input
              ref={skuRef}
              type="text"
              required
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all font-mono ${
                hasError('sku') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
              }`}
              placeholder="e.g. ORG"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            />
            {hasError('sku') && (
              <p className="mt-1 text-xs text-red-500 font-bold">SKU {serverErrors?.sku?.join(', ')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all"
              placeholder="Provide context for this category..."
              rows={3}
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
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;