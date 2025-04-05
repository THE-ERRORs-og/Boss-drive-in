"use server";

import { auth } from "@/auth";
import connectDB from "../mongodb";
import RestaurantDepotOrder from "../../models/RestaurantDepotOrder";
import { parseServerActionResponse } from "../utils";

export const createRestaurantDepotOrder = async (orderData) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Check if an entry already exists for the given date and shift
    const startOfDay = new Date(orderData.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(orderData.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingOrder = await RestaurantDepotOrder.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      shiftNumber: orderData.shiftNumber
    });

    if (existingOrder) {
      return {
        status: "ERROR",
        error: `An order already exists for this date and shift number`,
      };
    }

    const newOrder = await RestaurantDepotOrder.create({
      ...orderData,
      createdBy: session.user.id,
      submissionDate: new Date(),
    });

    await newOrder.populate({
      path: "items.itemId",
      model: "OrderItem",
    });

    // Serialize the response
    const serializedOrder = JSON.parse(JSON.stringify(newOrder));

    return {
      status: "SUCCESS",
      data: serializedOrder,
    };
  } catch (error) {
    console.error("Error creating restaurant depot order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create restaurant depot order",
    };
  }
}; 