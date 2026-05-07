import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SalesOrder, SalesOrderItem, Branch, Customer } from '../../types';
import { X, ShoppingCart, AlertCircle, Loader2, Plus, Building2, FileText, Package, Users, Receipt, Percent, DollarSign, CheckSquare } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';
import { api } from '../../services/api';

interface SalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  order: SalesOrder | null;
  loading: boolean;
  serverErrors: Record<string, string[]> | null;
}

/** Safely parse a numeric string, returning 0 for NaN/negative */
const sanitizeNumber = (val: string | number, allowNegative = false): number => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 0;
  if (!allowNegative && num < 0) return 0;
  return Math.round(num * 100) / 100; // cap at 2 decimals
};

const SalesOrderModal: React.FC<SalesOrderModalProps> = ({
  isOpen, onClose, onSubmit, order, loading, serverErrors
}) => {
  const [branchId, setBranchId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [taxInclude, setTaxInclude] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [taxPrice, setTaxPrice] = useState<number>(0);
  const [items, setItems] = useState<Partial<SalesOrderItem>[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = sanitizeNumber(item.quantity || 0);
    const price = sanitizeNumber(item.price || 0);
    return sum + qty * price;
  }, 0);

  const safeDiscount = Math.min(sanitizeNumber(discountPrice), subtotal);
  const safeTax = sanitizeNumber(taxPrice);
  const grandTotal = taxInclude
    ? subtotal - safeDiscount
    : subtotal - safeDiscount + safeTax;

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setBranchId(order.branch_id || '');
        setCustomerId(order.customer_id || '');
        setCustomerName(order.customer_name || '');
        setDescription(order.description || '');
        setTaxInclude(order.tax_include || false);
        setDiscountPrice(order.discount_price || 0);
        setTaxPrice(order.tax_price || 0);
        const mappedItems = (order.sales_order_items || []).map(item => ({
          ...item,
          product_name: item.product_name || (item as any).product?.name
        }));
        setItems(mappedItems.length > 0 ? mappedItems : [{ product_id: '', quantity: 1, price: 0, total_price: 0 }]);
        setDeletedItemIds([]);
      } else {
        setBranchId('');
        setCustomerId('');
        setCustomerName('');
        setDescription('');
        setTaxInclude(false);
        setDiscountPrice(0);
        setTaxPrice(0);
        setItems([{ product_id: '', quantity: 1, price: 0, total_price: 0 }]);
        setDeletedItemIds([]);
      }
      setErrors({});
      loadBranches();
    }
  }, [isOpen, order]);

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
    if (!customerId) newErrors.customer_id = 'Customer is required';

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        if (!item.product_id) newErrors[`item_${index}_product`] = 'Product is required';
        if (!item.quantity || item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Qty must be > 0';
        if (item.price == null || item.price < 0) newErrors[`item_${index}_price`] = 'Price must be ≥ 0';
      });
    }

    if (discountPrice < 0) newErrors.discount_price = 'Discount cannot be negative';
    if (discountPrice > subtotal) newErrors.discount_price = 'Discount exceeds subtotal';
    if (taxPrice < 0) newErrors.tax_price = 'Tax cannot be negative';
    if (grandTotal < 0) newErrors.grand_total = 'Grand total cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const sales_order_items_attributes = items.map(item => {
      const qty = sanitizeNumber(item.quantity || 0);
      const price = sanitizeNumber(item.price || 0);
      const attr: any = {
        product_id: item.product_id,
        quantity: qty,
        price: price,
        total_price: Math.round(qty * price * 100) / 100
      };
      if (item.id) attr.id = item.id;
      return attr;
    });

    if (deletedItemIds.length > 0) {
      deletedItemIds.forEach(id => {
        sales_order_items_attributes.push({ id, _destroy: true } as any);
      });
    }

    const formData = {
      branch_id: branchId,
      customer_id: customerId,
      description,
      tax_include: taxInclude,
      discount_price: safeDiscount,
      tax_price: taxInclude ? 0 : safeTax,
      total_price: Math.round(subtotal * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      sales_order_items_attributes,
    };

    onSubmit(formData);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const itemToRemove = items[index];
    if (itemToRemove.id) {
      setDeletedItemIds(prev => [...prev, itemToRemove.id!]);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SalesOrderItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      const updated = { ...newItems[index], [field]: value };
      // Auto-calc line total
      const qty = sanitizeNumber(updated.quantity || 0);
      const price = sanitizeNumber(updated.price || 0);
      updated.total_price = Math.round(qty * price * 100) / 100;
      newItems[index] = updated;
      return newItems;
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-eco-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {order ? 'Edit Sales Order' : 'New Sales Order'}
              </h2>
              <p className="text-eco-100 text-[9px] font-bold uppercase tracking-widest">
                {order ? 'Update existing order' : 'Create new order'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form id="sales-order-form" onSubmit={handleSubmit} className="space-y-4">

            {/* General Info */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-1">General Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Branch */}
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

                {/* Customer */}
                <div>
                  <SearchableDropdown
                    label="Customer"
                    onSearch={api.customers.customer_list}
                    value={customerId}
                    onChange={(id, name) => { setCustomerId(id); setCustomerName(name || ''); }}
                    placeholder="Search customer..."
                    error={!!errors.customer_id}
                    required={true}
                    initialName={customerName}
                    compact={true}
                  />
                  {(errors.customer_id || serverErrors?.customer_id) && (
                    <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.customer_id || serverErrors?.customer_id?.[0]}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-eco-600" /> Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 focus:ring-eco-500/20 rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium"
                    placeholder="Order notes..."
                  />
                </div>

                {/* Tax Include */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-eco-600" /> Tax Include
                  </label>
                  <div className="flex items-center gap-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setTaxInclude(!taxInclude)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxInclude ? 'bg-eco-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${taxInclude ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-xs font-bold text-gray-600">{taxInclude ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Order Items</h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      {/* Product */}
                      <div className="md:col-span-5">
                        <SearchableDropdown
                          label="Product"
                          onSearch={api.products.product_list}
                          value={item.product_id || ''}
                          onChange={(id, name) => {
                            setItems(prev => {
                              const newItems = [...prev];
                              newItems[index] = { ...newItems[index], product_id: id, product_name: name || newItems[index].product_name };
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

                      {/* Qty */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1.5 bg-white border ${errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-200'} rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium shadow-sm`}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-red-500 text-[9px] font-medium mt-0.5">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className={`w-full px-2 py-1.5 bg-white border ${errors[`item_${index}_price`] ? 'border-red-300' : 'border-gray-200'} rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium shadow-sm`}
                        />
                        {errors[`item_${index}_price`] && (
                          <p className="text-red-500 text-[9px] font-medium mt-0.5">{errors[`item_${index}_price`]}</p>
                        )}
                      </div>

                      {/* Line Total */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Line Total</label>
                        <div className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                          {formatCurrency(sanitizeNumber(item.quantity || 0) * sanitizeNumber(item.price || 0))}
                        </div>
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

            {/* Pricing Summary */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-1">Pricing Summary</h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 p-4 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-gray-400" /> Subtotal
                  </span>
                  <span className="text-sm font-black text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                    <Percent className="w-3.5 h-3.5 text-orange-400" /> Discount
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(sanitizeNumber(e.target.value))}
                    className={`w-40 px-2 py-1 bg-white border ${errors.discount_price ? 'border-red-300' : 'border-gray-200'} rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-bold text-right`}
                    placeholder="0"
                  />
                </div>
                {errors.discount_price && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 justify-end">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.discount_price}
                  </p>
                )}

                {/* Tax */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Tax
                    {taxInclude && <span className="text-[8px] bg-eco-100 text-eco-700 px-1.5 py-0.5 rounded font-black">INCLUDED</span>}
                  </span>
                  {taxInclude ? (
                    <span className="text-xs font-bold text-gray-400 italic">Included in price</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={taxPrice || ''}
                      onChange={(e) => setTaxPrice(sanitizeNumber(e.target.value))}
                      className={`w-40 px-2 py-1 bg-white border ${errors.tax_price ? 'border-red-300' : 'border-gray-200'} rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-bold text-right`}
                      placeholder="0"
                    />
                  )}
                </div>
                {errors.tax_price && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 justify-end">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.tax_price}
                  </p>
                )}

                {/* Grand Total */}
                <div className="border-t border-gray-300 pt-3 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Grand Total</span>
                  <span className={`text-lg font-black ${grandTotal < 0 ? 'text-red-600' : 'text-eco-700'}`}>
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                {errors.grand_total && (
                  <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 justify-end">
                    <AlertCircle className="w-2.5 h-2.5" /> {errors.grand_total}
                  </p>
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
            form="sales-order-form"
            disabled={loading}
            className="bg-eco-600 hover:bg-eco-700 text-white px-6 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md shadow-eco-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            ) : (
              order ? 'Update Order' : 'Create Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderModal;
