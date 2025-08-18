"use server";

import { auth } from "@/auth";
import connectDB from "../mongodb";
import { parseServerActionResponse, checkLocationAccess } from "../utils";
import USChefOrder from "../../models/USChefOrder";
import RestaurantDepotOrder from "../../models/RestaurantDepotOrder";
import SpecialOnlineOrder from "../../models/SpecialOnlineOrder";
import SyscoOrder from "../../models/SyscoOrder";
import mongoose from "mongoose";

const getOrderModel = (type) => {
  switch (type) {
    case "uschef":
      return USChefOrder;
    case "restaurant-depot":
      return RestaurantDepotOrder;
    case "special-online":
      return SpecialOnlineOrder;
    case "sysco":
      return SyscoOrder;
    default:
      return null;
  }
};

const serializeOrder = (order, type) => {
  const baseOrder = {
    _id: order._id.toString(),
    createdBy: {
      _id: order.createdBy._id.toString(),
      name: order.createdBy.name,
    },
    date: order.date.toISOString(),
    shiftNumber: order.shiftNumber,
    submissionDate: order.submissionDate.toISOString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    type: order.type || type,
  };

  // Add location if it exists
  if (order.location) {
    baseOrder.location = {
      _id: order.location._id.toString(),
      name: order.location.name || 'Unknown Location'
    };
  }

  // Handle different item structures based on order type
  if (type === "sysco") {
    return {
      ...baseOrder,
      items: order.items.map(item => ({
        itemId: item.itemId.toString(),
        itemName: item.itemName,
        yesterdayOrder: item.yesterdayOrder,
        boh: item.boh,
        total: item.total,
        order: item.order,
      })),
    };
  } else {
    return {
      ...baseOrder,
      items: order.items.map(item => ({
        itemId: item.itemId.toString(),
        itemName: item.itemName,
        boh: item.boh,
        order: item.order,
      })),
    };
  }
};

export const getOrderById = async (type, id) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const OrderModel = getOrderModel(type);
    if (!OrderModel) {
      return {
        status: "ERROR",
        error: "Invalid order type",
      };
    }

    const order = await OrderModel.findById(id)
      .populate("createdBy", "name")
      .populate("location", "name")
      .lean();

    if (!order) {
      return {
        status: "ERROR",
        error: "Order not found",
      };
    }

    // Check location access
    if (order.location && order.location._id) {
      const accessCheck = checkLocationAccess(session, order.location._id.toString());
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: "You don't have access to this location",
        };
      }
    }

    const serializedOrder = serializeOrder(order, type);

    return {
      status: "SUCCESS",
      data: serializedOrder,
    };
  } catch (error) {
    console.error(`Error fetching ${type} order:`, error);
    return {
      status: "ERROR",
      error: error.message || `Failed to fetch ${type} order`,
    };
  }
};

export const getOrderHistoryByType = async (type, params) => {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const { page = 1, limit = 12, query = "", sort = "desc", startDate, endDate, location } = params;
    const OrderModel = getOrderModel(type);

    if (!OrderModel) {
      return {
        status: "ERROR",
        error: "Invalid order type",
      };
    }

    // Check location access if location is provided
    if (location) {
      const accessCheck = checkLocationAccess(session, location);
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: accessCheck.error,
        };
      }
    } 

    // Create date range filter if dates are provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Create search filter if query is provided
    const searchFilter = query
      ? {
          $or: [
            { "items.itemName": { $regex: query, $options: "i" } },
            { "createdBy.name": { $regex: query, $options: "i" } },
          ],
        }
      : {};

    // Add location filter
    let locationFilter;

    if (location) {
      locationFilter = { location: new mongoose.Types.ObjectId(location) };
    } else {
      locationFilter = { location: { $in: session.user.locationIds } };
    }
    // Combine filters
    const filter = {
      ...dateFilter,
      ...searchFilter,
      ...locationFilter,
    };

    // Get orders
    const [orders, totalRecords] = await Promise.all([
      OrderModel.find(filter)
        .populate("createdBy", "name")
        .sort({ date: sort === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    // Serialize the orders
    const serializedOrders = orders.map(order => serializeOrder(order, type));

    return {
      status: "SUCCESS",
      data: {
        orders: serializedOrders,
        totalRecords,
      },
    };
  } catch (error) {
    console.error(`Error fetching ${type} order history:`, error);
    return {
      status: "ERROR",
      error: error.message || `Failed to fetch ${type} order history`,
    };
  }
};

export const getOrderHistory = async (params) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const { page = 1, limit = 12, query = "", sort = "desc", startDate, endDate } = params;

    // Create date range filter if dates are provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Create search filter if query is provided
    const searchFilter = query
      ? {
          $or: [
            { "items.itemName": { $regex: query, $options: "i" } },
            { "createdBy.name": { $regex: query, $options: "i" } },
          ],
        }
      : {};

    // Combine filters
    const filter = {
      ...dateFilter,
      ...searchFilter,
    };

    // Get orders from all collections
    const [usChefOrders, restaurantDepotOrders, specialOnlineOrders, syscoOrders] = await Promise.all([
      USChefOrder.find(filter)
        .populate("createdBy", "name")
        .sort({ date: sort === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RestaurantDepotOrder.find(filter)
        .populate("createdBy", "name")
        .sort({ date: sort === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SpecialOnlineOrder.find(filter)
        .populate("createdBy", "name")
        .sort({ date: sort === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SyscoOrder.find(filter)
        .populate("createdBy", "name")
        .sort({ date: sort === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // Get total counts
    const [usChefCount, restaurantDepotCount, specialOnlineCount, syscoCount] = await Promise.all([
      USChefOrder.countDocuments(filter),
      RestaurantDepotOrder.countDocuments(filter),
      SpecialOnlineOrder.countDocuments(filter),
      SyscoOrder.countDocuments(filter),
    ]);

    // Serialize and combine orders
    const allOrders = [
      ...usChefOrders.map(order => serializeOrder({ ...order, type: "USChef" })),
      ...restaurantDepotOrders.map(order => serializeOrder({ ...order, type: "RestaurantDepot" })),
      ...specialOnlineOrders.map(order => serializeOrder({ ...order, type: "SpecialOnline" })),
      ...syscoOrders.map(order => serializeOrder({ ...order, type: "Sysco" })),
    ];

    // Sort combined orders
    allOrders.sort((a, b) => {
      return sort === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    });

    const totalRecords = usChefCount + restaurantDepotCount + specialOnlineCount + syscoCount;

    return {
      status: "SUCCESS",
      data: {
        orders: allOrders,
        totalRecords,
      },
    };
  } catch (error) {
    console.error("Error fetching order history:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch order history",
    };
  }
}; 