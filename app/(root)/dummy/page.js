"use client";

import { createCashSummary, deleteAllCashSummaries } from "@/lib/actions/cashSummary";
import React, { useState } from "react";

const InsertCashSummary = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const generateDummyData = () => {
    const dummyData = [];
    const shifts = [1, 2, 3, 4]; // Shift numbers
    const baseDate = new Date(); // Current date

    // Generate data for 5 consecutive days from 5 days ago to today
    for (let i = -5; i <= 0; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + i); // Adjust date from 5 days ago to today

      shifts.forEach((shift) => {
        // Generate random values, ensuring expectedCloseoutCash is always higher than deductions
        const expectedCloseoutCash = Math.random() * 500 + 100; // Between 100 and 600
        const startingRegisterCash = Math.random() * 300 + 50; // Between 50 and 350
        const onlineTipsToast = Math.random() * 50; // Between 0 and 50
        const onlineTipsKiosk = Math.random() * 50; // Between 0 and 50
        const onlineTipCash = Math.random() * 50; // Between 0 and 50

        // Calculate total tip deduction
        const totalTipDeduction =
          onlineTipCash + onlineTipsKiosk + onlineTipsToast;

        // Ensure ownedToRestaurantSafe is non-negative
        const ownedToRestaurantSafe = Math.max(
          0,
          expectedCloseoutCash - startingRegisterCash - totalTipDeduction
        );

        dummyData.push({
          expectedCloseoutCash,
          startingRegisterCash,
          onlineTipsToast,
          onlineTipsKiosk,
          onlineTipCash,
          totalTipDeduction,
          ownedToRestaurantSafe,
          datetime: currentDate.toISOString(), // Set the date for the data
          shiftNumber: shift,
        });
      });
    }

    return dummyData;
  };

  const insertData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const dummyData = generateDummyData();
      console.log(dummyData);

      // Assuming you're calling an API to insert data
       dummyData.forEach(async (data,idx) => {
        const response = await createCashSummary(data);
        const result = response;
        if (result.status === "SUCCESS") {
          setMessage(`Dummy data ${idx} inserted successfully!`);
        } else {
          setMessage("Failed to insert dummy data.");
        }
      });
    } catch (error) {
      console.error("Error inserting data", error);
      setMessage("An error occurred while inserting data.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAllData = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Assuming you're calling an API to delete all data
      const response =await deleteAllCashSummaries();
    } catch (error) {
      console.error("Error deleting data", error);
      setMessage("An error occurred while deleting data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Insert Dummy Cash Summary Data</h2>
      <button
        onClick={insertData}
        className={`btn ${loading ? "btn-disabled" : "btn-primary"}`}
        disabled={loading}
      >
        {loading ? "Inserting..." : "Insert Dummy Data"}
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}

      <br/>
      <button  onClick={deleteAllData} className="bg-red">delete all document of cash summary </button>
    </div>
  );
};

export default InsertCashSummary;
