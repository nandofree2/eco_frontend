import React from 'react';
import { X, Package, Tag, Layers, Scale, Calendar, Clock, Activity, Info, BarChart3 } from 'lucide-react';
import { Product, ProductType } from '../../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            Product Specifications
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm shrink-0">
              <Package className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h3>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
                  {product.category_name}
                </span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${product.product_type === ProductType.Physical ? 'bg-eco-50 text-eco-600 border-eco-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                  {product.product_type === ProductType.Physical ? 'Physical Asset' : 'Marketing Material'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">MSRP</p>
              <p className="text-lg font-black text-gray-900">{formatPrice(product.price)}</p>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit</p>
              <p className="text-lg font-black text-gray-900 capitalize">{product.unit_name || product.unit_symbol || '-'}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Context & Metadata
              </h4>
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

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-8 py-2.5 bg-white border border-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
