import { orderTypes } from '@/lib/constants';
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    stockNo: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      // enum: Object.keys(orderTypes),
      default: "uschef",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for type, order, and location to ensure uniqueness per location
orderItemSchema.index({ type: 1, location: 1, stockNo: 1 }, { unique: true });

const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);

export default OrderItem; 