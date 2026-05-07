import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { MdTrendingUp, MdShoppingCart, MdInventory, MdWarning, MdStar, MdStorefront } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, colorClass, iconBg, subtitle, delay, border }) => (
  <motion.div
    className={`royal-card royal-card-hover p-6 ${border}`}
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">{title}</p>
        <p className="text-2xl font-black text-white mb-1">{value}</p>
        {subtitle && <p className="text-xs text-white/35">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
        <Icon size={22} className={colorClass} />
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="royal-card p-3 text-sm shadow-2xl">
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="text-yellow-400 font-bold">{formatCurrency(payload[0]?.value)}</p>
        {payload[1] && <p className="text-blue-400 text-xs">{payload[1]?.value} orders</p>}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sales/dashboard').then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <MdStorefront className="text-yellow-400" size={18} />
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Dashboard
            </h1>
          </div>
          <p className="text-white/35 text-sm ml-11">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/50 font-medium">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Today's Revenue" value={formatCurrency(stats?.todayRevenue)} icon={MdTrendingUp}
          colorClass="text-yellow-400" iconBg="bg-yellow-500/15" subtitle={`${stats?.todayOrders || 0} orders today`} delay={0} border="stat-1" />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue)} icon={MdShoppingCart}
          colorClass="text-blue-400" iconBg="bg-blue-500/15" subtitle={`${stats?.monthlyOrders || 0} orders this month`} delay={0.1} border="stat-2" />
        <StatCard title="Items Sold" value={stats?.monthlyQuantity || 0} icon={MdInventory}
          colorClass="text-green-400" iconBg="bg-green-500/15" subtitle="This month" delay={0.2} border="stat-3" />
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={MdStar}
          colorClass="text-purple-400" iconBg="bg-purple-500/15" subtitle="Active products" delay={0.3} border="stat-4" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div className="royal-card p-6 xl:col-span-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Revenue Overview</h2>
              <p className="text-xs text-white/35 mt-0.5">Last 7 days performance</p>
            </div>
            <span className="badge badge-gold">Weekly</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.chartData || []}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill: '#D4AF37', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="royal-card p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Daily Orders</h2>
            <p className="text-xs text-white/35 mt-0.5">Last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.chartData || []}>
              <defs>
                <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="url(#barGold)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Product */}
        <motion.div className="royal-card p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">🏆</span> Top Selling Product
          </h2>
          {stats?.topProduct ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-3xl">🥤</div>
              <div className="flex-1">
                <p className="font-bold text-white text-lg">{stats.topProduct.name}</p>
                <p className="text-yellow-400/80 text-sm">{stats.topProduct.quantity} units sold</p>
                <p className="text-white/40 text-sm">{formatCurrency(stats.topProduct.revenue)} revenue</p>
              </div>
              <span className="badge badge-gold">👑 #1</span>
            </div>
          ) : (
            <p className="text-white/30 text-sm">No sales data yet</p>
          )}
        </motion.div>

        {/* Low Stock */}
        <motion.div className="royal-card p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <MdWarning className="text-red-400" size={20} /> Low Stock Alerts
            {stats?.lowStockProducts?.length > 0 && (
              <span className="badge badge-red ml-auto">{stats.lowStockProducts.length}</span>
            )}
          </h2>
          {stats?.lowStockProducts?.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <span className="text-white/80 text-sm font-medium">{p.name}</span>
                  <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-yellow'}`}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <span className="text-2xl">✅</span>
              <p className="text-green-400 text-sm font-medium">All products are well stocked!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
