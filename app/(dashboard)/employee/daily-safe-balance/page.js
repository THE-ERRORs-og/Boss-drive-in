"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination/Pagination";
import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import BottomContainer from "./BottomContainer";
import { processCashSummaryData } from "@/lib/utils";
import FilterPage from "@/components/FilterBar/filterbar";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getCashSummariesByDateRange, getCurrentSafeBalance } from "@/lib/actions/cashSummary";

export default function DailySafeBalance() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [currentSafeBalance, setCurrentSafeBalance] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") || "desc",
    startDate: searchParams.get("startDate") || null,
    endDate: searchParams.get("endDate") || null,
  });

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const recordsPerPage = parseInt(searchParams.get("recordsPerPage") || "12");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current safe balance
        const safeBalanceResponse = await getCurrentSafeBalance();
        if (safeBalanceResponse.status === "SUCCESS") {
          setCurrentSafeBalance(safeBalanceResponse.data.value);
        }

        // Calculate date range for pagination
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        // Get cash summaries with pagination
        const cashSummariesResponse = await getCashSummariesByDateRange(
          startDate,
          endDate,
          currentPage,
          recordsPerPage,
          filters.sort
        );

        if (cashSummariesResponse.status === "SUCCESS") {
          const { data, total } = cashSummariesResponse;
          setGroupedData(processCashSummaryData(data, filters.sort));
          setTotalRecords(total);
        }
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
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams);
    params.set("query", newFilters.query || "");
    params.set("sort", newFilters.sortOrder || "desc");
    if (newFilters.startDate) params.set("startDate", newFilters.startDate);
    if (newFilters.endDate) params.set("endDate", newFilters.endDate);
    params.set("page", "1"); // Reset to first page when filters change
    
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const nPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div className="p-8 h-[95vh] w-full flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">Daily Safe Balance</h1>
      <FilterPage onFilterChange={handleFilterChange} />

      <div className="flex items-center rounded-lg px-3 py-2 w-fit">
        <p className="text-black font-semibold">Available Safe Balance</p>
        <div className="ml-3 border border-gray-300 rounded-md px-3 py-1">
          <span className="text-black">$ {currentSafeBalance?.toFixed(2) || "0.00"}</span>
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
        <Pagination 
          nPages={nPages} 
          currentPage={currentPage} 
          setPage={handlePageChange} 
        />
      </div>

      <BottomContainer currentSafeBalance={currentSafeBalance} />
    </div>
  );
}
