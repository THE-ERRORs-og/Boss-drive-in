"use client";

import { useState, useEffect } from "react";
import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import { client } from "@/sanity/lib/client";
import {
  GET_CURRENT_SAFE_BALANCE_QUERY,
  GET_SAFE_BALANCE_HISTORY_BY_PAGINATION_QUERY,
  TOTAL_NUMBER_OF_SAFE_BALANCE_HISTORY_QUERY,
} from "@/sanity/lib/queries";
import SafeBalanceCard from "./SafeBalanceCard";
// import FilterComponent from "@/components/FilterBar/FilterComponent";
import { useSearchParams, useRouter } from "next/navigation";
import FilterComponent from "@/components/FilterBar/filterbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeOrderHistory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSafeBalance, setCurrentSafeBalance] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") ||  "desc",
    startDate:  null,
    endDate: null,
  });
  const [currentPage,setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const recordsPerPage = parseInt(searchParams.get("recordsPerPage") || "5");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const indexOfLastRecord = currentPage * recordsPerPage - 1;
      const indexOfFirstRecord = indexOfLastRecord - recordsPerPage + 1;
      try {
        const sortOrder = filters.sort === "desc" ? "desc" : "asc";
        const queryParams = {
          indexOfLastRecord,
          indexOfFirstRecord,
          query: filters.query || "", // Ensure query is always defined
          sortOrder: filters.sort || "asc",
          startDate: filters.startDate ? filters.startDate : null,
          endDate: filters.endDate ? filters.endDate : null,
        };

        console.log(queryParams);

        const [currentSafe, historyData, total] = await Promise.all([
          client
            .withConfig({ useCdn: false })
            .fetch(GET_CURRENT_SAFE_BALANCE_QUERY),
          client.fetch(
            GET_SAFE_BALANCE_HISTORY_BY_PAGINATION_QUERY.replace(
              "$sortOrder",
              sortOrder
            ),
            queryParams
          ),
          client.fetch(TOTAL_NUMBER_OF_SAFE_BALANCE_HISTORY_QUERY),
        ]);

        setCurrentSafeBalance(currentSafe?.value || 0);

        // sort history data by _updatedAt and filter.sort
        historyData.sort((a, b) => {
          return filters.sort === "asc"
            ? new Date(a._updatedAt) - new Date(b._updatedAt)
            : new Date(b._updatedAt) - new Date(a._updatedAt);
        });
        setRawData(historyData);
        console.log(historyData);
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
    setFilters({...newFilters, sort: newFilters.sortOrder});
    // router.push("?page=1"); // Reset to first page on filter change
  };

  const nPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div className="p-8 h-screen w-full flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">
        Daily Safe Balance History
      </h1>
      <FilterComponent onFilterChange={handleFilterChange} />

      <div className="flex items-center rounded-lg px-3 py-2 w-fit">
        <p className="text-black font-semibold">Available Safe Balance</p>
        <div className="ml-3 border border-gray-300 rounded-md px-3 py-1">
          <span className="text-black">$ {currentSafeBalance}</span>
        </div>
      </div>

      <div className="flex-col w-full h-[54vh] rounded-md border shadow-inner-lg overflow-y-scroll items-center">
        {isLoading
          ? [1, 2, 3, 4, 5].map((_, index) => (
              <SkeletonSafeBalanceCard key={index} />
            ))
          : rawData.map((item, index) => (
              <SafeBalanceCard key={index} item={item} />
            ))}
      </div>

      <div className="flex w-full justify-center">
        <Pagination
          nPages={nPages}
          currentPage={currentPage}
          setPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

const SkeletonSafeBalanceCard = () => {
  return (
    <div className="w-full space-y-4 border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between">
      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
};