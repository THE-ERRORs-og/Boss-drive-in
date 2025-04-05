import mongoose from "mongoose";

const syscoOrderSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    shiftNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "OrderItem",
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        yesterdayOrder: {
          type: Number,
          required: true,
          default: 0,
        },
        boh: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    submissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SyscoOrder = mongoose.models.SyscoOrder || mongoose.model("SyscoOrder", syscoOrderSchema);

export default SyscoOrder; 