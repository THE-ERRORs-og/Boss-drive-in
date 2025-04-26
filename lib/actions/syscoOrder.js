"use server";

import { auth } from "@/auth";
import connectDB from "../mongodb";
import mongoose from "mongoose";
import SyscoOrder from "../../models/SyscoOrder";
import { parseServerActionResponse } from "../utils";

export const getLastSyscoOrder = async () => {
  try {
    await connectDB();
    // Calculate yesterday's start and end
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0); // yesterday 00:00:00

    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999); // yesterday 23:59:59

    const lastOrder = await SyscoOrder.findOne({
      submissionDate: { $gte: yesterdayStart, $lte: yesterdayEnd },
    })
      .sort({ submissionDate: -1 })
      .populate({
        path: "items.itemId",
        model: "OrderItem",
      });

    if (!lastOrder) {
      return {
        status: "SUCCESS",
        data: null,
      };
    }

    // Convert to plain object and serialize
    const serializedOrder = JSON.parse(JSON.stringify(lastOrder));

    return {
      status: "SUCCESS",
      data: serializedOrder,
    };
  } catch (error) {
    console.error("Error fetching last sysco order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch last sysco order",
    };
  }
};

export const createSyscoOrder = async (orderData) => {
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

    const existingOrder = await SyscoOrder.findOne({
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

    const newOrder = await SyscoOrder.create({
      ...orderData,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
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
    console.error("Error creating sysco order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create sysco order",
    };
  }
}; 