import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { logo } from "@/public/images";
import jsPDF from "jspdf";
import { timeOptions } from "@/lib/constants";

/**
 * Returns the current date and time in US Eastern Time (ET) zone
 * This function ensures consistent timezone handling throughout the application
 * @returns {Date} Current date in US Eastern Time as a JavaScript Date object
 */
export function getUSEasternTime() {
  // Create a date with the current UTC time
  const date = new Date();

  // Convert to US Eastern Time using Intl.DateTimeFormat with timeZone option
  const etTimeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).format(date);

  // Parse the formatted date string back into a Date object
  // Split the date string into components
  const [datePart, timePart] = etTimeStr.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");

  // Create a new Date object with the ET components
  // Note: months are 0-indexed in JavaScript Date
  return new Date(year, month - 1, day, hour, minute, second);
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseServerActionResponse(response) {
  return JSON.parse(JSON.stringify(response));
}

// Helper function to check if a user has access to a specific location
export function checkLocationAccess(session, locationId) {
  if (!session || !session.user) {
    return {
      hasAccess: false,
      error: "Not signed in",
    };
  }

  // If user has access to all locations, they have access to any specific location
  if (session.user.hasAllLocationsAccess) {
    return {
      hasAccess: true,
    };
  }

  // If a specific location is requested, check if user has access to it
  if (locationId && !session.user.locationIds.includes(locationId)) {
    return {
      hasAccess: false,
      error: "You don't have access to this location",
    };
  }

  return {
    hasAccess: true,
  };
}

export const getDateString = (date, timeZone = "America/New_York") => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone, // US timezone you want
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export function processCashSummaryData(rawData, sortOrder = "desc") {
  // Group data by date
  const groupedData = rawData.reduce((acc, item) => {
    // Extract date from datetime (YYYY-MM-DD)
    const date = item.datetime.split("T")[0];

    // Initialize the group for this date if not already done
    if (!acc[date]) {
      acc[date] = {
        date,
        name: item.createdBy?.name || "Nan", // Default to the first record's creator
        shiftIds: [], // Array to hold shift numbers and IDs
        balance: 0, // Sum of ownedToRestaurantSafe
      };
    }

    // Update the group
    acc[date].shiftIds.push({ No: item.shiftNumber, id: item._id });
    acc[date].balance += item.ownedToRestaurantSafe;

    // Check if this record is the latest for the date
    // Assume data is sorted by datetime desc, shiftNumber desc
    if (new Date(item.datetime) > new Date(acc[date].datetime || 0)) {
      acc[date].name = item.createdBy.name;
      acc[date].datetime = item.datetime; // Update datetime for the latest check
    }

    return acc;
  }, {});

  // Convert grouped object into an array
  let groupedArray = Object.values(groupedData);

  // Sort based on sortOrder
  groupedArray.sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date);
  });

  return groupedArray;
}

