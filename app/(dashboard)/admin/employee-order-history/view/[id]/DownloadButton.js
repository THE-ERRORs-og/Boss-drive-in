"use client";
import jsPDF from "jspdf";
import React from "react";
import {logo} from "@/public/images";

const DownloadButton = ({ orderDetails }) => {
  const handleDownloadPDF = () => {
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
      <div style="width: 100%;font-size:25px; background: white; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 15px;">
          <img src=${logo?.src} alt="BOSS Drive-In Logo" style="width: 80px; display: block; margin: auto;" />
          <h1 style="font-size: 18px; font-weight: bold;">Cash Summary</h1>
          <p style="font-weight: bold;">Staff Name: ${orderDetails.createdBy.name}</p>
          <div style="display: flex; justify-content: space-between;">
            <p style=""><strong>Date: </strong> ${dateStr}</p>
            <p><strong>Shift Time:</strong> Shift ${orderDetails.shiftNumber}</p>
          </div>
        </div>

        ${orderDetails.items
          .map(
            (item) => `
          <div style="border: 1px solid black; padding: 10px; margin-bottom: 10px;">
            <p style="font-weight: bold;">${item.itemName}</p>
            <p><strong>BOH:</strong> $${item.boh.toLocaleString()}</p>
            <p><strong>Cash Order:</strong> $${item.cashOrder.toLocaleString()}</p>
            <p><strong>Inventory:</strong> $${item.inventory.toLocaleString()}</p>
          </div>
        `
          )
          .join("")}
      </div>
    `;


    doc.html(htmlContent, {
      callback: function (doc) {
        doc.save(`Cash_Summary_${orderDetails.createdBy.name}.pdf`);
      },
      x: 10, // Shift content to the left
      y: 10,
      width: 190, // Reduce width to prevent overflow
      windowWidth: 800,
    });
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="bg-red-500 text-white px-8 py-3 mt-6 rounded-lg font-medium text-lg hover:bg-red-600 transition"
    >
      Download as PDF
    </button>
  );
};

export default DownloadButton;
