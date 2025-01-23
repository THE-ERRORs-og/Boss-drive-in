"use server";

import { writeClient } from "@/sanity/lib/write_client";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";

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
      createdBy: {
        _type: "reference",
        _ref: session.id, // Set createdBy directly from session.id
      },
      shiftNumber,
    };

    const result = await writeClient.create({
      _type: "cash_summary",
      ...cashSummary,
    });

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

