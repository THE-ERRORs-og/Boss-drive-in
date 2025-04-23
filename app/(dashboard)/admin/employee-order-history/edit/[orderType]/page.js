"use client";
import { use, useEffect, useState } from "react";
import {
  getAllOrderItems,
  createOrderItem,
  deleteItem,
  toggleItemStatus,
  updateOrder,
} from "@/lib/actions/orderItems";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { orderTypes } from "@/lib/constants";

export default function Page() {
  const { orderType } = useParams();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState([]);
  const [showAddItemBar, setShowAddItemBar] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch order items
  async function fetchOrderItems() {
    try {
      const result = await getAllOrderItems(orderType);
      if (result.status === "SUCCESS") {
        setOrderItems(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to fetch order items",
        });
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch order items",
      });
    }
  }

  useEffect(() => {
    fetchOrderItems();
  }, []);

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const handlePopUp = () => {
    setIsPopupVisible(true);
  };

  const handleAddItemClick = () => {
    setShowAddItemBar(!showAddItemBar);
  };

  const handleConfirmPopup = async () => {
    setLoading(true);
    try {
      if (popupAction === "save") {
        await handleSaveNewItem();
      } else if (popupAction === "disable") {
        await handleDisableItem(selectedItemId);
      } else if (popupAction === "delete") {
        await handleDeleteItem(selectedItemId);
      }
      await fetchOrderItems();
    } catch (error) {
      console.error("Error in popup action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Operation failed",
      });
    } finally {
      setSelectedItemId(null);
      setIsPopupVisible(false);
      setLoading(false);
    }
  };

  const moveItem = async (index, direction) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= orderItems.length) return;

    const newItems = [...orderItems];
    [newItems[index], newItems[swapIndex]] = [
      newItems[swapIndex],
      newItems[index],
    ];

    // Update UI instantly
    setOrderItems(newItems);
    updateMongoDBOrder(newItems);
  };

  let debounceTimer;

  const updateMongoDBOrder = (newItems) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateOrder(newItems);
    }, 500);
  };

  const handleSaveNewItem = async () => {
    if (newItem.trim()) {
      try {
        const result = await createOrderItem(newItem.trim(), orderType);
        if (result.status === "SUCCESS") {
          toast({
            variant: "success",
            title: "Success",
            description: "Item added successfully",
          });
          setNewItem("");
          setShowAddItemBar(false);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error adding new item:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to add item",
        });
      }
    }
  };

  const handleDisableItem = async (id) => {
    try {
      const result = await toggleItemStatus(id);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: "Item status updated successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error disabling item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update item status",
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const result = await deleteItem(id);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: "Item deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete item",
      });
    }
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen gap-4 m-4">
      <h1 className="text-3xl font-semibold mb-4">
        {orderTypes[orderType]} Order Items
      </h1>
      <h1 className="text-2xl font-bold text-start self-start ml-4">
        Remove the Item you want to remove:
      </h1>
      <div className="flex flex-col gap-4">
        {orderItems.map((item, index) => (
          <div
            key={item._id}
            className="flex justify-center items-center gap-3"
          >
            <div className="border-2 border-gray-300 flex flex-col p-2 rounded-md">
              <div
                className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[15px] border-b-black"
                onClick={() => moveItem(index, -1)}
              ></div>
              <div
                className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[15px] border-t-black mt-1"
                onClick={() => moveItem(index, 1)}
              ></div>
            </div>

            <div
              className={`border-2 border-gray-300 p-2 rounded-md w-[60vw] h-[40] font-semibold text-2xl justify-center items-center flex ${
                !item.isEnabled ? "bg-gray-300" : ""
              }`}
            >
              {item.name}
            </div>

            <button
              onClick={() => {
                setPopupAction("disable");
                setSelectedItemId(item._id);
                handlePopUp();
              }}
              className={`px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
      bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border rounded-lg hover:bg-red-600 transition duration-300
      ${item.isEnabled ? "bg-green-500" : "bg-red-500"}`}
            >
              {item.isEnabled ? "Enabled" : "Disabled"}
            </button>
            <button
              onClick={() => {
                setPopupAction("delete");
                setSelectedItemId(item._id);
                handlePopUp();
              }}
              className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
      bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

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
          </div>
        </div>
      )}

      <div className="gap-20 flex">
        <button
          onClick={handleAddItemClick}
          className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
      bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
        >
          {showAddItemBar ? "Cancel" : "Add Item"}
        </button>
        {showAddItemBar && (
          <button
            onClick={() => {
              setPopupAction("save");
              handlePopUp();
            }}
            className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
      bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
          >
            Save Changes
          </button>
        )}
      </div>

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">
              Are You Sure to {popupAction} Item?
            </p>
            <div className="flex gap-20">
              <button
                onClick={handleConfirmPopup}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                {loading ? "Loading..." : "Confirm"}
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
