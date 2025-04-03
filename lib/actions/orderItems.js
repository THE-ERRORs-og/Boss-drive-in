"use server";
import { auth } from "@/auth";
import { parseServerActionResponse } from "../utils";
import { writeClient } from "@/sanity/lib/write_client";

export const createOrderItem = async (newItem) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });
  }

  try {
    // Fetch the highest order value from existing items
    const highestOrderItem = await writeClient.fetch(`
      *[_type == "order_item"] | order(order desc) [0] {
        order
      }
    `);

    // Determine the new order value (increment max order by 1)
    const newOrder = highestOrderItem ? highestOrderItem.order + 1 : 1;

    // Create new item with the calculated order value
    const result = await writeClient.create({
      _type: "order_item",
      name: newItem.trim(),
      isEnabled: true,
      order: newOrder, // Set the order dynamically
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

export const updateOrder = async (newItems) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin"))
    return parseServerActionResponse({
      error: "Not signed in or not authorized",
      status: "ERROR",
    });

  const mutations = newItems.map((item, index) => ({
    patch: {
      id: item._id,
      set: { order: index },
    },
  }));

  await writeClient.transaction(mutations).commit();
};

export const toggleItemStatus = async (id) => {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin"))
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
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "superadmin"))
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
