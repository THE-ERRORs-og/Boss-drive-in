import Pagination from "@/components/Pagination/Pagination";
import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import BottomContainer from "./BottomContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processCashSummaryData } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import {
  CASH_SUMMARY_BY_PAGINATION_QUERY,
  GET_CURRENT_SAFE_BALANCE_QUERY,
  TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY,
} from "@/sanity/lib/queries";
import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react";

export default async function DailySafeBalance({ searchParams }) {
  const searchParamsv = await searchParams;
  
  const currentPage = parseInt(searchParamsv.page || 1); // Default to page 1
  const recordsPerPage = parseInt(searchParamsv.recordsPerPage || 12);
  const indexOfLastRecord = currentPage * recordsPerPage - 1;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage + 1;
  
const [current_safe_balance, rawData, processInfo] = await Promise.all([
  client.withConfig({useCdn:false}).fetch(GET_CURRENT_SAFE_BALANCE_QUERY),
  client.fetch(CASH_SUMMARY_BY_PAGINATION_QUERY, {
    indexOfLastRecord,
    indexOfFirstRecord,
  }),
  client.fetch(TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY),
]);

  const nPages = Math.ceil(processInfo / recordsPerPage);
  const groupedData = processCashSummaryData(rawData);

  return (
    <div className="p-8 h-screen w-screen flex flex-col items-center space-y-4 ">
      <div className="flex w-full lg:w-1/2 items-center space-x-2 ">
        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300 "
          varient="outline"
        >
          Filter <ListFilter className="!size-6" />
        </Button>

        <div className="relative w-full">
          <Input
            type="search"
            className="bg-white text-black border border-gray-300"
            placeholder="Search for keyword"
          />
          <div className="absolute bg-white m-1 inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search />
          </div>
        </div>

        <Button
          className="bg-white text-xl text-black border border-gray-300 hover:bg-gray-300 "
          varient="outline"
        >
          Sort <ArrowDownWideNarrow className="!size-6" />
        </Button>
      </div>
      <ScrollViewer groupedData={groupedData} />
      <div className="flex w-full justify-center">
        <Pagination nPages={nPages} currentPage={currentPage} />
      </div>
      <BottomContainer currentSafeBalance={current_safe_balance} />

    </div>
  );
}
