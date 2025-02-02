"use server";

import { signIn } from "@/auth";
import { parseServerActionResponse } from "../utils";

export async function doCredentialLogin(formData) {
  try {
    const { userid, password } = formData;
    console.log('signin calleing with', userid);
    const result = await signIn("credentials", {
      userid,
      password,
      redirect: false,
    });
    console.log('inside signin', result);

    return parseServerActionResponse({
      ...result,
      error: "",
      status : "SUCCESS",
      message: "User successfully logged in",
    });
  } catch (error) {
    console.log("error in doCredentialLogin", error.message);
    return parseServerActionResponse({
      // error: JSON.stringify(error),
      error: error.message,
      status: "ERROR",
    });
  }
}
