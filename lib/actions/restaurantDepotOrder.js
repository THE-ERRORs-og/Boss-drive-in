"use server";

import { auth } from "@/auth";
import connectDB from "../mongodb";
import mongoose from "mongoose";
import RestaurantDepotOrder from "../../models/RestaurantDepotOrder";
import {
  getDateString,
  getUniqueFields,
  parseServerActionResponse,
} from "../utils";
import { sendGroupEmail } from "./emailService";
import { timeOptions } from "../constants";

export const createRestaurantDepotOrder = async (orderData) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Check if an entry already exists for the given date and shift
    const startOfDay = new Date(orderData.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(orderData.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingOrder = await RestaurantDepotOrder.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      shiftNumber: orderData.shiftNumber,
    });

    if (existingOrder) {
      return {
        status: "ERROR",
        error: `An order already exists for this date and shift number`,
      };
    }

    const newOrder = await RestaurantDepotOrder.create({
      ...orderData,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      submissionDate: new Date(),
    });

    await newOrder.populate({
      path: "items.itemId",
      model: "OrderItem",
    });

    // Serialize the response
    const serializedOrder = JSON.parse(JSON.stringify(newOrder));
    const orderDetails = serializedOrder;
    const uniqueFields = getUniqueFields(orderDetails);

    const emailData = {
      templateName: "order-details",
      groupName: "Test Group",
      templateData: {
        logosrc: process.env.LOGO_SRC || "",
        username: session.user.name,
        shiftTime: timeOptions[orderData.shiftNumber - 1],
        dateStr: getDateString(new Date(orderData.date)),
        ordertype: "Restaurant Depot",
        tableContent: `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
            <tr style="border: 1px solid black; background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; font-weight: bold;">Item Name</th>
              ${uniqueFields
                .map(
                  (field) => `
                <th style="padding: 10px; text-align: right; font-weight: bold;">
                  ${
                    field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/([A-Z])/g, " $1")
                  }
                </th>
              `
                )
                .join("")}
            </tr>
            ${orderDetails.items
              .map(
                (item) => `
              <tr style="border: 1px solid black;">
                <td style="padding: 10px; text-align: left;">${
                  item.itemName
                }</td>
                ${uniqueFields
                  .map(
                    (field) => `
                  <td style="padding: 10px; text-align: right;">${item[field]}</td>
                `
                  )
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </table>
            `,
      },
    };

    // Send email notification (assuming sendGroupEmail is a function that sends the email)
    let emailResponse;
    try {
      emailResponse = await sendGroupEmail(emailData);
    } catch (error) {
      console.error("Error sending email:", error);
      emailResponse = {
        status: "ERROR",
        error: "Failed to send email notification",
      };
    }

    return {
      status: "SUCCESS",
      data: serializedOrder,
      emailResponse:
        emailResponse.status === "SUCCESS"
          ? "Email sent successfully"
          : emailResponse.error,
    };
  } catch (error) {
    console.error("Error creating restaurant depot order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create restaurant depot order",
    };
  }
};
