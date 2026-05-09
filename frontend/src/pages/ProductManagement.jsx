import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdUpload, MdLink, MdImage } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, getCategoryColor, getProductEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['All', 'Soda', 'Juice', 'Milk', 'Curd', 'Buttermilk', 'Water', 'Ice Cream', 'Other'];
const CATEGORY_EMOJIS = {
  All: '🛒',
  Soda: '🥤',
  Juice: '🧃',
  Milk: '🥛',
  Curd: '🍶',
  Buttermilk: '🫙',
  Water: '💧',
  'Ice Cream': '🍦',
  Other: '📦',
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || '',
    stock: product?.stock || '',
    size: product?.size || '',
    category: product?.category || 'Other',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('upload');
  const [preview, setPreview] = useState(product?.image || '');
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImageUrl(''); setPreview(URL.createObjectURL(file)); }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url); setImageFile(null); setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('size', form.size);
      formData.append('category', form.category);
      if (imageFile) formData.append('image', imageFile);
      else if (imageUrl) formData.append('imageUrl', imageUrl);

      if (product) {
        await api.put(`/products/${product._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated! ✅');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created! ✅');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const iStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14,
    fontFamily: 'Inter, sans-serif', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(212,175,55,0.25)', color: '#E8E8F0', outline: 'none',
  };
  const lStyle = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,240,0.45)', marginBottom: 8, display: 'block' };
  const onFocus = (e) => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; };
  const onBlur = (e) => { e.target.style.borderColor = 'rgba(212,175,55,0.25)'; e.target.style.boxShadow = 'none'; };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div style={{ background: 'linear-gradient(135deg, #13131f, #0d0d18)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 24, padding: 28, width: '100%', maxWidth: 480, position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)', borderRadius: '24px 24px 0 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {product ? '✏️' : '➕'}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#E8E8F0', margin: 0 }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
              <p style={{ fontSize: 12, color: 'rgba(232,232,240,0.35)', margin: 0 }}>Fill in product information</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(232,232,240,0.5)' }}>
            <MdClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image */}
          <div style={{ marginBottom: 18 }}>
            <label style={lStyle}>Product Image</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 76, height: 76, borderRadius: 14, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 32, flexShrink: 0 }}>
                {preview ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setPreview('')} /> : getProductEmoji(form.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {['upload', 'url'].map((mode) => (
                    <button key={mode} type="button" onClick={() => setImageMode(mode)}
                      style={{ flex: 1, padding: '7px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: imageMode === mode ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', border: imageMode === mode ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.1)', color: imageMode === mode ? '#D4AF37' : 'rgba(232,232,240,0.5)' }}>
                      {mode === 'upload' ? <><MdUpload size={13} /> Upload</> : <><MdLink size={13} /> URL</>}
                    </button>
                  ))}
                </div>
                {imageMode === 'upload' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <MdImage size={15} />
                    {imageFile ? imageFile.name.substring(0, 18) + '...' : 'Choose Image File'}
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                ) : (
                  <input type="url" value={imageUrl} onChange={handleUrlChange} style={{ ...iStyle, fontSize: 12 }} placeholder="https://example.com/image.jpg" onFocus={onFocus} onBlur={onBlur} />
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={lStyle}>Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={iStyle} placeholder="e.g. Lemon Salt Soda" required onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Price, Stock, Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={lStyle}>Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={iStyle} placeholder="20" min="0" required onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={lStyle}>Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={iStyle} placeholder="50" min="0" required onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={lStyle}>Size / ML</label>
              <input type="text" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} style={iStyle} placeholder="500ml" onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 22 }}>
            <label style={lStyle}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.filter(c => c !== 'All').map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                  style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: form.category === c ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)', border: form.category === c ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.1)', color: form.category === c ? '#D4AF37' : 'rgba(232,232,240,0.5)' }}>
                  {CATEGORY_EMOJIS[c]} {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)', marginBottom: 18 }} />

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,232,240,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <motion.button type="submit" disabled={saving}
              style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: saving ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #B8960C)', border: 'none', color: '#0A0A0F', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
              whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}>
              {saving ? 'Saving...' : product ? '✓ Update' : '✓ Create Product'}
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
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

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
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Count per category
  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Product Management</h1>
          <p className="text-white/35 text-sm mt-1">{products.length} products in inventory</p>
        </div>
        <motion.button onClick={() => { setEditProduct(null); setModalOpen(true); }} className="btn-royal self-start" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <MdAdd size={20} /> Add Product
        </motion.button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          counts[cat] > 0 || cat === 'All' ? (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                background: activeCategory === cat ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))' : 'rgba(255,255,255,0.05)',
                border: activeCategory === cat ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#D4AF37' : 'rgba(232,232,240,0.5)',
                boxShadow: activeCategory === cat ? '0 4px 15px rgba(212,175,55,0.15)' : 'none',
              }}
            >
              <span>{CATEGORY_EMOJIS[cat]}</span>
              <span>{cat}</span>
              <span style={{ background: activeCategory === cat ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                {counts[cat]}
              </span>
            </motion.button>
          ) : null
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500/40" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-royal pl-11" />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {filtered.map((product) => (
            <motion.div key={product._id} className="royal-card royal-card-hover p-4" layout
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="relative mb-3">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-32 rounded-xl flex items-center justify-center text-5xl" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))' }}>
                    {getProductEmoji(product.name)}
                  </div>
                )}
                <span className={`absolute top-2 right-2 badge ${getCategoryColor(product.category)}`}>{product.category}</span>
              </div>

              <h3 className="font-bold text-white mb-1">{product.name}</h3>

              {/* Size badge */}
              {product.size && (
                <span className="badge badge-purple mb-2" style={{ fontSize: 11 }}>📏 {product.size}</span>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="gold-text font-bold text-lg">{formatCurrency(product.price)}</span>
                <span className={`badge ${product.stock <= 10 ? 'badge-red' : 'badge-green'}`}>Stock: {product.stock}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setEditProduct(product); setModalOpen(true); }} className="btn-outline flex-1 justify-center text-sm py-2">
                  <MdEdit size={15} /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(product)} className="btn-danger flex-1 justify-center text-sm py-2">
                  <MdDelete size={15} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/30">
            <p className="text-4xl mb-3">{CATEGORY_EMOJIS[activeCategory]}</p>
            <p>No {activeCategory === 'All' ? '' : activeCategory} products found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && <ProductModal product={editProduct} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); fetchProducts(); }} />}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ background: 'linear-gradient(135deg, #13131f, #0d0d18)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🗑️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#E8E8F0', marginBottom: 8 }}>Delete Product?</h3>
              <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.45)', marginBottom: 22 }}>
                Delete <strong style={{ color: '#E8E8F0' }}>{deleteConfirm.name}</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,232,240,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm._id)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
