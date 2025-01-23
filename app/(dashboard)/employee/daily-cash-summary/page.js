"use client";
import { useState } from "react";

export default function Page() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  
  const timeOptions = ["5am - 11am", "11am - 5pm", "5pm - 11pm", "11pm - 5am"];

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsPopupVisible(true); // Show the popup
    // Logic for PDF generation and download can be added here
  };

  const closePopup = () => {
    setIsPopupVisible(false); // Hide the popup
  };

  return (
    <div>
      {/* <h1>Route: /employee/daily-cash-summary</h1> */}
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Content */}
        <div className="flex flex-col px-8 py-2">
          {/* Staff Details */}
          <div className="w-full flex justify-between items-center m-4 px-6">
        <p className="text-base font-semibold text-red-500">
          Staff Name: <span className="text-black">XXXXXXXXXX</span>
        </p>
        <div className="flex space-x-4 items-center">
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Date:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Shift Time:</p>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="" disabled>
                Select Time
              </option>
              {timeOptions.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

          {/* Form Fields */}
          <form className="space-y-2" onSubmit={handleFormSubmit}>
            {/* Cashout Fields */}
            <div className="grid grid-cols-2">
              <div className="">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Expected Closeout Cash
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Starting Register Cash
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Online Tips */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-bold">Online Tips</p>
              </div>
              <div>
                <p className="text-lg font-bold">Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Toast
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Kiosk
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Cash
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <hr className="my-4 border-gray-300 font-extrabold" />

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Total Tip Deduction
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Owned To Restaurant Safe
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  placeholder="$XX"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  placeholder="$XX"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-auto px-10 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Submit & Download PDF
              </button>
            </div>
          </form>

          {/* Popup */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
