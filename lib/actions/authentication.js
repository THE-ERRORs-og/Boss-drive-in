"use server";

import { signIn } from "@/auth";
import { parseServerActionResponse } from "../utils";

export async function doCredentialLogin(formData) {
  try {
    const { email, password } = formData;
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return parseServerActionResponse({
      ...result,
      error: "",
      success: true,
    });
  } catch (error) {
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
}
