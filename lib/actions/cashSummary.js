"use server";

import { writeClient } from "@/sanity/lib/write_client";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import {cashSummarySchema} from "@/lib/validation";
import { client } from "@/sanity/lib/client";
import { GET_CURRENT_SAFE_BALANCE_QUERY } from "@/sanity/lib/queries";

export const createCashSummary = async (form) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

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
    otherClosingRemovalAmount,
    otherClosingRemovalItemCount,
    otherClosingDiscounts,
  } = form;

  // Helper function to round numbers to two decimal places
  const roundToTwoDecimals = (num) =>
    typeof num === "number" ? parseFloat(num.toFixed(2)) : num;

  try {
    // Prepare cash summary data
    const cashSummary = {
      expectedCloseoutCash: roundToTwoDecimals(expectedCloseoutCash),
      startingRegisterCash: roundToTwoDecimals(startingRegisterCash),
      onlineTipsToast: roundToTwoDecimals(onlineTipsToast),
      onlineTipsKiosk: roundToTwoDecimals(onlineTipsKiosk),
      onlineTipCash: roundToTwoDecimals(onlineTipCash),
      totalTipDeduction: roundToTwoDecimals(totalTipDeduction),
      ownedToRestaurantSafe: roundToTwoDecimals(ownedToRestaurantSafe),
      removalAmount: roundToTwoDecimals(otherClosingRemovalAmount || 0),
      removalItemCount: parseInt(otherClosingRemovalItemCount || 0),
      discounts: roundToTwoDecimals(otherClosingDiscounts || 0),
      datetime,
      shiftNumber,
    };

    // Validate cash summary using schema
    const validatedData = cashSummarySchema.parse(cashSummary);

    // Fetch the current safe balance
    const oldSafeBalance = await client
      .withConfig({ useCdn: false })
      .fetch(GET_CURRENT_SAFE_BALANCE_QUERY);

    if (!oldSafeBalance || !oldSafeBalance._id) {
      throw new Error("Unable to fetch current safe balance.");
    }

    // Only check safe balance if we're taking money out (negative amount)
    if (cashSummary.ownedToRestaurantSafe < 0) {
      const requiredAmount = Math.abs(cashSummary.ownedToRestaurantSafe);
      if (oldSafeBalance.value < requiredAmount) {
        throw new Error(`Insufficient funds in safe. Current safe balance: $${oldSafeBalance.value.toFixed(2)}, Required amount: $${requiredAmount.toFixed(2)}`);
      }
    }

    // Calculate the updated safe balance
    const updatedSafeBalance = roundToTwoDecimals(
      oldSafeBalance.value + ownedToRestaurantSafe
    );

    // Prepare transaction mutations
    const transactionMutations = [
      // Create the cash summary record
      {
        create: {
          _type: "cash_summary",
          ...validatedData,
          createdBy: {
            _type: "reference",
            _ref: session.id,
          },
        },
      },
      // Update the safe balance
      {
        patch: {
          id: oldSafeBalance._id,
          set: {
            value: updatedSafeBalance,
            lastUpdated_by: {
              _type: "reference",
              _ref: session.id,
            },
          },
        },
      },
    ];

    // Commit the transaction
    const transactionResult = await writeClient
      .transaction(transactionMutations)
      .commit();

    if (!transactionResult) {
      throw new Error(
        "Transaction failed: unable to create cash summary and update safe balance."
      );
    }

    console.log("Transaction successful:", transactionResult);

    return parseServerActionResponse({
      data: transactionResult,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error in createCashSummary:", error);
    return parseServerActionResponse({
      error:
        error.message || "An error occurred while creating the cash summary.",
      status: "ERROR",
    });
  }
};


export const deleteAllCashSummaries = async () => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

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
