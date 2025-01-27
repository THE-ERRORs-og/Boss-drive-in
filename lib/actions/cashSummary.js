"use server";

import { writeClient } from "@/sanity/lib/write_client";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import {cashSummarySchema} from "@/lib/validation";
import { client } from "@/sanity/lib/client";
import { GET_CURRENT_SAFE_BALANCE_QUERY } from "@/sanity/lib/queries";

export const createCashSummary = async (form) => {
  const session = await auth();
  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const {
    expectedCloseoutCash,
    startingRegisterCash,
    onlineTipsToast,
    onlineTipsKiosk,
    onlineTipCash,
    totalTipDeduction,
    ownedToRestaurantSafe,
    datetime,
    shiftNumber,
  } = form;
  // Helper function to round numbers to two decimal places
  const roundToTwoDecimals = (num) =>
    typeof num === "number" ? parseFloat(num.toFixed(2)) : num;

  try {
    const cashSummary = {
      expectedCloseoutCash: roundToTwoDecimals(expectedCloseoutCash),
      startingRegisterCash: roundToTwoDecimals(startingRegisterCash),
      onlineTipsToast: roundToTwoDecimals(onlineTipsToast),
      onlineTipsKiosk: roundToTwoDecimals(onlineTipsKiosk),
      onlineTipCash: roundToTwoDecimals(onlineTipCash),
      totalTipDeduction: roundToTwoDecimals(totalTipDeduction),
      ownedToRestaurantSafe: roundToTwoDecimals(ownedToRestaurantSafe),
      datetime,
      shiftNumber,
    };

    // match cash_summary schema
    const validatedData = cashSummarySchema.parse(cashSummary);

    const result = await writeClient.create({
      _type: "cash_summary",
      ...validatedData,
      createdBy: {
        _type: "reference",
        _ref: session.id,
      },
    });

    // Fetch the current safe balance from the database
    const old_safe_balance = await client
      .withConfig({ useCdn: false })
      .fetch(GET_CURRENT_SAFE_BALANCE_QUERY);

    if (!old_safe_balance || !old_safe_balance._id) {
      throw new Error("Unable to fetch current safe balance.");
    }

    // Calculate the updated balance
    const updated_safe_balance = roundToTwoDecimals(
      old_safe_balance.value + ownedToRestaurantSafe
    );

    // Update the current safe balance in the database
    const safe_balance_result = await writeClient
      .patch(old_safe_balance._id)
      .set({
        value: updated_safe_balance,
        lastUpdated: new Date(),
        lastUpdated_by: {
          _type: "reference",
          _ref: session.id, // Ensure session.id is available and valid
        },
      })
      .commit();

    if (!safe_balance_result) {
      throw new Error("Failed to update the current safe balance.");
    }

    // Optional: Log the result or take further actions
    console.log("Safe balance updated successfully:", safe_balance_result);

    return parseServerActionResponse({
      ...result,
      ...safe_balance_result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};


export const deleteAllCashSummaries = async () => {
  try {
    const result = await writeClient.delete({
      query: "*[_type == 'cash_summary']",
    });
    console.log("All cash_summary documents deleted:", result);
    return parseServerActionResponse({
        ...result,
        error: "",
        status: "SUCCESS",
        });
  } catch (error) {
    console.error("Error deleting cash_summary documents:", error);
  }
};
