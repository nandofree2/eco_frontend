import React, { useEffect, useRef, useState } from 'react';
import { useCustomerStatement } from './CustomerStatementScript';
import { formatDateOnly, formatYmdToDmy, parseDmyToYmd, formatDateInput } from '../../services/helper';
import SEO from '../../components/SEO';
import SearchableFilterDropdown from '../../components/SearchableFilterDropdown';
import {
  Plus, Search, Edit2, Trash2, ShoppingCart,
  ArrowUpDown, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter, Building2, Users, X, AlertTriangle,
  Calendar, Receipt, Printer
} from 'lucide-react';

const CustomerStatement: React.FC = () => {
  const {
    transactions, customers, loading, searchTerm, setSearchTerm, contactTerm, setContactTerm, transactionDateFrom,
    setTransactionDateFrom, transactionDateTo, setTransactionDateTo, sortBy, pagination, isModalOpen, setModalOpen, selectedTransaction,
    setSelectedTransaction, transactionForDetail, setTransactionForDetail, actionLoading, serverErrors, setServerErrors, toasts,
    loadTransactions, toggleSort, handlePageChange, formatDate, formatCurrency, formatDescriptionHtml, currentPage, perPage, handlePrint, isPrinting,
  } = useCustomerStatement();

  const [transactionDateFromInput, setTransactionDateFromInput] = useState('');
  const [transactionDateToInput, setTransactionDateToInput] = useState('');
  const dateFromPickerRef = useRef<HTMLInputElement>(null);
  const dateToPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTransactionDateFromInput(formatYmdToDmy(transactionDateFrom));
  }, [transactionDateFrom]);

  useEffect(() => {
    setTransactionDateToInput(formatYmdToDmy(transactionDateTo));
  }, [transactionDateTo]);

  const handleTransactionDateFromInputChange = (val: string) => {
    const formatted = formatDateInput(val, transactionDateFromInput);
    setTransactionDateFromInput(formatted);

    if (formatted.replace(/[^0-9]/g, '').length === 8) {
      const ymd = parseDmyToYmd(formatted);
      setTransactionDateFrom(ymd);
    } else {
      setTransactionDateFrom('');
    }
  };

  const handleTransactionDateToInputChange = (val: string) => {
    const formatted = formatDateInput(val, transactionDateToInput);
    setTransactionDateToInput(formatted);

    if (formatted.replace(/[^0-9]/g, '').length === 8) {
      const ymd = parseDmyToYmd(formatted);
      setTransactionDateTo(ymd);
    } else {
      setTransactionDateTo('');
    }
  };

  const handleTransactionDateFromPickerChange = (ymd: string) => {
    if (!ymd) return;
    setTransactionDateFrom(ymd);
    setTransactionDateFromInput(formatYmdToDmy(ymd));
  };

  const handleTransactionDateToPickerChange = (ymd: string) => {
    if (!ymd) return;
    setTransactionDateTo(ymd);
    setTransactionDateToInput(formatYmdToDmy(ymd));
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <SEO
        title="Customer Statement"
        description="Manage customer statement."
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

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-eco-600" /> Customer Statement
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadTransactions(searchTerm, contactTerm, sortBy, currentPage, transactionDateFrom, transactionDateTo)}
            className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-xl transition-all border border-gray-200 bg-white shadow-sm disabled:opacity-50"
            title="Print Data Table"
          >
            <Printer className={`w-5 h-5 ${isPrinting ? 'animate-spin' : ''}`} />
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
              value={transactionDateFromInput}
              onChange={(e) => handleTransactionDateFromInputChange(e.target.value)}
            />
            {transactionDateFromInput && (
              <button
                onClick={() => { setTransactionDateFrom(''); setTransactionDateFromInput(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear From Date"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <input
              type="date"
              ref={dateFromPickerRef}
              value={transactionDateFrom}
              onChange={(e) => handleTransactionDateFromPickerChange(e.target.value)}
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
              value={transactionDateToInput}
              onChange={(e) => handleTransactionDateToInputChange(e.target.value)}
            />
            {transactionDateToInput && (
              <button
                onClick={() => { setTransactionDateTo(''); setTransactionDateToInput(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear To Date"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <input
              type="date"
              ref={dateToPickerRef}
              value={transactionDateTo}
              onChange={(e) => handleTransactionDateToPickerChange(e.target.value)}
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

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-eco-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by Contact name..."
              className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all w-full md:w-64 shadow-sm text-sm"
              value={contactTerm}
              onChange={(e) => setContactTerm(e.target.value)}
            />
            {contactTerm && (
              <button onClick={() => setContactTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Search">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('code')}>
                  <div className="flex items-center gap-2">SKU <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('contact_name')}>
                  <div className="flex items-center gap-2">Contact <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('sourceable_type')}>
                  <div className="flex items-center gap-2">Source <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('transaction_date')}>
                  <div className="flex items-center gap-2">Transaction Date <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('delivery_order_sales_order_customer_name')} >
                  <div className="flex items-center gap-2">Category <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-bold text-green-600 uppercase tracking-widest cursor-pointer hover:text-green-900 transition-colors group"
                  onClick={() => toggleSort('debit')} >
                  <div className="flex items-center gap-2">Debit +) <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-widest cursor-pointer hover:text-red-900 transition-colors group"
                  onClick={() => toggleSort('credit')} >
                  <div className="flex items-center gap-2">credit (-) <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest">
                  <div className="flex items-center gap-2">Balance</div>
                </th>

                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group"
                  onClick={() => toggleSort('description')} >
                  <div className="flex items-center gap-2">Description <ArrowUpDown className="w-3 h-3 group-hover:text-eco-600" /></div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading && transactions.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-24 text-center text-gray-400 bg-gray-50/20">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="font-bold text-lg">No Invoices found.</p>
                    <p className="text-sm">Create a new Invoice to get started.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="group hover:bg-eco-50/20 transition-all duration-300">
                    <td className="px-6 py-4">
                      <button className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm">
                        {transaction.code}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm">
                        {transaction.contact_name} - ({transaction.contact_class})
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="font-bold text-gray-900 group-hover:text-eco-700 transition-colors hover:underline text-sm">
                        {transaction.source_name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {formatDateOnly(transaction.transaction_date) || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {transaction.transaction_category}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : 'Rp 0'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : 'Rp 0'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 font-bold">
                        {formatCurrency(transaction.balance)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-2 text-sm text-gray-600 font-medium"
                        dangerouslySetInnerHTML={{ __html: formatDescriptionHtml(transaction.description) }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

export default CustomerStatement;
