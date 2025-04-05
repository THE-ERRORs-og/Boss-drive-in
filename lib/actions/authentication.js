"use server";

import { signIn } from "@/auth";
import { parseServerActionResponse } from "../utils";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function doCredentialLogin(formData) {
  try {
    const { userid, password } = formData;
    
    if (!userid || !password) {
      return parseServerActionResponse({
        error: "User ID and password are required",
        status: "ERROR",
      });
    }

    try {
      // First, check if the user exists and get their role
      await connectDB();
      const user = await User.findOne({ userid: userid.toLowerCase() });
      
      if (!user) {
        return parseServerActionResponse({
          error: "Invalid credentials",
          status: "ERROR",
        });
      }

      // Check password (since we're storing plain text passwords)
      if (user.password !== password) {
        return parseServerActionResponse({
          error: "Invalid credentials",
          status: "ERROR",
        });
      }

      // Perform the sign in
      await signIn("credentials", {
        userid: userid.toLowerCase(),
        password,
        redirect: false,
      });

      // Return success with user role for immediate UI update
      return parseServerActionResponse({
        success: true,
        error: "",
        status: "SUCCESS",
        message: "User successfully logged in",
        role: user.role,
        redirect: user.role === 'admin' || user.role === 'superadmin' 
          ? '/admin' 
          : user.role === 'employee' 
            ? '/employee'
            : '/'
      });

    } catch (error) {
      // Handle specific auth errors
      if (error.message?.includes('CredentialsSignin')) {
        return parseServerActionResponse({
          error: "Invalid credentials",
          status: "ERROR",
        });
      }
      throw error; // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Error in doCredentialLogin:", error);
    return parseServerActionResponse({
      error: "An error occurred during login. Please try again.",
      status: "ERROR",
    });
  }
}
