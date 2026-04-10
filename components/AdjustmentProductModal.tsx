import React, { useState, useEffect } from 'react';
import { AdjustmentProduct, AdjustmentProductItem, AdjustmentType, Branch } from '../types';
import { X, SlidersHorizontal, AlertCircle, Loader2, Plus, Trash2, Building2, FileText, Package } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { api } from '../services/api';

interface AdjustmentProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  adjustment: AdjustmentProduct | null;
  loading: boolean;
  serverErrors: Record<string, string[]> | null;
}

const AdjustmentProductModal: React.FC<AdjustmentProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  adjustment,
  loading,
  serverErrors
}) => {
  const [branchId, setBranchId] = useState('');
  const [description, setDescription] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(AdjustmentType.In);
  const [items, setItems] = useState<Partial<AdjustmentProductItem>[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stockWarnings, setStockWarnings] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (adjustment) {
        setBranchId(adjustment.branch_id);
        setDescription(adjustment.description || '');
        setAdjustmentType(adjustment.adjustment_type || AdjustmentType.In);
        // Ensure items have product_name for the SearchableDropdown
        const mappedItems = (adjustment.adjustment_product_items || []).map(item => ({
          ...item,
          product_name: item.product_name || (item as any).product?.name
        }));
        setItems(mappedItems);
        setDeletedItemIds([]);
      } else {
        setBranchId('');
        setDescription('');
        setAdjustmentType(AdjustmentType.In);
        setItems([{ product_id: '', quantity: 1 }]);
        setDeletedItemIds([]);
      }
      setErrors({});
      loadBranches();
    }
  }, [isOpen, adjustment]);

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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!branchId) newErrors.branch_id = 'Branch is required';
    if (!adjustmentType) newErrors.adjustment_type = 'Adjustment type is required';
    
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        if (!item.product_id) newErrors[`item_${index}_product`] = 'Product is required';
        if (!item.quantity || item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const adjustment_product_items_attributes = items.map(item => {
      const attr: any = {
        product_id: item.product_id,
        quantity: Number(item.quantity)
      };
      if (item.id) attr.id = item.id;
      return attr;
    });

    if (deletedItemIds.length > 0) {
      deletedItemIds.forEach(id => {
        adjustment_product_items_attributes.push({
          id,
          _destroy: true
        } as any);
      });
    }

    const formData = {
      branch_id: branchId,
      description,
      adjustment_type: adjustmentType,
      adjustment_product_items_attributes
    };

    onSubmit(formData);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const itemToRemove = items[index];
    if (itemToRemove.id) {
      setDeletedItemIds(prev => [...prev, itemToRemove.id!]);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof AdjustmentProductItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Trigger stock check if product or quantity changed and it's an OUT adjustment
      if (field === 'product_id' || field === 'quantity') {
        const item = newItems[index];
        if (item.product_id && item.quantity && branchId && adjustmentType === AdjustmentType.Out) {
          checkStock(index, item.product_id, item.quantity);
        } else {
          // Clear warning if not applicable
          setStockWarnings(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
          });
        }
      }
      
      return newItems;
    });
  };

  const checkStock = async (index: number, productId: string, quantity: number) => {
    if (!branchId || adjustmentType !== AdjustmentType.Out) return;
    
    try {
      await api.adjustment_products.checkStockItem(branchId, productId, quantity, adjustmentType);
      
      // If success, clear warning
      setStockWarnings(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } catch (err: any) {
      const data = err.data;
      if (err.message?.includes('Stock not available') || (data && data.errors === 'Stock not available')) {
        setStockWarnings(prev => ({
          ...prev,
          [index]: 'Stock not available'
        }));

        // Update quantity to current_stock if available
        if (data && typeof data.current_stock === 'number') {
          setItems(prev => {
            const next = [...prev];
            if (next[index]) {
              next[index] = { ...next[index], quantity: data.current_stock };
            }
            return next;
          });
        }
      } else {
        // Clear warning for other errors to avoid confusion, or keep it?
        // Usually, if it's a 422 with "Stock not available", it's a specific warning.
        setStockWarnings(prev => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    }
  };

  // Re-check all items if branch or type changes to OUT
  useEffect(() => {
    if (branchId && adjustmentType === AdjustmentType.Out && items.length > 0) {
      items.forEach((item, index) => {
        if (item.product_id && item.quantity) {
          checkStock(index, item.product_id, item.quantity as number);
        }
      });
    } else if (adjustmentType !== AdjustmentType.Out) {
      setStockWarnings({});
    }
  }, [branchId, adjustmentType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {adjustment ? 'Edit Adjustment' : 'New Stock Adjustment'}
              </h2>
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">
                {adjustment ? 'Update existing record' : 'Create new record'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form id="adjustment-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* General Info */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-1">General Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-eco-600" /> Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className={`w-full pl-3 pr-8 py-1.5 bg-gray-50 border ${errors.branch_id || serverErrors?.branch_id ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-eco-500/20'} rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium appearance-none`}
                      disabled={branchesLoading}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    {branchesLoading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400" />}
                  </div>
                  {(errors.branch_id || serverErrors?.branch_id) && (
                    <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.branch_id || serverErrors?.branch_id?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-eco-600" /> Adjustment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                    className={`w-full px-3 py-1.5 bg-gray-50 border ${errors.adjustment_type || serverErrors?.adjustment_type ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-eco-500/20'} rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium appearance-none`}
                  >
                    <option value={AdjustmentType.In}>In (+)</option>
                    <option value={AdjustmentType.Out}>Out (-)</option>
                  </select>
                  {(errors.adjustment_type || serverErrors?.adjustment_type) && (
                    <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.adjustment_type || serverErrors?.adjustment_type?.[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-eco-600" /> Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-3 py-1.5 bg-gray-50 border ${serverErrors?.description ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-eco-500/20'} rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium`}
                    placeholder="Reason..."
                  />
                  {serverErrors?.description && (
                    <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> {serverErrors.description[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Adjustment Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[10px] font-bold text-eco-600 hover:text-eco-700 bg-eco-50 hover:bg-eco-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              {errors.items && (
                <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.items}
                </div>
              )}

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-xl relative group">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-9">
                        <SearchableDropdown
                          label="Product"
                          onSearch={api.products.product_list}
                          value={item.product_id || ''}
                          onChange={(id, name) => {
                            setItems(prev => {
                              const newItems = [...prev];
                              newItems[index] = { 
                                ...newItems[index], 
                                product_id: id,
                                product_name: name || newItems[index].product_name
                              };
                              return newItems;
                            });
                          }}
                          placeholder="Search product..."
                          error={!!errors[`item_${index}_product`]}
                          initialName={item.product_name}
                          compact={true}
                        />
                        {errors[`item_${index}_product`] && (
                          <p className="text-red-500 text-[9px] font-medium mt-0.5">{errors[`item_${index}_product`]}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-3 space-y-0.5">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1.5 bg-white border ${errors[`item_${index}_quantity`] || stockWarnings[index] ? 'border-red-300' : 'border-gray-200'} rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium`}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-red-500 text-[9px] font-medium mt-0.5">{errors[`item_${index}_quantity`]}</p>
                        )}
                        {stockWarnings[index] && !errors[`item_${index}_quantity`] && (
                          <p className="text-amber-600 text-[9px] font-bold mt-0.5 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> {stockWarnings[index]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">No items added yet.</p>
                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-2 text-xs font-bold text-eco-600 hover:text-eco-700 hover:underline"
                    >
                      Add your first item
                    </button>
                  </div>
                )}
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
            form="adjustment-form"
            disabled={loading}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            ) : (
              'Save Adjustment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentProductModal;
