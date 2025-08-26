"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";
import {
  ListFilter,
  Search,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  MapPin,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";

export default function FilterComponent({
  query: defaultQuery = "",
  sortOrder: defaultSortOrder = "desc",
  dateRange: defaultDateRange = { start: null, end: null },
  locations = [],
  initialLocation = "",
  showLocationSelector = true,
  isLoadingLocations = false,
  onFilterChange,
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [location, setLocation] = useState(initialLocation);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  useEffect(() => {
    if (isInitialRender) {
      // Only call onFilterChange on initial render without updating URL
      const startDate = dateRange.start ? dateRange.start.toISOString() : null;
      const endDate = dateRange.end ? dateRange.end.toISOString() : null;
      onFilterChange?.({ query, sortOrder, location, startDate, endDate });
      setIsInitialRender(false);
      return;
    }
    
    // Only update URL after the initial render
    const params = new URLSearchParams();
    const startDate = dateRange.start ? dateRange.start.toISOString() : null;
    const endDate = dateRange.end ? dateRange.end.toISOString() : null;
    
    if (query) params.set("query", query);
    if (sortOrder) params.set("sort", sortOrder);
    if (dateRange.start && dateRange.end) {
      params.set("startDate", dateRange.start.toISOString());
      params.set("endDate", dateRange.end.toISOString());
    }
    if (location) params.set("location", location);
    
    router.replace(`?${params.toString()}`); // replace instead of push
    onFilterChange?.({ query, sortOrder, location, startDate, endDate });
  }, [query, sortOrder, location, dateRange]);

  return (
    <div className="flex flex-col w-full items-center p-6">
      <div className="flex w-full items-center space-x-2">
        {/* Filter Button */}
        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300"
          onClick={() => setIsFilterOpen(true)}
        >
          Filter <ListFilter className="!size-6" />
        </Button>

        {/* Search Input */}
        <div className="relative w-full flex-1">
          <Input
            type="search"
            className="bg-white text-black border border-gray-300"
            placeholder="Search for keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute bg-white m-1 inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search />
          </div>
        </div>

        {/* Location Selector */}
        {showLocationSelector && locations.length > 0 && (
          <div className="relative min-w-[200px] max-w-[250px]">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoadingLocations}
              className="w-full bg-white text-black border border-gray-300 rounded-md py-2 px-3 pr-10 
                 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 truncate"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Sort Button */}
        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Sort{" "}
          {sortOrder === "asc" ? (
            <ArrowDownWideNarrow className="!size-6" />
          ) : (
            <ArrowUpWideNarrow className="!size-6" />
          )}
        </Button>
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-4 mt-4">
            {/* Start Date */}
            <div>
              <p className="text-sm font-semibold">Start Date</p>
              <Calendar
                mode="single"
                selected={dateRange.start}
                onSelect={(date) =>
                  setDateRange((prev) => ({ ...prev, start: date }))
                }
              />
            </div>

            {/* End Date */}
            <div>
              <p className="text-sm font-semibold">End Date</p>
              <Calendar
                mode="single"
                selected={dateRange.end}
                onSelect={(date) =>
                  setDateRange((prev) => ({ ...prev, end: date }))
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
