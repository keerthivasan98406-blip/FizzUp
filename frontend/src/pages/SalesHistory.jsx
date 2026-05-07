import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdExpandMore, MdExpandLess, MdPrint, MdHistory } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, formatDateTime, getProductEmoji } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SaleRow = ({ sale }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="cursor-pointer transition-colors" style={{ borderBottom: '1px solid rgba(212,175,55,0.06)' }}
        onClick={() => setExpanded(!expanded)}>
        {/* Product Images instead of Bill No */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {sale.items.slice(0, 3).map((item, i) => (
              <div key={i} className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-yellow-500/20"
                style={{ background: 'rgba(212,175,55,0.08)' }}>
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    {getProductEmoji(item.productName)}
                  </div>
                )}
              </div>
            ))}
            {sale.items.length > 3 && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-yellow-400/70"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                +{sale.items.length - 3}
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-white/80 text-sm font-medium">{sale.items.map(i => i.productName).join(', ').substring(0, 30)}{sale.items.map(i => i.productName).join(', ').length > 30 ? '...' : ''}</p>
          <p className="text-white/35 text-xs mt-0.5">{sale.billNumber}</p>
        </td>
        <td className="px-4 py-3 text-white/55 text-sm">{formatDateTime(sale.date)}</td>
        <td className="px-4 py-3">
          <span className="badge badge-gold text-xs">{sale.items.length} item{sale.items.length > 1 ? 's' : ''}</span>
        </td>
        <td className="px-4 py-3">
          <span className="text-yellow-400 font-bold text-sm">{formatCurrency(sale.grandTotal)}</span>
        </td>
        <td className="px-4 py-3 text-white/30">
          {expanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={6} className="px-4 pb-4">
              <motion.div
                className="rounded-2xl p-4 mt-1"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sale.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {getProductEmoji(item.productName)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/90 font-semibold">{item.productName}</p>
                        <p className="text-xs text-white/40">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">{formatCurrency(item.totalAmount)}</span>
                    </div>
                  ))}
                </div>
                {sale.note && (
                  <p className="text-xs text-white/35 mt-3 italic">📝 {sale.note}</p>
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

  useEffect(() => { fetchSales(); fetchDailySummary(); }, [page, startDate, endDate]);

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
    } catch (err) { toast.error('Failed to load sales'); }
    finally { setLoading(false); }
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

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <MdHistory className="text-yellow-400" size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Sales History</h1>
          <p className="text-white/35 text-sm">{totalCount} total transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="royal-card p-5">
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Filter by Date</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-2">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="input-royal text-sm" style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2">To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="input-royal text-sm" style={{ colorScheme: 'dark' }} />
          </div>
          <button onClick={() => { setPage(1); fetchSales(); fetchDailySummary(); }}
            className="btn-royal flex items-center gap-2">
            <MdSearch size={16} /> Search
          </button>
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
              className="btn-outline text-sm">Clear</button>
          )}
        </div>
      </div>

      {/* Daily Summary */}
      {dailySummary.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">Daily Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {dailySummary.slice(0, 10).map((day) => (
              <div key={day._id} className="royal-card p-3 text-center">
                <p className="text-xs text-white/40 mb-1">
                  {new Date(day._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-yellow-400 font-bold text-sm">{formatCurrency(day.totalRevenue)}</p>
                <p className="text-white/35 text-xs">{day.totalOrders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="royal-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <LoadingSpinner /> : (
            <table className="royal-table">
              <thead>
                <tr>
                  <th>Products</th>
                  <th>Sale Details</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? sales.map((sale) => <SaleRow key={sale._id} sale={sale} />) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-white/30">
                      <p className="text-4xl mb-3">📋</p>
                      <p className="font-medium">No sales found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
            <p className="text-sm text-white/35">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline text-sm py-2 px-4 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline text-sm py-2 px-4 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
