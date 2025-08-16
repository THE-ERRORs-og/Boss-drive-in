"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import connectDB from "../mongodb";
import User from "../../models/User";

export async function getAllUsers() {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const users = await User.find({ isActive: true })
      .select('_id userid name role')
      .lean();

    // Ensure we return serializable data
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    return {
      status: "SUCCESS",
      data: serializedUsers
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch users"
    };
  }
}

export async function getUserById(userid) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    const user = await User.findOne({ userid, isActive: true })
      .select('_id userid name password lastLogin role')
      .lean();

    if (!user) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // Get user's location access
    const userWithLocations = await User.findById(user._id)
      .select('locationAccess')
      .populate({
        path: 'locationAccess',
        select: '_id locationId name',
        match: { isActive: true }
      })
      .lean();

    // Ensure we return serializable data
    const serializedUser = {
      ...user,
      _id: user._id.toString(),
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      locationAccess: userWithLocations?.locationAccess ? userWithLocations.locationAccess.map(loc => ({
        ...loc,
        _id: loc._id.toString()
      })) : []
    };

    return {
      status: "SUCCESS",
      data: serializedUser
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch user"
    };
  }
}

export async function updateUserPassword(userid, newPassword) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // First, get the user to check their role
    const targetUser = await User.findOne({ userid, isActive: true }).select('role').lean();
    
    if (!targetUser) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // If the current user is an admin, prevent them from changing superadmin password
    if (session.user.role === "admin" && targetUser.role === "superadmin") {
      return parseServerActionResponse({
        error: "Admins cannot change superadmin passwords",
        status: "ERROR",
      });
    }

    const user = await User.findOneAndUpdate(
      { userid, isActive: true },
      { $set: { password: newPassword } },
      { new: true }
    ).select('_id userid name').lean();

    // Ensure we return serializable data
    const serializedUser = {
      ...user,
      _id: user._id.toString()
    };

    return {
      status: "SUCCESS",
      data: serializedUser
    };
  } catch (error) {
    console.error("Error updating user password:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to update password"
    };
  }
}

export async function createUser(userData) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Check if userid already exists
    const existingUser = await User.findOne({ userid: userData.userid.toLowerCase() });
    if (existingUser) {
      return parseServerActionResponse({
        error: "User ID already exists",
        status: "ERROR",
      });
    }

    // Set up default values
    const userToCreate = {
      userid: userData.userid.toLowerCase(),
      name: userData.name,
      password: userData.password,
      role: userData.role || "employee",
      createdBy: session.user.id,
      isActive: true,
      locationAccess: userData.locationAccess || []
    };

    // Create new user
    const newUser = await User.create(userToCreate);

    // Ensure we return serializable data
    const serializedUser = {
      _id: newUser._id.toString(),
      userid: newUser.userid,
      name: newUser.name,
      role: newUser.role
    };

    return {
      status: "SUCCESS",
      data: serializedUser
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create user"
    };
  }
}

export async function updateUserRole(userId, newRole) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // First, get the user to check their role
    const targetUser = await User.findById(userId).select('role').lean();
    
    if (!targetUser) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role: newRole } },
      { new: true }
    ).select('_id userid name role').lean();

    // Ensure we return serializable data
    const serializedUser = {
      ...updatedUser,
      _id: updatedUser._id.toString()
    };

    return {
      status: "SUCCESS",
      data: serializedUser
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to update user role"
    };
  }
}

export async function deleteUser(userId) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // First, get the user to check their role
    const targetUser = await User.findById(userId).select('role').lean();
    
    if (!targetUser) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // If the current user is an admin, prevent them from deleting superadmin
    if (session.user.role === "admin" && targetUser.role === "superadmin") {
      return parseServerActionResponse({
        error: "Admins cannot delete superadmin accounts",
        status: "ERROR",
      });
    }

    // Soft delete by setting isActive to false
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    ).select('_id userid name role').lean();

    if (!deletedUser) {
      return parseServerActionResponse({
        error: "Failed to delete user",
        status: "ERROR",
      });
    }

    // Ensure we return serializable data
    const serializedUser = {
      ...deletedUser,
      _id: deletedUser._id.toString()
    };

    return {
      status: "SUCCESS",
      data: serializedUser
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to delete user"
    };
  }
} 