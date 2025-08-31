"use server";
import { auth } from "@/auth";
import { parseServerActionResponse, checkLocationAccess } from "../utils";
import connectDB from "../mongodb";
import OrderItem from "../../models/OrderItem";
import mongoose from "mongoose";

export const getOrderItems = async (orderType, locationId) => {
  const session = await auth();
  if (!session) {
    return {
      status: "ERROR",
      error: "Not signed in",
    };
  }

  // If locationId is not provided, return error
  if (!locationId) {
    return {
      status: "ERROR",
      error: "Location ID is required",
    };
  }

  try {
    await connectDB();

    // Build the query
    let query = { type: orderType, isEnabled: true };

    // Check access and filter by location
    const accessCheck = checkLocationAccess(session, locationId);
    if (!accessCheck.hasAccess) {
      return {
        status: "ERROR",
        error: accessCheck.error,
      };
    }
    query.location = locationId;

    const items = await OrderItem.find(query).sort({ order: 1 }).lean();

    // Serialize the items
    const serializedItems = items.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
      stockNo: item.stockNo,
      order: item.order,
      isEnabled: item.isEnabled,
      location: item.location ? item.location.toString() : null,
      createdAt: item.createdAt?.toISOString(),
      updatedAt: item.updatedAt?.toISOString(),
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

export const getAllOrderItems = async (orderType, locationId) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  // If locationId is not provided, return error
  if (!locationId) {
    return parseServerActionResponse({
      error: "Location ID is required",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Build the query
    let query = { type: orderType };

    // Check access and filter by location
    const accessCheck = checkLocationAccess(session, locationId);
    if (!accessCheck.hasAccess) {
      return parseServerActionResponse({
        error: accessCheck.error,
        status: "ERROR",
      });
    }
    query.location = new mongoose.Types.ObjectId(locationId);

    const orderItems = await OrderItem.find(query)
      .sort({ order: 1 })
      .populate("location", "name")
      .lean();

    // Ensure we return serializable data
    const serializedItems = orderItems.map((item) => ({
      ...item,
      _id: item._id.toString(),
      location: item.location
        ? {
            _id: item.location._id.toString(),
            name: item.location.name,
          }
        : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
    // console.log(serializedItems);

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

export const createOrderItem = async (name, orderType, stockNo, locationId) => {
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

  // Check if location is provided
  if (!locationId) {
    return parseServerActionResponse({
      error: "Location is required",
      status: "ERROR",
    });
  }

  // Check if user has access to the location
  const accessCheck = checkLocationAccess(session, locationId);
  if (!accessCheck.hasAccess) {
    return parseServerActionResponse({
      error: accessCheck.error,
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Check if stock number already exists for this location
    const existingItem = await OrderItem.findOne({
      stockNo,
      location: new mongoose.Types.ObjectId(locationId),
    });

    if (existingItem) {
      return {
        status: "ERROR",
        error: "Stock number already exists for this location",
      };
    }

    // Get the highest order number for this location and type
    const lastItem = await OrderItem.findOne({
      type: orderType,
      location: locationId,
    }).sort({
      order: -1,
    });

    const newOrder = lastItem ? lastItem.order + 1 : 1;
    const newItem = await OrderItem.create({
      name,
      stockNo,
      order: newOrder,
      type: orderType,
      isEnabled: true,
      location: new mongoose.Types.ObjectId(locationId),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });

    return {
      status: "SUCCESS",
      data: {
        ...newItem.toObject(),
        _id: newItem._id.toString(),
        createdBy: newItem.createdBy.toString(),
        location: newItem.location.toString(),
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

    const item = await OrderItem.findById(id);
    if (!item) {
      return parseServerActionResponse({
        error: "Item not found",
        status: "ERROR",
      });
    }

    // Check if user has access to this location
    if (item.location) {
      const accessCheck = checkLocationAccess(
        session,
        item.location.toString()
      );
      if (!accessCheck.hasAccess) {
        return parseServerActionResponse({
          error: "You don't have access to this location",
          status: "ERROR",
        });
      }
    }

    item.isEnabled = !item.isEnabled;
    await item.save();

    return parseServerActionResponse({
      status: "SUCCESS",
      data: {
        ...item.toObject(),
        _id: item._id.toString(),
        location: item.location ? item.location.toString() : null,
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

    // First, find the item to check location access
    const item = await OrderItem.findById(id);
    if (!item) {
      return {
        status: "ERROR",
        error: "Item not found",
      };
    }

    // Check if user has access to this location
    if (item.location) {
      const accessCheck = checkLocationAccess(
        session,
        item.location.toString()
      );
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: "You don't have access to this location",
        };
      }
    }

    // Now delete the item
    await OrderItem.findByIdAndDelete(id);

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

    // Check location access for the first item (assuming all items have the same location)
    if (items.length > 0 && items[0].location) {
      let locationId;

      // Handle both string and object location
      if (typeof items[0].location === "string") {
        locationId = items[0].location;
      } else if (items[0].location._id) {
        locationId = items[0].location._id;
      }

      if (locationId) {
        const accessCheck = checkLocationAccess(session, locationId);
        if (!accessCheck.hasAccess) {
          return parseServerActionResponse({
            error: "You don't have access to this location",
            status: "ERROR",
          });
        }
      }
    }

    // Create a single bulk update operation
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item._id) },
        update: { $set: { order: index + 1 } },
      },
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

export const updateOrderItem = async (id, name, stockNo) => {
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

    // First find the item to get its location
    const item = await OrderItem.findById(id);
    if (!item) {
      return parseServerActionResponse({
        error: "Item not found",
        status: "ERROR",
      });
    }

    // Check if user has access to this location
    if (item.location) {
      const accessCheck = checkLocationAccess(
        session,
        item.location.toString()
      );
      if (!accessCheck.hasAccess) {
        return parseServerActionResponse({
          error: "You don't have access to this location",
          status: "ERROR",
        });
      }
    }

    // Check if stock number already exists for a different item in the same location
    const existingItem = await OrderItem.findOne({
      stockNo,
      _id: { $ne: id },
      location: item.location,
    });

    if (existingItem) {
      return {
        status: "ERROR",
        error: "Stock number already exists for this location",
      };
    }

    // Update the item
    item.name = name;
    item.stockNo = stockNo;
    await item.save();

    return parseServerActionResponse({
      status: "SUCCESS",
      data: {
        ...item.toObject(),
        _id: item._id.toString(),
        location: item.location ? item.location.toString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating order item:", error);
    return parseServerActionResponse({
      status: "ERROR",
      error: error.message || "Failed to update order item",
    });
  }
};

export const copyOrderItemsFromLocation = async (
  orderType,
  fromLocationId,
  toLocationId
) => {
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

  // Check if both locations are provided
  if (!fromLocationId || !toLocationId) {
    return parseServerActionResponse({
      error: "Both source and destination locations are required",
      status: "ERROR",
    });
  }

  // Check if user has access to both locations
  const fromAccessCheck = checkLocationAccess(session, fromLocationId);
  if (!fromAccessCheck.hasAccess) {
    return parseServerActionResponse({
      error: "You don't have access to the source location",
      status: "ERROR",
    });
  }

  const toAccessCheck = checkLocationAccess(session, toLocationId);
  if (!toAccessCheck.hasAccess) {
    return parseServerActionResponse({
      error: "You don't have access to the destination location",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Get all order items from the source location
    const sourceItems = await OrderItem.find({
      type: orderType,
      location: new mongoose.Types.ObjectId(fromLocationId),
      isEnabled: true,
    })
      .sort({ order: 1 })
      .lean();

    if (sourceItems.length === 0) {
      return parseServerActionResponse({
        error: "No items found in the source location",
        status: "ERROR",
      });
    }

    // Check if destination location already has items for this order type
    const existingItems = await OrderItem.find({
      type: orderType,
      location: new mongoose.Types.ObjectId(toLocationId),
    });

    if (existingItems.length > 0) {
      return parseServerActionResponse({
        error:
          "Destination location already has order items. Please clear them first or choose a different location.",
        status: "ERROR",
      });
    }

    // Create new items for the destination location
    const newItems = sourceItems.map((item, index) => ({
      name: item.name,
      stockNo: item.stockNo,
      order: index + 1,
      type: orderType,
      isEnabled: true,
      location: new mongoose.Types.ObjectId(toLocationId),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    }));

    // Insert all new items
    const createdItems = await OrderItem.insertMany(newItems);

    return parseServerActionResponse({
      status: "SUCCESS",
      message: `Successfully copied ${createdItems.length} items from source location to destination location`,
      data: {
        copiedCount: createdItems.length,
        items: createdItems.map((item) => ({
          _id: item._id.toString(),
          name: item.name,
          stockNo: item.stockNo,
          order: item.order,
          isEnabled: item.isEnabled,
          location: item.location.toString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error copying order items:", error);
    return parseServerActionResponse({
      status: "ERROR",
      error: error.message || "Failed to copy order items",
    });
  }
};
