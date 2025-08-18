"use server";

import { auth } from "@/auth";
import { parseServerActionResponse, checkLocationAccess, getUSEasternTime } from "../utils";
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

  const { date, shiftNumber, submissionDate, items, location } = form;

  // Check if location is provided
  if (!location) {
    return parseServerActionResponse({
      error: "Location is required",
      status: "ERROR",
    });
  }

  // Check if user has access to the location
  const accessCheck = checkLocationAccess(session, location);
  if (!accessCheck.hasAccess) {
    return parseServerActionResponse({
      error: accessCheck.error,
      status: "ERROR",
    });
  }

  try {
    await connectDB();
  
    const orderSummary = {
      date: new Date(date),
      shiftNumber,
      submissionDate: submissionDate ? new Date(submissionDate) : getUSEasternTime(),
      location: location,
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

    // Check if an order summary already exists for this date, shift, and location
    const existingSummary = await OrderSummary.findOne({
      date: validatedData.date,
      shiftNumber: validatedData.shiftNumber,
      location: validatedData.location
    });

    if (existingSummary) {
      return parseServerActionResponse({
        error: "An order summary already exists for this date, shift, and location",
        status: "ERROR",
      });
    }

    const result = await OrderSummary.create(validatedData);

    // Populate the location for the response
    await result.populate('location', 'name');

    // Convert the result to a plain object and serialize
    const serializedResult = {
      ...result.toObject(),
      _id: result._id.toString(),
      createdBy: result.createdBy.toString(),
      location: {
        _id: result.location._id.toString(),
        name: result.location.name
      },
      date: result.date.toISOString(),
      submissionDate: result.submissionDate.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    };

    return parseServerActionResponse({
      ...serializedResult,
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

export const deleteAllOrderSummaries = async (locationId) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();
    
    // Prepare query based on authorization
    let query = {};
    
    if (locationId) {
      // Check if user has access to this location
      const accessCheck = checkLocationAccess(session, locationId);
      if (!accessCheck.hasAccess) {
        return parseServerActionResponse({
          error: accessCheck.error,
          status: "ERROR",
        });
      }
      query.location = locationId;
    } else if (!session.user.hasAllLocationsAccess) {
      // If no location specified and user doesn't have all access,
      // limit to locations they have access to
      query.location = { $in: session.user.locationIds };
    }
    
    const result = await OrderSummary.deleteMany(query);
    console.log("Order summaries deleted:", result);
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
