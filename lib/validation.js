'use client';

import { z } from "zod";

// Basic schemas that can run on both client and server
export const cashSummarySchema = z.object({
  expectedCloseoutCash: z
    .number()
    .min(0, "Expected closeout cash must be positive"),
  startingRegisterCash: z
    .number()
    .min(0, "Starting register cash must be positive"),
  onlineTipsToast: z.number().min(0, "Online tips toast must be positive"),
  onlineTipsKiosk: z.number().min(0, "Online tips kiosk must be positive"),
  onlineTipCash: z.number().min(0, "Online tip cash must be positive"),
  totalTipDeduction: z.number(),
  ownedToRestaurantSafe: z.number(),
  datetime: z.string().min(1, "Date is required"),
  shiftNumber: z.number().int().min(1, "Shift number is required"),
  removalAmount: z.number().min(0, "Removal amount must be positive"),
  removalItemCount: z.number().int().min(0, "Item count must be positive"),
  discounts: z.number().min(0, "Discounts must be positive"),
  createdBy: z.string().min(1, "User ID is required"),
});

export const signInSchema = z.object({
  userid: z.string({ required_error: "userid is required" })
    .min(3, "userid should be more than 3 characters"),
  password: z.string({ required_error: "Password is required" })
    .min(5, "Password must be more than 5 characters")
    .max(32, "Password must be less than 32 characters"),
});

// Basic user schema without database checks
export const userSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty"),
  userid: z.string({ required_error: "User ID is required" })
    .min(3, "User ID must be at least 3 characters"),
  password: z.string({ required_error: "Password is required" })
    .min(5, "Password must be at least 5 characters")
    .max(32, "Password must be less than 32 characters"),
  role: z.enum(["superadmin", "admin", "employee"], { required_error: "Role is required" }),
});

// Location schema for client-side validation
export const locationSchema = z.object({
  locationId: z.string({ required_error: "Location ID is required" })
    .min(3, "Location ID must be at least 3 characters"),
  name: z.string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty"),
  address: z.string({ required_error: "Address is required" })
    .min(5, "Address must be at least 5 characters"),
  city: z.string({ required_error: "City is required" })
    .min(2, "City name must be at least 2 characters"),
  state: z.string({ required_error: "State is required" })
    .min(2, "State must be at least 2 characters"),
  zipCode: z.string({ required_error: "Zip code is required" })
    .min(5, "Zip code must be at least 5 characters"),
  phoneNumber: z.string().optional(),
});

export const orderSummarySchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  shiftNumber: z.number().int().min(1),
  submissionDate: z.string().transform((val) => new Date(val)),
  items: z.array(
    z.object({
      itemName: z.string(),
      boh: z.number(),
      cashOrder: z.number(),
      inventory: z.number(),
    })
  ),
  totalOrders: z.number().int().min(0),
  totalAmount: z.number().min(0),
});

// Client-side validation schema
export const cashSummaryValidationSchema = z.object({
  expectedCloseoutCash: z.number().min(0, "Expected closeout cash must be positive"),
  startingRegisterCash: z.number().min(0, "Starting register cash must be positive"),
  onlineTipsToast: z.number().min(0, "Online tips toast must be positive"),
  onlineTipsKiosk: z.number().min(0, "Online tips kiosk must be positive"),
  onlineTipCash: z.number().min(0, "Online tip cash must be positive"),
  totalTipDeduction: z.number(),
  ownedToRestaurantSafe: z.number(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  otherClosingRemovalAmount: z.number().min(0, "Removal amount must be positive"),
  otherClosingRemovalItemCount: z.number().int().min(0, "Item count must be positive"),
  otherClosingDiscounts: z.number().min(0, "Discounts must be positive"),
});