const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    size: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'Soda',
        'Juice',
        'Milk',
        'Curd',
        'Buttermilk',
        'Water',
        'Ice Cream',
        'Other',
      ],
      default: 'Other',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
