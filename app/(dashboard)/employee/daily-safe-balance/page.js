"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination/Pagination";
import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import BottomContainer from "./BottomContainer";
import { processCashSummaryData } from "@/lib/utils";
import FilterPage from "@/components/FilterBar/filterbar";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCashSummariesByDateRange,
  getCurrentSafeBalance,
} from "@/lib/actions/cashSummary";
import { getAllLocations, getLocationById } from "@/lib/actions/location";
import { useSession } from "@/context/SessionContext";

export default function DailySafeBalance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [currentSafeBalance, setCurrentSafeBalance] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

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
  const recordsPerPage = parseInt(searchParams.get("recordsPerPage") || "12");

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        let result;

        if (
          user &&
          !user.hasAllLocationsAccess &&
          user.locationIds &&
          user.locationIds.length === 1
        ) {
          // User has only one location
          result = await getLocationById(user.locationIds[0]);
          if (result.status === "SUCCESS") {
            setLocations([result.data]);
            // Set the location filter if not already set
            if (!filters.location) {
              setFilters((prev) => ({ ...prev, location: result.data._id }));
              setLocationName(result.data.name || "");
            }
          }
        } else {
          // User has multiple locations or all access
          result = await getAllLocations();
          if (result.status === "SUCCESS" && result.data) {
            setLocations(result.data);
            if (searchParams.get("location")) {
              setLocationName(
                result.data.find(
                  (loc) => loc._id === searchParams.get("location")
                )?.name || ""
              );
            }
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

  // Fetch safe balance data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!filters.location) {
          // Clear data when no location is selected
          setCurrentSafeBalance(null);
          setLocationName("");
        } else {
          const safeBalanceResponse = await getCurrentSafeBalance(
            filters.location
          );
          if (safeBalanceResponse.status === "SUCCESS") {
            setCurrentSafeBalance(safeBalanceResponse.data.value);
            // setLocationName(safeBalanceResponse.data.locationName);
          } else {
            // Handle error
            setCurrentSafeBalance(null);
            setLocationName("");
            console.error(
              "Error fetching safe balance:",
              safeBalanceResponse.error
            );
          }
        }

        // Calculate date range for pagination
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        // Get cash summaries with pagination
        const cashSummariesResponse = await getCashSummariesByDateRange(
          startDate,
          endDate,
          currentPage,
          recordsPerPage,
          filters.sort,
          filters.location
        );

        if (cashSummariesResponse.status === "SUCCESS") {
          const { data, total } = cashSummariesResponse;
          setGroupedData(processCashSummaryData(data, filters.sort));
          setTotalRecords(total);
        } else {
          // Handle error
          setGroupedData([]);
          setTotalRecords(0);
          console.error("Error fetching cash summaries:", cashSummariesResponse.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setCurrentSafeBalance(null);
        setGroupedData([]);
        setTotalRecords(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, recordsPerPage, filters]);

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
    <div className="p-8 h-[95vh] w-full flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">Daily Safe Balance</h1>

      <FilterPage
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

      <BottomContainer
        currentSafeBalance={currentSafeBalance}
        locationId={filters.location}
        locationName={locationName}
      />
    </div>
  );
}
