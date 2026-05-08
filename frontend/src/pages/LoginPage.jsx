import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BubbleBackground from '../components/BubbleBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@fizzup.com');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin 👑');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0A0A0F' }}>
      <BubbleBackground />

      <motion.div className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960C)', boxShadow: '0 20px 60px rgba(212,175,55,0.4)' }}
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🥤
          </motion.div>
          <h1 className="text-4xl font-black gold-text mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>AS Shop Manager</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase font-medium">Sales Management System</p>
        </div>

        {/* Card */}
        <div className="royal-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <span className="text-yellow-400 text-sm">👑</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Portal</h2>
              <p className="text-xs text-white/40">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500/60" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-royal pl-11" placeholder="admin@fizzup.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500/60" size={18} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-royal pl-11 pr-11" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" className="btn-royal w-full py-3 justify-center text-base"
              disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Signing in...
                </span>
              ) : '👑 Sign In to Dashboard'}
            </motion.button>
          </form>

          <div className="gold-divider mt-6" />
          <div className="p-4 rounded-xl mt-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="text-xs text-yellow-500/80 font-semibold mb-2 flex items-center gap-1">
              <span>🔑</span> Demo Credentials
            </p>
            <p className="text-xs text-white/50">Email: <span className="text-white/80">admin@fizzup.com</span></p>
            <p className="text-xs text-white/50">Password: <span className="text-white/80">admin123</span></p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">© 2024 AS Shop Manager. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
