"use client";
import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { ALL_ORDER_ITEMS_QUERY } from "@/sanity/lib/queries";
import {
  createOrderItem,
  deleteItem,
  toggleItemStatus,
} from "@/lib/actions/orderItems";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState();
  const [showAddItemBar, setShowAddItemBar] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch order items
  async function fetchOrderItems() {
    try {
      const data = await client
        .withConfig({ useCdn: false })
        .fetch(ALL_ORDER_ITEMS_QUERY);
      console.log(data);
      setOrderItems(data);
    } catch (error) {
      console.error("Error fetching order items:", error);
    } finally {
      return true;
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
    if (popupAction === "save") {
      await handleSaveNewItem();
    } else if (popupAction === "disable") {
      await handleDisableItem(selectedItemId);
    } else if (popupAction === "delete") {
      await handleDeleteItem(selectedItemId);
    }
    console.log("Popup action:", popupAction);
    await fetchOrderItems();
    setSelectedItemId(null);
    setIsPopupVisible(false);
    setLoading(false);
  };

  const handleSaveNewItem = async () => {
    if (newItem.trim()) {
      try {
        // Create new item
        const result = await createOrderItem(newItem);
        if (result.status === "SUCCESS") {
          toast({
            variant: "success",
            title: "Success",
            description: result.message,
          });
        }
        setOrderItems((prev) => [...prev, newItem.trim()]);
        setNewItem("");
        setShowAddItemBar(false);
      } catch (error) {
        console.error("Error adding new item:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } finally {
        return true;
      }
    }
  };

  const handleDisableItem = async (id) => {
    try {
      // Disable item
      const result = await toggleItemStatus(id);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error disabling item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      return true;
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      // Delete item
      const result = await deleteItem(id);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      return true;
    }
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen gap-4 m-4">
      <h1 className="text-2xl font-bold text-start self-start ml-4">
        Remove the Item you want to remove:
      </h1>
      <div className="flex flex-col gap-4">
        {/* Existing items with Remove and Disable buttons */}
        {orderItems?.length >= 0 &&
          orderItems.map((item, index) => (
            <div
              key={item.key}
              className="flex justify-center items-center gap-3"
            >
              <div
                className={`border-2 border-gray-300 p-2 rounded-md w-[60vw] h-[40] font-semibold text-2xl justify-center items-center flex ${
                  !item.isEnabled ? "bg-gray-300" : ""
                }`}
              >
                {item.name}
              </div>

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
              <button
                onClick={() => {
                  setPopupAction("disable");
                  setSelectedItemId(item._id);
                  handlePopUp();
                }}
                className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
      bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
              >
                {!item.isEnabled ? "Enable" : "Disable"}
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
          </div>
        </div>
      )}

      {/* Buttons */}
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
            className="mt-4 w-[20vw] px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
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
