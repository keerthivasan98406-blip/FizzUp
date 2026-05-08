import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdMenu } from 'react-icons/md';
import Sidebar from './Sidebar';
import BubbleBackground from './BubbleBackground';

const pageTitles = {
  '/': 'Dashboard',
  '/sales': 'Product Sales',
  '/products': 'Product Management',
  '/history': 'Sales History',
  '/monthly': 'Monthly Report',
  '/stock': 'Stock Management',
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'AS Shop Manager';

  return (
    <div className="min-h-screen relative" style={{ background: '#0A0A0F' }}>
      <BubbleBackground />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:ml-64 relative z-10">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-5 py-4 sticky top-0 z-30"
          style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-yellow-400 transition-colors">
            <MdMenu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🥤</span>
            <span className="font-black gold-text text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>AS Shop</span>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          className="p-5 md:p-7 lg:p-8 min-h-screen"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
