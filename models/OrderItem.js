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
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);

export default OrderItem; 