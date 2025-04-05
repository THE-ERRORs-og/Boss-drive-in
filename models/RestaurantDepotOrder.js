import mongoose from "mongoose";

const restaurantDepotOrderSchema = new mongoose.Schema(
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
        boh: {
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

const RestaurantDepotOrder = mongoose.models.RestaurantDepotOrder || mongoose.model("RestaurantDepotOrder", restaurantDepotOrderSchema);

export default RestaurantDepotOrder; 