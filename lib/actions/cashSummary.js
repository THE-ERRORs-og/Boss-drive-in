"use server";

import { auth } from "@/auth";
import { parseServerActionResponse, getUSEasternTime, checkLocationAccess } from "../utils";
import { cashSummarySchema } from "@/lib/schemas";
import connectDB from "../mongodb";
import CashSummary from "../../models/CashSummary";
import mongoose from "mongoose";
import Constant from "../../models/Constant";

// Helper function to round numbers to two decimal places
const roundToTwoDecimals = (num) =>
  typeof num === "number" ? parseFloat(num.toFixed(2)) : num;

export async function createCashSummary(cashSummary) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  // Check if user has access to the location
  const accessCheck = checkLocationAccess(session, cashSummary.location);
  if (!accessCheck.hasAccess) {
    return parseServerActionResponse({
      error: accessCheck.error,
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Round all numeric values in the input
    const roundedCashSummary = {
      ...cashSummary,
      expectedCloseoutCash: roundToTwoDecimals(cashSummary.expectedCloseoutCash),
      startingRegisterCash: roundToTwoDecimals(cashSummary.startingRegisterCash),
      onlineTipsToast: roundToTwoDecimals(cashSummary.onlineTipsToast),
      onlineTipsKiosk: roundToTwoDecimals(cashSummary.onlineTipsKiosk),
      onlineTipCash: roundToTwoDecimals(cashSummary.onlineTipCash),
      totalTipDeduction: roundToTwoDecimals(cashSummary.totalTipDeduction),
      ownedToRestaurantSafe: roundToTwoDecimals(cashSummary.ownedToRestaurantSafe),
      removalAmount: roundToTwoDecimals(cashSummary.removalAmount),
      discounts: roundToTwoDecimals(cashSummary.discounts),
    };

    // Validate data against the Zod schema
    const validatedData = cashSummarySchema.safeParse(roundedCashSummary);
    if (!validatedData.success) {
      return {
        status: "ERROR",
        error: validatedData.error.format()
      };
    }

    // Check if a cash summary already exists for this datetime, shift, and location
    const existingSummary = await CashSummary.findOne({
      datetime: new Date(cashSummary.datetime),
      shiftNumber: cashSummary.shiftNumber,
      location: cashSummary.location
    });

    if (existingSummary) {
      return {
        status: "ERROR",
        error: "A cash summary already exists for this date, shift, and location"
      };
    }

    // Fetch the current safe balance from constants table for the specific location
    let current_safe_balance = await Constant.findOne({ 
      name: "current_safe_balance",
      location: cashSummary.location
    });

    // If no safe balance exists for this location, create one with a default value of 0
    if (!current_safe_balance) {
      try {
        current_safe_balance = await Constant.create({
          name: "current_safe_balance",
          value: 0, // Default starting balance
          lastUpdated_by: session.user.id,
          location: cashSummary.location
        });
        
        // Make sure we convert to a plain JavaScript object to avoid serialization issues
        current_safe_balance = current_safe_balance.toObject();
        current_safe_balance.location = current_safe_balance.location.toString();
        current_safe_balance.lastUpdated_by = current_safe_balance.lastUpdated_by.toString();
        
        console.log(`Created new safe balance for location: ${cashSummary.location}`);
      } catch (error) {
        console.error("Error creating safe balance:", error);
        return {
          status: "ERROR",
          error: "Failed to initialize safe balance for this location"
        };
      }
    }

    // Only check safe balance if we're taking money out (negative amount)
    if (roundedCashSummary.ownedToRestaurantSafe < 0) {
      const requiredAmount = Math.abs(roundedCashSummary.ownedToRestaurantSafe);
      if (current_safe_balance.value < requiredAmount) {
        return {
          status: "ERROR",
          error: `Insufficient funds in safe. Current safe balance: $${current_safe_balance.value.toFixed(2)}, Required amount: $${requiredAmount.toFixed(2)}`
        };
      }
    }

    // Calculate the updated safe balance
    const updatedSafeBalance = roundToTwoDecimals(
      current_safe_balance.value + roundedCashSummary.ownedToRestaurantSafe
    );

    // Start a session for transaction
    const dbSession = await mongoose.startSession();
    let result;

    try {
      await dbSession.startTransaction();

      // Create new cash summary
      const newCashSummary = await CashSummary.create(
        [
          {
            ...validatedData.data,
            datetime: new Date(validatedData.data.datetime),
            createdBy: session.user.id,
          },
        ],
        { session: dbSession }
      );

      // Update the safe balance
      const updatedConstant = await Constant.findOneAndUpdate(
        { 
          name: "current_safe_balance",
          location: cashSummary.location
        },
        {
          $set: {
            value: updatedSafeBalance,
            lastUpdated_by: session.user.id,
            updatedAt: getUSEasternTime(),
          },
        },
        { new: true, session: dbSession }
      );

      // Commit the transaction
      await dbSession.commitTransaction();

      // Ensure we return serializable data
      const serializedCashSummary = {
        ...newCashSummary[0].toObject(),
        _id: newCashSummary[0]._id.toString(),
        createdBy: newCashSummary[0].createdBy.toString(),
        location: newCashSummary[0].location.toString(), // Convert ObjectId to string
        datetime: newCashSummary[0].datetime.toISOString(),
        createdAt: newCashSummary[0].createdAt.toISOString(),
        updatedAt: newCashSummary[0].updatedAt.toISOString()
      };

      const serializedConstant = {
        ...updatedConstant.toObject(),
        _id: updatedConstant._id.toString(),
        lastUpdated_by: updatedConstant.lastUpdated_by.toString(),
        location: updatedConstant.location.toString(), // Convert ObjectId to string
        updatedAt: updatedConstant.updatedAt.toISOString()
      };

      result = {
        status: "SUCCESS",
        data: {
          cashSummary: serializedCashSummary,
          safeBalance: serializedConstant
        }
      };
    } catch (error) {
      // If anything goes wrong, abort the transaction
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }

    return result;
  } catch (error) {
    console.error("Error creating cash summary:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create cash summary"
    };
  }
}

export const deleteAllCashSummaries = async (locationId) => {
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
    
    const result = await CashSummary.deleteMany(query);
    console.log("Cash summaries deleted:", result);
    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error deleting cash summaries:", error);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
};

export async function getCashSummaryByDate(date, locationId) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();
    const query = { datetime: new Date(date) };
    
    // Add location filter if provided
    if (locationId) {
      // Check if user has access to this location
      const accessCheck = checkLocationAccess(session, locationId);
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: accessCheck.error
        };
      }
      query.location = locationId;
    } else if (!session.user.hasAllLocationsAccess) {
      // If no location specified and user doesn't have all access,
      // limit to locations they have access to
      query.location = { $in: session.user.locationIds };
    }
    
    const summaries = await CashSummary.find(query)
      .sort({ shiftNumber: 1 })
      .lean(); // Use lean() to get plain JavaScript objects

    // Transform the data to ensure all fields are serializable
    const serializedSummaries = summaries.map(summary => ({
      _id: summary._id.toString(),
      expectedCloseoutCash: summary.expectedCloseoutCash,
      startingRegisterCash: summary.startingRegisterCash,
      onlineTipsToast: summary.onlineTipsToast,
      onlineTipsKiosk: summary.onlineTipsKiosk,
      onlineTipCash: summary.onlineTipCash,
      totalTipDeduction: summary.totalTipDeduction,
      ownedToRestaurantSafe: summary.ownedToRestaurantSafe,
      removalAmount: summary.removalAmount,
      removalItemCount: summary.removalItemCount,
      discounts: summary.discounts,
      datetime: summary.datetime.toISOString(),
      shiftNumber: summary.shiftNumber,
      createdBy: summary.createdBy.toString(),
      location: summary.location.toString(),
      createdAt: summary.createdAt.toISOString(),
      updatedAt: summary.updatedAt.toISOString()
    }));

    return {
      status: "SUCCESS",
      data: serializedSummaries
    };
  } catch (error) {
    console.error("Error fetching cash summary:", error);
    return {
      status: "ERROR",
      error: "Failed to fetch cash summary"
    };
  }
}

