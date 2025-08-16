"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAllLocations } from "@/lib/actions/location";
import LocationItem from "./LocationItem";

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all locations on page load
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await getAllLocations();
      if (response.status === "SUCCESS") {
        setLocations(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to fetch locations",
        });
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching locations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLocationFromList = (id) => {
    setLocations((prevLocations) => prevLocations.filter((location) => location._id !== id));
  };

  const handleAddNewLocation = () => {
    router.push("/admin/location-management/add-location");
  };

  if (loading) {
    return (
      <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col">
        <h1 className="font-semibold text-3xl p-1">
          Manage coffee shop locations:
        </h1>
        <div className="h-[80vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto flex items-center justify-center">
          <p className="text-gray-500">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col">
        <h1 className="font-semibold text-3xl p-1">
          Manage coffee shop locations:
        </h1>
        <div className="h-[80vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">No locations found</p>
          <button
            onClick={handleAddNewLocation}
            className="px-6 py-2 bg-[#ED1C24] text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
          >
            Add New Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-semibold text-3xl p-1">
          Manage coffee shop locations:
        </h1>
        <button
          onClick={handleAddNewLocation}
          className="px-6 py-2 bg-[#ED1C24] text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
        >
          Add New Location
        </button>
      </div>
      <div className="h-[80vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto">
        {/* Locations List */}
        <div>
          {locations.map((location, idx) => (
            <LocationItem
              key={location._id}
              idx={idx}
              location={location}
              onRemove={handleRemoveLocationFromList}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-start items-center h-screen gap-4 m-4">
      <h1 className="text-3xl font-semibold mb-4">Manage Coffee Shop Locations</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      ) : locations.length === 0 && !showAddLocationForm ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">No locations found</p>
          <button 
            onClick={() => setShowAddLocationForm(true)}
            className="mt-4 inline-block px-6 py-2 bg-[#ED1C24] text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
          >
            Add a Location
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-start self-start ml-4">
            {locations.length > 0 ? "Manage or remove locations:" : ""}
          </h2>
          
          <div className="flex flex-col gap-3 overflow-y-scroll max-h-[55vh] w-full">
            {locations.map((location, index) => (
              <div
                key={location._id}
                className="flex justify-center items-center gap-3"
              >
                <div className="border-2 border-gray-300 flex flex-col p-2 rounded-md">
                  <div
                    className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[15px] border-b-black cursor-pointer"
                    onClick={() => moveLocation(index, -1)}
                  ></div>
                  <div
                    className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[15px] border-t-black mt-1 cursor-pointer"
                    onClick={() => moveLocation(index, 1)}
                  ></div>
                </div>

                <div className="border-2 border-gray-300 p-2 rounded-md w-[20vw] font-semibold text-lg">
                  <div>{location.locationId}</div>
                  <div className="text-sm text-gray-500">{location.name}</div>
                </div>

                <div className="border-2 border-gray-300 p-2 rounded-md w-[35vw] font-medium">
                  <div>{location.address}</div>
                  <div>{location.city}, {location.state} {location.zipCode}</div>
                  <div className="text-sm text-gray-500">{location.phoneNumber}</div>
                </div>

                <button
                  onClick={() => handleEditButtonClick(location)}
                  className="px-4 py-3 bg-blue-500 text-white text-sm font-semibold border rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setPopupAction("delete");
                    setSelectedLocationId(location._id);
                    handlePopUp();
                  }}
                  className="px-4 py-3 bg-[#ED1C24] text-white text-sm font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {showAddLocationForm && (
            <div className="flex flex-col gap-4 mt-1 w-full border-2 border-gray-300 p-4 rounded-md">
              <h1 className="text-lg font-bold">
                {editMode ? "Edit location:" : "Enter the details of the location you want to add:"}
              </h1>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Location ID:</label>
                  <input
                    type="text"
                    name="locationId"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.locationId}
                    onChange={handleInputChange}
                    placeholder="downtown-shop"
                    disabled={editMode} // Disable in edit mode
                  />
                  
                  <label className="font-medium mt-2">Name:</label>
                  <input
                    type="text"
                    name="name"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Downtown Coffee Shop"
                  />
                  
                  <label className="font-medium mt-2">Address:</label>
                  <input
                    type="text"
                    name="address"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-medium">City:</label>
                  <input
                    type="text"
                    name="city"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                  
                  <label className="font-medium mt-2">State:</label>
                  <input
                    type="text"
                    name="state"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                  />
                  
                  <label className="font-medium mt-2">Zip Code:</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                  
                  <label className="font-medium mt-2">Phone Number (Optional):</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="border-2 border-gray-300 p-2 rounded-md"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="gap-6 flex mt-4">
            <button
              onClick={() => {
                setShowAddLocationForm(!showAddLocationForm);
                if (editMode) {
                  setEditMode(false);
                  setFormData({
                    locationId: "",
                    name: "",
                    address: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    phoneNumber: "",
                  });
                }
              }}
              className="px-4 py-3 bg-[#ED1C24] text-white text-sm font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
            >
              {showAddLocationForm ? "Cancel" : "Add Location"}
            </button>
            
            {showAddLocationForm && (
              <button
                onClick={handleFormSubmit}
                className="px-4 py-3 bg-[#ED1C24] text-white text-sm font-semibold border rounded-lg hover:bg-red-600 transition duration-300"
              >
                {editMode ? "Update Location" : "Save Location"}
              </button>
            )}
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">
              {popupAction === "save" && "Are you sure you want to add this location?"}
              {popupAction === "edit" && "Are you sure you want to update this location?"}
              {popupAction === "delete" && "Are you sure you want to delete this location? This action cannot be undone."}
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleConfirmPopup}
                className="px-6 py-2 bg-[#ED1C24] text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Confirm
              </button>
              <button
                onClick={closePopup}
                className="px-6 py-2 border-2 text-black rounded-lg font-medium transition duration-300"
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
