import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { MdTrendingUp, MdShoppingCart, MdInventory, MdStar } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#00d4ff', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#4ade80', '#f87171', '#818cf8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="text-cyan-400 font-semibold">{formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  }
  return null;
};

export default function MonthlyReport() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/sales/monthly?year=${year}&month=${month}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const pieData = data?.topProducts?.slice(0, 6).map((p) => ({
    name: p.name,
    value: p.revenue,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monthly Report</h1>
          <p className="text-white/50 text-sm">{months[month - 1]} {year}</p>
        </div>
        {/* Month/Year Selector */}
        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input-glass text-sm w-36"
            style={{ colorScheme: 'dark' }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1} style={{ background: '#1a1a2e' }}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-glass text-sm w-24"
            style={{ colorScheme: 'dark' }}
          >
            {years.map((y) => (
              <option key={y} value={y} style={{ background: '#1a1a2e' }}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue), icon: MdTrendingUp, color: 'cyan' },
              { label: 'Total Orders', value: data?.totalOrders || 0, icon: MdShoppingCart, color: 'purple' },
              { label: 'Items Sold', value: data?.totalQuantity || 0, icon: MdInventory, color: 'blue' },
              { label: 'Top Product', value: data?.topProducts?.[0]?.name || 'N/A', icon: MdStar, color: 'amber' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`inline-flex p-2 rounded-lg mb-3 ${
                  stat.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                  stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-white/50 text-xs mb-1">{stat.label}</p>
                <p className="text-white font-bold text-lg truncate">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Bar Chart */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Revenue by Product</h2>
              {data?.topProducts?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.topProducts.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="url(#barGradH)" radius={[0, 4, 4, 0]}>
                      <defs>
                        <linearGradient id="barGradH" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#00d4ff" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-white/30">
                  No sales data for this period
                </div>
              )}
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Sales Distribution</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend
                      formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-white/30">
                  No sales data for this period
                </div>
              )}
            </motion.div>
          </div>

          {/* Top Products Table */}
          {data?.topProducts?.length > 0 && (
            <motion.div
              className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="p-5 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Product Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Qty Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`badge ${i === 0 ? 'badge-yellow' : i === 1 ? 'badge-blue' : 'badge-purple'}`}>
                            #{i + 1}
                          </span>
                        </td>
                        <td className="font-medium text-white">{p.name}</td>
                        <td className="text-white/70">{p.quantity}</td>
                        <td className="text-cyan-400 font-semibold">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
