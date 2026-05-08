const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getLowStock,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/low-stock', protect, getLowStock);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
