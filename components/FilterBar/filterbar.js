"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListFilter, Search, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";

export default function FilterComponent({
  query: defaultQuery = "",
  sortOrder: defaultSortOrder = "desc",
  dateRange: defaultDateRange = { start: null, end: null },
  onFilterChange,
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    const startDate = dateRange.start ? dateRange.start.toISOString() : null;
    const endDate = dateRange.end ? dateRange.end.toISOString() : null;
    if (query) params.set("query", query);
    if (sortOrder) params.set("sort", sortOrder);
    if (dateRange.start && dateRange.end) {
      params.set("startDate", dateRange.start.toISOString());
      params.set("endDate", dateRange.end.toISOString());
    }
    router.push(`?${params.toString()}`);
    onFilterChange?.({ query, sortOrder,startDate , endDate });
  }, [query, sortOrder, dateRange]);

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

        {/* Sort Button */}
        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300"
          onClick={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
        >
          Sort {sortOrder=== "asc" ? <ArrowDownWideNarrow className="!size-6" /> : <ArrowUpWideNarrow className="!size-6" />}
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
          <Button
            className="mt-4 w-auto bg-blue-600 text-white hover:bg-blue-500"
            onClick={() => setIsFilterOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
