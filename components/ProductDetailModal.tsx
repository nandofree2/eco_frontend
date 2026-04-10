import React from 'react';
import { Product, ProductStatus, ProductType } from '../types';
import { X, Package, Tag, Scale, DollarSign, Info, Hash, Layers, Calendar } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header with Cover Image */}
        <div className="relative h-48 sm:h-64 shrink-0 bg-gray-100">
          {product.cover_image_url ? (
            <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-eco-50">
              <Package className="w-20 h-20 text-eco-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{product.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30">
                {product.code || product.sku || 'NO CODE'}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                product.status_product === ProductStatus.Active ? 'bg-green-500/20 text-green-100 border-green-400/30' : 
                product.status_product === ProductStatus.Unreleased ? 'bg-gray-500/20 text-gray-100 border-gray-400/30' :
                product.status_product === ProductStatus.Expired ? 'bg-red-500/20 text-red-100 border-red-400/30' : 
                'bg-amber-500/20 text-amber-100 border-amber-400/30'
              }`}>
                {ProductStatus[product.status_product]}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Price</p>
              <div className="flex items-center gap-1 text-gray-900 font-black text-lg">
                <DollarSign className="w-4 h-4 text-eco-600" />
                <span>{Number(product.base_price || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
              <div className="flex items-center gap-1 text-gray-900 font-black text-lg">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{ProductType[product.product_type]}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
              <div className="flex items-center gap-1 text-gray-900 font-black text-lg">
                <Tag className="w-4 h-4 text-orange-600" />
                <span className="truncate">{product.category?.name || 'None'}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit</p>
              <div className="flex items-center gap-1 text-gray-900 font-black text-lg">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>{product.unit_of_measurement?.abbreviation || '---'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" /> Product Description
            </h3>
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
              <p className="text-gray-600 leading-relaxed italic">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>
          </div>

          {/* Gallery */}
          {product.preview_images_urls && product.preview_images_urls.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4" /> Gallery Assets
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.preview_images_urls.map((url, idx) => (
                  <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:scale-105 transition-transform cursor-zoom-in">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Added on {new Date(product.created_at).toLocaleDateString()}
            </div>
            <div>ID: {product.id.split('-')[0]}...</div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 flex justify-end shrink-0 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white font-black px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
