import { client } from "@/sanity/lib/client";
import { USER_BY_USERID_QUERY } from "@/sanity/lib/queries";
import { object, string, number, enum as zEnum, union, literal, array } from "zod";

export const signInSchema = object({
  userid: string({ required_error: "userid is required" }).min(
    3,
    "userid should be more than 3 characters"
  ),
  password: string({ required_error: "Password is required" })
    .min(5, "Password must be more than 5 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const userSchema = object({
  name: string({ required_error: "Name is required" }).min(
    1,
    "Name cannot be empty"
  ),

  userid: string({ required_error: "User ID is required" })
    .min(3, "User ID must be at least 3 characters")
    .refine(
      async (userid) => {
        const existingUsers = await client.fetch(USER_BY_USERID_QUERY, {
          userid,
        });
        return !existingUsers;
      },
      { message: "This User ID is already in use" }
    ),

  password: string({ required_error: "Password is required" })
    .min(5, "Password must be at least 5 characters")
    .max(32, "Password must be less than 32 characters"),

  role: zEnum(["admin", "employee"], { required_error: "Role is required" }),

});

export const cashSummarySchema = object({
  expectedCloseoutCash: number({
    required_error: "Expected Closeout Cash is required",
  }).min(0, "Expected Closeout Cash must be at least 0."),
  startingRegisterCash: number({
    required_error: "Starting Register Cash is required",
  }).min(0, "Starting Register Cash must be at least 0."),
  onlineTipsToast: number()
    .min(0, "Online Tips (Toast) must be at least 0.")
    .optional(),
  onlineTipsKiosk: number()
    .min(0, "Online Tips (Kiosk) must be at least 0.")
    .optional(),
  onlineTipCash: number()
    .min(0, "Online Tip (Cash) must be at least 0.")
    .optional(),
  totalTipDeduction: number()
    .min(0, "Total Tip Deduction must be at least 0.")
    .optional(),
  ownedToRestaurantSafe: number({
    required_error: "Expected Closeout Cash is required",
  }),
  datetime: string({ required_error: "Date and Time is required" }).refine(
    (value) => !isNaN(Date.parse(value)),
    "Invalid Date and Time format"
  ),
  shiftNumber: union([literal(1), literal(2), literal(3), literal(4)]).refine(
    (value) => [1, 2, 3, 4].includes(value),
    {
      message: "Shift Number must be 1, 2, 3, or 4.",
    }
  ),
});

export const orderSummarySchema = object({
  date: string({ required_error: "Date is required" }).refine(
    (value) => !isNaN(Date.parse(value)),
    "Date must be in DD/MM/YYYY format"
  ),
  shiftNumber: union([literal(1), literal(2), literal(3), literal(4)]).refine(
    (value) => [1, 2, 3, 4].includes(value),
    {
      message: "Shift Number must be 1, 2, 3, or 4.",
    }
  ),
  submissionDate: string({
    required_error: "Submission Date is required",
  }).refine(
    (value) => !isNaN(Date.parse(value)),
    "Invalid Submission Date format"
  ),
  items: array(
    object({
      itemName: string({ required_error: "Item Name is required" }).min(
        1,
        "Item Name cannot be empty"
      ),
      boh: number({ required_error: "BOH value is required" }).min(
        0,
        "BOH value must be at least 0."
      ),
      cashOrder: number({ required_error: "Cash Order value is required" }).min(
        0,
        "Cash Order value must be at least 0."
      ),
      inventory: number({ required_error: "Inventory value is required" }).min(
        0,
        "Inventory value must be at least 0."
      ),
    })
  ).min(1, "At least one item is required."),
});