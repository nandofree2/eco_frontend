import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Package, Tag, AlertCircle, ImagePlus, XCircle } from 'lucide-react';
import { Salary, SalaryItem } from '../../types';
import { api } from '../../services/api';

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  salary?: Salary | null;
  loading: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const SalaryModal: React.FC<SalaryModalProps> = ({ isOpen, onClose, onSubmit, salary, loading, serverErrors }) => {
  const [salary_items, setSalaryItems] = useState<SalaryItem[]>([]);
  const [salaryItemSearch, setSalaryItemSearch] = useState('');
  const [salaryItemOpen, setSalaryItemOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    salary_item_ids: [] as string[],
    description: '',
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const salaryItemWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.salary_items.list('', 'name asc', 1, 10)
      ]).then(([salaryItemRes]) => {
        setSalaryItems(salaryItemRes.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (salary) {
      setFormData({
        name: salary.name,
        category: salary.category,
        salary_item_ids: (salary as any).salary_item_ids ?? [],
        description: salary.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        salary_item_ids: [],
        description: '',
      });
    }
  }, [salary, isOpen]);

  useEffect(() => {
    if (serverErrors?.name) nameRef.current?.focus();
  }, [serverErrors]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!salaryItemWrapperRef.current) return;
      if (!salaryItemWrapperRef.current.contains(e.target as Node)) setSalaryItemOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!isOpen) return null;

  const hasError = (field: string) => serverErrors && serverErrors[field];

  const getSalaryItemLabel = (salaryItemId: string) => {
    const fromList = salary_items.find((salaryItem) => salaryItem.id === salaryItemId);
    if (fromList) return fromList.name;

    const salarySalaryItemIds = Array.isArray(salary?.salary_item_ids) ? salary?.salary_item_ids : [];
    const salarySalaryItemNames = Array.isArray(salary?.salary_item_names) ? salary?.salary_item_names : [];
    const index = salarySalaryItemIds.indexOf(salaryItemId);

    if (index >= 0 && salarySalaryItemNames[index]) return salarySalaryItemNames[index];
    return salaryItemId;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = { ...formData };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[95vh] flex flex-col">
        <div className="bg-eco-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            {salary ? 'Modify Salary Identity' : 'Register New Salary'}
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
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('name') ? 'text-red-600' : 'text-gray-400'}`}>Salary Name</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  ref={nameRef}
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all ${hasError('name') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gaji Bulana, Gaji Harian, THR, Bonus Sales ..."
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('category') ? 'text-red-600' : 'text-gray-400'}`}>Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  ref={nameRef}
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all ${hasError('category') ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100 focus:bg-white focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500'}`}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Gaji, Bonus, Pesangon"
                />
              </div>
            </div>


            <div className="col-span-1 md:col-span-2">
              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${hasError('salary_item_ids') ? 'text-red-600' : 'text-gray-400'}`}>Assigned Salary Items</label>
              <div className="relative" ref={salaryItemWrapperRef}>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center" onClick={() => { setSalaryItemOpen(true); }}>
                  {formData.salary_item_ids.map((id) => (
                    <span key={id} className="bg-white border border-gray-100 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-2">
                      <span>{getSalaryItemLabel(id)}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, salary_item_ids: formData.salary_item_ids.filter((x) => x !== id) }); }} className="text-gray-400 hover:text-gray-600">×</button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={salaryItemSearch}
                    onChange={(e) => { setSalaryItemSearch(e.target.value); setSalaryItemOpen(true); }}
                    onFocus={() => setSalaryItemOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const filtered = salary_items.filter(c => c.name.toLowerCase().includes(salaryItemSearch.toLowerCase()) && !formData.salary_item_ids.includes(c.id));
                        if (filtered[0]) {
                          setFormData({ ...formData, salary_item_ids: [...formData.salary_item_ids, filtered[0].id] });
                          setSalaryItemSearch('');
                        }
                      } else if (e.key === 'Backspace' && !salaryItemSearch) {
                        setFormData({ ...formData, salary_item_ids: formData.salary_item_ids.slice(0, -1) });
                      }
                    }}
                    placeholder={formData.salary_item_ids.length === 0 ? 'Search and add salary items...' : ''}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1 py-1"
                  />
                </div>

                {salaryItemOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-auto">
                    {salary_items.filter(c => c.name.toLowerCase().includes(salaryItemSearch.toLowerCase()) && !formData.salary_item_ids.includes(c.id)).map(c => (
                      <button key={c.id} type="button" onClick={() => { setFormData({ ...formData, salary_item_ids: [...formData.salary_item_ids, c.id] }); setSalaryItemSearch(''); setSalaryItemOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                        {c.name}
                      </button>
                    ))}
                    {salary_items.filter(c => c.name.toLowerCase().includes(salaryItemSearch.toLowerCase()) && !formData.salary_item_ids.includes(c.id)).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400">No salary items found</div>
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
              placeholder="Provide context regarding salary origin, usage, or specifications..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-eco-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-eco-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-eco-200 active:scale-95 transition-all text-sm uppercase tracking-widest">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {salary ? 'update' : 'Execute Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryModal;
