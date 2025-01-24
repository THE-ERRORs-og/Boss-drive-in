"use client";
import { useState } from "react";
export default function Page() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsPopupVisible(true); // Show the popup
    // Logic for PDF generation and download can be added here
  };

  const closePopup = () => {
    setIsPopupVisible(false); // Hide the popup
  };

  const data = [
    {
      id: 1,
      name: "Albert Anthony",
    },
    {
      id: 2,
      name: "John Doe",
    },
    {
      id: 3,
      name: "Jane Doe",
    },
    {
      id: 4,
      name: "Michael Smith",
    },
    {
      id: 5,
      name: "Robert Johnson",
    },
  ];

  return (
    <div className="m-5">
      <h1 className="font-semibold">Remove the member you want to remove:</h1>
      {data.map((item) => (
        <div
          key={item.id}
          className="flex w-full items-center content-center p-2"
        >
          <div className="rounded-lg border-2 w-[60vw] p-2">
            <p>
              {item.id}. {item.name}
            </p>
          </div>
          <button className="m-2 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300">
            View Profile
          </button>
          <button
            onClick={handleFormSubmit}
            className="m-2 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
          >
            Remove
          </button>
        </div>
      ))}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">
              Are you sure to remove the member
            </p>
            <div className="">
              <button
                onClick={closePopup}
                className="m-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Remove Member
              </button>
              <button
                onClick={closePopup}
                className="m-4 px-6 py-2 border-2 rounded-lg font-medium transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
