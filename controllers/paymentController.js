const Payment = require('../models/Payment');

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'orderNumber customerName totalAmount status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment by order ID
const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Process payment (update status, add transactionId, set processedAt)
const processPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Generate transactionId if not provided
    const txnId = transactionId || `TXN-${Date.now()}`;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        transactionId: txnId,
        processedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get payments by status
const getPaymentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const payments = await Payment.find({ status })
      .populate('order', 'orderNumber customerName totalAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      status: status,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByOrderId,
  processPayment,
  getPaymentsByStatus
};
