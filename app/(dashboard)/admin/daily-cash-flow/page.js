"use client";

import { useState, useEffect } from "react";
import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import SafeBalanceCard from "./SafeBalanceCard";
import FilterComponent from "@/components/FilterBar/filterbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCurrentSafeBalance,
  getSafeBalanceHistory,
} from "@/lib/actions/safeBalance";
import { useToast } from "@/hooks/use-toast";
import { getAllLocations } from "@/lib/actions/location";
import { useSession } from "@/context/SessionContext";

export default function EmployeeOrderHistory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSafeBalance, setCurrentSafeBalance] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationName, setLocationName] = useState("");

  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") || "desc",
    startDate: searchParams.get("startDate") || null,
    endDate: searchParams.get("endDate") || null,
    location: searchParams.get("location") || "",
  });
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const recordsPerPage = parseInt(searchParams.get("recordsPerPage") || "5");

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const result = await getAllLocations();
        if (result.status === "SUCCESS" && result.data) {
          setLocations(result.data);
          if (searchParams.get("location")) {
            setLocationName(
              result.data.find((loc) => loc._id === searchParams.get("location"))?.name || ""
            );
          }
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (user) {
      fetchLocations();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get locationId from searchParams if available
        const locationId = searchParams.get("location") || null;

        const [currentBalanceResult, historyResult] = await Promise.all([
          locationId
            ? getCurrentSafeBalance(locationId)
            : Promise.resolve({ status: "SUCCESS", data: { value: 0 } }),
          getSafeBalanceHistory({
            page: currentPage,
            limit: recordsPerPage,
            query: filters.query,
            sortOrder: filters.sort,
            startDate: filters.startDate,
            endDate: filters.endDate,
            locationId: locationId,
          }),
        ]);

        if (currentBalanceResult.status === "SUCCESS") {
          setCurrentSafeBalance(currentBalanceResult.data.value || 0);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: currentBalanceResult.error,
          });
        }

        if (historyResult.status === "SUCCESS") {
          setRawData(historyResult.data.history);
          setTotalRecords(historyResult.data.total);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: historyResult.error,
          });
        }
      } catch (error) {
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
  }, [currentPage, recordsPerPage, filters, searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, sort: newFilters.sortOrder });

    setLocationName(
      locations.find((loc) => loc._id === newFilters.location)?.name || ""
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const nPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div className="p-8 h-screen w-full flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">
        Daily Safe Balance History
      </h1>
      <FilterComponent
        onFilterChange={handleFilterChange}
        initialLocation={filters.location}
        locations={locations}
        isLoadingLocations={isLoadingLocations}
        showLocationSelector={
          user?.hasAllLocationsAccess ||
          (user?.locationIds && user?.locationIds.length > 1)
        }
      />

      <div className="flex items-center rounded-lg px-3 py-2 w-fit">
        <p className="text-black font-semibold">
          Available Safe Balance
          {locationName && (
            <span className="text-sm ml-2">({locationName})</span>
          )}
        </p>
        <div className="ml-3 border border-gray-300 rounded-md px-3 py-1">
          <span className="text-black">
            $ {currentSafeBalance?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      <div className="flex-col w-full h-[54vh] rounded-md border shadow-inner-lg overflow-y-scroll items-center">
        {isLoading
          ? [1, 2, 3, 4, 5].map((_, index) => (
              <SkeletonSafeBalanceCard key={index} />
            ))
          : rawData.map((item, index) => (
              <SafeBalanceCard key={item._id} item={item} />
            ))}
      </div>

      <div className="flex w-full justify-center">
        <Pagination
          nPages={nPages}
          currentPage={currentPage}
          setPage={handlePageChange}
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
