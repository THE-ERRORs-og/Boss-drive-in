"use client";
import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import StaticDataBox from "@/components/Textbox/StaticDataBox";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react";

import React from "react";
import { useState } from "react";

export default function SafeBalanceHistory() {
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
  ];

 const processInfo = 22; //this will be info array and we will be using length of info for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const nPages = Math.ceil(processInfo / recordsPerPage);


  return (

    <div className="p-8 h-screen w-screen flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-semibold mb-4">Daily Safe Balance History</h1>
      <div className="flex w-full lg:w-1/2 items-center space-x-2 ">
        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300 "
          varient="outline"
        >
          Filter <ListFilter className="!size-6" />
        </Button>

        <div className="relative w-full">
          <Input
            type="search"
            className="bg-white text-black border border-gray-300"
            placeholder="Search for keyword"
          />
          <div className="absolute bg-white m-1 inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search />
          </div>
        </div>

        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300 "
          varient="outline"
        >
          Sort <ArrowDownWideNarrow className="!size-6" />
        </Button>
      </div>

      <div className="flex justify-end space-x-6 items-center">
        <p className="text-xl md:text-2xl font-semibold">
          Available Safe Balance
        </p>
        <StaticDataBox text="$1000" className="text-md  " />
      </div>
      {data.map((item, index) => (
        <div
          key={index}
          className=" w-full space-y-4  border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between"
        >
          <div className=" flex items-center justify-between w-full">
            <p className="font-md text-xl">
              <span className="font-semibold text-xl">Date :</span> {item.date}
            </p>
            <p className="font-md text-xl">
              <span className="font-semibold text-xl">Time :</span> {item.time}
            </p>
            <p className="font-md text-xl">
              <span className="font-semibold text-xl">Name :</span> {item.name}
            </p>
            <p className="font-md text-xl">
              <span className="font-semibold text-xl">Shift Number :</span>{" "}
              {item.shiftNumber}
            </p>
          </div>
          <div>
            <p className="font-md text-xl">
              <span className="font-semibold text-xl">Deposited Amount :</span>{" "}
              {item.depositedAmount}
            </p>
          </div>
          <MainButton text="Download PDF" className="" />
        </div>
      ))}
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
