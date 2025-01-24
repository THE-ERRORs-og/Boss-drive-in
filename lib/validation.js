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
  shiftNumber: union([literal(1), literal(2), literal(3), literal(4)]).refine(
    (value) => [1, 2, 3, 4].includes(value),
    {
      message: "Shift Number must be 1, 2, 3, or 4.",
    }
  ),
});

export const orderSummarySchema = object({
  date: string({ required_error: "Date is required" }).refine(
    (value) => /^\d{2}\/\d{2}\/\d{4}$/.test(value),
    "Date must be in DD/MM/YYYY format"
  ),
  shiftTime: string({ required_error: "Shift Time is required" }).refine(
    (value) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s?[AP]M)?$/.test(value),
    "Shift Time must be in HH:mm format (24-hour) or include AM/PM"
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