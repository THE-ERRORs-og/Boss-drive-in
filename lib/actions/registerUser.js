"use server";
import { writeClient } from "@/sanity/lib/write_client";
// Replace this with your database client
import { parseServerActionResponse } from "../utils";
import { userSchema } from "../validation";
import { auth } from "@/auth";
import { USER_DATA_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";

export async function updateUserLogin(user) {
  try {
    const result = await writeClient
      .patch(user._id)
      .set({ lastLogin: new Date().toISOString() })
      .commit();
    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
      message: "User last login successfully updated in the database.",
    });
  } catch (error) {
    console.error("Error updating user last login in database:", error.message);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
    
  }
}
export async function createUser(formData) {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) 
        return parseServerActionResponse({
            error: "Not signed in or not authorized",
            status: "ERROR",
        });

    const { name, userid, password, role } = formData;
    
    // Only superadmin can create other superadmins
    if (role === "superadmin" && session.user.role !== "superadmin") {
        return parseServerActionResponse({
            error: "Only superadmin can create other superadmin accounts",
            status: "ERROR",
        });
    }

    try {
        const userData = {
            name,
            userid,
            password,
            role: role || "employee",
        }
        const validatedData = await userSchema.parseAsync(userData);

        // Save the user data
        const result = await writeClient.create({
            _type: "user",
            ...validatedData,
            isActive: true,
            createdBy: {
                _type: "reference",
                _ref: session.user.id,
            },
        });

        console.log("User saved to database:", result);

        return parseServerActionResponse({
            ...result,
            error: "",
            status: "SUCCESS",
            message: "User successfully saved to the database.",
        });
    } catch (error) {
        console.error("Error saving user to database:", error.message);
        return parseServerActionResponse({
            error: error.message,
            status: "ERROR",
        });
    }
}

export async function deleteUser(userId) {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) 
        return parseServerActionResponse({
          error: "Not signed in or not authorized",
          status: "ERROR",
        });

    try {
        // Get the user to be deleted
        const userToDelete = await client.getDocument(userId);
        if (!userToDelete) {
            return parseServerActionResponse({
                error: "User not found",
                status: "ERROR",
            });
        }

        // Check if trying to delete own account
        if (session.user.id === userId) {
            return parseServerActionResponse({
                error: "You cannot delete your own account",
                status: "ERROR",
            });
        }

        // Check if admin is trying to delete superadmin
        if (session.user.role === "admin" && userToDelete.role === "superadmin") {
            return parseServerActionResponse({
                error: "Admins cannot delete superadmin accounts",
                status: "ERROR",
            });
        }

        // Delete the user
        const result = await writeClient
            .patch(userId)
            .set({ isActive: false })
            .commit();

        console.log("User deleted from database:", result);

        return parseServerActionResponse({
            ...result,
            error: "",
            status: "SUCCESS",
            message: "User successfully deleted from the database.",
        });
    } catch (error) {
        console.error("Error deleting user from database:", error.message);
        return parseServerActionResponse({
            error: error.message,
            status: "ERROR",
        });
    }
}

export async function changePassword(userid, newPassword) {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "admin") 
        return parseServerActionResponse({
          error: "Not signed in or not authorized",
          status: "ERROR",
        });
  try {
    const employee = await client
          .fetch(USER_DATA_QUERY, { userid });
    // Update the user's password
    const result = await writeClient
      .patch(employee._id)
      .set({ password: newPassword })
      .commit();

    console.log("User password updated in database:", result);

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
      message: "User password successfully updated in the database.",
    });
  } catch (error) {
    console.error("Error updating user password in database:", error.message);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
}
