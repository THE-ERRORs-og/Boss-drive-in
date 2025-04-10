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
    unique: true,
  },
}, {
  timestamps: true,
});

const Constant = mongoose.models.Constant || mongoose.model('Constant', constantSchema);

export default Constant; 