"use server";

import { auth } from "@/auth";
import { GET_CURRENT_SAFE_BALANCE_QUERY } from "@/sanity/lib/queries";
import { parseServerActionResponse } from "../utils";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write_client";

export const depositSafeBalance = async () => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    const oldSafeBalance = await client
      .withConfig({ useCdn: false })
      .fetch(GET_CURRENT_SAFE_BALANCE_QUERY);

    if (!oldSafeBalance || !oldSafeBalance._id) {
      throw new Error("Unable to fetch current safe balance.");
    }
    if(oldSafeBalance.value === 0) {
        throw new Error("Safe balance is already deposited.");
    }

    // Prepare mutations to maintain consistency
    const transactionMutations = [
      // Record the deposit in the safe balance history
      {
        create: {
          _type: "safe_balance_history",
          depositAmount: oldSafeBalance.value,
          submittedBy: {
            _type: "reference",
            _ref: session.id,
          },
        },
      },
      // Update the current safe balance to reset value and set the last updated details
      {
        patch: {
          id: oldSafeBalance._id,
          set: {
            value: 0,
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
      throw new Error("Transaction failed: unable to update the safe balance.");
    }

    console.log("Transaction successful:", transactionResult);

    return parseServerActionResponse({
      data: transactionResult,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error in depositSafeBalance:", error);
    return parseServerActionResponse({
      error:
        error.message || "An error occurred while updating the safe balance.",
      status: "ERROR",
    });
  }
};
