const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getTodaySales,
  getMonthlySales,
  getDashboardStats,
  getSaleById,
  getDailyHistory,
} = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/today', protect, getTodaySales);
router.get('/monthly', protect, getMonthlySales);
router.get('/daily-history', protect, getDailyHistory);
router.get('/', protect, getSales);
router.get('/:id', protect, getSaleById);
router.post('/', protect, createSale);

module.exports = router;
