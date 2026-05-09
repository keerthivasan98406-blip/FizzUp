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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
