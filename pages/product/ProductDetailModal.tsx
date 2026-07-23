import React, { useState } from 'react';
import { X, Package, Tag, Layers, Scale, Calendar, Clock, Activity, Info, BarChart3, Edit2, Trash2, Hash, DollarSign, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { ProductType } from '../../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onEdit?: (product: any) => void;
  onDelete?: (product: any) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product, onEdit, onDelete }) => {
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewUrls: string[] = product?.preview_image_urls || [];

  if (!isOpen || !product) return null;

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

  const formatPrice = (price?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            Product Specifications
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h3>
              <div className="flex justify-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${product.product_type === ProductType.Physical ? 'bg-eco-50 text-eco-600 border-eco-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                  {product.product_type === ProductType.Physical ? 'Physical Asset' : 'Service'}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200">
                  {product.status_product_label || 'Status'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1 items-start">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> SKU Code</p>
              <p className="text-sm font-bold text-gray-900 break-all">{product.code || '-'}</p>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1 items-start">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Base Price</p>
              <p className="text-sm font-bold text-gray-900">{formatPrice(product.base_price)}</p>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1 items-start">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Category</p>
              <p className="text-sm font-bold text-gray-900">{product.category?.name || '-'}</p>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1 items-start">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Variant</p>
              <p className="text-sm font-bold text-gray-900">{product.variant?.name || '-'}</p>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1 items-start ">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Measurement Unit</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{product.unit_of_measurement?.name || '-'}</p>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1 items-start ">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Customer list</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{product.customers?.map((customer: any) => customer.name).join(', ') || '-'}</p>
            </div>

          </div>
          {product.cover_image_url && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Image className="w-3.5 h-3.5" /> Cover Image
              </p>
              <div className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={product.cover_image_url}
                  alt={`${product.name} cover`}
                  className="w-full h-52 object-cover"
                />
              </div>
            </div>
          )}

          {previewUrls.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Image className="w-3.5 h-3.5" /> Preview Images
              </p>
              <div className="relative">
                <img
                  src={previewUrls[previewIndex]}
                  alt={`Preview ${previewIndex + 1}`}
                  className="w-full h-48 object-cover rounded-2xl border border-gray-100 shadow-sm"
                />
                {previewUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(i => (i - 1 + previewUrls.length) % previewUrls.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(i => (i + 1) % previewUrls.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {previewUrls.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${i === previewIndex ? 'bg-eco-600 w-4' : 'w-1.5 bg-white/80'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {previewIndex + 1} / {previewUrls.length}
                </span>
              </div>
              {previewUrls.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {previewUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === previewIndex ? 'border-eco-500' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="space-y-3 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Description</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                    "{product.description || 'No detailed specifications provided for this asset.'}"
                  </p>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Registry Date</span>
                    <span className="font-black text-gray-700 uppercase">{formatDate(product.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Last Revision</span>
                    <span className="font-black text-gray-700 uppercase">{formatDate(product.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(product)} className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(product)} className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-transparent hover:border-red-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
