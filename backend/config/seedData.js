const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');

// Always load .env from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'Loaded ✅' : 'NOT FOUND ❌');

    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    await Product.insertMany(products);
    console.log('✅ Products seeded (8 products)');

    await User.create({
      name: 'Admin',
      email: 'admin@fizzup.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('');
    console.log('🎉 Seed complete!');
    console.log('   Email:    admin@fizzup.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
