import React from 'react';
import { StockProduct } from '../../types';
import { X, Boxes, Package, Building2, Calendar, Clock, ArrowRight } from 'lucide-react';

interface StockProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockProduct: StockProduct | null;
}

const StockProductDetailModal: React.FC<StockProductDetailModalProps> = ({
  isOpen,
  onClose,
  stockProduct
}) => {
  if (!isOpen || !stockProduct) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Stock Details</h2>
              <p className="text-eco-100 text-[10px] font-bold uppercase tracking-widest">Inventory Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Product & Branch Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Product</p>
                <h3 className="text-lg font-black text-gray-900 leading-tight">{stockProduct.product_name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                  ID: <span className="font-mono">{stockProduct.product_id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Branch</p>
                <h3 className="text-lg font-black text-gray-900 leading-tight">{stockProduct.branch_name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                  ID: <span className="font-mono">{stockProduct.branch_id}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-eco-50 rounded-3xl border border-eco-100 text-center">
              <p className="text-[10px] font-black text-eco-600 uppercase tracking-[0.2em] mb-2">Physical Stock</p>
              <div className="text-4xl font-black text-eco-900">{stockProduct.physical_stock}</div>
              <p className="text-[10px] text-eco-500 font-bold mt-1 uppercase">Units in hand</p>
            </div>
            <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Marketing Stock</p>
              <div className="text-4xl font-black text-blue-900">{stockProduct.marketing_stock}</div>
              <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase">Available for sale</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Created At</span>
              </div>
              <span className="text-sm font-bold text-gray-700">{formatDate(stockProduct.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Last Updated</span>
              </div>
              <span className="text-sm font-bold text-gray-700">{formatDate(stockProduct.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Record ID: <span className="font-mono">{stockProduct.id}</span>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
          >
            Close View <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockProductDetailModal;
