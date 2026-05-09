const Product = require('../models/Product');
const sharp = require('sharp');

// Compress image and convert to Base64
const processImage = async (file) => {
  if (!file) return '';
  try {
    // Resize to max 400x400, compress to JPEG quality 70
    const compressed = await sharp(file.buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();
    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch (err) {
    // Fallback: just convert as-is
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
};

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
    const image = await processImage(req.file);
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

    if (req.file) product.image = await processImage(req.file);
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
