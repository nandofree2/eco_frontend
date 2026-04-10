import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { generateProductDescription } from '../services/gemini';
import { Category, UnitOfMeasurement, ProductStatus, Product, ProductType } from '../types';
import { X, Save, Wand2, Loader2, UploadCloud, Plus, AlertCircle, Info, DollarSign, Package, Hash } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  product?: Product | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  loading,
  serverErrors
}) => {
  const isEdit = Boolean(product);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    description: '',
    base_price: 0,
    status_product: ProductStatus.Active,
    product_type: ProductType.Storable,
    category_id: '',
    unit_of_measurement_id: '',
    preview_images_urls: []
  });
  
  const [initialCategoryName, setInitialCategoryName] = useState('');
  const [initialUnitName, setInitialUnitName] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [localGeneralError, setLocalGeneralError] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData(product);
        if (product.category) setInitialCategoryName(product.category.name);
        if (product.unit_of_measurement) setInitialUnitName(product.unit_of_measurement.name);
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          base_price: 0,
          status_product: ProductStatus.Active,
          product_type: ProductType.Storable,
          category_id: '',
          unit_of_measurement_id: '',
          preview_images_urls: []
        });
        setInitialCategoryName('');
        setInitialUnitName('');
      }
      setLocalGeneralError('');
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.name) nameRef.current?.focus();
      else if (serverErrors.code || serverErrors.sku) skuRef.current?.focus();
      else if (serverErrors.base_price) priceRef.current?.focus();
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalGeneralError('');
    
    // Prepare data
    const { cover_image_url, preview_images_urls, category, unit_of_measurement, role, created_at, ...rest } = formData;
    
    // Only send image data if it's a new Base64 string
    const submissionData = {
        ...rest,
        base_price: typeof formData.base_price === 'string' ? (parseFloat(formData.base_price) || 0) : (formData.base_price || 0),
        category_id: formData.category_id || null,
        unit_of_measurement_id: formData.unit_of_measurement_id || null,
        cover_image: cover_image_url?.startsWith('data:image') ? cover_image_url : undefined,
        preview_images: preview_images_urls?.filter(url => url.startsWith('data:image'))
    };

    await onSubmit(submissionData);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
        setLocalGeneralError("Product Name is required for AI generation.");
        nameRef.current?.focus();
        return;
    }
    setAiLoading(true);
    try {
        const desc = await generateProductDescription(formData.name, initialCategoryName || 'General Category');
        setFormData(prev => ({ ...prev, description: desc }));
    } catch (e) {
        setLocalGeneralError("AI generation failed. Please try again.");
    } finally {
        setAiLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              if (isCover) {
                  setFormData(prev => ({ ...prev, cover_image_url: base64String }));
              } else {
                  if ((formData.preview_images_urls?.length || 0) >= 5) {
                      alert("Maximum 5 preview images allowed");
                      return;
                  }
                  setFormData(prev => ({ 
                      ...prev, 
                      preview_images_urls: [...(prev.preview_images_urls || []), base64String] 
                  }));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const removePreviewImage = (index: number) => {
      const newImages = [...(formData.preview_images_urls || [])];
      newImages.splice(index, 1);
      setFormData(prev => ({ ...prev, preview_images_urls: newImages }));
  };

  const hasError = (field: string) => serverErrors && serverErrors[field] && serverErrors[field].length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isEdit ? 'Update Catalog Entry' : 'New Catalog Entry'}
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
            {(localGeneralError || (serverErrors && Object.keys(serverErrors).length > 0)) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-800">Action Required</p>
                        <div className="mt-0.5 space-y-0.5">
                            {localGeneralError && <p className="text-xs text-red-600 leading-relaxed">{localGeneralError}</p>}
                            {serverErrors && Object.entries(serverErrors).map(([field, messages]) => (
                                <p key={field} className="text-xs text-red-600 leading-relaxed">
                                    <span className="capitalize font-bold">{field.replace('_', ' ')}</span>: {(messages as string[]).join(', ')}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Essentials */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4" /> Essential Properties
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-6">
                        <div className="sm:col-span-3">
                            <label className={`block text-sm font-bold mb-1 ${hasError('name') ? 'text-red-600' : 'text-gray-700'}`}>
                                Product Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                ref={nameRef}
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all font-medium ${
                                    hasError('name') ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
                                }`}
                                placeholder="e.g. Organic Fair Trade Coffee"
                            />
                            {hasError('name') && <p className="mt-1 text-xs text-red-500 font-bold">{serverErrors?.name?.[0]}</p>}
                        </div>

                        <div className="sm:col-span-3">
                            <label className={`block text-sm font-bold mb-1 ${hasError('code') || hasError('sku') ? 'text-red-600' : 'text-gray-700'}`}>
                                Product Code
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Hash className="w-4 h-4" /></div>
                                <input
                                    ref={skuRef}
                                    type="text"
                                    value={formData.code || formData.sku || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none transition-all font-mono font-bold ${
                                        hasError('code') || hasError('sku') ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
                                    }`}
                                    placeholder="FROZEN-001 (Optional)"
                                />
                            </div>
                            {(hasError('code') || hasError('sku')) && <p className="mt-1 text-xs text-red-500 font-bold">{serverErrors?.code?.[0] || serverErrors?.sku?.[0]}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={`block text-sm font-bold mb-1 ${hasError('base_price') ? 'text-red-600' : 'text-gray-700'}`}>
                                Base Price <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><DollarSign className="w-4 h-4" /></div>
                                <input
                                    ref={priceRef}
                                    type="number"
                                    step="0.01"
                                    required
                                    min="0"
                                    value={formData.base_price}
                                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none transition-all font-bold ${
                                        hasError('base_price') ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'
                                    }`}
                                />
                            </div>
                            {hasError('base_price') && <p className="mt-1 text-xs text-red-500 font-bold">{serverErrors?.base_price?.[0]}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <SearchableDropdown
                                label="Category"
                                required
                                value={formData.category_id || ''}
                                error={hasError('category_id')}
                                placeholder="Find Category..."
                                initialName={initialCategoryName}
                                onSearch={(q) => api.categories.searchLite(q)}
                                onChange={(id, name) => {
                                    setFormData(prev => ({ ...prev, category_id: id }));
                                    if (name) setInitialCategoryName(name);
                                }}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <SearchableDropdown
                                label="Unit of Measure"
                                required
                                value={formData.unit_of_measurement_id || ''}
                                error={hasError('unit_of_measurement_id')}
                                placeholder="Find Unit..."
                                initialName={initialUnitName}
                                onSearch={(q) => api.units.searchLite(q)}
                                onChange={(id, name) => {
                                    setFormData(prev => ({ ...prev, unit_of_measurement_id: id }));
                                    if (name) setInitialUnitName(name);
                                }}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Product Type</label>
                            <select
                                value={formData.product_type}
                                onChange={(e) => setFormData({ ...formData, product_type: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all font-medium bg-white"
                            >
                                <option value={ProductType.Storable}>Storable</option>
                                <option value={ProductType.Service}>Service</option>
                                <option value={ProductType.Preorder}>Preorder</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Stock Status</label>
                            <select
                                value={formData.status_product}
                                onChange={(e) => setFormData({ ...formData, status_product: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all font-medium bg-white"
                            >
                                <option value={ProductStatus.Unreleased}>Unreleased</option>
                                <option value={ProductStatus.Expired}>Expired</option>
                                <option value={ProductStatus.Active}>Active</option>
                                <option value={ProductStatus.Deactive}>Deactive</option>
                            </select>
                        </div>

                        <div className="sm:col-span-6">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-bold text-gray-700">Description</label>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateDescription}
                                    disabled={aiLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-eco-50 text-eco-700 border border-eco-200 rounded-lg text-xs font-bold hover:bg-eco-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    AI Generate
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 outline-none transition-all text-sm"
                                placeholder="Write a brief description or use AI to generate one..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Media */}
                <div className="pt-8 border-t border-gray-100 space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Media Assets
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Primary Cover</label>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                <div className="w-32 h-32 shrink-0 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden bg-gray-50/50 hover:border-eco-300 transition-colors group">
                                    {formData.cover_image_url ? (
                                        <img src={formData.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Plus className="w-6 h-6 text-gray-300 mx-auto" />
                                            <p className="text-[10px] text-gray-400 mt-1 font-bold">UPLOAD</p>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, true)} accept="image/*" />
                                </div>
                                <div className="flex-1 space-y-1 text-center sm:text-left">
                                    <p className="text-sm font-bold text-gray-900">Cover Asset</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">Shown on catalog thumbnails and search results.</p>
                                    <p className="text-[10px] font-bold text-eco-600 uppercase tracking-widest mt-2">Recommended: 800x800px</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Gallery Preview ({formData.preview_images_urls?.length || 0}/5)</label>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                {formData.preview_images_urls?.map((url, idx) => (
                                    <div key={idx} className="w-20 h-20 relative rounded-xl overflow-hidden border border-gray-100 group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removePreviewImage(idx)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><X className="w-5 h-5" /></button>
                                    </div>
                                ))}
                                {(formData.preview_images_urls?.length || 0) < 5 && (
                                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center relative bg-gray-50/30 hover:border-eco-200 transition-colors cursor-pointer">
                                        <Plus className="w-6 h-6 text-gray-300" />
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, false)} accept="image/*" />
                                    </div>
                                )}
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
                form="product-form"
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto bg-eco-600 hover:bg-eco-700 text-white font-bold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-eco-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isEdit ? 'Update Catalog' : 'Create Product'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
