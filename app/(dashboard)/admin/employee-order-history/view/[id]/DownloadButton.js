"use client";
import jsPDF from "jspdf";
import React, { useState } from "react";
import { logo } from "@/public/images";
import { timeOptions } from "@/lib/constants";
import { downloadOrderHistorySummary } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DownloadButton = ({ orderDetails }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      await downloadOrderHistorySummary(orderDetails);
      toast({
        title: "Success",
        description: "PDF generated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error downloading PDF", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isLoading}
      className={`bg-red-500 text-white px-8 py-3 mt-6 rounded-lg font-medium text-lg hover:bg-red-600 transition ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? "Generating PDF..." : "Download as PDF"}
    </button>
  );
};

export default DownloadButton;
