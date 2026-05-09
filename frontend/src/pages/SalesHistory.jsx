import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdExpandMore, MdExpandLess, MdDelete } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SaleRow = ({ sale, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <tr className="hover:bg-white/3 transition-colors">
        <td className="px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className="badge badge-gold text-xs">{sale.billNumber}</span>
        </td>
        <td className="px-4 py-3 text-white/70 text-sm cursor-pointer" onClick={() => setExpanded(!expanded)}>
          {formatDateTime(sale.date)}
        </td>
        <td className="px-4 py-3 text-white/70 text-sm cursor-pointer" onClick={() => setExpanded(!expanded)}>
          {sale.items.length} item(s)
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className="text-yellow-400 font-bold">{formatCurrency(sale.grandTotal)}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-white/30 cursor-pointer" onClick={() => setExpanded(!expanded)}>
              {expanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
            </span>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-all hover:bg-red-500/20"
                style={{ color: 'rgba(248,113,113,0.5)', border: '1px solid transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.5)'; }}
                title="Delete sale"
              >
                <MdDelete size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(sale._id)}
                  style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,232,240,0.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  No
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded items */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={5} className="px-4 pb-3">
              <motion.div
                className="rounded-xl p-4"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}
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
                      <span className="text-yellow-400 font-semibold text-sm">{formatCurrency(item.totalAmount)}</span>
                    </div>
                  ))}
                </div>
                {sale.note && <p className="text-xs text-white/40 mt-3 italic">Note: {sale.note}</p>}
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Sale deleted & stock restored ✅');
      fetchSales();
      fetchDailySummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete sale');
    }
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Sales History</h1>
        <p className="text-white/35 text-sm mt-1">{totalCount} total transactions</p>
      </div>

      {/* Filters */}
      <div className="royal-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="input-royal text-sm" style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider">To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="input-royal text-sm" style={{ colorScheme: 'dark' }} />
          </div>
          <button onClick={() => { setPage(1); fetchSales(); fetchDailySummary(); }} className="btn-royal flex items-center gap-2">
            <MdSearch size={18} /> Filter
          </button>
          {(startDate || endDate) && (
            <button onClick={clearFilter} className="btn-outline text-sm">Clear</button>
          )}
        </div>
      </div>

      {/* Daily Summary */}
      {dailySummary.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-white mb-3">Daily Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {dailySummary.slice(0, 10).map((day) => (
              <div key={day._id} className="royal-card p-3 text-center">
                <p className="text-xs text-white/50 mb-1">
                  {new Date(day._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-yellow-400 font-bold text-sm">{formatCurrency(day.totalRevenue)}</p>
                <p className="text-white/40 text-xs">{day.totalOrders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="royal-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <LoadingSpinner /> : (
            <table className="royal-table">
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <SaleRow key={sale._id} sale={sale} onDelete={handleDelete} />
                  ))
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
            <p className="text-sm text-white/40">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm py-1 px-3 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline text-sm py-1 px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
