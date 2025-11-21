const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply admin-only authentication to all analytics routes
router.use(authenticate, authorize('admin'));

// Product analytics routes
router.get('/products/count', analyticsController.getProductsCount);
router.get('/products/by-category', analyticsController.getProductsByCategory);
router.get('/products/value', analyticsController.getInventoryValue);

// Order analytics routes
router.get('/orders/stats', analyticsController.getOrderStats);
router.get('/orders/by-status', analyticsController.getOrdersByStatus);
router.get('/orders/recent', analyticsController.getRecentOrders);
router.get('/orders/top-products', analyticsController.getTopProducts);

// Payment analytics routes
router.get('/payments/by-method', analyticsController.getPaymentsByMethod);
router.get('/payments/success-rate', analyticsController.getPaymentSuccessRate);
router.get('/payments/revenue', analyticsController.getRevenueByStatus);
router.get('/payments/daily', analyticsController.getDailyRevenue);

module.exports = router;
