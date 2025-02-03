"use client";
import jsPDF from "jspdf";
import React from "react";
import {logo} from "@/public/images";
import { timeOptions } from "@/lib/constants";
import { downloadOrderHistorySummary } from "@/lib/utils";

const DownloadButton = ({ orderDetails }) => {
  const handleDownloadPDF = async () => {
    try {
      await downloadOrderHistorySummary(orderDetails);
    } catch (error) {
      console.error("Error downloading PDF", error);
      
    }
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
