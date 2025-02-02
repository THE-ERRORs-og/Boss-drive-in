"use server";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import { writeClient } from "@/sanity/lib/write_client";

export const createOrderItem = async (newItem) => {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "admin")
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });

  try {
    const result = await writeClient.create({
      _type: "order_item",
      name: newItem.trim(),
      isEnabled: true,
      createdBy: {
        _type: "reference",
        _ref: session.user.id,
      },
    });

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
      message: "New item successfully added.",
    });
  } catch (error) {
    console.error("Error adding new item:", error);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
};

export const toggleItemStatus = async (id) => {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "admin")
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });

  try {
    // Fetch the current item status
    const currentItem = await writeClient.getDocument(id);
    if (!currentItem) {
      return parseServerActionResponse({
        error: "Item not found",
        status: "ERROR",
      });
    }

    // Toggle the isEnabled status
    const updatedStatus = !currentItem.isEnabled;

    const result = await writeClient
      .patch(id)
      .set({ isEnabled: updatedStatus })
      .commit();

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
      message: `Item successfully ${updatedStatus ? "enabled" : "disabled"}.`,
    });
  } catch (error) {
    console.error("Error toggling item status:", error);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
};


export const deleteItem = async (id) => {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "admin")
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });

  try {
    const result = await writeClient.delete(id);

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
      message: "Item successfully deleted.",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return parseServerActionResponse({
      error: error.message,
      status: "ERROR",
    });
  }
};
