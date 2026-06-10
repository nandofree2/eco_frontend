import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DeliveryOrder, DeliveryOrderItem, Branch, Customer, SalesOrder } from '../../types';
import { X, ShoppingCart, AlertCircle, Loader2, Plus, Building2, FileText, Package, Users, Receipt, Percent, DollarSign, CheckSquare } from 'lucide-react';
import SearchableDropdownDelivery from '../../components/SearchableDropdownDelivery';
import { api } from '../../services/api';

interface DeliveryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  order: DeliveryOrder | null;
  loading: boolean;
  serverErrors: Record<string, string[]> | null;
}

const DeliveryOrderModal: React.FC<DeliveryOrderModalProps> = ({
  isOpen, onClose, onSubmit, order, loading, serverErrors
}) => {
  const [branchId, setBranchId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [salesOrderId, setSalesOrderId] = useState('');
  const [salesOrderCode, setSalesOrderCode] = useState('');
  const [salesOrderName, setSalesOrderName] = useState('');

  const [items, setItems] = useState<Partial<DeliveryOrderItem>[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setBranchId(order.branch_id || '');
        setCustomerId(order.customer_id || '');
        setCustomerName(order.customer_name || '');
        setSalesOrderId(order.sales_order_id || '');
        setDescription(order.description || '');
        const mappedItems = (order.delivery_order_items || []).map(item => ({
          ...item,
          product_name: item.product_name || (item as any).product?.name || (item as any).sales_order_item?.product?.name,
          sales_order_quantity: item.sales_order_quantity || (item as any).sales_order_item?.quantity
        }));
        setItems(mappedItems.length > 0 ? mappedItems : []);
        setDeletedItemIds([]);
      } else {
        setBranchId('');
        setCustomerId('');
        setCustomerName('');
        setSalesOrderId('');
        setDescription('');
        setItems([]);
        setDeletedItemIds([]);
      }
      setErrors({});
    }
  }, [isOpen, order]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!salesOrderId) newErrors.sales_order_id = 'Sales Order is required';

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        if (!item.sales_order_item_id) newErrors[`item_${index}_sales_order_item_id`] = 'Sales Order Item is required';
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = 'Qty must be > 0';
        } else if (item.sales_order_quantity && item.quantity > item.sales_order_quantity) {
          newErrors[`item_${index}_quantity`] = `Max qty is ${item.sales_order_quantity}`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;


    const delivery_order_items_attributes = items.map(item => {
      const qty = item.quantity || 1;
      const attr: any = {
        sales_order_item_id: item.sales_order_item_id,
        quantity: qty
      };
      if (item.id) attr.id = item.id;
      return attr;
    });

    if (deletedItemIds.length > 0) {
      deletedItemIds.forEach(id => {
        delivery_order_items_attributes.push({ id, _destroy: true } as any);
      });
    }

    const formData = {
      sales_order_id: salesOrderId,
      description,
      delivery_order_items_attributes,
    };

    onSubmit(formData);
  };

  const addItem = () => {
    setItems([...items, { sales_order_item_id: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const itemToRemove = items[index];
    if (itemToRemove.id) {
      setDeletedItemIds(prev => [...prev, itemToRemove.id!]);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DeliveryOrderItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      const updated = { ...newItems[index], [field]: value };
      newItems[index] = updated;
      return newItems;
    });
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
                {order ? 'Edit Delivery Order' : 'New Delivery Order'}
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
          <form id="delivery-order-form" onSubmit={handleSubmit} className="space-y-4">

            {/* General Info */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-1">General Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <SearchableDropdownDelivery
                    label="Sales Order"
                    onSearch={api.sales_orders.sales_order_list}
                    value={salesOrderId}

                    onChange={(id, name, extraData) => {
                      if (id !== salesOrderId) {
                        setItems([]);
                        setDeletedItemIds(prev => {
                          const existingIds = items.map(i => i.id).filter(Boolean) as string[];
                          return [...prev, ...existingIds];
                        });
                      }
                      setSalesOrderId(id);
                      setCustomerName(extraData?.customer_name || '');
                    }}

                    placeholder="Search Sales Order..."
                    error={!!errors.sales_order_id}
                    required={true}
                    compact={true}
                    initialName={order?.sales_order_code}
                  />
                  {(errors.sales_order_id || serverErrors?.sales_order_id) && (
                    <p className="text-red-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.sales_order_id || serverErrors?.sales_order_id?.[0]}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-eco-600" /> Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    readOnly
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 focus:ring-eco-500/20 rounded-lg outline-none focus:ring-2 transition-all text-xs font-medium"
                  />
                </div>
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

              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Order Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!salesOrderId}
                  className={`text-[10px] font-bold text-eco-600 hover:text-eco-700 bg-eco-50 hover:bg-eco-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${!salesOrderId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                {items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 hidden md:grid">
                    <div className="md:col-span-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</div>
                    <div className="md:col-span-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">SO Qty</div>
                    <div className="md:col-span-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">DO Qty</div>
                  </div>
                )}
                {items.map((item, index) => (
                  <div key={index} className="p-1 bg-gray-50 border border-gray-200 rounded-xl relative group">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      {/* Product */}
                      <div className="md:col-span-5">
                        <SearchableDropdownDelivery
                          onSearch={(q) => {
                            const selectedSalesOrderItemIds = items
                              .map((i, idx) => idx !== index ? i.sales_order_item_id : null)
                              .filter(Boolean) as string[];
                            return api.sales_orders.sales_order_item_list(q, salesOrderId, selectedSalesOrderItemIds);
                          }}
                          value={item.sales_order_item_id || ''}
                          onChange={(id, name, extraData) => {
                            setItems(prev => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                sales_order_item_id: id,
                                product_name: name || newItems[index].product_name,
                                sales_order_quantity: extraData?.salesOrderQuantity || 0
                              };
                              return newItems;
                            });
                          }}
                          placeholder="Search item..."
                          error={!!errors[`item_${index}_sales_order_item_id`]}
                          initialName={item.product_name}
                          compact={true}
                          disabled={!salesOrderId}
                        />
                        {errors[`item_${index}_sales_order_item_id`] && (
                          <p className="text-red-500 text-[9px] font-medium mt-0.5">{errors[`item_${index}_sales_order_item_id`]}</p>
                        )}
                      </div>

                      {/* SO Qty */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider md:hidden mb-1">SO Qty</label>
                        <input
                          type="number"
                          value={item.sales_order_quantity || ''}
                          className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg outline-none text-xs font-medium shadow-sm cursor-not-allowed text-gray-500"
                          disabled
                          readOnly
                        />
                      </div>

                      {/* Qty */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider md:hidden mb-1">DO Qty</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1.5 bg-white border ${errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-200'} rounded-lg outline-none focus:ring-2 focus:ring-eco-500/20 transition-all text-xs font-medium shadow-sm ${(!salesOrderId || !item.sales_order_item_id) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          disabled={!salesOrderId || !item.sales_order_item_id}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-red-500 text-[9px] font-medium mt-0.5">{errors[`item_${index}_quantity`]}</p>
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
                      disabled={!salesOrderId}
                      className={`mt-2 text-xs font-bold text-eco-600 hover:text-eco-700 hover:underline ${!salesOrderId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            form="delivery-order-form"
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

export default DeliveryOrderModal;
