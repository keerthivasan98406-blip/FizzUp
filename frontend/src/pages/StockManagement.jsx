import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdWarning, MdSearch, MdEdit, MdSave, MdClose } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, getCategoryColor, getProductEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const StockEditModal = ({ product, onClose, onSave }) => {
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/products/${product._id}`, { stock });
      toast.success(`Stock updated for ${product.name}`);
      onSave();
    } catch (err) {
      toast.error('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="glass-card p-6 max-w-sm w-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Update Stock</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <MdClose size={22} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-white/5">
          <span className="text-3xl">{getProductEmoji(product.name)}</span>
          <div>
            <p className="font-semibold text-white">{product.name}</p>
            <p className="text-xs text-white/40">Current stock: {product.stock}</p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-white/60 mb-2">New Stock Quantity</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            className="input-glass text-lg font-bold text-center"
            min="0"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-neon flex-1">Cancel</button>
          <motion.button
            onClick={handleSave}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdSave size={18} />
            {saving ? 'Saving...' : 'Update'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? p.stock <= 10 && p.stock > 0 :
      filter === 'out' ? p.stock === 0 :
      filter === 'ok' ? p.stock > 10 : true;
    return matchSearch && matchFilter;
  });

  const lowCount = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
  const outCount = products.filter((p) => p.stock === 0).length;
  const okCount = products.filter((p) => p.stock > 10).length;

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'badge-red' };
    if (stock <= 5) return { label: 'Critical', class: 'badge-red' };
    if (stock <= 10) return { label: 'Low Stock', class: 'badge-yellow' };
    return { label: 'In Stock', class: 'badge-green' };
  };

  const getStockBarWidth = (stock) => {
    const max = 100;
    return Math.min((stock / max) * 100, 100);
  };

  const getStockBarColor = (stock) => {
    if (stock === 0) return 'bg-red-500';
    if (stock <= 5) return 'bg-red-400';
    if (stock <= 10) return 'bg-yellow-400';
    return 'bg-cyan-400';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Stock Management</h1>
        <p className="text-white/50 text-sm">Monitor and update product inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center border-t-2 border-green-500">
          <p className="text-2xl font-bold text-green-400">{okCount}</p>
          <p className="text-xs text-white/50 mt-1">In Stock</p>
        </div>
        <div className="glass-card p-4 text-center border-t-2 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-400">{lowCount}</p>
          <p className="text-xs text-white/50 mt-1">Low Stock</p>
        </div>
        <div className="glass-card p-4 text-center border-t-2 border-red-500">
          <p className="text-2xl font-bold text-red-400">{outCount}</p>
          <p className="text-xs text-white/50 mt-1">Out of Stock</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(lowCount > 0 || outCount > 0) && (
        <div className="glass-card p-4 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <MdWarning className="text-red-400" size={20} />
            <h3 className="font-semibold text-red-400">Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {products
              .filter((p) => p.stock <= 10)
              .map((p) => (
                <span key={p._id} className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-yellow'}`}>
                  {p.name}: {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-glass pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'ok', 'low', 'out'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/40'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'ok' ? 'In Stock' : f === 'low' ? 'Low' : 'Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <motion.tr
                    key={product._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getProductEmoji(product.name)}</span>
                        <span className="font-medium text-white">{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="text-cyan-400 font-semibold">{formatCurrency(product.price)}</td>
                    <td>
                      <div className="flex items-center gap-3 min-w-32">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getStockBarColor(product.stock)}`}
                            style={{ width: `${getStockBarWidth(product.stock)}%` }}
                          />
                        </div>
                        <span className="text-white/70 text-sm w-8 text-right">{product.stock}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setEditProduct(product)}
                        className="btn-neon flex items-center gap-1 text-sm py-1 px-3"
                      >
                        <MdEdit size={14} /> Update
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProduct && (
          <StockEditModal
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSave={() => {
              setEditProduct(null);
              fetchProducts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
