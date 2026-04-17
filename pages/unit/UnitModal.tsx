import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Info, AlertCircle } from 'lucide-react';
import { UnitOfMeasurement } from '../../types';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<UnitOfMeasurement>) => Promise<void>;
  unit?: UnitOfMeasurement | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const UnitModal: React.FC<UnitModalProps> = ({ isOpen, onClose, onSubmit, unit, loading, serverErrors }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    quantity: 1,
    abbreviation: '',
    description: ''
  });

  // Refs for auto-focusing invalid fields
  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const abbrRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        code: unit.code,
        quantity: unit.quantity,
        abbreviation: unit.abbreviation,
        description: unit.description || ''
      });
    } else {
      setFormData({ name: '', code: '', quantity: 1, abbreviation: '', description: '' });
    }
  }, [unit, isOpen]);

  // Handle focus when server errors arrive
  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.name) nameRef.current?.focus();
      else if (serverErrors.code) codeRef.current?.focus();
      else if (serverErrors.abbreviation) abbrRef.current?.focus();
      else if (serverErrors.quantity) quantityRef.current?.focus();
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Note: We don't reset form here if there are errors, 
    // the parent will handle that if success occurs.
  };

  const hasError = (field: string) => serverErrors && serverErrors[field];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            {unit ? 'Edit Measurement Standard' : 'New Measurement Standard'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {serverErrors && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={`block text-sm font-semibold mb-1 ${hasError('name') ? 'text-red-600' : 'text-gray-700'}`}>Unit Name</label>
              <input
                ref={nameRef}
                type="text"
                required
                className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${hasError('name') ? 'border-red-500 ring-2 ring-red-100 focus:border-red-600' : 'border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-eco-500'
                  }`}
                placeholder="e.g., Kilogram"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {hasError('name') && (
                <p className="mt-1 text-xs text-red-500 font-medium">Name {serverErrors?.name?.join(', ')}</p>
              )}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className={`block text-sm font-semibold mb-1 ${hasError('code') ? 'text-red-600' : 'text-gray-700'}`}>Standard Code</label>
              <input
                ref={codeRef}
                type="text"
                required
                className={`w-full px-4 py-2 border rounded-lg outline-none transition-all uppercase font-mono ${hasError('code') ? 'border-red-500 ring-2 ring-red-100 focus:border-red-600' : 'border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-eco-500'
                  }`}
                placeholder="e.g., KG"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              {hasError('code') && (
                <p className="mt-1 text-xs text-red-500 font-medium">Code {serverErrors?.code?.join(', ')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-1 ${hasError('abbreviation') ? 'text-red-600' : 'text-gray-700'}`}>Abbreviation</label>
              <input
                ref={abbrRef}
                type="text"
                required
                className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${hasError('abbreviation') ? 'border-red-500 ring-2 ring-red-100 focus:border-red-600' : 'border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-eco-500'
                  }`}
                placeholder="e.g., kg"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              />
              {hasError('abbreviation') && (
                <p className="mt-1 text-xs text-red-500 font-medium">Abbreviation {serverErrors?.abbreviation?.join(', ')}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-1 ${hasError('quantity') ? 'text-red-600' : 'text-gray-700'}`}>Quantity</label>
              <input
                ref={quantityRef}
                type="number"
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${hasError('quantity') ? 'border-red-500 ring-2 ring-red-100 focus:border-red-600' : 'border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-eco-500'
                  }`}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
              {hasError('quantity') && (
                <p className="mt-1 text-xs text-red-500 font-medium">Quantity {serverErrors?.quantity?.join(', ')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:border-eco-500 outline-none transition-all"
              placeholder="e.g. Standard unit for weighing solid goods..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-eco-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {unit ? 'Update Unit' : 'Create Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;
