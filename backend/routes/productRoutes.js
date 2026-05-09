const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getLowStock,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Store in memory as buffer — we'll convert to Base64 and save in MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max (mobile photos)
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.get('/low-stock', protect, getLowStock);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
