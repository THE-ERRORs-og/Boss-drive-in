"use client";

import { useState } from "react";
import { z } from "zod";
import { locationSchema } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { createLocation } from "@/lib/actions/location";

export default function Page() {
  const { toast } = useToast();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [formData, setFormData] = useState({
    locationId: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "locationId" ? value.toLowerCase() : value 
    });
  };

  const validateForm = async (data) => {
    try {
      // Normalize locationId for validation
      const normalizedData = {
        ...data,
        locationId: data.locationId.toLowerCase(),
      };
  
      await locationSchema.parseAsync(normalizedData);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm(formData)) {
      setIsPopupVisible(true);
    }
  };

  const submitPopupForm = async () => {
    try {
      const normalizedData = {
        ...formData,
        locationId: formData.locationId.toLowerCase(),
      };
  
      const response = await createLocation(normalizedData);
      if (response.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Location added successfully",
          description: "Coffee shop location has been added successfully",
        });
        setFormData({
          locationId: "",
          name: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          phoneNumber: "",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      }
    } catch (error) {
      console.error("Error adding location", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding location",
      });
    } finally {
      setIsPopupVisible(false);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="min-h-screen flex items-start justify-center">
      <div className="bg-white p-6 w-full">
        {/* Form */}
        <h1 className="font-semibold text-3xl p-1 mb-4">
          Enter the details of the coffee shop location:
        </h1>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2">
            <div className="items-center">
              <h1 className="text-xl font-medium place-content-center m-4">
                Location ID
              </h1>
              <h1 className="text-xl font-medium place-content-center m-4">
                Location Name
              </h1>
              <h1 className="text-xl font-medium place-content-center m-4">
                Street Address
              </h1>
              <h1 className="text-xl font-medium place-content-center m-4">
                City
              </h1>
              <h1 className="text-xl font-medium place-content-center m-4">
                State
              </h1>
              <h1 className="text-xl font-medium place-content-center m-4">
                Zip Code
              </h1>
              <h1 className="text-xl font-medium place-content-center m-4">
                Phone Number (Optional)
              </h1>
            </div>
            <div className="mb-10 gap-2 items-center flex flex-col place-content-center">
              <input
                type="text"
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                placeholder="downtown-shop"
                className={`mt-1 w-full px-3 py-2 border ${errors.locationId ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Downtown Coffee Shop"
                className={`mt-1 w-full px-3 py-2 border ${errors.name ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className={`mt-1 w-full px-3 py-2 border ${errors.address ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="New York"
                className={`mt-1 w-full px-3 py-2 border ${errors.city ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="NY"
                className={`mt-1 w-full px-3 py-2 border ${errors.state ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="10001"
                className={`mt-1 w-full px-3 py-2 border ${errors.zipCode ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className={`mt-1 w-full px-3 py-2 border ${errors.phoneNumber ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="w-[20vw] px-6 py-2 bg-[#ED1C24] text-sm md:text-lg text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
            >
              Add Location
            </button>
          </div>
        </form>
        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-10 rounded-lg shadow-lg text-center">
              <p className="text-xl font-medium">
                Are you sure you want to add this location?
              </p>
              <div className="">
                <button
                  onClick={submitPopupForm}
                  className="m-4 px-6 py-2 bg-[#ED1C24] text-sm md:text-lg text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
                >
                  Add Location
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
    </div>
  );
}
