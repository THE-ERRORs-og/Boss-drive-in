"use client";
import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import StaticDataBox from "@/components/Textbox/StaticDataBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react";
import { useState } from "react";

export default function DailyCashFlow() {
  const processInfo = 22; //this will be info array and we will be using length of info for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const nPages = Math.ceil(processInfo / recordsPerPage);

  return (
    <div className="p-8 h-screen w-screen flex flex-col items-center space-y-4 ">
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
      <ScrollViewer />
      <div className="flex w-full justify-center">
        <Pagination
          nPages={nPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <div className="flex w-full justify-between pl-8 pr-8 space-x-3 items-center">
        <MainButton className="md:text-xl md:w-1/3" text = "Deposit to bank & Download PDF"/>
        <div className="flex w-2/3 justify-end space-x-6 items-center">
          <p className="text-md md:text-2xl font-semibold">Available Safe Balance</p>
          <StaticDataBox text="$1000" className="text-md pr-8 md:w-1/6 " />
        </div>
      </div>
    </div>
  );
}

