import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdCalendarToday, MdExpandMore, MdExpandLess, MdPrint } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SaleRow = ({ sale }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <span className="badge badge-blue text-xs">{sale.billNumber}</span>
        </td>
        <td className="px-4 py-3 text-white/70 text-sm">{formatDateTime(sale.date)}</td>
        <td className="px-4 py-3 text-white/70 text-sm">{sale.items.length} item(s)</td>
        <td className="px-4 py-3">
          <span className="text-cyan-400 font-bold">{formatCurrency(sale.grandTotal)}</span>
        </td>
        <td className="px-4 py-3 text-white/40">
          {expanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={5} className="px-4 pb-3">
              <motion.div
                className="rounded-xl bg-white/3 border border-white/5 p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sale.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                      <div>
                        <p className="text-sm text-white font-medium">{item.productName}</p>
                        <p className="text-xs text-white/40">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <span className="text-cyan-400 font-semibold text-sm">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
                {sale.note && (
                  <p className="text-xs text-white/40 mt-3 italic">Note: {sale.note}</p>
                )}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dailySummary, setDailySummary] = useState([]);

  useEffect(() => {
    fetchSales();
    fetchDailySummary();
  }, [page, startDate, endDate]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const { data } = await api.get(`/sales?${params}`);
      setSales(data.sales);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const { data } = await api.get(`/sales/daily-history?${params}`);
      setDailySummary(data);
    } catch (err) {}
  };

  const handleFilter = () => {
    setPage(1);
    fetchSales();
    fetchDailySummary();
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sales History</h1>
        <p className="text-white/50 text-sm">{totalCount} total transactions</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-glass text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-glass text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <button onClick={handleFilter} className="btn-primary flex items-center gap-2">
            <MdSearch size={18} /> Filter
          </button>
          {(startDate || endDate) && (
            <button onClick={clearFilter} className="btn-neon text-sm">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Daily Summary Cards */}
      {dailySummary.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Daily Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {dailySummary.slice(0, 10).map((day) => (
              <div key={day._id} className="glass-card p-3 text-center">
                <p className="text-xs text-white/50 mb-1">
                  {new Date(day._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-cyan-400 font-bold text-sm">{formatCurrency(day.totalRevenue)}</p>
                <p className="text-white/40 text-xs">{day.totalOrders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map((sale) => <SaleRow key={sale._id} sale={sale} />)
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-white/40">
                      <p className="text-3xl mb-2">📋</p>
                      <p>No sales found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-white/40">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-neon text-sm py-1 px-3 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-neon text-sm py-1 px-3 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
