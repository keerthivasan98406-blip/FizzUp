import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdPointOfSale, MdInventory, MdHistory,
  MdBarChart, MdWarehouse, MdLogout, MdClose,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/',         icon: MdDashboard,   label: 'Dashboard',      exact: true },
  { to: '/sales',    icon: MdPointOfSale, label: 'Product Sales' },
  { to: '/products', icon: MdInventory,   label: 'Products' },
  { to: '/history',  icon: MdHistory,     label: 'Sales History' },
  { to: '/monthly',  icon: MdBarChart,    label: 'Monthly Report' },
  { to: '/stock',    icon: MdWarehouse,   label: 'Stock Management' },
];

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">
            🛒
          </div>
          <div>
            <h1 className="font-black text-xl gold-text tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
              AS Shop
            </h1>
            <p className="text-xs text-white/30 font-medium tracking-widest uppercase">Manager</p>
          </div>
        </div>
        <div className="gold-divider mt-4" />
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-white/20 font-semibold uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="royal-card p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-bold text-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
            <span className="badge badge-gold">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20"
        >
          <MdLogout size={19} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <aside
        className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40"
        style={{ background: 'linear-gradient(180deg, #0D1117 0%, #0A0A0F 100%)', borderRight: '1px solid rgba(212,175,55,0.12)' }}
      >
        <SidebarContent onClose={() => {}} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-screen w-72 z-50 lg:hidden"
              style={{ background: 'linear-gradient(180deg, #0D1117 0%, #0A0A0F 100%)', borderRight: '1px solid rgba(212,175,55,0.15)' }}
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              <button
                className="absolute top-4 right-4 text-white/40 hover:text-white z-10"
                onClick={() => setMobileOpen(false)}
              >
                <MdClose size={22} />
              </button>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
