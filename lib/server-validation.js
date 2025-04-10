'use server';

import connectDB from "./mongodb";
import User from "../models/User";
import { createUserSchema, cashSummarySchema } from "./schemas";
import { z } from "zod";


export async function validateUserData(data) {
  try {
    await connectDB();
    const existingUser = await User.findOne({ userid: data.userid });
    if (existingUser) {
      return { success: false, error: "This User ID is already in use" };
    }
    const result = createUserSchema.safeParse(data);
    return result.success 
      ? { success: true, data: result.data }
      : { success: false, error: result.error.format() };
  } catch (error) {
    console.error("Error validating user data:", error);
    return { success: false, error: "An error occurred during validation" };
  }
}

export async function validateCashSummary(data) {
  try {
    const result = cashSummarySchema.safeParse(data);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.format() };
  } catch (error) {
    console.error("Error validating cash summary:", error);
    return { success: false, error: "An error occurred during validation" };
  }
} 