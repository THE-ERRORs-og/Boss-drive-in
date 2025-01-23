import { object, string } from "zod";

export const signInSchema = object({
  userid: string({ required_error: "userid is required" })
    .min(3, "userid should be more than 3 characters"),
  password: string({ required_error: "Password is required" })
    .min(5, "Password must be more than 5 characters")
    .max(32, "Password must be less than 32 characters"),
});
