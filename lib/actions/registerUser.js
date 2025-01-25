"use server";
import { writeClient } from "@/sanity/lib/write_client";
// Replace this with your database client
import { parseServerActionResponse } from "../utils";
import { userSchema } from "../validation";
import { auth } from "@/auth";

export async function createUser(formData) {
    const session = await auth();
      if (!session || !session.user || session.user.role !== "admin") 
        return parseServerActionResponse({
          error: "Not signed in or not authorized",
          status: "ERROR",
        });
    const { name, userid, password } = formData;
  try {
    const userData = {
        name,
        userid,
        password,
        role: "employee",
    }
    const validatedData = await userSchema.parseAsync(userData);

    // Save the user data
    const result = await writeClient.create({
      _type: "user",
      ...validatedData,
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
