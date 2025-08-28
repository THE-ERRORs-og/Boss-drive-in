"use server";

import { auth } from "@/auth";
import connectDB from "../mongodb";
import mongoose from "mongoose";
import SyscoOrder from "../../models/SyscoOrder";
import {
  getDateString,
  getUniqueFields,
  parseServerActionResponse,
  getUSEasternTime,
  checkLocationAccess,
} from "../utils";
import { timeOptions } from "../constants";
import { sendGroupEmail } from "./emailService";
import { sendSyscoOrderEmail } from "./emailService";

export const getLastSyscoOrder = async (locationId) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  try {
    await connectDB();

    // Create query object
    const query = {};

    // Add location filter if provided
    if (locationId) {
      // Check if user has access to this location
      const accessCheck = checkLocationAccess(session, locationId);
      if (!accessCheck.hasAccess) {
        return {
          status: "ERROR",
          error: accessCheck.error,
        };
      }
      query.location = locationId;
    } else if (
      !session.user.hasAllLocationsAccess &&
      session.user.locationIds.length > 0
    ) {
      // If no location specified and user doesn't have all access but has at least one location,
      // use their first location
      query.location = session.user.locationIds[0];
    } else if (!session.user.hasAllLocationsAccess) {
      // User doesn't have any locations
      return {
        status: "ERROR",
        error: "You don't have access to any locations",
      };
    }

    // Calculate yesterday's start and end
    const yesterdayStart = getUSEasternTime();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0); // yesterday 00:00:00

    const yesterdayEnd = getUSEasternTime();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999); // yesterday 23:59:59

    // Add date filter
    query.submissionDate = { $gte: yesterdayStart, $lte: yesterdayEnd };

    const lastOrder = await SyscoOrder.findOne(query)
      .sort({ submissionDate: -1 })
      .populate({
        path: "items.itemId",
        model: "OrderItem",
      })
      .populate({
        path: "location",
        select: "name",
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

  // Check if location is provided
  if (!orderData.location) {
    return {
      status: "ERROR",
      error: "Location is required",
    };
  }

  // Check if user has access to the location
  const accessCheck = checkLocationAccess(session, orderData.location);
  if (!accessCheck.hasAccess) {
    return {
      status: "ERROR",
      error: accessCheck.error,
    };
  }

  try {
    await connectDB();

    // Check if an entry already exists for the given date, shift, and location
    const startOfDay = new Date(orderData.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(orderData.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingOrder = await SyscoOrder.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      shiftNumber: orderData.shiftNumber,
      location: orderData.location,
    });

    if (existingOrder) {
      return {
        status: "ERROR",
        error: `An order already exists for this date, shift number, and location`,
      };
    }

    const newOrder = await SyscoOrder.create({
      ...orderData,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      submissionDate: getUSEasternTime(),
    });

    await newOrder.populate([
      {
        path: "items.itemId",
        model: "OrderItem",
      },
      {
        path: "location",
        select: "name",
      },
    ]);

    // Serialize the response
    const serializedOrder = JSON.parse(JSON.stringify(newOrder));
    const orderDetails = serializedOrder;
    const uniqueFields = getUniqueFields(orderDetails);
    const locationName = serializedOrder.location?.name || "Unknown Location";

    // Original emailData for group email
    const emailData = {
      templateName: "order-details",
      groupName: "Test Group",
      templateData: {
        logosrc: process.env.LOGO_SRC || "",
        username: session.user.name,
        shiftTime: timeOptions[orderData.shiftNumber - 1],
        dateStr: getDateString(new Date(orderData.date)),
        ordertype: "Sysco",
        locationName: locationName,
        year: getUSEasternTime().getFullYear(),
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

    // Send both email notifications in parallel using Promise.all
    const specificEmail = process.env.SYSCO_SPECIFIC_EMAIL || "sysco@example.com";
    const syscoEmailData = {
      to: specificEmail,
      items: orderDetails.items,
      shiftTime: timeOptions[orderData.shiftNumber - 1],
      dateStr: getDateString(new Date(orderData.date)),
      locationName: locationName,
    };
    
    // Define promises for both email operations
    const emailPromises = [
      // Group email promise with error handling
      sendGroupEmail(emailData).catch(error => {
        console.error("Error sending group email:", error);
        return {
          status: "ERROR",
          error: "Failed to send group email notification",
        };
      }),
      
      // Sysco specific email promise with error handling
      sendSyscoOrderEmail(syscoEmailData).catch(error => {
        console.error("Error sending sysco email:", error);
        return {
          status: "ERROR",
          error: "Failed to send sysco email notification",
        };
      })
    ];
    
    // Execute both promises in parallel and destructure the results
    const [groupEmailResponse, syscoEmailResponse] = await Promise.all(emailPromises);

    return {
      status: "SUCCESS",
      data: serializedOrder,
      emailResponses: {
        group:
          groupEmailResponse.status === "SUCCESS"
            ? "Group email sent successfully"
            : groupEmailResponse.error,
        sysco:
          syscoEmailResponse?.status === "SUCCESS"
            ? "Sysco email sent successfully"
            : syscoEmailResponse?.error || "Failed to send sysco email",
      },
    };
  } catch (error) {
    console.error("Error creating sysco order:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to create sysco order",
    };
  }
};
