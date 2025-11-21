const mongoose = require('mongoose');

// Define the Payment schema
const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true // One payment per order
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['CreditCard', 'DebitCard', 'PayPal', 'Cash'],
      message: '{VALUE} is not a valid payment method'
    },
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Completed', 'Failed', 'Refunded'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },
  transactionId: {
    type: String,
    sparse: true,  // Allows multiple null/undefined values
    unique: true   // But enforces uniqueness when value exists
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes are created automatically based on unique:true in schema
// No need for manual index creation in this case

module.exports = mongoose.model('Payment', paymentSchema);
