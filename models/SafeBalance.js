import mongoose from 'mongoose';

const safeBalanceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
}, {
  timestamps: true,
});

// Create compound index for date (descending) and location to ensure proper filtering
safeBalanceSchema.index({ date: -1, location: 1 });

const SafeBalance = mongoose.models.SafeBalance || mongoose.model('SafeBalance', safeBalanceSchema);

export default SafeBalance; 