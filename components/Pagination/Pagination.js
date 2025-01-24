"use client";

import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ nPages, currentPage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageNumbers = [...Array(nPages + 1).keys()].slice(1);

  const setCurrentPage = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber); // Update the page parameter
    router.push(`?${params.toString()}`); // Push the updated query params to the URL
  };
  
  const goToNextPage = (event) => {
    event.preventDefault();
    if (currentPage !== nPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = (event) => {
    event.preventDefault();
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber, event) => {
    event.preventDefault();
    setCurrentPage(pageNumber);
  };

  return (
    <nav>
      <ul className=" inline-flex -space-x-px text-xl font-semibold">
        <li className="page-item">
          <a
            className="page-link flex items-center justify-center h-10 ml-1 px-2 text-md md:px-6  md:ml-2 md:h-10 ms-0 leading-tight  border border-black border-e-1 rounded-xl    text-black dark:text-black hover:bg-gray-300 dark:hover:bg-gray-300"
            onClick={goToPrevPage}
            href="#"
          >
            Previous
          </a>
        </li>
        {pageNumbers.map((pgNumber) => (
          <li
            key={pgNumber}
            className={`page-item ${currentPage == pgNumber ? "active" : ""} `}
          >
            <a
              onClick={(event) => goToPage(pgNumber, event)}
              className="page-link flex items-center justify-center px-3 ml-1 h-10 md:px-4 md:ml-2 md:h-11 leading-tight border border-black rounded-full bg-white dark:bg-wite  dark:border-gray-300 text-black dark:text-black hover:bg-gray-300 dark:hover:bg-gray-300 "
              href="#"
            >
              {pgNumber}
            </a>
          </li>
        ))}
        <li className="page-item">
          <a
            className="page-link   flex items-center justify-center  h-10 ml-1 px-2 text-md md:px-6  md:ml-2 md:h-10 ms-0 leading-tight  border border-black border-e-1 rounded-xl    text-black dark:text-black hover:bg-gray-300 dark:hover:bg-gray-300"
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