export async function getCurrentSafeBalance(locationId) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();
    
    const query = { name: "current_safe_balance" };
    
    // Add location filter if provided
    if (locationId) {
      // Check if user has access to this location
      const accessCheck = checkLocationAccess(session, locationId);
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: accessCheck.error
        };
      }
      query.location = locationId;
    } else if (!session.user.hasAllLocationsAccess && session.user.locationIds.length > 0) {
      // If no location specified and user doesn't have all access but has at least one location,
      // use their first location
      query.location = session.user.locationIds[0];
    } else {
      // Super admin with no specific location or user with no locations
      return {
        status: "ERROR",
        error: "Please specify a location to get the safe balance"
      };
    }
    
    const currentSafeBalance = await Constant.findOne(query).populate('location', 'name').lean();
    
    if (!currentSafeBalance) {
      // If we couldn't find the safe balance for this location, it might not be initialized yet
      return {
        status: "INFO",
        message: "Safe balance not initialized for this location",
        data: {
          value: 0,
          locationId: locationId,
          locationName: "Unknown" // We don't have the location object here
        }
      };
    }

    // Ensure all object IDs are properly serialized to strings
    return {
      status: "SUCCESS",
      data: {
        value: currentSafeBalance.value,
        lastUpdated_by: currentSafeBalance.lastUpdated_by.toString(),
        locationId: currentSafeBalance.location._id.toString(),
        locationName: currentSafeBalance.location.name,
        updatedAt: currentSafeBalance.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error("Error fetching current safe balance:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch current safe balance"
    };
  }
}

