const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  { name: 'Lemon Salt Soda', price: 20, stock: 50, category: 'Soda', size: '300ml', image: '' },
  { name: 'Buttermilk', price: 15, stock: 8, category: 'Buttermilk', size: '200ml', image: '' },
  { name: 'Curd', price: 25, stock: 30, category: 'Curd', size: '500g', image: '' },
  { name: 'Milk', price: 22, stock: 40, category: 'Milk', size: '500ml', image: '' },
  { name: 'Mint Juice', price: 30, stock: 20, category: 'Juice', size: '250ml', image: '' },
  { name: 'Cola', price: 40, stock: 60, category: 'Soda', size: '500ml', image: '' },
  { name: 'Water Bottle', price: 20, stock: 5, category: 'Water', size: '1L', image: '' },
  { name: 'Fresh Juice', price: 50, stock: 15, category: 'Juice', size: '300ml', image: '' },
  { name: 'Ice Cream', price: 35, stock: 25, category: 'Ice Cream', size: '100ml', image: '' },
];

// GET /api/seed?key=xxx
router.get('/', async (req, res) => {
  try {
    const { key } = req.query;
    if (key !== process.env.JWT_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Product.deleteMany({});
    await User.deleteMany({});

    await Product.insertMany(products);

    // Create admin with explicit role
    const admin = new User({
      name: 'Admin',
      email: 'admin@fizzup.com',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();

    // Verify role was saved
    const savedAdmin = await User.findOne({ email: 'admin@fizzup.com' });

    res.json({
      success: true,
      message: '✅ Database seeded!',
      products: products.length,
      admin: {
        email: savedAdmin.email,
        role: savedAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/seed/check — check current user roles
router.get('/check', async (req, res) => {
  try {
    const users = await User.find({}).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/seed/reset — clear ALL sales data, keep products & admin
router.get('/reset', async (req, res) => {
  try {
    const { key } = req.query;
    if (key !== process.env.JWT_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const Sale = require('../models/Sale');

    // Delete all sales/orders only
    await Sale.deleteMany({});

    res.json({
      success: true,
      message: '✅ All sales data cleared! App is fresh for client.',
      note: 'Products and admin account are kept.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/seed/fix-index — drop the old billNumber index
router.get('/fix-index', async (req, res) => {
  try {
    const { key } = req.query;
    if (key !== process.env.JWT_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const Sale = require('../models/Sale');
    // Drop the billNumber index if it exists
    try {
      await Sale.collection.dropIndex('billNumber_1');
      res.json({ success: true, message: '✅ billNumber index dropped! Sales will work now.' });
    } catch (e) {
      res.json({ success: true, message: 'Index not found or already dropped: ' + e.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
