"use server";

import { auth } from "@/auth";
import connectDB from "../mongodb";
import mongoose from "mongoose";
import SyscoOrder from "../../models/SyscoOrder";
import { getDateString, getUniqueFields, parseServerActionResponse, getUSEasternTime } from "../utils";
import { timeOptions } from "../constants";
import { sendGroupEmail } from "./emailService";

export const getLastSyscoOrder = async () => {
  try {
    await connectDB();
    // Calculate yesterday's start and end
    const yesterdayStart = getUSEasternTime();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0); // yesterday 00:00:00

    const yesterdayEnd = getUSEasternTime();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999); // yesterday 23:59:59

    const lastOrder = await SyscoOrder.findOne({
      submissionDate: { $gte: yesterdayStart, $lte: yesterdayEnd },
    })
      .sort({ submissionDate: -1 })
      .populate({
        path: "items.itemId",
        model: "OrderItem",
      });

    if (!lastOrder) {
      return {
        status: "SUCCESS",
        data: null,
      };
    }

    // Convert to plain object and serialize
    const serializedOrder = JSON.parse(JSON.stringify(lastOrder));

    return {
      status: "SUCCESS",
      data: serializedOrder,
    };
  } catch (error) {
    console.error("Error fetching last sysco order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to fetch last sysco order",
    };
  }
};

export const createSyscoOrder = async (orderData) => {
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

    const existingOrder = await SyscoOrder.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      shiftNumber: orderData.shiftNumber
    });

    if (existingOrder) {
      return {
        status: "ERROR",
        error: `An order already exists for this date and shift number`,
      };
    }

    const newOrder = await SyscoOrder.create({
      ...orderData,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      submissionDate: getUSEasternTime(),
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
        ordertype: "Sysco",
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
            <td style="padding: 10px; text-align: left;">${item.itemName}</td>
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
    console.error("Error creating sysco order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create sysco order",
    };
  }
}; 