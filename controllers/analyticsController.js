const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// ========== PRODUCT ANALYTICS ==========

// Get total products count
const getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();

    res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product count and average price by category
const getProductsByCategory = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get total inventory value
const getInventoryValue = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $project: {
          name: 1,
          value: { $multiply: ['$price', '$stock'] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' },
          productCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: result[0] || { totalValue: 0, productCount: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== ORDER ANALYTICS ==========

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order count and total amount by status
const getOrdersByStatus = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders from last 30 days
const getRecentOrders = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top 5 most ordered products
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productId: '$_id',
          name: '$productDetails.name',
          category: '$productDetails.category',
          price: '$productDetails.price',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: topProducts.length,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== PAYMENT ANALYTICS ==========

// Get total amount collected by payment method
const getPaymentsByMethod = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment success rate
const getPaymentSuccessRate = async (req, res) => {
  try {
    const total = await Payment.countDocuments();
    const completed = await Payment.countDocuments({ status: 'Completed' });
    const failed = await Payment.countDocuments({ status: 'Failed' });
    const pending = await Payment.countDocuments({ status: 'Pending' });

    const successRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalPayments: total,
        completedPayments: completed,
        failedPayments: failed,
        pendingPayments: pending,
        successRate: successRate + '%'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get total revenue by payment status
const getRevenueByStatus = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get daily revenue within date range
const getDailyRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate query parameters are required'
      });
    }

    const result = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: result.length,
      dateRange: { startDate, endDate },
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  // Product analytics
  getProductsCount,
  getProductsByCategory,
  getInventoryValue,

  // Order analytics
  getOrderStats,
  getOrdersByStatus,
  getRecentOrders,
  getTopProducts,

  // Payment analytics
  getPaymentsByMethod,
  getPaymentSuccessRate,
  getRevenueByStatus,
  getDailyRevenue
};
