"use server";

import { auth } from "@/auth";
import { parseServerActionResponse, getUSEasternTime } from "../utils";
import connectDB from "../mongodb";
import SafeBalance from "../../models/SafeBalance";
import Constant from "../../models/Constant";
import mongoose from "mongoose";

export const depositSafeBalance = async () => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Start a session for transaction
    const dbSession = await mongoose.startSession();
    let result;

    try {
      await dbSession.startTransaction();

      // Get current safe balance
      const currentSafeBalance = await Constant.findOne({ name: "current_safe_balance" });
      
      if (!currentSafeBalance) {
        throw new Error("Unable to fetch current safe balance");
      }

      if (currentSafeBalance.value <= 0) {
        throw new Error("No funds available to deposit");
      }

      // Create safe balance record for the deposit
      const newSafeBalance = await SafeBalance.create(
        [
          {
            amount: currentSafeBalance.value,
            date: getUSEasternTime(),
            type: "credit",
            description: "Deposit to bank",
            createdBy: new mongoose.Types.ObjectId(session.user.id),
          },
        ],
        { session: dbSession }
      );

      // Reset current safe balance to 0
      const updatedConstant = await Constant.findOneAndUpdate(
        { name: "current_safe_balance" },
        {
          $set: {
            value: 0,
            lastUpdated_by: new mongoose.Types.ObjectId(session.user.id),
            updatedAt: getUSEasternTime(),
          },
        },
        { new: true, session: dbSession }
      );

      // Commit the transaction
      await dbSession.commitTransaction();

      // Ensure we return serializable data
      const serializedSafeBalance = {
        ...newSafeBalance[0].toObject(),
        _id: newSafeBalance[0]._id.toString(),
        createdBy: newSafeBalance[0].createdBy.toString(),
        date: newSafeBalance[0].date.toISOString(),
        createdAt: newSafeBalance[0].createdAt.toISOString(),
        updatedAt: newSafeBalance[0].updatedAt.toISOString()
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
          safeBalance: serializedSafeBalance,
          updatedSafeBalance: serializedConstant
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
    console.error("Error depositing safe balance:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to deposit safe balance"
    };
  }
};

export const getCurrentSafeBalance = async () => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const currentBalance = await Constant.findOne({ name: "current_safe_balance" }).lean();

    return {
      status: "SUCCESS",
      data: {
        value: currentBalance?.value || 0
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

export async function getSafeBalanceHistory({ 
  page = 1, 
  limit = 5, 
  query = "", 
  sortOrder = "desc",
  startDate = null,
  endDate = null
}) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const skip = (page - 1) * limit;
    
    // Build the query conditions
    const conditions = {};
    
    if (query) {
      conditions.depositAmount = { $regex: query, $options: 'i' };
    }
    
    if (startDate) {
      conditions.createdAt = { ...conditions.createdAt, $gte: new Date(startDate) };
    }
    
    if (endDate) {
      conditions.createdAt = { ...conditions.createdAt, $lte: new Date(endDate) };
    }

    // Get total count
    const total = await SafeBalance.countDocuments(conditions);

    // Get paginated data
    const history = await SafeBalance.find(conditions)
      .sort({ createdAt: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name userid")
      .lean();

    // Ensure we return serializable data
    const serializedHistory = history.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt.toISOString(),
      createdBy: {
        ...item.createdBy,
        _id: item.createdBy._id.toString(),
      },
    }));

    return {
      status: "SUCCESS",
      data: {
        history: serializedHistory,
        total
      }
    };
  } catch (error) {
    console.error("Error fetching safe balance history:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch safe balance history"
    };
  }
}

export async function addSafeBalance(amount, type, description, userId) {
  try {
    await connectDB();
    
    const currentBalance = await getCurrentSafeBalance();
    const newAmount = type === 'credit' 
      ? currentBalance.amount + amount 
      : currentBalance.amount - amount;
    
    const safeBalance = new SafeBalance({
      amount: newAmount,
      date: getUSEasternTime(),
      createdBy: userId,
      type,
      description,
    });
    
    await safeBalance.save();
    
    return { success: true };
  } catch (error) {
    console.error("Error adding safe balance:", error);
    throw new Error("Failed to add safe balance");
  }
}
