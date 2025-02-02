import MainButton from "@/components/Button/MainButton";
import { useRouter } from "next/navigation";
import React from "react";

const OrderSummaryCard = ({ item }) => {
  const router = useRouter();
  const date = new Date(item.date);

  // Format Date: "11/Feb/2025"
  const dateStr =
    date.getDate().toString().padStart(2, "0") +
    "/" +
    date.toLocaleString("en-US", { month: "short" }) +
    "/" +
    date.getFullYear();

  // Format Time: "12:00 PM"
  const time = date
    .toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/^0/, "");

  return (
    <div className="  space-y-4  border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between">
      <div className=" flex items-center justify-between w-full">
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Date :</span> {dateStr}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Time :</span> {time}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Ordered By :</span>{" "}
          {item.createdBy.name}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Shift Number :</span>{" "}
          {item.shiftNumber}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/admin/employee-order-history/view/" + item._id);
        }}
      >
        <MainButton text="View Details" className="" />
      </form>
    </div>
  );
};

export default OrderSummaryCard;
