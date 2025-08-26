import React from "react";
import { format } from "date-fns";
import DownloadButton from "./DownloadButton";
import { timeOptions } from "@/lib/constants";

const OrderDetailView = ({ orderDetails }) => {
  const date = new Date(orderDetails.date);
  const dateStr = format(date, "MM/dd/yyyy");

  // Get all unique fields from items, excluding _id
  const getUniqueFields = () => {
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

  const uniqueFields = getUniqueFields();
  const gridCols = `grid-cols-${uniqueFields.length + 1}`; // +1 for itemName

  return (
    <div className="flex flex-col items-center w-screen p-6">
      <div className="text-center mb-6 flex flex-col items-center w-full">
        <div className="flex justify-between w-full text-xl font-semibold border-b pb-2">
          <p>
            <span className="font-bold">Date :</span> {dateStr}
          </p>
          <p>
            <span className="font-bold">Ordered by :</span>{" "}
            {orderDetails.createdBy.name}
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

      <div className="w-full border rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Order List</h2>
        <div
          className={`grid ${gridCols} gap-4 text-center font-semibold mb-4`}
        >
          <p className="font-bold">Item Name</p>
          {uniqueFields.map((field, index) => (
            <p key={index} className="font-bold">
              {field.charAt(0).toUpperCase() +
                field.slice(1).replace(/([A-Z])/g, " $1")}
            </p>
          ))}
        </div>
        {orderDetails.items.map((item, index) => (
          <div
            key={index}
            className={`grid ${gridCols} gap-4 text-center items-center py-2 border-b`}
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

      <DownloadButton orderDetails={orderDetails} />
    </div>
  );
};

export default OrderDetailView;
