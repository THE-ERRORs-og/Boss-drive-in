"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import connectDB from "../mongodb";
import User from "../../models/User";
import Location from "../../models/Location";
import mongoose from "mongoose";

/**
 * Get all locations that a user has access to
 * @param {string} userId - User ID to check access for
 * @returns {Promise<Object>} List of locations the user has access to or error response
 */
export async function getUserLocationAccess(userId) {
  const session = await auth();
  if (!session || !session.user) {
    return parseServerActionResponse({
      error: "Not authenticated",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Find the user by ID
    const user = await User.findById(userId).select('_id role').lean();
    
    if (!user) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // Check authorization
    // Superadmins and admins can check access of any user
    // Employees can only check their own access
    if (session.user.role !== "superadmin" && session.user.role !== "admin" && session.user.id !== userId) {
      return parseServerActionResponse({
        error: "Not authorized to view this user's location access",
        status: "ERROR",
      });
    }

    // For superadmins, return all locations as they have access to all
    if (user.role === "superadmin") {
      const allLocations = await Location.find({ isActive: true })
        .select('_id locationId name address city state zipCode')
        .lean();

      return {
        status: "SUCCESS",
        data: allLocations.map(location => ({
          ...location,
          _id: location._id.toString()
        }))
      };
    }

    // For other users, get their specific location access
    const userWithLocations = await User.findById(userId)
      .select('locationAccess')
      .populate({
        path: 'locationAccess',
        select: '_id locationId name address city state zipCode',
        match: { isActive: true }
      })
      .lean();
    
    const accessibleLocations = userWithLocations?.locationAccess || [];
    
    return {
      status: "SUCCESS",
      data: accessibleLocations.map(location => ({
        ...location,
        _id: location._id.toString()
      }))
    };
  } catch (error) {
    console.error("Error getting user location access:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to get user location access"
    };
  }
}

/**
 * Add location access for a user
 * @param {string} userId - User ID to add access for
 * @param {string[]} locationIds - Array of location IDs to add access to
 * @returns {Promise<Object>} Success or error response
 */
export async function addUserLocationAccess(userId, locationIds) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Find the user
    const user = await User.findById(userId).select('_id role').lean();
    if (!user) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // If the user is a superadmin, they already have access to all locations
    if (user.role === "superadmin") {
      return {
        status: "SUCCESS",
        message: "Superadmins automatically have access to all locations",
        data: user
      };
    }

    // For admins, check if the current user has access to the locations they're trying to assign
    if (session.user.role === "admin") {
      const adminWithLocations = await User.findById(session.user.id)
        .select('locationAccess')
        .lean();
      
      const adminLocations = adminWithLocations?.locationAccess?.map(loc => loc.toString()) || [];
      
      // Check if admin has access to all locations they're trying to assign
      const unauthorizedLocations = locationIds.filter(
        locId => !adminLocations.includes(locId)
      );
      
      if (unauthorizedLocations.length > 0) {
        return parseServerActionResponse({
          error: "You can only assign access to locations you have access to",
          status: "ERROR",
        });
      }
    }

    // Convert string IDs to ObjectIds
    const locationObjectIds = locationIds.map(id => new mongoose.Types.ObjectId(id));
    
    // Get the user's current location access
    const userWithLocations = await User.findById(userId)
      .select('locationAccess')
      .lean();
    
    const currentAccess = userWithLocations?.locationAccess || [];
    
    // Add new locations that aren't already in the access list
    const newLocations = locationObjectIds.filter(
      locId => !currentAccess.some(existingId => existingId.toString() === locId.toString())
    );
    
    if (newLocations.length === 0) {
      return {
        status: "SUCCESS",
        message: "User already has access to all specified locations",
        data: user
      };
    }

    // Update the user's location access
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { locationAccess: { $each: newLocations } } },
      { new: true }
    )
    .select('_id userid name role')
    .lean();

    // Get updated location access
    const updatedUserWithLocations = await User.findById(userId)
      .select('locationAccess')
      .populate({
        path: 'locationAccess',
        select: '_id locationId name',
        match: { isActive: true }
      })
      .lean();

    return {
      status: "SUCCESS",
      message: "Location access added successfully",
      data: {
        ...updatedUser,
        _id: updatedUser._id.toString(),
        locationAccess: updatedUserWithLocations.locationAccess.map(loc => ({
          ...loc,
          _id: loc._id.toString()
        }))
      }
    };
  } catch (error) {
    console.error("Error adding user location access:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to add location access"
    };
  }
}

