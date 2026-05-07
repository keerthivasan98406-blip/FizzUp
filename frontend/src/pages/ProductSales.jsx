import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdRemove, MdShoppingCart, MdPrint, MdClear, MdSearch } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency, getProductEmoji, getCategoryColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductCard = ({ product, quantity, onAdd, onRemove }) => {
  const total = product.price * quantity;

  return (
    <motion.div
      className={`glass-card glass-card-hover p-4 flex flex-col gap-3 ${quantity > 0 ? 'border-cyan-500/40' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product image / emoji */}
      <div className="relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-28 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-28 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-5xl">
            {getProductEmoji(product.name)}
          </div>
        )}
        {product.stock <= 10 && (
          <span className="absolute top-2 right-2 badge badge-red text-xs">
            {product.stock === 0 ? 'Out' : `${product.stock} left`}
          </span>
        )}
        {quantity > 0 && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-black">
            {quantity}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="font-semibold text-white text-sm leading-tight">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-cyan-400 font-bold">{formatCurrency(product.price)}</span>
          <span className={`badge ${getCategoryColor(product.category)}`}>{product.category}</span>
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRemove(product)}
          disabled={quantity === 0}
          className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <MdRemove size={16} />
        </button>
        <span className="flex-1 text-center font-bold text-white text-lg">{quantity}</span>
        <button
          onClick={() => onAdd(product)}
          disabled={product.stock === 0 || quantity >= product.stock}
          className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <MdAdd size={16} />
        </button>
      </div>

      {/* Total */}
      {quantity > 0 && (
        <motion.div
          className="text-center py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <p className="text-xs text-white/50">Total</p>
          <p className="font-bold text-cyan-400">{formatCurrency(total)}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function ProductSales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [lastBill, setLastBill] = useState(null);
  const billRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?active=true');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (product) => {
    setCart((prev) => ({
      ...prev,
      [product._id]: Math.min((prev[product._id] || 0) + 1, product.stock),
    }));
  };

  const handleRemove = (product) => {
    setCart((prev) => {
      const newQty = (prev[product._id] || 0) - 1;
      if (newQty <= 0) {
        const { [product._id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product._id]: newQty };
    });
  };

  const clearCart = () => {
    setCart({});
    setNote('');
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find((p) => p._id === id);
    return { product, quantity: qty };
  }).filter((i) => i.product);

  const grandTotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  const handleSaveSale = async () => {
    if (cartItems.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    setSaving(true);
    try {
      const items = cartItems.map(({ product, quantity }) => ({
        productId: product._id,
        quantity,
      }));
      const { data } = await api.post('/sales', { items, note });
      setLastBill(data);
      clearCart();
      fetchProducts(); // refresh stock
      toast.success(`Sale saved! Bill: ${data.billNumber} 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save sale');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
          <h1 className="text-2xl font-bold text-white">Product Sales</h1>
          <p className="text-white/50 text-sm">Select products and save the sale</p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="btn-danger flex items-center gap-2 self-start">
            <MdClear size={18} /> Clear Cart
          </button>
        )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                quantity={cart[product._id] || 0}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/40">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* Cart / Order Summary */}
        <div className="space-y-4">
          <div className="glass-card p-5 sticky top-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MdShoppingCart className="text-cyan-400" /> Order Summary
              {cartItems.length > 0 && (
                <span className="badge badge-blue ml-auto">{cartItems.length}</span>
              )}
            </h2>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-white/30">
                <MdShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No items added</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product._id} className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <p className="text-sm text-white font-medium">{product.name}</p>
                        <p className="text-xs text-white/40">{formatCurrency(product.price)} × {quantity}</p>
                      </div>
                      <span className="text-cyan-400 font-semibold text-sm">
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 font-medium">Grand Total</span>
                    <span className="text-xl font-bold text-cyan-400">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Note */}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="input-glass text-sm resize-none h-16 mb-4"
                />

                {/* Save Button */}
                <motion.button
                  onClick={handleSaveSale}
                  disabled={saving}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <>
                      <motion.span
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>💾 Save Sale</>
                  )}
                </motion.button>
              </>
            )}
          </div>

          {/* Last Bill */}
          <AnimatePresence>
            {lastBill && (
              <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                ref={billRef}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Last Bill</h3>
                  <button onClick={handlePrint} className="btn-neon flex items-center gap-1 text-sm py-1 px-3">
                    <MdPrint size={16} /> Print
                  </button>
                </div>
                <p className="text-xs text-white/40 mb-3">{lastBill.billNumber}</p>
                {lastBill.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-white/70">{item.productName} × {item.quantity}</span>
                    <span className="text-cyan-400">{formatCurrency(item.totalAmount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-3 pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-cyan-400">{formatCurrency(lastBill.grandTotal)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
