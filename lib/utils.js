import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {logo} from "@/public/images";
import jsPDF from "jspdf";
import { timeOptions } from "@/lib/constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseServerActionResponse(response) {
  return JSON.parse(JSON.stringify(response));
}

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
  const dateStr =
    date.getDate().toString().padStart(2, "0") +
    "-" +
    date.toLocaleString("en-US", { month: "2-digit" }) +
    "-" +
    date.getFullYear();
  const doc = new jsPDF("p", "mm", "a4");

  // Create temporary HTML as a string
  const htmlContent = `
    <div style="width: 100%; font-size: 20px; background: white; font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <img src=${logo?.src} alt="BOSS Drive-In Logo" style="width: 100px; display: block; margin: auto;" />
        <h1 style="font-size: 26px; font-weight: bold; margin: 10px 0;">Cash Summary</h1>
        <p><strong>Staff Name:</strong> ${data.username}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between;">
        <p><strong>Shift Time:</strong> ${timeOptions[data.shiftNumber - 1]}</p>
        <p><strong>Date:</strong> ${dateStr}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Expected Cash out</td>
          <td style="padding: 10px; text-align: right;">$${data.expectedCloseoutCash}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Starting Register Cash</td>
          <td style="padding: 10px; text-align: right;">$${data.startingRegisterCash}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td colspan="2" style="padding: 10px; font-weight: bold;">Online Tips</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Toast</td>
          <td style="padding: 10px; text-align: right;">$${data.onlineTipsToast}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Kiosk</td>
          <td style="padding: 10px; text-align: right;">$${data.onlineTipsKiosk}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td colspan="2" style="padding: 10px; font-weight: bold;">Miscellaneous</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px;">Cash</td>
          <td style="padding: 10px; text-align: right;">$${data.onlineTipCash}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Total Tip Deduction</td>
          <td style="padding: 10px; text-align: right;">$${data.totalTipDeduction}</td>
        </tr>
        <tr style="border: 1px solid black;">
          <td style="padding: 10px; font-weight: bold;">Owned To Restaurant Safe</td>
          <td style="padding: 10px; text-align: right;">$${data.ownedToRestaurantSafe}</td>
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

      // // Optional: Download the PDF as well
      // doc.save(`Cash_Summary_${data.username}.pdf`);
    },
    x: 10, // Shift content to the left
    y: 10,
    width: 190, // Reduce width to prevent overflow
    windowWidth: 800,
  });
}

export async function downloadOrderHistorySummary(orderDetails) {
  const date = new Date(orderDetails.date);
  const dateStr =
    date.getDate().toString().padStart(2, "0") +
    "-" +
    date.toLocaleString("en-US", { month: "short" }) +
    "-" +
    date.getFullYear();

  const doc = new jsPDF("p", "mm", "a4");

  // Create temporary HTML as a string
  const htmlContent = `
    <div style="width: 100%; font-size: 20px; background: white; font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <img src=${logo?.src} alt="BOSS Drive-In Logo" style="width: 80px; display: block; margin: auto;" />
        <h1 style="font-size: 26px; font-weight: bold;">Item Order List</h1>
        <p style="font-weight: bold;">Staff Name: ${orderDetails.createdBy.name}</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <p><strong>Date:</strong> ${dateStr}</p>
        </div>
      </div>

      ${orderDetails.items
        .map(
          (item) => `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
            <tr style="border: 1px solid black;">
              <td colspan="2" style="padding: 10px; font-weight: bold;">${item.itemName}</td>
            </tr>
            <tr style="font-size: 16px;border: 1px solid black;">
              <td style="padding: 10px; font-weight: bold;">BOH:</td>
              <td style="padding: 10px; text-align: right;"> $${item.boh.toLocaleString()}</td>
            </tr>
            <tr style="font-size: 16px;border: 1px solid black;">
              <td style="padding: 10px; font-weight: bold;">Cash Order:</td>
              <td style="padding: 10px; text-align: right;">  $${item.cashOrder.toLocaleString()}</td>
            </tr>
            <tr style="font-size: 16px;border: 1px solid black;">
              <td style="padding: 10px; font-weight: bold;">Inventory:</td>
              <td style="padding: 10px; text-align: right;"> $${item.inventory.toLocaleString()}</td>
            </tr>
          </table>
        `
        )
        .join("")}
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

      // // Optional: Download the PDF as well
      // doc.save(`Cash_Summary_${data.username}.pdf`);
    },
    x: 10, // Shift content to the left
    y: 10,
    width: 190, // Reduce width to prevent overflow
    windowWidth: 800,
  });
}
