const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create a new sale
// @route   POST /api/sales
const createSale = async (req, res) => {
  try {
    const { items, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in sale' });
    }

    // Validate stock and calculate totals
    const saleItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const totalAmount = product.price * item.quantity;
      grandTotal += totalAmount;

      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        totalAmount,
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const sale = await Sale.create({ items: saleItems, grandTotal, note });
    res.status(201).json(sale);
  } catch (error) {
    console.error('Sale creation error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sales with optional date filter
// @route   GET /api/sales
const getSales = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ sales, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's sales summary
// @route   GET /api/sales/today
const getTodaySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await Sale.find({ date: { $gte: today, $lt: tomorrow } });

    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalOrders = sales.length;
    const totalQuantity = sales.reduce(
      (sum, s) => sum + s.items.reduce((q, i) => q + i.quantity, 0),
      0
    );

    res.json({ totalRevenue, totalOrders, totalQuantity, sales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly sales summary
// @route   GET /api/sales/monthly
const getMonthlySales = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    const sales = await Sale.find({ date: { $gte: startDate, $lte: endDate } });

    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalOrders = sales.length;
    const totalQuantity = sales.reduce(
      (sum, s) => sum + s.items.reduce((q, i) => q + i.quantity, 0),
      0
    );

    // Product breakdown
    const productMap = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = { quantity: 0, revenue: 0 };
        }
        productMap[item.productName].quantity += item.quantity;
        productMap[item.productName].revenue += item.totalAmount;
      });
    });

    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({ totalRevenue, totalOrders, totalQuantity, topProducts, year: y, month: m });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/sales/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Today stats
    const todaySales = await Sale.find({ date: { $gte: today, $lt: tomorrow } });
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
    const todayOrders = todaySales.length;

    // Monthly stats
    const monthlySales = await Sale.find({ date: { $gte: firstOfMonth, $lte: lastOfMonth } });
    const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.grandTotal, 0);
    const monthlyOrders = monthlySales.length;
    const monthlyQuantity = monthlySales.reduce(
      (sum, s) => sum + s.items.reduce((q, i) => q + i.quantity, 0),
      0
    );

    // Top selling product (all time)
    const allSales = await Sale.find({});
    const productMap = {};
    allSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = { quantity: 0, revenue: 0 };
        }
        productMap[item.productName].quantity += item.quantity;
        productMap[item.productName].revenue += item.totalAmount;
      });
    });

    const topProduct = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)[0] || null;

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isActive: true });

    // Total products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Last 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const daySales = await Sale.find({ date: { $gte: d, $lt: nextD } });
      const dayRevenue = daySales.reduce((sum, s) => sum + s.grandTotal, 0);

      last7Days.push({
        date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: daySales.length,
      });
    }

    res.json({
      todayRevenue,
      todayOrders,
      monthlyRevenue,
      monthlyOrders,
      monthlyQuantity,
      topProduct,
      lowStockProducts,
      totalProducts,
      chartData: last7Days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily sales grouped by date
// @route   GET /api/sales/daily-history
const getDailyHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    }

    const result = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          totalRevenue: { $sum: '$grandTotal' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a sale and restore stock
// @route   DELETE /api/sales/:id
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    // Restore stock for each item
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    await sale.deleteOne();
    res.json({ message: 'Sale deleted and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getTodaySales,
  getMonthlySales,
  getDashboardStats,
  getSaleById,
  getDailyHistory,
  deleteSale,
};
