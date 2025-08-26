import { getDateString } from "@/lib/utils";
import React from "react";

const ScrollViewer = ({groupedData}) => {
  // const rows = Array.from({ length: 20 }).map(() => ({
  //   date: "11/02/25",
  //   name: "The Errors",
  //   shifts: ["Shift 1", "Shift 2", "Shift 3", "Shift 4"],
  //   balance: "$1000",
  // }));

  return (
    <div className="h-[50vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto">
      {/* Table Header */}
      <div className="grid grid-cols-5 bg-white text-center sticky top-0 z-10 text-xl font-semibold border-b">
        <div className="p-2">Date</div>
        <div className="p-2">Name</div>
        <div className="p-2 col-span-2 ">Shift Number</div>
        <div className="p-2">Balance Amount</div>
      </div>

      {/* Table Body */}
      <div>
        {groupedData.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-5 border-2 border-black rounded-xl m-1 text-center items-center hover:bg-gray-50 p-1"
          >
            <div className="p-2">{getDateString(new Date(row.date))}</div>
            <div className="p-2">{row.name}</div>
            <div className="p-2 col-span-2">
              <div className="flex gap-2 flex-wrap justify-center">
                {row.shiftIds.map((shift, i) => (
                  <a
                    href={`/employee/daily-safe-balance/${shift.id}`}
                    key={i}
                    className="px-5 py-1 rounded-full bg-[#ED1C24AB] text-white text-sm font-semibold"
                  >
                    Shift {shift.No}
                  </a>
                ))}
              </div>
            </div>
            <div className="p-2">{row.balance}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollViewer;

