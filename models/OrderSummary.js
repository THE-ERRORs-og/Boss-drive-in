import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  boh: {
    type: Number,
    min: 0,
    default: 0,
  },
  cashOrder: {
    type: Number,
    min: 0,
    default: 0,
  },
  inventory: {
    type: Number,
    min: 0,
    default: 0,
  },
});

const orderSummarySchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  shiftNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  submissionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  items: [orderItemSchema],
}, {
  timestamps: true,
});

// Create compound index for date (descending), shiftNumber, and location to ensure uniqueness
orderSummarySchema.index({ date: -1, shiftNumber: 1, location: 1 }, { unique: true });

const OrderSummary = mongoose.models.OrderSummary || mongoose.model('OrderSummary', orderSummarySchema);

export default OrderSummary; 