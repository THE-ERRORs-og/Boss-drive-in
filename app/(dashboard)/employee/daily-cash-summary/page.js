"use client";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import {
  createCashSummary,
  getCashSummaryByDate,
} from "@/lib/actions/cashSummary";
import { getAllLocations, getLocationById } from "@/lib/actions/location";
import { downloadCashSummary } from "@/lib/utils";
import { cashSummarySchema } from "@/lib/validation";
import { startingRegisterCash, timeOptions } from "@/lib/constants";
import { useState, useEffect } from "react";
import { z } from "zod";

export default function Page() {
  const { toast } = useToast();
  const { user } = useSession();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [formData, setFormData] = useState({
    expectedCloseoutCash: "",
    startingRegisterCash: startingRegisterCash,
    onlineTipsToast: "",
    onlineTipsKiosk: "",
    onlineTipCash: "",
    totalTipDeduction: "",
    otherClosingRemovalAmount: "",
    otherClosingRemovalItemCount: "",
    otherClosingDiscounts: "",
    ownedToRestaurantSafe: -1 * startingRegisterCash,
  });
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    const checkExistingSummary = async () => {
      if (selectedDate && selectedTime && selectedLocation) {
        try {
          const result = await getCashSummaryByDate(
            selectedDate,
            selectedLocation
          );
          console.log("result", result);
          if (result.status === "SUCCESS" && result.data) {
            // Check if there's a summary for the selected shift time
            const existingSummary = result.data.find(
              (summary) => summary.shiftNumber === parseInt(selectedTime)
            );

            if (existingSummary) {
              toast({
                title: "Warning",
                description: `A cash summary already exists for ${selectedDate} (Shift ${selectedTime}).`,
              });
            }
          }
        } catch (error) {
          console.error("Error checking existing summary:", error);
        }
      }
    };

    checkExistingSummary();
  }, [selectedDate, selectedTime, selectedLocation, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Only allow numbers and decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    const fvlues = { ...formData, [name]: value };
    var totalTipDeduction =
      parseFloat(fvlues.onlineTipsToast || 0) +
      parseFloat(fvlues.onlineTipsKiosk || 0);

    // Calculate OWED amount (can be negative)
    var ownedToRestaurantSafe =
      parseFloat(fvlues.expectedCloseoutCash || 0) -
      parseFloat(fvlues.startingRegisterCash || 0) -
      totalTipDeduction;

    setFormData({
      ...fvlues,
      totalTipDeduction: totalTipDeduction.toFixed(2),
      ownedToRestaurantSafe: ownedToRestaurantSafe.toFixed(2),
    });
  };

  const validateForm = (data) => {
    try {
      cashSummarySchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      console.log(error);
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
    setIsLoading(true);

    if (!user) {
      toast({
        variant: "destructive",
        title: "User not logged in",
        description: "Please login to submit the form.",
      });
      setIsLoading(false);
      return;
    }

    if (!selectedLocation) {
      toast({
        variant: "destructive",
        title: "1",
        description: "Please select a location.",
      });
      setIsLoading(false);
      return;
    }

    const data = {
      expectedCloseoutCash: parseFloat(formData.expectedCloseoutCash || 0),
      startingRegisterCash: parseFloat(formData.startingRegisterCash || 0),
      onlineTipsToast: parseFloat(formData.onlineTipsToast || 0),
      onlineTipsKiosk: parseFloat(formData.onlineTipsKiosk || 0),
      onlineTipCash: parseFloat(formData.onlineTipCash || 0),
      totalTipDeduction: parseFloat(formData.totalTipDeduction || 0),
      ownedToRestaurantSafe: parseFloat(formData.ownedToRestaurantSafe || 0),
      removalAmount: parseFloat(formData.otherClosingRemovalAmount || 0),
      removalItemCount: parseInt(formData.otherClosingRemovalItemCount || 0),
      discounts: parseFloat(formData.otherClosingDiscounts || 0),
      datetime: selectedDate,
      shiftNumber: parseInt(selectedTime),
      createdBy: user.id,
      location: selectedLocation,
    };

    if (!validateForm(data)) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await createCashSummary(data);
      if (result.status === "SUCCESS") {
        // Get location name for the PDF
        const locationName =
          locations.find((loc) => loc._id === selectedLocation)?.name || "";

        await downloadCashSummary({
          ...data,
          username: user?.name,
          locationName: locationName,
        });

        toast({
          title: "Success",
          description: "Cash summary created successfully",
        });
        setIsPopupVisible(true);
        // Reset form
        setSelectedDate("");
        setSelectedTime("");
        // Only reset location if user has multiple locations
        if (user?.hasAllLocationsAccess || user?.locationIds?.length > 1) {
          setSelectedLocation("");
        }
        setFormData({
          expectedCloseoutCash: "",
          startingRegisterCash: startingRegisterCash,
          onlineTipsToast: "",
          onlineTipsKiosk: "",
          onlineTipCash: "",
          totalTipDeduction: "0",
          otherClosingRemovalAmount: "0",
          otherClosingRemovalItemCount: "0",
          otherClosingDiscounts: "0",
          ownedToRestaurantSafe: -1 * startingRegisterCash,
        });
      } else {
        console.log("result", result);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create cash summary",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit cash summary",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div>
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex flex-col px-8 py-2">
          <div className="w-full flex justify-between items-center px-4">
            <p className="text-base font-semibold text-red-500">
              Staff Name: <span className="text-black">{user?.name}</span>
            </p>
            <div className="flex space-x-4 items-center">
              {/* Location Selector */}
              {user?.hasAllLocationsAccess || user?.locationIds?.length > 1 ? (
                <div className="flex items-center">
                  <p className="text-base font-semibold mr-2">Location:</p>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
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
                      : locations.find((loc) => loc._id === selectedLocation)
                          ?.name || "No location assigned"}
                  </p>
                </div>
              )}

              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Date:</p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-2 py-1 text-sm border ${
                    errors.datetime ? "border-red-600" : "border-gray-300"
                  }  rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Shift Time:</p>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className={`px-2 py-1 text-sm border ${
                    errors.shiftNumber ? "border-red-600" : "border-gray-300"
                  } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  <option value="" disabled>
                    Select Time
                  </option>
                  {timeOptions.map((time, index) => (
                    <option key={index} value={index + 1}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <form className="space-y-0" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-2">
              <div className="">
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-2">
                  Expected Closeout Cash
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-2">
                  Starting Register Cash
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  name="expectedCloseoutCash"
                  value={formData.expectedCloseoutCash}
                  onChange={handleInputChange}
                  placeholder="$---"
                  inputMode="decimal"
                  className={`mt-1 w-full px-4 py-1 border ${
                    errors.expectedCloseoutCash
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="startingRegisterCash"
                  value={formData.startingRegisterCash}
                  onChange={handleInputChange}
                  disabled={true}
                  placeholder="$---"
                  className={`mt-1 w-full px-4 py-1 border ${
                    errors.shiftNumber ? "border-red-600" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-4 py-2">
              <div>
                <p className="text-lg font-bold">Online Tips</p>
              </div>
              <div>
                <p className="text-lg font-bold">Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-2">
                  Toast
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-2">
                  Kiosk
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  name="onlineTipsToast"
                  value={formData.onlineTipsToast}
                  onChange={handleInputChange}
                  placeholder="$---"
                  inputMode="decimal"
                  className={`mt-1 w-full px-4 py-2 border ${
                    errors.onlineTipsToast
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="onlineTipsKiosk"
                  value={formData.onlineTipsKiosk}
                  onChange={handleInputChange}
                  placeholder="$---"
                  inputMode="decimal"
                  className={`mt-1 w-full px-4 py-2 border ${
                    errors.onlineTipsKiosk
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>

            <div>
              {" "}
              <hr className="m-2 border-gray-300 font-extrabold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-2">
                  Total Tip Deduction
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-2">
                  OWED To Restaurant Safe
                  <span className="text-sm text-gray-500 block">
                    (Negative value means reduction from bank safe)
                  </span>
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  name="totalTipDeduction"
                  value={formData.totalTipDeduction}
                  onChange={handleInputChange}
                  disabled={true}
                  placeholder="$XX"
                  className={`mt-1 w-full px-4 py-2 border ${
                    errors.totalTipDeduction
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="ownedToRestaurantSafe"
                  value={formData.ownedToRestaurantSafe}
                  onChange={handleInputChange}
                  disabled={true}
                  placeholder="$XX"
                  className={`mt-1 w-full px-4 py-2 border ${
                    errors.ownedToRestaurantSafe
                      ? "border-red-600"
                      : parseFloat(formData.ownedToRestaurantSafe) < 0
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>
            <div>
              {" "}
              <hr className="m-2 border-gray-300 font-extrabold" />
            </div>

            <div className="grid grid-cols-2 gap-4 px-4 py-2">
              <div>
                <p className="text-lg font-bold">Other Closing Info</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-[0.6rem]">
                  Cash Tips
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-[0.6rem]">
                  Removal Amount
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-[0.6rem]">
                  Removal Item Count
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center px-4 py-[0.6rem] mb-2">
                  Discounts
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  name="onlineTipCash"
                  value={formData.onlineTipCash}
                  onChange={handleInputChange}
                  placeholder="$---"
                  inputMode="decimal"
                  className={` w-full px-4 py-2 border ${
                    errors.onlineTipCash ? "border-red-600" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />

                <input
                  type="text"
                  name="otherClosingRemovalAmount"
                  value={formData.otherClosingRemovalAmount}
                  onChange={handleInputChange}
                  placeholder="$---"
                  inputMode="decimal"
                  className={` w-full px-4 py-2 border ${
                    errors.onlineTipsToast
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />

                <input
                  type="text"
                  name="otherClosingRemovalItemCount"
                  value={formData.otherClosingRemovalItemCount}
                  onChange={handleInputChange}
                  placeholder="0"
                  inputMode="numeric"
                  pattern="\d*"
                  className={` w-full px-4 py-2 border ${
                    errors.onlineTipsToast
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="otherClosingDiscounts"
                  value={formData.otherClosingDiscounts}
                  onChange={handleInputChange}
                  placeholder="$---"
                  inputMode="decimal"
                  className={`mb-2 w-full px-4 py-2 border ${
                    errors.onlineTipsKiosk
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className={`w-auto px-10 text-white py-3 rounded-lg font-medium transition duration-300
                ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isLoading ? "Processing..." : "Submit & Download PDF"}
              </button>
            </div>
          </form>

          {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium">
                  Your PDF has been downloaded !!
                </p>
                <button
                  onClick={closePopup}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
