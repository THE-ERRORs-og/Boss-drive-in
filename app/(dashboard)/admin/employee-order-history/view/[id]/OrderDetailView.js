import React from "react";
import { format } from "date-fns";
import DownloadButton from "./DownloadButton";
import { timeOptions } from "@/lib/constants";

const OrderDetailView = ({ orderDetails }) => {
  const date = new Date(orderDetails.date);
  const dateStr = format(date, "MM/dd/yyyy");

  // Step 1: Collect all unique fields across all items
  const allFields = new Set();
  if (orderDetails.items && orderDetails.items.length > 0) {
    orderDetails.items.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "_id" && key !== "itemId" && key !== "itemName") {
          allFields.add(key);
        }
      });
    });
  }
  const uniqueFields = Array.from(allFields);

  // Step 2: Normalize items so each one has all fields
  const normalizedItems = orderDetails.items
    ? orderDetails.items.map((item) => {
        const normalized = { itemName: item.itemName };
        uniqueFields.forEach((field) => {
          normalized[field] = item[field] ?? 0;
        });
        return normalized;
      })
    : [];

  // Step 3: Generate grid template dynamically
  const colCount = uniqueFields.length + 1;
  const gridTemplate = `repeat(${colCount}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col items-center w-screen p-6">
      {/* Header Section */}
      <div className="text-center mb-6 flex flex-col items-center w-full">
        <div className="flex flex-wrap justify-between w-full text-xl font-semibold border-b pb-2">
          <p>
            <span className="font-bold">Date :</span> {dateStr}
          </p>
          <p>
            <span className="font-bold">Ordered by :</span>{" "}
            {orderDetails.createdBy?.name || "-"}
          </p>
          {orderDetails.location && (
            <p>
              <span className="font-bold">Location:</span>{" "}
              {orderDetails.location.name}
            </p>
          )}
          <p>
            <span className="font-bold">Shift :</span>{" "}
            {timeOptions[orderDetails.shiftNumber - 1]}
          </p>
        </div>
      </div>

      {/* Order Table */}
      <div className="w-full border h-[65vh] overflow-y-scroll rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Order List</h2>

        {/* Header Row */}
        <div
          className="grid gap-4 text-center font-semibold mb-4"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <p className="font-bold">Item Name</p>
          {uniqueFields.map((field, index) => (
            <p key={index} className="font-bold">
              {field.charAt(0).toUpperCase() +
                field.slice(1).replace(/([A-Z])/g, " $1")}
            </p>
          ))}
        </div>

        {/* Data Rows */}
        {normalizedItems.map((item, index) => (
          <div
            key={index}
            className="grid gap-4 text-center items-center py-2 border-b"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <p className="font-semibold">{item.itemName}</p>
            {uniqueFields.map((field, fieldIndex) => (
              <div
                key={fieldIndex}
                className="border rounded-lg px-4 py-2 bg-gray-100"
              >
                {item[field]}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Download Button */}
      <DownloadButton orderDetails={orderDetails} />
    </div>
  );
};

export default OrderDetailView;
