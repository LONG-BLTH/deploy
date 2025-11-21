const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// Specific routes MUST come before parameterized routes
router.get('/order/:orderId', authenticate, authorize('admin'), paymentController.getPaymentByOrderId);
router.get('/status/:status', authenticate, authorize('admin'), paymentController.getPaymentsByStatus);
router.patch('/:id/process', authenticate, authorize('admin'), paymentController.processPayment);

// CRUD routes
router.post('/', authenticate, authorize('admin'), paymentController.createPayment);
router.get('/', authenticate, authorize('admin'), paymentController.getAllPayments);
router.get('/:id', authenticate, authorize('admin'), paymentController.getPaymentById);

module.exports = router;