export async function downloadCashSummary(data) {
  const date = new Date(data.datetime);
  const dateStr = getDateString(date);
  const doc = new jsPDF("p", "mm", "a4");

  // Create temporary HTML as a string
  const htmlContent = `
    <div style="width: 100%; font-size: 20px; background: white; font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <img src=${
          logo?.src
        } alt="BOSS Drive-In Logo" style="width: 100px; display: block; margin: auto;" />
        <h1 style="font-size: 26px; font-weight: bold; margin: 10px 0;">Cash Summary</h1>
        <p><strong>Staff Name:</strong> ${data.username}</p>
        ${
          data.locationName
            ? `<p><strong>Location:</strong> ${data.locationName}</p>`
            : ""
        }
      </div>
      
      <div style="display: flex; justify-content: space-between;">
        <p><strong>Shift Time:</strong> ${timeOptions[data.shiftNumber - 1]}</p>
        <p><strong>Date:</strong> ${dateStr}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Expected Closeout Cash</td>
          <td style="padding: 10px; text-align: right;">$${data.expectedCloseoutCash.toFixed(
            2
          )}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Starting Register Cash</td>
          <td style="padding: 10px; text-align: right;">$${data.startingRegisterCash.toFixed(
            2
          )}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td colspan="2" style="padding: 10px; font-weight: bold;">Online Tips</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Toast</td>
          <td style="padding: 10px; text-align: right;">$${data.onlineTipsToast.toFixed(
            2
          )}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Kiosk</td>
          <td style="padding: 10px; text-align: right;">$${data.onlineTipsKiosk.toFixed(
            2
          )}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Total Tip Deduction</td>
          <td style="padding: 10px; text-align: right;">$${data.totalTipDeduction.toFixed(
            2
          )}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">OWED To Restaurant Safe</td>
          <td style="padding: 10px; text-align: right; ${
            data.ownedToRestaurantSafe < 0 ? "color: red;" : ""
          }">
            $${data.ownedToRestaurantSafe.toFixed(2)}
            ${
              data.ownedToRestaurantSafe < 0
                ? '<br><span style="font-size: 14px;">(Reduction from bank safe)</span>'
                : ""
            }
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td colspan="2" style="padding: 10px; font-weight: bold;">Other Closing Info</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Cash Tips</td>
          <td style="padding: 10px; text-align: right;">$${(
            data.onlineTipCash || 0
          ).toFixed(2)}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Removal Amount</td>
          <td style="padding: 10px; text-align: right;">$${(
            data.removalAmount || 0
          ).toFixed(2)}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Removal Item Count</td>
          <td style="padding: 10px; text-align: right;">${
            data.removalItemCount || 0
          }</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Discounts</td>
          <td style="padding: 10px; text-align: right;">$${(
            data.discounts || 0
          ).toFixed(2)}</td>
        </tr>
      </table>
    </div>
  `;

  doc.html(htmlContent, {
    callback: function (doc) {
      // Generate PDF Blob
      const pdfBlob = doc.output("blob");

      // Create Blob URL
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create a hidden iframe and trigger print
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      iframe.src = blobUrl;
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    },
    x: 10,
    y: 10,
    width: 190,
    windowWidth: 800,
  });
}

export const getUniqueFields = (orderDetails) => {
  if (!orderDetails.items || orderDetails.items.length === 0) return [];

  const fields = new Set();
  orderDetails.items.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== "_id" && key !== "itemId" && key !== "itemName") {
        fields.add(key);
      }
    });
  });
  return Array.from(fields);
};

export async function downloadOrderHistorySummary(orderDetails) {
  const date = new Date(orderDetails.date);
  const dateStr = getDateString(date);

  const doc = new jsPDF("p", "mm", "a4");

  // Get unique fields from items (excluding _id, itemId, and itemName)

  const uniqueFields = getUniqueFields(orderDetails);

  // Create temporary HTML as a string
  const htmlContent = `
    <div style="width: 100%; font-size: 20px; background: white; font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <img src=${
          logo?.src
        } alt="BOSS Drive-In Logo" style="width: 80px; display: block; margin: auto;" />
        <h1 style="font-size: 26px; font-weight: bold;">${orderDetails.type
          .split("-")
          .join(" ")
          .toUpperCase()} Order List</h1>
        <p style="font-weight: bold;">Staff Name: ${
          orderDetails.createdBy.name
        }</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <p><strong>Date:</strong> ${dateStr}</p>
          <p><strong>Shift:</strong> ${
            timeOptions[orderDetails.shiftNumber - 1]
          }</p>
        </div>
        ${
          orderDetails.location
            ? `<p style="margin-top: 10px; text-align: center; background-color: #f0f7ff; padding: 5px; border-radius: 5px;"><strong>Location:</strong> ${orderDetails.location.name}</p>`
            : ""
        }
      </div>

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
    </div>
  `;

  doc.html(htmlContent, {
    callback: function (doc) {
      // Generate PDF Blob
      const pdfBlob = doc.output("blob");

      // Create Blob URL
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create a hidden iframe and trigger print
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      iframe.src = blobUrl;
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    },
    x: 10,
    y: 10,
    width: 190,
    windowWidth: 800,
  });
}

// lib/utils.js
export function generatePagination(nPages, currentPage) {
  // Handle edge cases: if nPages is 0, undefined, or not a number
  if (!nPages || isNaN(nPages) || nPages <= 0) {
    return [1];
  }

  if (nPages <= 6) {
    return [...Array(nPages).keys()].map((x) => x + 1);
  }

  let pages = [1];

  if (currentPage > 3) {
    pages.push("...");
  }

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(nPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < nPages - 2) {
    pages.push("...");
  }

  pages.push(nPages);

  return pages;
}
