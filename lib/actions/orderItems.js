"use server";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import connectDB from "../mongodb";
import OrderItem from "../../models/OrderItem";
import mongoose from "mongoose";

export const getOrderItems = async () => {
  try {
    await connectDB();

    const items = await OrderItem.find({ isEnabled: true })
      .sort({ order: 1 })
      .lean();

    // Serialize the items
    const serializedItems = items.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      order: item.order,
      isEnabled: item.isEnabled,
      createdAt: item.createdAt?.toISOString(),
      updatedAt: item.updatedAt?.toISOString()
    }));

    return {
      status: "SUCCESS",
      data: serializedItems,
    };
  } catch (error) {
    console.error("Error fetching order items:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch order items",
    };
  }
};

export const getAllOrderItems = async () => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const orderItems = await OrderItem.find()
      .sort({ order: 1 })
      .lean();

      

    // Ensure we return serializable data
    const serializedItems = orderItems.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return parseServerActionResponse({
      status: "SUCCESS",
      data: serializedItems,
    });
  } catch (error) {
    console.error("Error fetching order items:", error);
    return parseServerActionResponse({
      status: "ERROR",
      error: error.message || "Failed to fetch order items",
    });
  }
};

export const createOrderItem = async (name) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Get the highest order number
    const lastItem = await OrderItem.findOne().sort({ order: -1 });
    const newOrder = lastItem ? lastItem.order + 1 : 1;

    const newItem = await OrderItem.create({
      name,
      order: newOrder,
      isEnabled: true,
      createdBy: session.user.id,
    });

    return {
      status: "SUCCESS",
      data: {
        ...newItem.toObject(),
        _id: newItem._id.toString(),
        createdAt: newItem.createdAt.toISOString(),
        updatedAt: newItem.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating order item:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create order item",
    };
  }
};

export const toggleItemStatus = async (id) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const item = await OrderItem.findById(id);
    if (!item) {
      return parseServerActionResponse({
        error: "Item not found",
        status: "ERROR",
      });
    }

    item.isEnabled = !item.isEnabled;
    await item.save();

    return parseServerActionResponse({
      status: "SUCCESS",
      data: {
        ...item.toObject(),
        _id: item._id.toString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error toggling item status:", error);
    return parseServerActionResponse({
      status: "ERROR",
      error: error.message || "Failed to toggle item status",
    });
  }
};

export const deleteItem = async (id) => {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const item = await OrderItem.findByIdAndDelete(id);
    if (!item) {
      return {
        status: "ERROR",
        error: "Item not found",
      };
    }

    return {
      status: "SUCCESS",
      message: "Item deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to delete item",
    };
  }
};

export const updateOrder = async (items) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Create a single bulk update operation
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item._id) },
        update: { $set: { order: index + 1 } }
      }
    }));

    // Execute all updates in a single operation
    await OrderItem.bulkWrite(bulkOps);

    return {
      status: "SUCCESS",
      message: "Order updated successfully",
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to update order",
    };
  }
};
