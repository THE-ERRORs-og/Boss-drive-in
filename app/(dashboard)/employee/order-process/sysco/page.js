"use client";
import MainButton from "@/components/Button/MainButton";
import React from "react";

const Page = () => {
  const [selectedDate, setSelectedDate] = React.useState("2025-03-31");

  return (
    <div className="h-screen bg-white flex flex-col items-center">
      <div className="w-full flex justify-between items-center m-4 px-6">
        <p className="text-base font-semibold text-red-500">
          Staff Name:{" "}
          <span className="text-black">Shivam Krishan Varshney</span>
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
            <select className="border border-gray-300 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option>5am - 11am</option>
              <option>11am - 5pm</option>
              <option>5pm - 11pm</option>
            </select>
          </div>
        </div>
      </div>
      <h1 className="text-center text-4xl font-bold">SYSCO</h1>
      <form className="w-full max-w-6xl px-6 mt-6">
        <div className="grid grid-cols-5 gap-4  text-center font-bold text-lg mb-4">
          <p className="text-left">Item Name</p>
          <p>Yesterday Order</p>
          <p>BOH</p>
          <p>Total</p>
          <p>Order</p>
        </div>
        {["Cookies", "Bags", "Candy"].map((item) => (
          <div className="grid grid-cols-5 gap-4 items-center mb-4" key={item}>
            <p className="text-left text-lg font-medium">{item}</p>
            <input
              type="text"
              placeholder="Yesterday Order"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              placeholder="BOH"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              placeholder="Total"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              placeholder="Order"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}
        <div className="flex justify-center mt-6">
          <MainButton
            type="submit"
            text="Submit"
            className=" bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
          />
        </div>
      </form>
    </div>
  );
};

export default Page;
