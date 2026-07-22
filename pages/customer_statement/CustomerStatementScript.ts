import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { CustomerStatement, PaginationMeta, Customer } from '../../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const useCustomerStatement = () => {
  const [transactions, setTransactions] = useState<CustomerStatement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactTerm, setContactTerm] = useState('');
  const [transactionDateFrom, setTransactionDateFrom] = useState<string>('');

  const [transactionDateTo, setTransactionDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState('transaction_date asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CustomerStatement | null>(null);
  const [transactionForDetail, setTransactionForDetail] = useState<CustomerStatement | null>(null);

  // Loading & Error States
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);


  const addToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const loadTransactions = useCallback(async (search = searchTerm, contact_name = contactTerm, sort = sortBy, page = currentPage, transactionDateFrom, transactionDateTo) => {
    setLoading(true);
    try {
      const response = await api.customer_statements.list(search, contact_name, sort, page, perPage, transactionDateFrom, transactionDateTo);
      const transactions = response.data || [];
      const uniqueTransactions = transactions.filter((transaction, index) => transactions.findIndex(i => i.id === transaction.id) === index);

      setTransactions(uniqueTransactions);
      setPagination(response.meta || null);
    } catch (err: any) {
      setTransactions([]);
      setPagination(null);
      addToast('error', err.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, contactTerm, sortBy, currentPage, perPage, transactionDateFrom, transactionDateTo, addToast]);

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const res = await api.customer_statements.print(searchTerm, contactTerm, sortBy, 1, 10000, transactionDateFrom, transactionDateTo);
      const rawCollection = res?.collection.data;

      const customerInfo = res?.customer || null;

      const allTransactions = rawCollection.map((item: any) => {
        const attrs = item.attributes || item;
        return { id: item.id, ...attrs };
      });
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        addToast('error', 'Please allow popups to print data table.');
        return;
      }

      const rowsHtml = allTransactions.map(t => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.transaction_date ? t.transaction_date.substring(0, 10) : '---'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.code || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.source_name || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #16a34a;">${t.debit > 0 ? formatCurrency(t.debit) : 'Rp 0'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #dc2626;">${t.credit > 0 ? formatCurrency(t.credit) : 'Rp 0'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(t.balance)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatDescriptionHtml(t.description)}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer Statement Report</title>
            <style>
              @page { size: A4 landscape; margin: 10mm; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 10px; color: #333; }
              h1 { margin-bottom: 5px; font-size: 12px; }
              p { margin-top: 0; font-size: 10px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; table-layout: auto; }
              th { background-color: #f3f4f6; padding: 8px 6px; border: 1px solid #ddd; text-align: left; font-size: 10px; text-transform: uppercase; }
              td { padding: 6px; border: 1px solid #ddd; word-break: break-word; }
            </style>
          </head>
          <body>
            <h1>Customer Statement Report</h1>
            ${customerInfo ? `<p style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Customer: ${customerInfo.name || '-'}</p>` : ''}
            ${customerInfo ? `<p style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Phone: ${customerInfo.phone || '-'}</p>` : ''}
            ${customerInfo ? `<p style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">Address: ${customerInfo.address || '-'}</p>` : ''}
            <p>Generated on: ${new Date().toLocaleString('id-ID')} | Total Records: ${allTransactions.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Transaction Date</th>
                  <th>SKU</th>
                  <th>Source</th>
                  <th style="text-align: right;">Debit (+)</th>
                  <th style="text-align: right;">Credit (-)</th>
                  <th style="text-align: right;">Balance</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="9" style="text-align:center; padding: 20px;">No data found</td></tr>'}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to fetch data for printing.');
    } finally {
      setIsPrinting(false);
    }
  };

  // Debounced search/filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadTransactions(searchTerm, contactTerm, sortBy, 1, transactionDateFrom, transactionDateTo);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, contactTerm, sortBy, transactionDateFrom, transactionDateTo]);

  const toggleSort = (field: string) => {
    setSortBy(prev => {
      const [currField, currDir] = prev.split(' ');
      const newDir = currField === field && currDir === 'asc' ? 'desc' : 'asc';
      return `${field} ${newDir}`;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    setCurrentPage(page);
    loadTransactions(searchTerm, contactTerm, sortBy, page, transactionDateFrom, transactionDateTo);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  const formatDescriptionHtml = (desc?: string) => {
    if (!desc) return '-';
    return desc.replace(/\[(.*?)\]/g, '<strong style="color: #2563eb; font-weight: bold;">[$1]</strong>');
  };

  return {
    transactions, customers, loading, searchTerm, setSearchTerm, contactTerm, setContactTerm, transactionDateFrom, setTransactionDateFrom, transactionDateTo,
    setTransactionDateTo, sortBy, setSortBy, currentPage, setCurrentPage, perPage, pagination, isModalOpen, setModalOpen, selectedTransaction, setSelectedTransaction,
    transactionForDetail, setTransactionForDetail, actionLoading, serverErrors, setServerErrors, toasts, loadTransactions, toggleSort, handlePageChange, formatDate,
    formatCurrency, formatDescriptionHtml, handlePrint, isPrinting
  };
};
