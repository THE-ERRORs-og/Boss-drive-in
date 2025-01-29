"use client";
import { useState } from "react";

export default function Page() {
  const [showAddItemBar, setShowAddItemBar] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const handlePopUp = () => {
    setIsPopupVisible(true);
  };

  const handleAddItemClick = () => {
    setShowAddItemBar(true);
  };

  const handleSaveNewItem = () => {
    if (newItem.trim()) {
      console.log("New Item Added:", newItem); // Replace with actual functionality
      setNewItem("");
      setShowAddItemBar(false);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen gap-4 m-4">
      <h1 className="text-lg font-bold text-start self-start ml-4">
        Remove the Item you want to remove:
      </h1>
      <div className="flex flex-col gap-4">
        {/* Existing items with Remove and Disable buttons */}
        {["Napkin", "Cup", "Candy", "Water"].map((item, index) => (
          <div key={index} className="flex justify-center items-center gap-3">
            <div
              type="text"
              className="border-2 border-gray-300 p-2 rounded-md w-[60vw] h-[40] font-semibold text-2xl justify-center items-center flex"
            >
              {item}
            </div>
            <button className="w-[10vw] px-6 py-2 bg-red-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300">
              Remove
            </button>
            <button className="w-[10vw] px-6 py-2 bg-red-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300">
              Disable
            </button>
          </div>
        ))}
      </div>

      {/* Add Item bar */}
      {showAddItemBar && (
        <div className="flex flex-col gap-4 mt-4">
          <h1 className="text-lg font-bold text-start self-start ml-4">
            Enter the name of the item you want to add:
          </h1>
          <div className="flex gap-3">
            <input
              type="text"
              className="border-2 border-gray-300 p-2 rounded-md w-[60vw] h-[40] font-medium text-xl"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter item name"
            />
            <button
              onClick={handleSaveNewItem}
              className="w-[10vw] px-6 py-2 bg-red-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="gap-20 flex">
        <button
          onClick={handleAddItemClick}
          className="mt-4 w-[20vw] px-6 py-2 bg-red-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
        >
          Add Items
        </button>
        <button
          // Implement save functionality here
          onClick={handlePopUp}
          className="mt-4 w-[20vw] px-6 py-2 bg-red-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
        >
          Save Changes
        </button>
      </div>

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">Are You Sure to save changes?</p>
            <div className="flex gap-20">
              <button
                onClick={closePopup}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Save Changes
              </button>
              <button
                onClick={closePopup}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
