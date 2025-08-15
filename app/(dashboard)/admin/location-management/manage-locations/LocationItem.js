"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLocation } from "@/lib/actions/location";
import { useToast } from "@/hooks/use-toast";

export default function LocationItem({ location, idx, onRemove }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleRemoveLocation = async () => {
    try {
      const result = await deleteLocation(location._id);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: `Location ${location.name} removed successfully`,
        });
        setIsPopupVisible(false);
        onRemove(location._id);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove location",
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const viewLocation = () => {
    router.push(`/admin/location-management/view/${location._id}`);
  };

  const editLocation = () => {
    router.push(`/admin/location-management/edit/${location._id}`);
  };

  return (
    <div className="flex w-full items-center content-center p-1">
      <div className="rounded-lg border-2 w-[74vw] p-2">
        <p className="text-lg font-medium">
          {idx + 1}. {location.name} ({location.locationId})
        </p>
      </div>
      <button
        onClick={viewLocation}
        className="m-1 px-6 py-2 bg-blue-500 text-sm md:text-md text-white rounded-lg font-medium hover:bg-blue-600 transition duration-300"
      >
        View
      </button>
      <button
        onClick={editLocation}
        className="m-1 px-6 py-2 bg-green-500 text-sm md:text-md text-white rounded-lg font-medium hover:bg-green-600 transition duration-300"
      >
        Edit
      </button>
      <button
        onClick={handleFormSubmit}
        className="m-1 px-6 py-2 bg-[#ED1C24] text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
      >
        Remove
      </button>

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl font-medium mb-4">
              Are you sure you want to remove this location?
            </p>
            <div>
              <button
                onClick={handleRemoveLocation}
                className="m-4 px-6 py-2 bg-[#ED1C24] text-sm md:text-lg text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Remove Location
              </button>
              <button
                onClick={closePopup}
                className="m-4 px-6 py-2 border-2 text-sm md:text-lg text-black rounded-lg font-medium transition duration-300"
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
