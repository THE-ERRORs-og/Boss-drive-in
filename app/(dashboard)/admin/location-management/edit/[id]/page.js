"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLocationById, updateLocation } from "@/lib/actions/location";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { locationSchema } from "@/lib/validation";

export default function EditLocation() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    _id: "",
    locationId: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const result = await getLocationById(id);
        if (result.status === "SUCCESS") {
          setFormData({
            _id: result.data._id,
            locationId: result.data.locationId,
            name: result.data.name,
            address: result.data.address,
            city: result.data.city,
            state: result.data.state,
            zipCode: result.data.zipCode,
            phoneNumber: result.data.phoneNumber || "",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to fetch location details",
          });
          router.push("/admin/location-management/manage-locations");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching location details",
        });
        router.push("/admin/location-management/manage-locations");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id, router, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = async (data) => {
    try {
      // We don't validate locationId because it can't be changed
      const { locationId, _id, ...validationData } = data;

      // Create a modified schema without the locationId requirement
      const editSchema = locationSchema.omit({ locationId: true });

      await editSchema.parseAsync(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        toast({
          variant: "destructive",
          title: `Error in ${error.errors[0].path[0]}`,
          description: `${error.errors[0].message}`,
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm(formData)) {
      setIsPopupVisible(true);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateLocation(formData);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: "Location updated successfully",
        });
        router.push("/admin/location-management/manage-locations");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update location",
        });
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating location",
      });
    } finally {
      setIsSubmitting(false);
      setIsPopupVisible(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mt-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mt-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Location</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location ID
                  </label>
                  <input
                    type="text"
                    name="locationId"
                    value={formData.locationId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Location ID cannot be changed
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Downtown Boss"
                    className={`w-full px-3 py-2 border ${
                      errors.name ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={`w-full px-3 py-2 border ${
                      errors.address ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.address && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className={`w-full px-3 py-2 border ${
                      errors.city ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.city && (
                    <p className="text-red-600 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className={`w-full px-3 py-2 border ${
                      errors.state ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.state && (
                    <p className="text-red-600 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className={`w-full px-3 py-2 border ${
                      errors.zipCode ? "border-red-600" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#ED1C24] text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Location"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl font-medium mb-4">
              Are you sure you want to update this location?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#ED1C24] text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 disabled:bg-gray-400"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
              <button
                onClick={closePopup}
                disabled={isSubmitting}
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
