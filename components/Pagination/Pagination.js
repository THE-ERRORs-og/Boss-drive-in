"use client";

import { useRouter, useSearchParams } from "next/navigation";
// If you moved the helper into utils.ts, use the line below:
import { generatePagination } from "@/lib/utils.js";
// If you kept it in utils.js instead, use this:
// import { generatePagination } from "@/lib/utils.js";

export default function Pagination({
  nPages,
  currentPage,
  setPage = () => {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCurrentPage = (pageNumber) => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ""
    );
    params.set("page", String(pageNumber));
    router.replace(`?${params.toString()}`);
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

  const pages = generatePagination(nPages, currentPage);

  return (
    <nav>
      <ul className="inline-flex -space-x-px text-xl font-semibold">
        <li className="page-item">
          <a
            className="page-link flex items-center justify-center h-10 ml-1 px-2 text-md md:px-6 md:ml-2 md:h-10 border border-black rounded-xl text-black hover:bg-gray-300"
            onClick={goToPrevPage}
            href="#"
            aria-disabled={currentPage === 1}
          >
            Previous
          </a>
        </li>

        {pages.map((pgNumber, index) => (
          <li key={index} className="page-item">
            {pgNumber === "..." ? (
              <span className="px-3 ml-1 h-10 md:px-4 md:ml-2 md:h-11">
                ...
              </span>
            ) : (
              <a
                onClick={(event) => goToPage(pgNumber, event)}
                className={`page-link flex items-center justify-center px-3 ml-1 h-10 md:px-4 md:ml-2 md:h-11 border border-black rounded-full text-black hover:bg-gray-300 ${
                  currentPage === pgNumber ? "bg-gray-600 text-white" : ""
                }`}
                href="#"
                aria-current={currentPage === pgNumber ? "page" : undefined}
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
            aria-disabled={currentPage === nPages}
          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
}
