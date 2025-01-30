import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import { client } from "@/sanity/lib/client";
import { GET_CURRENT_SAFE_BALANCE_QUERY, GET_SAFE_BALANCE_HISTORY_BY_PAGINATION_QUERY, TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY, TOTAL_NUMBER_OF_SAFE_BALANCE_HISTORY_QUERY } from "@/sanity/lib/queries";
import React from "react";
import SafeBalanceCard from "./SafeBalanceCard";
import FilterPage from "@/components/FilterBar/filterbar";

export default async function EmployeeOrderHistory({ searchParams }) {
  const searchParamsv = await searchParams;
    const currentPage = parseInt(searchParamsv.page || 1); // Default to page 1
    const recordsPerPage = parseInt(searchParamsv.recordsPerPage || 5);
    const indexOfLastRecord = currentPage * recordsPerPage - 1;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage + 1;
    const [current_safe_balance, rawData, processInfo] = await Promise.all([
      client.withConfig({ useCdn: false }).fetch(GET_CURRENT_SAFE_BALANCE_QUERY),
      client.fetch(GET_SAFE_BALANCE_HISTORY_BY_PAGINATION_QUERY, {
        indexOfLastRecord,
        indexOfFirstRecord,
      }),
      client.fetch(TOTAL_NUMBER_OF_SAFE_BALANCE_HISTORY_QUERY),
    ]);

      const nPages = Math.ceil(processInfo / recordsPerPage);

  return (
    <div className="p-8 h-screen w-full flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-semibold mb-4">
        Daily Safe Balance History
      </h1>
      <FilterPage/>
      <div className="flex items-center rounded-lg px-3 py-2 w-fit">
        <p className="text-black font-semibold">Available Safe Balance</p>
        <div className="ml-3 border border-gray-300 rounded-md px-3 py-1">
          <span className="text-black">$ {current_safe_balance.value}</span>
        </div>
      </div>

      <div className="flex-col w-full h-[50vh] overflow-y-scroll items-center  ">
        {rawData.map((item, index) => (
          <SafeBalanceCard key={index} item={item} />
        ))}
      </div>

      <div className="flex w-full justify-center">
        <Pagination nPages={nPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
