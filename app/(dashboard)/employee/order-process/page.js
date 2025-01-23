"use client";

import React, { useState } from "react";

export default function Page() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeOptions = ["5am - 11am", "11am - 5pm", "5pm - 11pm", "11pm - 5am"];
  return (
    <div className="h-screen bg-white flex flex-col items-center">
      {/* Staff and Time Details */}
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

      {/* Form Section */}
      <div className="flex flex-col items-center w-full px-6 mt-6">
        <form className="w-full max-w-3xl">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 text-center font-bold text-lg mb-4">
            <p> </p>
            <p>BOH</p>
            <p>Cash Order</p>
            <p>Inventory</p>
          </div>

          {/* Input Rows */}
          {["Napkin", "Cup", "Candy", "Water"].map((item) => (
            <div
              className="grid grid-cols-4 gap-4 items-center mb-4"
              key={item}
            >
              <div>
                <p className="text-left text-lg font-medium">{item}</p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="$---"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="$---"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="$---"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          ))}

          {/* Place Order Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-10 py-3 bg-red-500 text-white rounded-lg text-lg font-medium hover:bg-red-600 transition duration-300"
            >
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
