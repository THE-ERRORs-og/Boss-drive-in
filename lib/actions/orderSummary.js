"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import { orderSummarySchema } from "@/lib/validation";
import connectDB from "../mongodb";
import mongoose from "mongoose";
import OrderSummary from "../../models/OrderSummary";

export const createOrderSummary = async (form) => {
  const session = await auth();
  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { date, shiftNumber, submissionDate, items } = form;

  try {
    await connectDB();

    const orderSummary = {
      date: new Date(date),
      shiftNumber,
      submissionDate: submissionDate ? new Date(submissionDate) : new Date(),
      items: items.map((item) => ({
        itemName: item.itemName,
        boh: parseFloat(item.boh.toFixed(2)),
        cashOrder: parseFloat(item.cashOrder.toFixed(2)),
        inventory: parseFloat(item.inventory.toFixed(2)),
      })),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    };

    // Validate data against the Zod schema
    const validatedData = orderSummarySchema.parse(orderSummary);

    // Check if an order summary already exists for this date and shift
    const existingSummary = await OrderSummary.findOne({
      date: validatedData.date,
      shiftNumber: validatedData.shiftNumber
    });

    if (existingSummary) {
      return parseServerActionResponse({
        error: "An order summary already exists for this date and shift",
        status: "ERROR",
      });
    }

    const result = await OrderSummary.create(validatedData);

    return parseServerActionResponse({
      ...result.toObject(),
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error submitting order summary:", error);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
};

export const deleteAllOrderSummaries = async () => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();
    const result = await OrderSummary.deleteMany({});
    console.log("All order summaries deleted:", result);
    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error deleting order summaries:", error);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
};
