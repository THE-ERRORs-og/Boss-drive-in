"use client";

import { useState, useEffect } from "react";
import {
  getAllOrderItems,
  createOrderItem,
  deleteItem,
  toggleItemStatus,
  updateOrder,
  updateOrderItem,
} from "@/lib/actions/orderItems";
import { getAllLocations, getLocationById } from "@/lib/actions/location";
import { useToast } from "@/hooks/use-toast";
import { orderTypes } from "@/lib/constants";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSession } from "@/context/SessionContext";
import { Dialog, DialogContent } from "@/components/ui/custom-dialog";

export default function OrderEditModal({ orderType, isOpen, onClose }) {
  const { toast } = useToast();
  const { user } = useSession();
  const [orderItems, setOrderItems] = useState([]);
  const [showAddItemBar, setShowAddItemBar] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [newStockNo, setNewStockNo] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [itemToEdit, setItemToEdit] = useState({
    id: "",
    name: "",
    stockNo: "",
  });

  const [selectedLocation, setSelectedLocation] = useState("");

  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Fetch locations
  useEffect(() => {
    // Fetch available locations for user
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        let result;
        if (
          user &&
          !user.hasAllLocationsAccess &&
          user.locationIds &&
          user.locationIds.length === 1
        ) {
          result = await getLocationById(user.locationIds[0]);
          if (result.status === "SUCCESS") {
            setLocations([result.data]);
            setSelectedLocation(result.data._id);
          }
        } else {
          result = await getAllLocations();

          if (result.status === "SUCCESS" && result.data) {
            setLocations(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load locations",
        });
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (user) {
      fetchLocations();
    }
  }, [user, toast]);

  // Fetch order items
  async function fetchOrderItems() {
    if (!selectedLocation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a location first",
      });
      return;
    }

    try {
      const result = await getAllOrderItems(orderType, selectedLocation);
      if (result.status === "SUCCESS") {
        // Sort items by order property to ensure correct display
        const sortedItems = result.data.sort((a, b) => a.order - b.order);
        console.log(
          "Fetched items:",
          sortedItems.map((item) => ({ name: item.name, order: item.order }))
        );
        setOrderItems(sortedItems);
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
    if (selectedLocation) {
      fetchOrderItems();
    }
  }, [selectedLocation]);

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
      } else if (popupAction === "edit") {
        await handleEditItem();
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

  // Track the dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);

  // Handle the start of dragging
  const handleDragStart = (start) => {
    setIsDragging(true);
    setDraggedItemId(start.draggableId);
    console.log(
      "Started dragging:",
      start.draggableId,
      "from index:",
      start.source.index
    );
  };

  // Handle the end of a drag operation
  const handleDragEnd = (result) => {
    setIsDragging(false);
    setDraggedItemId(null);

    const { destination, source, draggableId } = result;

    // Drop outside the list or no destination
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (destination.index === source.index) {
      return;
    }

    // Create a new ordered array
    const newOrderedItems = Array.from(orderItems);

    // Find the item being dragged
    const draggedItem = newOrderedItems.find(
      (item) => item._id === draggableId
    );

    if (!draggedItem) {
      console.error("Could not find dragged item with ID:", draggableId);
      return;
    }

    // Remove the item from its original position
    newOrderedItems.splice(source.index, 1);

    // Insert the item at its new position
    newOrderedItems.splice(destination.index, 0, draggedItem);

    // Log the reordering for debugging
    console.log(
      `Moving item "${draggedItem.name}" from position ${source.index} to ${destination.index}`
    );
    console.log(
      "New order:",
      newOrderedItems.map((item, i) => `${i}: ${item.name}`)
    );

    // Update the order property for each item
    const updatedItems = newOrderedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    // Update state and save to DB
    setOrderItems(updatedItems);
    updateMongoDBOrder(updatedItems);
  };

  let debounceTimer;

  const updateMongoDBOrder = (newItems) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        console.log(
          "Saving new order to database:",
          newItems.map((item) => item.name)
        );
        const result = await updateOrder(newItems);
        if (result.status !== "SUCCESS") {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to update order",
          });
        }
      } catch (error) {
        console.error("Error updating order:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save the new order",
        });
      }
    }, 500);
  };

  const handleSaveNewItem = async () => {
    if (!selectedLocation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a location first",
      });
      return;
    }

    if (newItem.trim() && newStockNo.trim()) {
      try {
        const result = await createOrderItem(
          newItem.trim(),
          orderType,
          newStockNo.trim(),
          selectedLocation
        );
        if (result.status === "SUCCESS") {
          toast({
            variant: "success",
            title: "Success",
            description: "Item added successfully",
          });
          setNewItem("");
          setNewStockNo("");
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
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and Stock Number are required",
      });
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

  const handleEditButtonClick = (item) => {
    setItemToEdit({
      id: item._id,
      name: item.name,
      stockNo: item.stockNo || "",
    });
    setEditMode(true);
    setShowAddItemBar(true);
  };

  const handleEditItem = async () => {
    if (itemToEdit.name.trim() && itemToEdit.stockNo.trim()) {
      try {
        const result = await updateOrderItem(
          itemToEdit.id,
          itemToEdit.name.trim(),
          itemToEdit.stockNo.trim()
        );

        if (result.status === "SUCCESS") {
          toast({
            variant: "success",
            title: "Success",
            description: "Item updated successfully",
          });
          setItemToEdit({ id: "", name: "", stockNo: "" });
          setEditMode(false);
          setShowAddItemBar(false);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error updating item:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update item",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and Stock Number are required",
      });
    }
  };

  // Add this useEffect to handle localStorage
  useEffect(() => {
    // Get saved location from localStorage on component mount
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    } else if (
      user &&
      !user.hasAllLocationsAccess &&
      user.locationIds?.length === 1
    ) {
      // Set default location for users with single location access
      setSelectedLocation(user.locationIds[0]);
    }
  }, [user]);

  // Add this effect to save location changes to localStorage
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem("selectedLocation", selectedLocation);
    }
  }, [selectedLocation]);

  // Modify the location selection handler
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-[95vw] max-h-[95vh] overflow-auto">
        <div className="flex flex-col justify-start items-center h-full gap-4">
          <h1 className="text-3xl font-semibold mb-4">
            {orderTypes[orderType]} Order Items
          </h1>
          <div className="flex justify-between items-center w-full px-4">
            {/* Location Selector */}
            {user?.hasAllLocationsAccess || user?.locationIds?.length > 1 ? (
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Location:</p>
                <select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  disabled={isLoadingLocations}
                  className={`px-2 py-1 text-sm border ${
                    !selectedLocation ? "border-red-600" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[180px]`}
                >
                  <option value="" disabled>
                    -- Select Location --
                  </option>
                  {locations
                    .filter(
                      (location) =>
                        user?.hasAllLocationsAccess ||
                        user?.locationIds?.includes(location._id)
                    )
                    .map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Location:</p>
                <p className="text-base text-black">
                  {isLoadingLocations
                    ? "Loading..."
                    : locations.find((loc) => loc._id === selectedLocation)?.name ||
                      "No location assigned"}
                </p>
              </div>
            )}
          </div>

          {selectedLocation ? (
            <DragDropContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex flex-col gap-3 overflow-y-auto h-[50vh] w-full p-2 transition-colors duration-200 ${
                      snapshot && snapshot.isDraggingOver
                        ? "bg-blue-50 rounded-lg border border-blue-200"
                        : ""
                    }`}
                  >
                    {orderItems.length > 0 ? (
                      orderItems.map((item, index) => (
                        <Draggable
                          key={item._id}
                          draggableId={item._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center justify-between gap-3 mb-1 p-2 transition-all duration-200 ${
                                snapshot && snapshot.isDragging
                                  ? "opacity-90 bg-green-200 shadow-lg rounded-lg border-2 border-blue-300 z-50"
                                  : "bg-white"
                              }`}
                              style={{
                                minHeight: "70px",
                                boxShadow:
                                  snapshot && snapshot.isDragging
                                    ? "0 5px 15px rgba(0, 0, 0, 0.1)"
                                    : "none",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex flex-col sm:flex-row items-center content-center gap-2">
                                <div
                                  className={`border-2 border-gray-300 bg-blue-200 p-2 rounded-md w-[20vw] h-[40] font-semibold text-2xl justify-center items-center flex truncate ${
                                    !item.isEnabled ? "bg-gray-300" : ""
                                  }`}
                                  title={item.name}
                                >
                                  {item.name}
                                </div>

                                <div
                                  className={`border-2 border-gray-300 p-2 rounded-md w-[20vw] h-[40] font-semibold text-2xl justify-center items-center flex truncate ${
                                    !item.isEnabled ? "bg-gray-300" : ""
                                  }`}
                                  title={item.stockNo || "N/A"}
                                >
                                  {item.stockNo ? `#${item.stockNo}` : "N/A"}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <button
                                  onClick={() => handleEditButtonClick(item)}
                                  className={`px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
                                  bg-blue-500 text-white text-sm sm:text-base md:text-md lg:text-lg 
                                  font-semibold border rounded-lg hover:bg-blue-600 transition duration-300`}
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    setPopupAction("disable");
                                    setSelectedItemId(item._id);
                                    handlePopUp();
                                  }}
                                  className={`px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
                                  text-white text-sm sm:text-base md:text-md lg:text-lg 
                                  font-semibold border rounded-lg transition duration-300
                                  ${
                                    item.isEnabled
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-red-500 hover:bg-red-600"
                                  }`}
                                >
                                  {item.isEnabled ? "Enabled" : "Disabled"}
                                </button>
                                <button
                                  onClick={() => {
                                    setPopupAction("delete");
                                    setSelectedItemId(item._id);
                                    handlePopUp();
                                  }}
                                  className={`px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
                                  bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
                                  font-semibold border rounded-lg hover:bg-red-600 transition duration-300`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="p-10 h-full w-full items-center flex justify-center">
                        <p className="text-gray-500 font-bold">
                          No items found for this location.
                        </p>
                      </div>
                    )}

                    <style jsx global>{`
                      .react-beautiful-dnd-placeholder {
                        background-color: rgba(144, 202, 249, 0.3);
                        border: 2px dashed #2196f3;
                        border-radius: 8px;
                        margin-bottom: 16px;
                        min-height: 70px;
                        max-width: 100%;
                        transition: background-color 0.2s ease;
                        animation: pulse 1.5s infinite ease-in-out;
                      }

                      @keyframes pulse {
                        0% {
                          background-color: rgba(144, 202, 249, 0.2);
                        }
                        50% {
                          background-color: rgba(144, 202, 249, 0.5);
                        }
                        100% {
                          background-color: rgba(144, 202, 249, 0.2);
                        }
                      }
                    `}</style>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="p-10 h-[50vh] w-full items-center flex justify-center">
              <p className="text-gray-500 font-bold">
                Please select a location to view order items
              </p>
            </div>
          )}

          {showAddItemBar && (
            <div className="flex flex-col gap-2 w-full">
              <h1 className="text-lg font-bold text-start w-full self-start">
                {editMode
                  ? "Edit item:"
                  : "Enter the details of the item you want to add:"}
              </h1>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                <div className="flex gap-2 flex-col md:flex-row w-full md:w-auto">
                  <label className="min-w-[100px] font-medium text-lg flex items-center">
                    Item Name:
                  </label>
                  <input
                    type="text"
                    className="border-2 border-gray-300 p-2 rounded-md w-full md:w-[30vw] h-[40] font-medium text-xl"
                    value={editMode ? itemToEdit.name : newItem}
                    onChange={(e) =>
                      editMode
                        ? setItemToEdit({ ...itemToEdit, name: e.target.value })
                        : setNewItem(e.target.value)
                    }
                    placeholder="Enter item name"
                  />
                </div>
                <div className="flex gap-2 flex-col md:flex-row w-full md:w-auto">
                  <label className="min-w-[120px] font-medium text-lg flex items-center">
                    Stock Number:
                  </label>
                  <input
                    type="text"
                    className="border-2 border-gray-300 p-2 rounded-md w-full md:w-[25vw] h-[40] font-medium text-xl"
                    value={editMode ? itemToEdit.stockNo : newStockNo}
                    onChange={(e) =>
                      editMode
                        ? setItemToEdit({ ...itemToEdit, stockNo: e.target.value })
                        : setNewStockNo(e.target.value)
                    }
                    placeholder="Enter stock number"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="gap-20 flex mt-4">
            <button
              onClick={() => {
                setShowAddItemBar(!showAddItemBar);
                if (editMode) {
                  setEditMode(false);
                  setItemToEdit({ id: "", name: "", stockNo: "" });
                }
              }}
              className={`px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
              bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
              font-semibold border rounded-lg hover:bg-red-600 transition duration-300`}
            >
              {showAddItemBar ? "Cancel" : "Add Item"}
            </button>
            {showAddItemBar && (
              <button
                onClick={() => {
                  if (editMode) {
                    setPopupAction("edit");
                  } else {
                    setPopupAction("save");
                  }
                  handlePopUp();
                }}
                className={`px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
              bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
              font-semibold border rounded-lg hover:bg-red-600 transition duration-300`}
              >
                {editMode ? "Update Item" : "Save Changes"}
              </button>
            )}
          </div>

          {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium">
                  {popupAction === "save" && "Are You Sure to Save This Item?"}
                  {popupAction === "edit" && "Are You Sure to Update This Item?"}
                  {popupAction === "disable" &&
                    "Are You Sure to Change Item Status?"}
                  {popupAction === "delete" && "Are You Sure to Delete This Item?"}
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
      </DialogContent>
    </Dialog>
  );
}