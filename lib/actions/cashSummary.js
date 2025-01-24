"use server";

import { writeClient } from "@/sanity/lib/write_client";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import {cashSummarySchema} from "@/lib/validation";

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

    return parseServerActionResponse({
      ...result,
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
