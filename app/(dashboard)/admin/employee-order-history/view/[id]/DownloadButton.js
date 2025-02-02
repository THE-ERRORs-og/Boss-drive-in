"use client";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React from "react";
import logo from '@/public/images';

const DownloadButton = ({ orderDetails }) => {
  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Add Logo
    const img = new Image();
    img.src = logo; // Replace with actual logo path
    pdf.addImage(img, "PNG", 80, 10, 50, 15);

    // Add Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Cash Summary", 105, 35, null, null, "center");

    pdf.setFontSize(12);
    pdf.text(`Staff Name: ${orderDetails.createdBy.name}`, 20, 45);
    pdf.text(`Date: ${orderDetails.date}`, 140, 45);

    pdf.setFont("helvetica", "bold");
    pdf.text("Shift time:", 20, 55);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Shift ${orderDetails.shiftNumber}`, 45, 55);

    pdf.setFont("helvetica", "bold");
    pdf.text("Date:", 140, 55);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${orderDetails.date}`, 155, 55);

    let startY = 65;

    // Iterate through items and create boxed sections
    orderDetails.items.forEach((item) => {
      pdf.setFont("helvetica", "bold");
      pdf.setDrawColor(0);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(20, startY, 170, 10, "F");
      pdf.text(item.itemName, 25, startY + 7);

      startY += 10;

      pdf.setFont("helvetica", "bold");
      pdf.text("BOH:", 25, startY + 7);
      pdf.setFont("helvetica", "normal");
      pdf.text(`$${item.boh.toLocaleString()}`, 60, startY + 7);

      startY += 7;

      pdf.setFont("helvetica", "bold");
      pdf.text("Cash Order:", 25, startY + 7);
      pdf.setFont("helvetica", "normal");
      pdf.text(`$${item.cashOrder.toLocaleString()}`, 60, startY + 7);

      startY += 7;

      pdf.setFont("helvetica", "bold");
      pdf.text("Inventory:", 25, startY + 7);
      pdf.setFont("helvetica", "normal");
      pdf.text(`$${item.inventory.toLocaleString()}`, 60, startY + 7);

      startY += 12;
    });

    // Save the PDF
    pdf.save(`Cash_Summary_${orderDetails.createdBy.name}.pdf`);
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
