import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdUpload } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, getCategoryColor, getProductEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Soda', 'Juice', 'Dairy', 'Water', 'Ice Cream', 'Other'];

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || 'Other',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image || '');
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('category', form.category);
      if (imageFile) formData.append('image', imageFile);

      if (product) {
        await api.put(`/products/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
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
        className="glass-card w-full max-w-md p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Product Image</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{getProductEmoji(form.name)}</span>
                )}
              </div>
              <label className="btn-neon flex items-center gap-2 cursor-pointer text-sm">
                <MdUpload size={16} /> Upload Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-glass"
              placeholder="e.g. Lemon Salt Soda"
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-glass"
                placeholder="20"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-glass"
                placeholder="50"
                min="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-glass"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-neon flex-1">
              Cancel
            </button>
            <motion.button
              type="submit"
              className="btn-primary flex-1"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Saving...' : product ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleModalSave = () => {
    setModalOpen(false);
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Management</h1>
          <p className="text-white/50 text-sm">{products.length} products total</p>
        </div>
        <motion.button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 self-start"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MdAdd size={20} /> Add Product
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-glass pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((product) => (
            <motion.div
              key={product._id}
              className="glass-card glass-card-hover p-4"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Image */}
              <div className="relative mb-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-5xl">
                    {getProductEmoji(product.name)}
                  </div>
                )}
                <span className={`absolute top-2 right-2 badge ${getCategoryColor(product.category)}`}>
                  {product.category}
                </span>
              </div>

              {/* Info */}
              <h3 className="font-semibold text-white mb-1">{product.name}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-cyan-400 font-bold">{formatCurrency(product.price)}</span>
                <span className={`badge ${product.stock <= 10 ? 'badge-red' : 'badge-green'}`}>
                  Stock: {product.stock}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="flex-1 btn-neon flex items-center justify-center gap-1 text-sm py-2"
                >
                  <MdEdit size={16} /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(product)}
                  className="flex-1 btn-danger flex items-center justify-center gap-1 text-sm py-2"
                >
                  <MdDelete size={16} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/40">
            <p className="text-4xl mb-3">📦</p>
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProductModal
            product={editProduct}
            onClose={() => setModalOpen(false)}
            onSave={handleModalSave}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-6 max-w-sm w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🗑️</div>
                <h3 className="text-lg font-bold text-white">Delete Product?</h3>
                <p className="text-white/50 text-sm mt-2">
                  Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-neon flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id)}
                  className="btn-danger flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
