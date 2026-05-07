const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    items: [saleItemSchema],
    grandTotal: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    billNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate bill number before saving
saleSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.billNumber = `BILL-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
