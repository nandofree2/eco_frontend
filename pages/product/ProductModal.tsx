import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Package, Tag, AlertCircle, ImagePlus, XCircle } from 'lucide-react';
import { Product, Category, UnitOfMeasurement, ProductType, ProductStatus, Variant, Customer } from '../../types';
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
  const [variants, setVariants] = useState<Variant[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [custSearch, setCustSearch] = useState('');
  const [custOpen, setCustOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    customer_ids: [] as string[],
    variant_id: '',
    code: '',
    unit_of_measurement_id: '',
    product_type: ProductType.Physical,
    status_product: ProductStatus.Unreleased,
    description: '',
    base_price: 0
  });

  // Image states
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  const [previewImageFiles, setPreviewImageFiles] = useState<File[]>([]);
  const [previewImagePreviews, setPreviewImagePreviews] = useState<string[]>([]);
  const [existingPreviewUrls, setExistingPreviewUrls] = useState<string[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const custWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.categories.list('', 'name asc', 1, 100),
        api.variants.list('', 'name asc', 1, 100),
        api.units.list('', 'name asc', 1, 100),
        api.customers.list('', 'name asc', 1, 100)
      ]).then(([catRes, variantRes, unitRes, customerRes]) => {
        setCategories(catRes.data);
        setVariants(variantRes.data);
        setUnits(unitRes.data);
        setCustomers(customerRes.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category_id: product.category_id || '',
        customer_ids: (product as any).customer_ids ?? [],
        variant_id: product.variant_id || '',
        code: product.code || '',
        unit_of_measurement_id: product.unit_of_measurement_id || '',
        product_type: product.product_type ?? ProductType.Physical,
        status_product: product.status_product ?? ProductStatus.Unreleased,
        description: product.description || '',
        base_price: product.base_price || 0
      });
      setExistingCoverUrl(product.cover_image_url || null);
      setExistingPreviewUrls(product.preview_image_urls || []);
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setPreviewImageFiles([]);
      setPreviewImagePreviews([]);
    } else {
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        customer_ids: [],
        variant_id: variants[0]?.id || '',
        unit_of_measurement_id: units[0]?.id || '',
        code: '',
        product_type: ProductType.Physical,
        status_product: ProductStatus.Unreleased,
        description: '',
        base_price: 0
      });
      setExistingCoverUrl(null);
      setExistingPreviewUrls([]);
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setPreviewImageFiles([]);
      setPreviewImagePreviews([]);
    }
  }, [product, categories, variants, units, isOpen]);

  useEffect(() => {
    if (serverErrors?.name) nameRef.current?.focus();
  }, [serverErrors]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!custWrapperRef.current) return;
      if (!custWrapperRef.current.contains(e.target as Node)) setCustOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Cleanup object URLs on unmount/change
  useEffect(() => {
    return () => {
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
      previewImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [coverImagePreview, previewImagePreviews]);

  if (!isOpen) return null;

  const hasError = (field: string) => serverErrors && serverErrors[field];

  const getCustomerLabel = (customerId: string) => {
    const fromList = customers.find((customer) => customer.id === customerId);
    if (fromList) return fromList.name;

    const productCustomerIds = Array.isArray(product?.customer_ids) ? product.customer_ids : [];
    const productCustomerNames = Array.isArray(product?.customer_names) ? product.customer_names : [];
    const index = productCustomerIds.indexOf(customerId);

    if (index >= 0 && productCustomerNames[index]) return productCustomerNames[index];
    return customerId;
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setExistingCoverUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handlePreviewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviewImageFiles(prev => [...prev, ...files]);
    setPreviewImagePreviews(prev => [...prev, ...newPreviews]);
    if (previewInputRef.current) previewInputRef.current.value = '';
  };

  const handleRemoveNewPreview = (index: number) => {
    URL.revokeObjectURL(previewImagePreviews[index]);
    setPreviewImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPreview = (index: number) => {
    setExistingPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = { ...formData };
    if (coverImageFile) submitData.cover_image = coverImageFile;
    if (previewImageFiles.length > 0) submitData.preview_images = previewImageFiles;
    onSubmit(submitData);
  };

  const displayCover = coverImagePreview || existingCoverUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[95vh] flex flex-col">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product ? 'Modify Product Identity' : 'Register New Product'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-transform active:scale-90"><X className="w-6 h-6" /></button>
        </div>

        {serverErrors && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 shrink-0">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
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
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Variant</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 appearance-none font-medium"
                  value={formData.variant_id}
                  onChange={(e) => setFormData({ ...formData, variant_id: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Variant</option>
                  {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 appearance-none font-medium"
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
                <select
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 appearance-none font-medium"
                  value={formData.unit_of_measurement_id}
                  onChange={(e) => setFormData({ ...formData, unit_of_measurement_id: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation || u.code})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">SKU code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className={`w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all font-medium`}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Example: PRC ..."
                />
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 font-bold text-gray-700"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('customer_ids') ? 'text-red-600' : 'text-gray-400'}`}>Assigned Customers</label>
              <div className="relative" ref={custWrapperRef}>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center" onClick={() => { setCustOpen(true); }}>
                  {formData.customer_ids.map((id) => (
                    <span key={id} className="bg-white border border-gray-100 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-2">
                      <span>{getCustomerLabel(id)}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, customer_ids: formData.customer_ids.filter((x) => x !== id) }); }} className="text-gray-400 hover:text-gray-600">×</button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={custSearch}
                    onChange={(e) => { setCustSearch(e.target.value); setCustOpen(true); }}
                    onFocus={() => setCustOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const filtered = customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) && !formData.customer_ids.includes(c.id));
                        if (filtered[0]) {
                          setFormData({ ...formData, customer_ids: [...formData.customer_ids, filtered[0].id] });
                          setCustSearch('');
                        }
                      } else if (e.key === 'Backspace' && !custSearch) {
                        // remove last
                        setFormData({ ...formData, customer_ids: formData.customer_ids.slice(0, -1) });
                      }
                    }}
                    placeholder={formData.customer_ids.length === 0 ? 'Search and add customers...' : ''}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1 py-1"
                  />
                </div>

                {custOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-auto">
                    {customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) && !formData.customer_ids.includes(c.id)).map(c => (
                      <button key={c.id} type="button" onClick={() => { setFormData({ ...formData, customer_ids: [...formData.customer_ids, c.id] }); setCustSearch(''); setCustOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                        {c.name}
                      </button>
                    ))}
                    {customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) && !formData.customer_ids.includes(c.id)).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400">No customers found</div>
                    )}
                  </div>
                )}
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

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">
              Cover Image <span className="text-gray-300 font-medium normal-case tracking-normal">(optional)</span>
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageChange}
            />
            {displayCover ? (
              <div className="relative group inline-block">
                <img
                  src={displayCover}
                  alt="Cover preview"
                  className="h-40 w-auto max-w-full rounded-2xl object-cover border border-gray-100 shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 text-gray-700 text-xs font-bold rounded-lg hover:bg-white transition-all"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-lg hover:bg-red-500 transition-all"
                  >
                    Remove
                  </button>
                </div>
                {coverImageFile && (
                  <span className="absolute top-2 right-2 bg-eco-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-eco-400 hover:text-eco-500 hover:bg-eco-50/50 transition-all group"
              >
                <ImagePlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Click to upload cover image</span>
                <span className="text-[10px] text-gray-300">PNG, JPG, WEBP up to 10MB</span>
              </button>
            )}
          </div>

          {/* Preview Images */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">
              Preview Images <span className="text-gray-300 font-medium normal-case tracking-normal">(optional, multiple)</span>
            </label>
            <input
              ref={previewInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePreviewImagesChange}
            />

            {(existingPreviewUrls.length > 0 || previewImagePreviews.length > 0) ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {/* Existing images from server */}
                  {existingPreviewUrls.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="w-24 h-24 rounded-xl object-cover border border-gray-100 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPreview(i)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 shadow-md"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* Newly selected images */}
                  {previewImagePreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative group">
                      <img
                        src={url}
                        alt={`New preview ${i + 1}`}
                        className="w-24 h-24 rounded-xl object-cover border-2 border-eco-400 shadow-sm"
                      />
                      <span className="absolute top-1 left-1 bg-eco-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPreview(i)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 shadow-md"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => previewInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-eco-400 hover:text-eco-500 hover:bg-eco-50/50 transition-all"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-[9px] font-bold">Add More</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => previewInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-eco-400 hover:text-eco-500 hover:bg-eco-50/50 transition-all group"
              >
                <ImagePlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Click to upload preview images</span>
                <span className="text-[10px] text-gray-300">Multiple images allowed</span>
              </button>
            )}
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
