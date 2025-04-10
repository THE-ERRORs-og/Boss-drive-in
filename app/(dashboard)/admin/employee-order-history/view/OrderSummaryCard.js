import React from "react";
import { format } from "date-fns";
import MainButton from "@/components/Button/MainButton";
import { useRouter } from "next/navigation";

const OrderSummaryCard = ({ item }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    // Navigate to the appropriate order type detail page
    console.log(item);
    const orderType = item.type.toLowerCase();
    console.log(orderType);
    router.push(`/admin/employee-order-history/${orderType}/${item._id}`);
  };

  return (
    <div className="w-full space-y-4 border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-semibold">
          {item.createdBy?.name || "Unknown User"}
        </p>
        <p className="text-lg font-semibold">
          {format(new Date(item.date), "MMM dd, yyyy")}
        </p>
        <p className="text-lg font-semibold">
          {item.type} Order
        </p>
        <p className="text-lg font-semibold">
          Shift {item.shiftNumber}
        </p>
      </div>
      <MainButton
        text="View Details"
        onClick={handleViewDetails}
        className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
      />
    </div>
  );
};

export default OrderSummaryCard;
