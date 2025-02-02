"use client";

import Pagination from "@/components/Pagination/Pagination";
import React, { useEffect } from "react";
import { useState } from "react";
import OrderSummaryCard from "./OrderSummaryCard";
import { useSearchParams } from "next/navigation";
import { GET_ORDER_SUMMARY_BY_PAGINATION_QUERY, TOTAL_NUMBER_OF_ORDER_SUMMARY_QUERY } from "@/sanity/lib/queries";
import FilterComponent from "@/components/FilterBar/filterbar";
import { client } from "@/sanity/lib/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeOrderHistory() {
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState([]);
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

        const [historyData, total] = await Promise.all([
          client.fetch(
            GET_ORDER_SUMMARY_BY_PAGINATION_QUERY.replace(
              /\$sortOrder/g,
              sortOrder
            ),
            queryParams
          ),
          client.fetch(TOTAL_NUMBER_OF_ORDER_SUMMARY_QUERY),
        ]);

        
        // sort history data by _updatedAt and filter.sort
        historyData.sort((a, b) => {
          return filters.sort === "asc"
            ? new Date(a._updatedAt) - new Date(b._updatedAt)
            : new Date(b._updatedAt) - new Date(a._updatedAt);
        });
        // console.log(historyData);
        setRawData(historyData);
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
    <div className="p-8 h-screen w-screen flex flex-col items-center ">
      <h1 className="text-3xl font-semibold mb-4">Employee Order History</h1>

      <FilterComponent onFilterChange={handleFilterChange} />

      <div className="h-[54vh] rounded-md border shadow-inner-lg  w-full m-4 overflow-y-scroll">
        {isLoading
          ? [1, 2, 3, 4, 5].map((item, index) => (
              <SkeletonOrderSummaryCard key={index} />
            ))
          : rawData.map((item, index) => (
              <OrderSummaryCard key={index} item={item} />
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


const SkeletonOrderSummaryCard = () => {
  return (
    <div className="w-full space-y-4 border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between">
      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
};