import mongoose from 'mongoose';

const cashSummarySchema = new mongoose.Schema({
  expectedCloseoutCash: {
    type: Number,
    required: true,
    min: 0,
  },
  startingRegisterCash: {
    type: Number,
    required: true,
    min: 0,
  },
  onlineTipsToast: {
    type: Number,
    min: 0,
    default: 0,
  },
  onlineTipsKiosk: {
    type: Number,
    min: 0,
    default: 0,
  },
  onlineTipCash: {
    type: Number,
    min: 0,
    default: 0,
  },
  totalTipDeduction: {
    type: Number,
    min: 0,
    default: 0,
  },
  ownedToRestaurantSafe: {
    type: Number,
    default: 0,
  },
  removalAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  removalItemCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  discounts: {
    type: Number,
    min: 0,
    default: 0,
  },
  datetime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shiftNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
}, {
  timestamps: true,
});

// Create compound index for datetime (descending), shiftNumber, and location to ensure uniqueness
cashSummarySchema.index({ datetime: -1, shiftNumber: 1, location: 1 }, { unique: true });

const CashSummary = mongoose.models.CashSummary || mongoose.model('CashSummary', cashSummarySchema);

export default CashSummary; 