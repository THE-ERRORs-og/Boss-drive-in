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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 w-full">
        {/* Form */}
        <h1 className="text-lg font-semibold mb-4">
          Enter the details of employee you want to add:
        </h1>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2">
            <div className="">
              <h1 className="text-lg font-medium place-content-center m-4">
                Enter name of new member
              </h1>
              <h1 className="text-lg font-medium place-content-center m-4">
                Create password for new member
              </h1>
              <h1 className="text-lg font-medium place-content-center m-4">
                Confirm password for new member
              </h1>
            </div>
            <div className="mb-10 gap-2 items-center flex flex-col place-content-center">
              <input
                type="text"
                name="expectedCloseoutCash"
                placeholder="Albert Anthony"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="startingRegisterCash"
                placeholder="******"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="startingRegisterCash"
                placeholder="******"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[20vw] bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
            >
              Add member
            </button>
          </div>
        </form>
        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-medium">
                Are you sure to add the member
              </p>
              <div className="">
                <button
                  onClick={closePopup}
                  className="m-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
                >
                  Add Member
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
    </div>
  );
}
