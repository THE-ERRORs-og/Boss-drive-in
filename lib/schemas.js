import { z } from "zod";

// Server-side validation schema
export const cashSummarySchema = z.object({
  expectedCloseoutCash: z.number().min(0),
  startingRegisterCash: z.number().min(0),
  onlineTipsToast: z.number().min(0),
  onlineTipsKiosk: z.number().min(0),
  onlineTipCash: z.number().min(0),
  totalTipDeduction: z.number(),
  ownedToRestaurantSafe: z.number(),
  datetime: z.string().transform((val) => new Date(val)),
  shiftNumber: z.number().int().min(1),
  removalAmount: z.number().min(0),
  removalItemCount: z.number().int().min(0),
  discounts: z.number().min(0),
  createdBy: z.string(),
});

// Server-side user validation that includes database checks
export const createUserSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty"),
  userid: z.string({ required_error: "User ID is required" })
    .min(3, "User ID must be at least 3 characters"),
  password: z.string({ required_error: "Password is required" })
    .min(5, "Password must be at least 5 characters")
    .max(32, "Password must be less than 32 characters"),
  role: z.enum(["superadmin", "admin", "employee"], { required_error: "Role is required" }),
}); 