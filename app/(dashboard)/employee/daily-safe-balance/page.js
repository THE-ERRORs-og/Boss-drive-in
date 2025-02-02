"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination/Pagination";
import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import BottomContainer from "./BottomContainer";
import { processCashSummaryData } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import {
  CASH_SUMMARY_BY_PAGINATION_QUERY,
  GET_CURRENT_SAFE_BALANCE_QUERY,
  TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY,
} from "@/sanity/lib/queries";
import FilterPage from "@/components/FilterBar/filterbar";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function DailySafeBalance() {
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [currentSafeBalance, setCurrentSafeBalance] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") || "desc",
    startDate: null,
    endDate: null,
  });

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const recordsPerPage = parseInt(searchParams.get("recordsPerPage") || "12");


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sortOrder = filters.sort === "desc" ? "desc" : "asc";
        const indexOfLastRecord = currentPage * recordsPerPage - 1;
        const indexOfFirstRecord = indexOfLastRecord - recordsPerPage + 1;
        const queryParams = {
          indexOfLastRecord,
          indexOfFirstRecord,
          query: filters.query || "",
          sortOrder: filters.sort || "desc",
          startDate: filters.startDate ? filters.startDate : null,
          endDate: filters.endDate ? filters.endDate : null,
        };

        const [currentSafe, historyData, total] = await Promise.all([
          client
            .withConfig({ useCdn: false })
            .fetch(GET_CURRENT_SAFE_BALANCE_QUERY),
          client.fetch(
            CASH_SUMMARY_BY_PAGINATION_QUERY
            .replace(/\$sortOrder/g, sortOrder),
            queryParams
          ),
          client.fetch(TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY),
        ]);

        // sort history data by datetime and filter.sort
        console.log(filters.sort);
        const Data = processCashSummaryData(historyData, filters.sort);
        setCurrentSafeBalance(currentSafe?.value || 0);
        setGroupedData(Data);
        setTotalRecords(total);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, recordsPerPage, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, sort: newFilters.sortOrder });
  };

  const nPages = Math.ceil(totalRecords / recordsPerPage);
  

  return (
    <div className="p-8 h-[95vh] w-full flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">Daily Safe Balance</h1>
      <FilterPage onFilterChange={handleFilterChange} />

      <div className="flex items-center rounded-lg px-3 py-2 w-fit">
        <p className="text-black font-semibold">Available Safe Balance</p>
        <div className="ml-3 border border-gray-300 rounded-md px-3 py-1">
          <span className="text-black">$ {currentSafeBalance}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <ScrollViewer groupedData={groupedData} />
      )}

      <div className="flex w-full justify-center">
        <Pagination nPages={nPages} currentPage={currentPage} setPage={setCurrentPage} />
      </div>

      <BottomContainer currentSafeBalance={currentSafeBalance} />
    </div>
  );
}
