import React, { useEffect, useRef, useState } from 'react';
import { useDeposit } from './DepositScript';
import { formatDateOnly, formatYmdToDmy, parseDmyToYmd, formatDateInput } from '../../services/helper';
import SEO from '../../components/SEO';
import {
  Plus, Search, Edit2, Trash2, ShoppingCart,
  ArrowUpDown, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter, Building2, Users, X, AlertTriangle,
  Calendar, Receipt
} from 'lucide-react';

const Deposit: React.FC = () => {
  const {
    deposits, loading, searchTerm, setSearchTerm, depositDateFrom,
    setDepositDateFrom, depositDateTo, setDepositDateTo, sortBy, pagination, actionLoading, serverErrors, setServerErrors, toasts,
    loadDeposits, toggleSort, handlePageChange, formatDate, formatCurrency, currentPage, perPage,
  } = useDeposit();

  const [depositDateFromInput, setDepositDateFromInput] = useState('');
  const [depositDateToInput, setDepositDateToInput] = useState('');
  const dateFromPickerRef = useRef<HTMLInputElement>(null);
  const dateToPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDepositDateFromInput(formatYmdToDmy(depositDateFrom));
  }, [depositDateFrom]);

  useEffect(() => {
    setDepositDateToInput(formatYmdToDmy(depositDateTo));
  }, [depositDateTo]);

  const handleDepositDateFromInputChange = (val: string) => {
    const formatted = formatDateInput(val, depositDateFromInput);
    setDepositDateFromInput(formatted);

    if (formatted.replace(/[^0-9]/g, '').length === 8) {
      const ymd = parseDmyToYmd(formatted);
      setDepositDateFrom(ymd);
    } else {
      setDepositDateFrom('');
    }
  };

  const handleDepositDateToInputChange = (val: string) => {
    const formatted = formatDateInput(val, depositDateToInput);
    setDepositDateToInput(formatted);

    if (formatted.replace(/[^0-9]/g, '').length === 8) {
      const ymd = parseDmyToYmd(formatted);
      setDepositDateTo(ymd);
    } else {
      setDepositDateTo('');
    }
  };

  const handleDepositDateFromPickerChange = (ymd: string) => {
    if (!ymd) return;
    setDepositDateFrom(ymd);
    setDepositDateFromInput(formatYmdToDmy(ymd));
  };

  const handleDepositDateToPickerChange = (ymd: string) => {
    if (!ymd) return;
    setDepositDateTo(ymd);
    setDepositDateToInput(formatYmdToDmy(ymd));
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Financial Transactions"
        description="Manage financial transactions."
      />

      {/* Toasts */}
      <div className="fixed top-20 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-eco-600" /> Deposit History
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadDeposits(searchTerm, sortBy, currentPage, depositDateFrom, depositDateTo)}
            className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative group w-full md:w-44">
            <button
              type="button"
              onClick={() => dateFromPickerRef.current?.showPicker?.()}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-eco-600 transition-colors z-10"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="From Date"
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full text-sm shadow-sm"
              value={depositDateFromInput}
              onChange={(e) => handleDepositDateFromInputChange(e.target.value)}
            />
            {depositDateFromInput && (
              <button
                onClick={() => { setDepositDateFrom(''); setDepositDateFromInput(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear From Date"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <input
              type="date"
              ref={dateFromPickerRef}
              value={depositDateFrom}
              onChange={(e) => handleDepositDateFromPickerChange(e.target.value)}
              className="sr-only"
            />
          </div>

          <div className="relative group w-full md:w-44">
            <button
              type="button"
              onClick={() => dateToPickerRef.current?.showPicker?.()}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-eco-600 transition-colors z-10"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="To Date"
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full text-sm shadow-sm"
              value={depositDateToInput}
              onChange={(e) => handleDepositDateToInputChange(e.target.value)}
            />
            {depositDateToInput && (
              <button
                onClick={() => { setDepositDateTo(''); setDepositDateToInput(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear To Date"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <input
              type="date"
              ref={dateToPickerRef}
              value={depositDateTo}
              onChange={(e) => handleDepositDateToPickerChange(e.target.value)}
              className="sr-only"
            />
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by SKU, description..."
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-64 shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Search">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Registry Filter
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-xs font-medium text-gray-500">
              Displaying <span className="text-gray-900 font-bold">{deposits.length}</span> records
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('code')}>
                  <div className="flex items-center gap-2">SKU <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('customer_name')}>
                  <div className="flex items-center gap-2">Contact <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('deposit_type')}>
                  <div className="flex items-center gap-2">Type <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('transaction_date')}>
                  <div className="flex items-center gap-2">Transaction Date <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('amount')} >
                  <div className="flex items-center gap-2">Amount <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('description')} >
                  <div className="flex items-center gap-2">Description <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && deposits.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No History Deposit found.</p>
                  </td>
                </tr>
              ) : (
                deposits.map((deposit) => (
                  <tr key={deposit.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <button className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm">
                        {deposit.code}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm">
                        {deposit.customer_name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm">
                        {deposit.deposit_type}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {deposit.deposit_date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {formatCurrency(deposit.amount) || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {deposit.description}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Record <span className="text-gray-900">{((currentPage - 1) * perPage) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * perPage, pagination.total_count)}</span>
              <span className="mx-2">of</span>
              <span className="text-eco-600">{pagination.total_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (currentPage > 3 && pagination.total_pages > 5) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > pagination.total_pages) pageNum = pagination.total_pages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                        ? 'bg-eco-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-eco-500 hover:text-eco-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages || loading} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-eco-600 shadow-sm transition-all disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;