export async function getCashSummariesByDateRange(startDate, endDate, page = 1, limit = 12, sortOrder = "desc", locationId) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Build the query
    const query = {};
    if (startDate && endDate) {
      query.datetime = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Add location filter and authorization check
    if (locationId) {
      // Check if user has access to this location
      const accessCheck = checkLocationAccess(session, locationId);
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: accessCheck.error
        };
      }
      query.location = locationId;
    } else if (!session.user.hasAllLocationsAccess) {
      // If no location specified and user doesn't have all access,
      // limit to locations they have access to
      query.location = { $in: session.user.locationIds };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await CashSummary.countDocuments(query);

    // Get paginated results
    const cashSummaries = await CashSummary.find(query)
      .sort({ datetime: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data to ensure all fields are serializable
    const serializedSummaries = cashSummaries.map(summary => ({
      _id: summary._id.toString(),
      expectedCloseoutCash: summary.expectedCloseoutCash,
      startingRegisterCash: summary.startingRegisterCash,
      onlineTipsToast: summary.onlineTipsToast,
      onlineTipsKiosk: summary.onlineTipsKiosk,
      onlineTipCash: summary.onlineTipCash,
      totalTipDeduction: summary.totalTipDeduction,
      ownedToRestaurantSafe: summary.ownedToRestaurantSafe,
      removalAmount: summary.removalAmount,
      removalItemCount: summary.removalItemCount,
      discounts: summary.discounts,
      datetime: summary.datetime.toISOString(),
      shiftNumber: summary.shiftNumber,
      createdBy: summary.createdBy.toString(),
      location: summary.location?.toString(),
      createdAt: summary.createdAt.toISOString(),
      updatedAt: summary.updatedAt.toISOString()
    }));

    return {
      status: "SUCCESS",
      data: serializedSummaries,
      total
    };
  } catch (error) {
    console.error("Error fetching cash summaries:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch cash summaries"
    };
  }
}

export async function getCashSummaryById(id) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const cashSummary = await CashSummary.findById(id)
      .populate('createdBy', 'name userid')
      .populate('location', 'name')
      .lean();

    if (!cashSummary) {
      return {
        status: "ERROR",
        error: "Cash summary not found"
      };
    }
    
    // Check authorization for the location
    const locationId = cashSummary.location._id.toString();
    const accessCheck = checkLocationAccess(session, locationId);
    if (!accessCheck.hasAccess) {
      return {
        status: "ERROR",
        error: accessCheck.error
      };
    }

    // Ensure we return serializable data
    const serializedSummary = {
      ...cashSummary,
      _id: cashSummary._id.toString(),
      createdBy: {
        ...cashSummary.createdBy,
        _id: cashSummary.createdBy._id.toString()
      },
      location: {
        ...cashSummary.location,
        _id: cashSummary.location._id.toString()
      },
      datetime: cashSummary.datetime.toISOString(),
      createdAt: cashSummary.createdAt.toISOString(),
      updatedAt: cashSummary.updatedAt.toISOString()
    };

    return {
      status: "SUCCESS",
      data: serializedSummary
    };
  } catch (error) {
    console.error("Error fetching cash summary:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch cash summary"
    };
  }
}
