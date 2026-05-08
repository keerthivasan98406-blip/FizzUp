const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products
const getProducts = async (req, res) => {
  try {
    const { category, search, active } = req.query;
    let query = {};
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    // Cloudinary gives full URL in req.file.path
    const image = req.file ? req.file.path : '';
    const product = await Product.create({ name, price, stock, category, image });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, price, stock, category, isActive } = req.body;

    // If new image uploaded via Cloudinary
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (product.image && product.image.includes('cloudinary')) {
        const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      product.image = req.file.path;
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;
    if (isActive !== undefined) product.isActive = isActive;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete from Cloudinary
    if (product.image && product.image.includes('cloudinary')) {
      const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock products
const getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lte: threshold }, isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStock };
