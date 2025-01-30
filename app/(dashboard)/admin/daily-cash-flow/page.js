"use client";
import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import StaticDataBox from "@/components/Textbox/StaticDataBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react";

import React from "react";
import { useState } from "react";

export default function EmployeeOrderHistory() {
  const data = [
    {
      date: "11/Feb/2025",
      time: "12:00 PM",
      name: "The Errors",
      shiftNumber: 3,
      depositedAmount: "$20000",
    },
    {
      date: "11/Feb/2025",
      time: "12:00 PM",
      name: "The Errors",
      shiftNumber: 3,
      depositedAmount: "$20000",
    },
    {
      date: "11/Feb/2025",
      time: "12:00 PM",
      name: "The Errors",
      shiftNumber: 3,
      depositedAmount: "$20000",
    },
    {
      date: "11/Feb/2025",
      time: "12:00 PM",
      name: "The Errors",
      shiftNumber: 3,
      depositedAmount: "$20000",
    },
  ];

  const processInfo = 22; //this will be info array and we will be using length of info for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const nPages = Math.ceil(processInfo / recordsPerPage);

  return (
    <div className="p-8 h-screen w-screen flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-semibold mb-4">
        Daily Safe Balance History
      </h1>

      <div className="flex items-center rounded-lg px-3 py-2 w-fit">
        <p className="text-black font-semibold">Available Safe Balance</p>
        <div className="ml-3 border border-gray-300 rounded-md px-3 py-1">
          <span className="text-black">$ 4000</span>
        </div>
      </div>

      <div className="flex-col w-full h-[50vh] overflow-y-scroll items-center space-x-2 ">
        {data.map((item, index) => (
          <div
            key={index}
            className="w-full space-y-4 border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <p className="font-md text-xl">
                <span className="font-semibold text-xl">Date :</span>{" "}
                {item.date}
              </p>
              <p className="font-md text-xl">
                <span className="font-semibold text-xl">Time :</span>{" "}
                {item.time}
              </p>
              <p className="font-md text-xl">
                <span className="font-semibold text-xl">Ordered By :</span>{" "}
                {item.name}
              </p>
              <p className="font-md text-xl">
                <span className="font-semibold text-xl">Shift Number :</span>{" "}
                {item.shiftNumber}
              </p>
            </div>

            <p className="font-md text-xl">
              <span className="font-semibold text-xl">Deposited Amount :</span>{" "}
              {item.depositedAmount}
            </p>
            <MainButton text="View Details" className="" />
          </div>
        ))}
      </div>

      <div className="flex w-full justify-center">
        <Pagination
          nPages={nPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
