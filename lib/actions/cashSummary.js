"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import { cashSummarySchema } from "@/lib/schemas";
import connectDB from "../mongodb";
import CashSummary from "../../models/CashSummary";
import SafeBalance from "../../models/SafeBalance";
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

    // Check if a cash summary already exists for this datetime and shift
    const existingSummary = await CashSummary.findOne({
      datetime: new Date(cashSummary.datetime),
      shiftNumber: cashSummary.shiftNumber
    });

    if (existingSummary) {
      return {
        status: "ERROR",
        error: "A cash summary already exists for this date and shift"
      };
    }

    // Fetch the current safe balance from constants table
    const current_safe_balance = await Constant.findOne({ name: "current_safe_balance" });

    if (!current_safe_balance) {
      return {
        status: "ERROR",
        error: "Unable to fetch current safe balance"
      };
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
      const newCashSummary = await CashSummary.create([{
        ...validatedData.data,
        datetime: new Date(validatedData.data.datetime),
        createdBy: session.user.id
      }], { session: dbSession });

      // Update the safe balance
      const updatedConstant = await Constant.findOneAndUpdate(
        { name: "current_safe_balance" },
        { 
          $set: { 
            value: updatedSafeBalance,
            lastUpdated_by: session.user.id,
            updatedAt: new Date()
          }
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
        datetime: newCashSummary[0].datetime.toISOString(),
        createdAt: newCashSummary[0].createdAt.toISOString(),
        updatedAt: newCashSummary[0].updatedAt.toISOString()
      };

      const serializedConstant = {
        ...updatedConstant.toObject(),
        _id: updatedConstant._id.toString(),
        lastUpdated_by: updatedConstant.lastUpdated_by.toString(),
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

export const deleteAllCashSummaries = async () => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();
    const result = await CashSummary.deleteMany({});
    console.log("All cash summaries deleted:", result);
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

export async function getCashSummaryByDate(date) {
  try {
    await connectDB();
    const summaries = await CashSummary.find({ datetime: new Date(date) })
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

export async function getCurrentSafeBalance() {
  try {
    await connectDB();
    const currentSafeBalance = await Constant.findOne({ name: "current_safe_balance" });
    
    if (!currentSafeBalance) {
      return {
        status: "ERROR",
        error: "Unable to fetch current safe balance"
      };
    }

    return {
      status: "SUCCESS",
      data: {
        value: currentSafeBalance.value,
        lastUpdated_by: currentSafeBalance.lastUpdated_by,
        updatedAt: currentSafeBalance.updatedAt
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

export async function getCashSummariesByDateRange(startDate, endDate, page = 1, limit = 12, sortOrder = "desc") {
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
  try {
    await connectDB();

    const cashSummary = await CashSummary.findById(id)
      .populate('createdBy', 'name userid')
      .lean();

    if (!cashSummary) {
      return {
        status: "ERROR",
        error: "Cash summary not found"
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
