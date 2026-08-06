import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableDropdownSalaryProps {
  label: string;
  value: string;
  onChange: (id: string, name?: string) => void;
  onSearch?: (query: string) => Promise<Option[]>;
  placeholder?: string;
  error?: boolean;
  required?: boolean;
  initialName?: string;
  compact?: boolean;
}

const SearchableDropdownSalary: React.FC<SearchableDropdownSalaryProps> = ({
  label,
  value,
  onChange,
  onSearch,
  placeholder = "Search Salary...",
  error = false,
  required = false,
  initialName = "",
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(initialName);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialName) {
      setDisplayName(initialName);
    }
  }, [initialName]);

  useEffect(() => {
    if (!value && !initialName) {
      setDisplayName('');
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && options.length === 0) {
      handleSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (q: string) => {
    setLoading(true);
    try {
      if (onSearch) {
        const results = await onSearch(q);
        setOptions(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (option: Option) => {
    setDisplayName(option.name);
    onChange(option.id, option.name);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block ${compact ? 'text-[10px]' : 'text-sm'} font-bold mb-1 flex items-center gap-1.5 uppercase tracking-wider ${error ? 'text-red-600' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 10);
        }}
        className={`w-full flex items-center justify-between ${compact ? 'px-3 py-2 rounded-xl text-xs' : 'px-4 py-2.5 rounded-xl text-sm'} border outline-none transition-all font-medium text-left bg-gray-50 shadow-sm ${error
          ? 'border-red-300 ring-2 ring-red-500/20'
          : 'border-gray-200 focus:ring-2 focus:ring-eco-500/20 hover:border-gray-300'
          }`}
      >
        <span className={displayName ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {displayName || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[110] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              ref={inputRef}
              type="text"
              className="w-full py-1 bg-transparent outline-none text-xs font-medium"
              placeholder="Filter salaries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {loading && <Loader2 className="w-4 h-4 text-eco-500 animate-spin mr-2" />}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 && !loading ? (
              <div className="p-3 text-center text-gray-400 text-xs italic">No salaries found.</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectOption(opt)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors border-l-4 ${value === opt.id
                    ? 'bg-eco-50 border-eco-500 text-eco-700'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  {opt.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdownSalary;
