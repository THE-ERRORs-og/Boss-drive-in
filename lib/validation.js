import { object, string, number, enum as zEnum } from "zod";

export const signInSchema = object({
  userid: string({ required_error: "userid is required" }).min(
    3,
    "userid should be more than 3 characters"
  ),
  password: string({ required_error: "Password is required" })
    .min(5, "Password must be more than 5 characters")
    .max(32, "Password must be less than 32 characters"),
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
  ownedToRestaurantSafe: number()
    .min(0, "Owned to Restaurant Safe must be at least 0.")
    .optional(),
  datetime: string({ required_error: "Date and Time is required" }).refine(
    (value) => !isNaN(Date.parse(value)),
    "Invalid Date and Time format"
  ),
  createdBy: string({ required_error: "Created By is required" }),
  shiftNumber: zEnum([1, 2, 3, 4], {
    required_error: "Shift Number is required",
    invalid_type_error: "Shift Number must be 1, 2, 3, or 4.",
  }),
});
