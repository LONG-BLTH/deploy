const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

// Specific routes MUST come before parameterized routes
router.get('/customer/:email', authenticate, orderController.getOrdersByCustomerEmail);
router.patch('/:id/status', authenticate, authorize('admin'), orderController.updateOrderStatus);

// CRUD routes
router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, authorize('admin'), orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.delete('/:id', authenticate, authorize('admin'), orderController.cancelOrder);

module.exports = router;