/**
 * Remove location access for a user
 * @param {string} userId - User ID to remove access for
 * @param {string[]} locationIds - Array of location IDs to remove access from
 * @returns {Promise<Object>} Success or error response
 */
export async function removeUserLocationAccess(userId, locationIds) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Find the user
    const user = await User.findById(userId).select('_id role').lean();
    if (!user) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // If the user is a superadmin, they cannot have location access removed
    if (user.role === "superadmin") {
      return parseServerActionResponse({
        error: "Superadmins automatically have access to all locations and cannot have access removed",
        status: "ERROR",
      });
    }

    // For admins, check if the current user has access to the locations they're trying to remove
    if (session.user.role === "admin") {
      const adminWithLocations = await User.findById(session.user.id)
        .select('locationAccess')
        .lean();
      
      const adminLocations = adminWithLocations?.locationAccess?.map(loc => loc.toString()) || [];
      
      // Check if admin has access to all locations they're trying to remove
      const unauthorizedLocations = locationIds.filter(
        locId => !adminLocations.includes(locId)
      );
      
      if (unauthorizedLocations.length > 0) {
        return parseServerActionResponse({
          error: "You can only remove access to locations you have access to",
          status: "ERROR",
        });
      }
    }

    // Convert string IDs to ObjectIds
    const locationObjectIds = locationIds.map(id => new mongoose.Types.ObjectId(id));

    // Update the user's location access
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pullAll: { locationAccess: locationObjectIds } },
      { new: true }
    )
    .select('_id userid name role')
    .lean();

    // Get updated location access
    const updatedUserWithLocations = await User.findById(userId)
      .select('locationAccess')
      .populate({
        path: 'locationAccess',
        select: '_id locationId name',
        match: { isActive: true }
      })
      .lean();

    return {
      status: "SUCCESS",
      message: "Location access removed successfully",
      data: {
        ...updatedUser,
        _id: updatedUser._id.toString(),
        locationAccess: updatedUserWithLocations?.locationAccess?.map(loc => ({
          ...loc,
          _id: loc._id.toString()
        })) || []
      }
    };
  } catch (error) {
    console.error("Error removing user location access:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to remove location access"
    };
  }
}

/**
 * Get available locations that can be assigned to a user
 * @param {string} userId - User ID to get available locations for
 * @returns {Promise<Object>} List of available locations or error response
 */
export async function getAvailableLocationsForUser(userId) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Find the user
    const user = await User.findById(userId).select('_id role').lean();
    if (!user) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // If the user is a superadmin, they already have access to all locations
    if (user.role === "superadmin") {
      return {
        status: "SUCCESS",
        message: "Superadmins automatically have access to all locations",
        data: []
      };
    }

    // Get the user's current location access
    const userWithLocations = await User.findById(userId)
      .select('locationAccess')
      .lean();
    
    const currentAccess = userWithLocations?.locationAccess || [];
    const currentAccessIds = currentAccess.map(id => id.toString());

    // For admins, get only locations they have access to
    let availableLocations;
    if (session.user.role === "admin") {
      const adminWithLocations = await User.findById(session.user.id)
        .select('locationAccess')
        .lean();
      
      const adminLocationIds = adminWithLocations?.locationAccess?.map(id => id.toString()) || [];

      availableLocations = await Location.find({
        _id: { $in: adminLocationIds, $nin: currentAccessIds },
        isActive: true
      })
      .select('_id locationId name address city state')
      .lean();
    } else {
      // For superadmins, get all locations except those already assigned
      availableLocations = await Location.find({
        _id: { $nin: currentAccessIds },
        isActive: true
      })
      .select('_id locationId name address city state')
      .lean();
    }

    return {
      status: "SUCCESS",
      data: availableLocations.map(location => ({
        ...location,
        _id: location._id.toString()
      }))
    };
  } catch (error) {
    console.error("Error getting available locations:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to get available locations"
    };
  }
}
