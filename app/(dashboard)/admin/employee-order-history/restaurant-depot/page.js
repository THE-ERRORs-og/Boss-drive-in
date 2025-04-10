"use client";

import Pagination from "@/components/Pagination/Pagination";
import React, { useEffect, useState } from "react";
import OrderSummaryCard from "../view/OrderSummaryCard";
import { useSearchParams } from "next/navigation";
import FilterComponent from "@/components/FilterBar/filterbar";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderHistoryByType } from "@/lib/actions/orderHistory";
import { useToast } from "@/hooks/use-toast";

export default function RestaurantDepotOrderHistory() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState([]);
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
        const result = await getOrderHistoryByType("restaurant-depot", {
          page: currentPage,
          limit: recordsPerPage,
          query: filters.query,
          sort: filters.sort,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        if (result.status === "SUCCESS") {
          setRawData(result.data.orders);
          setTotalRecords(result.data.totalRecords);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to fetch Restaurant Depot order history",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, recordsPerPage, filters, toast]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, sort: newFilters.sortOrder });
  };

  const nPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div className="p-8 h-screen w-screen flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">Restaurant Depot Order History</h1>

      <FilterComponent onFilterChange={handleFilterChange} />

      <div className="h-[54vh] rounded-md border shadow-inner-lg w-full m-4 overflow-y-scroll">
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