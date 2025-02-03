
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ nPages, currentPage, setPage = () => {} }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCurrentPage = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber); // Update the page parameter
    router.push(`?${params.toString()}`); // Push the updated query params to the URL
    setPage(pageNumber);
  };

  const goToNextPage = (event) => {
    event.preventDefault();
    if (currentPage < nPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = (event) => {
    event.preventDefault();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber, event) => {
    event.preventDefault();
    setCurrentPage(pageNumber);
  };

  // Generate dynamic pagination with proper ellipsis handling
  const getPageNumbers = () => {
    if (nPages <= 6) return [...Array(nPages).keys()].map((x) => x + 1);
    
    let pages = [1];
    if (currentPage > 3) pages.push("...");
    
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(nPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < nPages - 2) pages.push("...");
    pages.push(nPages);
    
    return pages;
  };

  return (
    <nav>
      <ul className="inline-flex -space-x-px text-xl font-semibold">
        <li className="page-item">
          <a
            className="page-link flex items-center justify-center h-10 ml-1 px-2 text-md md:px-6 md:ml-2 md:h-10 border border-black rounded-xl text-black hover:bg-gray-300"
            onClick={goToPrevPage}
            href="#"
          >
            Previous
          </a>
        </li>
        {getPageNumbers().map((pgNumber, index) => (
          <li key={index} className={`page-item `}>
            {pgNumber === "..." ? (
              <span className="px-3 ml-1 h-10 md:px-4 md:ml-2 md:h-11">...</span>
            ) : (
              <a
                onClick={(event) => goToPage(pgNumber, event)}
                className={`page-link flex items-center justify-center px-3 ml-1 h-10 md:px-4 md:ml-2 md:h-11 border border-black rounded-full bg-white text-black hover:bg-gray-300 ${currentPage === pgNumber ? "bg-gray-600 text-white" : ""}`}
                href="#"
              >
                {pgNumber}
              </a>
            )}
          </li>
        ))}
        <li className="page-item">
          <a
            className="page-link flex items-center justify-center h-10 ml-1 px-2 text-md md:px-6 md:ml-2 md:h-10 border border-black rounded-xl text-black hover:bg-gray-300"
            onClick={goToNextPage}
            href="#"
          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
