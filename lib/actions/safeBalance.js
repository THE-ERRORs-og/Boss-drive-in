"use server";

import { auth } from "@/auth";
import { parseServerActionResponse, getUSEasternTime, checkLocationAccess } from "../utils";
import connectDB from "../mongodb";
import SafeBalance from "../../models/SafeBalance";
import Constant from "../../models/Constant";
import mongoose from "mongoose";

export const depositSafeBalance = async (locationId) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  // Require a specific location ID
  if (!locationId) {
    return {
      status: "ERROR",
      error: "A location must be specified for this operation"
    };
  }

  // Check location access
  const accessCheck = checkLocationAccess(session, locationId);
  if (!accessCheck.hasAccess) {
    return {
      status: "ERROR",
      error: accessCheck.error
    };
  }

  try {
    await connectDB();

    // Start a session for transaction
    const dbSession = await mongoose.startSession();
    let result;

    try {
      await dbSession.startTransaction();

      // Get current safe balance for the location
      const query = { name: "current_safe_balance" };
      if (locationId) {
        query.location = locationId;
      }
      
      const currentSafeBalance = await Constant.findOne(query).populate('location', 'name');
      
      if (!currentSafeBalance) {
        throw new Error("Unable to fetch current safe balance for this location");
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
            location: currentSafeBalance.location._id
          },
        ],
        { session: dbSession }
      );

      // Reset current safe balance to 0
      const updatedConstant = await Constant.findOneAndUpdate(
        { _id: currentSafeBalance._id },
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
        location: newSafeBalance[0].location.toString(),
        date: newSafeBalance[0].date.toISOString(),
        createdAt: newSafeBalance[0].createdAt.toISOString(),
        updatedAt: newSafeBalance[0].updatedAt.toISOString()
      };

      const serializedConstant = {
        ...updatedConstant.toObject(),
        _id: updatedConstant._id.toString(),
        lastUpdated_by: updatedConstant.lastUpdated_by.toString(),
        location: updatedConstant.location.toString(),
        updatedAt: updatedConstant.updatedAt.toISOString()
      };

      result = {
        status: "SUCCESS",
        data: {
          safeBalance: serializedSafeBalance,
          updatedSafeBalance: serializedConstant,
          locationName: currentSafeBalance.location.name
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

export const getCurrentSafeBalance = async (locationId) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  // Require a specific location ID
  if (!locationId) {
    return {
      status: "ERROR",
      error: "A location must be specified to get the safe balance"
    };
  }

  // Check location access
  const accessCheck = checkLocationAccess(session, locationId);
  if (!accessCheck.hasAccess) {
    return {
      status: "ERROR",
      error: accessCheck.error
    };
  }

  try {
    await connectDB();

    const query = { name: "current_safe_balance", location: locationId };

    const currentBalance = await Constant.findOne(query).populate('location', 'name').lean();

    if (!currentBalance) {
      // If safe balance for this location doesn't exist, return 0
      return {
        status: "SUCCESS",
        data: {
          value: 0,
          locationId: locationId,
          locationName: "Unknown" // Location name not available
        }
      };
    }

    return {
      status: "SUCCESS",
      data: {
        value: currentBalance.value || 0,
        locationId: currentBalance.location._id.toString(),
        locationName: currentBalance.location.name
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
  endDate = null,
  locationId = null
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

    if (locationId) {
      conditions.location = locationId;
    } else {
      conditions.location = { $in: session.user.locationIds };
    }

    // Get total count
    const total = await SafeBalance.countDocuments(conditions);

    // Get paginated data
    const history = await SafeBalance.find(conditions)
      .sort({ createdAt: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name userid")
      .populate("location", "name")
      .lean();

    // Ensure we return serializable data
    const serializedHistory = history.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt.toISOString(),
      location: {
        _id: item.location?._id.toString(),
        name: item.location?.name
      },
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

export async function addSafeBalance(amount, type, description, userId, locationId) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  // Check location access
  const accessCheck = checkLocationAccess(session, locationId);
  if (!accessCheck.hasAccess) {
    return {
      status: "ERROR",
      error: accessCheck.error
    };
  }

  try {
    await connectDB();
    
    // Start a session for transaction
    const dbSession = await mongoose.startSession();
    let result;

    try {
      await dbSession.startTransaction();

      // Get current safe balance for this location
      const query = { name: "current_safe_balance", location: locationId };
      let currentSafeBalance = await Constant.findOne(query);
      
      // If no record exists for this location, create one
      if (!currentSafeBalance) {
        currentSafeBalance = await Constant.create({
          name: "current_safe_balance",
          value: 0,
          lastUpdated_by: userId,
          location: locationId
        });
      }
      
      // Calculate new amount
      const newAmount = type === 'credit' 
        ? currentSafeBalance.value + amount 
        : currentSafeBalance.value - amount;
      
      // Create safe balance transaction record
      const safeBalance = await SafeBalance.create(
        [{
          amount,
          date: getUSEasternTime(),
          createdBy: userId,
          type,
          description,
          location: locationId
        }],
        { session: dbSession }
      );
      
      // Update the current safe balance
      const updatedConstant = await Constant.findOneAndUpdate(
        { _id: currentSafeBalance._id },
        {
          $set: {
            value: newAmount,
            lastUpdated_by: userId,
            updatedAt: getUSEasternTime(),
          }
        },
        { new: true, session: dbSession }
      );
      
      // Commit the transaction
      await dbSession.commitTransaction();
      
      // Ensure we return serializable data
      const serializedSafeBalance = {
        ...safeBalance[0].toObject(),
        _id: safeBalance[0]._id.toString(),
        createdBy: safeBalance[0].createdBy.toString(),
        location: safeBalance[0].location.toString(),
        date: safeBalance[0].date.toISOString(),
        createdAt: safeBalance[0].createdAt.toISOString(),
        updatedAt: safeBalance[0].updatedAt.toISOString()
      };

      result = {
        status: "SUCCESS",
        data: serializedSafeBalance
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
    console.error("Error adding safe balance:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to add safe balance"
    };
  }
}
