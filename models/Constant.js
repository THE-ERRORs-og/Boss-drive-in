import mongoose from 'mongoose';

const constantSchema = new mongoose.Schema({
  lastUpdated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  name: {
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

// Create compound index for name and location to ensure uniqueness per location
constantSchema.index({ name: 1, location: 1 }, { unique: true });

const Constant = mongoose.models.Constant || mongoose.model('Constant', constantSchema);

export default Constant; 