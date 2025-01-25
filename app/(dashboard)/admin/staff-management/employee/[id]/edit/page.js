"use client";

import { useState } from "react";
export default function Page() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const closePopup = () => {
    setIsPopupVisible(false);
  }

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsPopupVisible(true); // Show the popup
    // Logic for PDF generation and download can be added here
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      {/* <h1>Route: /admin/staff-management/employee/edit</h1> */}
      <h1 className="font-semibold">Enter New Password</h1>
      <input
        type="password"
        className="border-2 border-gray-300 p-2 rounded-md w-[40vw]"
        placeholder="Enter New Password"
      />
      <h1 className="font-semibold">Confirm New Password</h1>
      <input
        type="password"
        className="border-2 border-gray-300 p-2 rounded-md w-[40vw]"
        placeholder="Confirm New Password"
      />
      <button
        onClick={handleFormSubmit}
        className="mt-4 w-[20vw] px-6 py-3 bg-red-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
      >
        Change Password
      </button>

      {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-medium">
                Are You Sure You Want to Change Your Password?
              </p>

              <div className="flex justify-center mt-6 gap-2 ">
              <button
                onClick={closePopup}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 w-auto"
              >
                Change Password
              </button>
              <button
                onClick={closePopup}
                className="mt-4 px-6 py-2 rounded-lg font-medium border-2 transition duration-300 w-[15vw]"
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
