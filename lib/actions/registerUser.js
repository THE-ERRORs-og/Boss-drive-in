"use server";
import { revalidatePath } from "next/cache";
import connectDB from "../mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export async function registerUser(userData) {
  try {
    await connectDB();
    
    // Check if userid already exists
    const existingUser = await User.findOne({ userid: userData.userid });
    if (existingUser) {
      return { error: "User ID already exists" };
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const user = new User({
      ...userData,
      password: hashedPassword,
      isActive: true,
    });
    
    await user.save();
    
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "Failed to register user" };
  }
}

export async function updateUserLogin(userId) {
  try {
    await connectDB();
    
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user login:", error);
    return { error: "Failed to update user login" };
  }
}
