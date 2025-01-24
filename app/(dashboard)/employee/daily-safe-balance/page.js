import MainButton from "@/components/Button/MainButton";
import Pagination from "@/components/Pagination/Pagination";
import ScrollViewer from "@/components/ScrollViewer/ScrollViewer";
import StaticDataBox from "@/components/Textbox/StaticDataBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processCashSummaryData } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import {
  CASH_SUMMARY_BY_PAGINATION_QUERY,
  TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY,
} from "@/sanity/lib/queries";
import { ArrowDownWideNarrow, ListFilter, Search } from "lucide-react";

export default async function DailySafeBalance({ searchParams }) {
  const processInfo = await client.fetch(TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY); //this will be info array and we will be using length of info for pagination
  // const [currentPage, setCurrentPage] = useState(1);
  // const [recordsPerPage] = useState(5);
  const searchParamsv = await searchParams;

  const currentPage = parseInt(searchParamsv.page || 1); // Default to page 1
  const recordsPerPage = parseInt(searchParamsv.recordsPerPage || 12);
  const indexOfLastRecord = currentPage * recordsPerPage - 1;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage + 1;

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsPopupVisible(true); // Show the popup
    // Logic for PDF generation and download can be added here
  };

  const closePopup = () => {
    setIsPopupVisible(false); // Hide the popup
  };

  const nPages = Math.ceil(processInfo / recordsPerPage);
  const rawData = await client.fetch(CASH_SUMMARY_BY_PAGINATION_QUERY, {
    indexOfLastRecord,
    indexOfFirstRecord,
  });
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
      <div className="flex w-full justify-between pl-8 pr-8 space-x-3 items-center">
        <MainButton
          className="md:text-xl md:w-1/3"
          text="Deposit to bank & Download PDF"
        />
        <div className="flex w-2/3 justify-end space-x-6 items-center">
          <p className="text-md md:text-2xl font-semibold">
            Available Safe Balance
          </p>
          <StaticDataBox text="$1000" className="text-md pr-8 md:w-1/6 " />
        </div>
      </div>

      {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium">Your PDF has been downloaded !!</p>
                <button
                  onClick={closePopup}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>)}
    </div>
  );
}
