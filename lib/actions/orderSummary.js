"use server";

import { writeClient } from "@/sanity/lib/write_client";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import { orderSummarySchema } from "@/lib/validation";

export const createOrderSummary = async (form) => {
  const session = await auth();
  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { date, shiftNumber, submissionDate, items } = form;

  try {
    const orderSummary = {
      date,
      shiftNumber,
      submissionDate: submissionDate || new Date().toISOString(), // Use current datetime if not provided
      items: items.map((item) => ({
        itemName: item.itemName,
        boh: parseFloat(item.boh.toFixed(2)),
        cashOrder: parseFloat(item.cashOrder.toFixed(2)),
        inventory: parseFloat(item.inventory.toFixed(2)), 
      })),
    };

    // Validate data against the Zod schema
    const validatedData = orderSummarySchema.parse(orderSummary);

    const result = await writeClient.create({
      _type: "order_summary",
      ...validatedData,
      createdBy: {
        _type: "reference",
        _ref: session.id,
      },
    });

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error submitting order summary:", error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const deleteAllOrderSummaries = async () => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    const result = await writeClient.delete({
      query: "*[_type == 'order_summary']",
    });
    console.log("All order_summary documents deleted:", result);
    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error deleting order_summary documents:", error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};
