"use client";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { createCashSummary } from "@/lib/actions/cashSummary";
import { downloadCashSummary } from "@/lib/utils";
import { cashSummarySchema } from "@/lib/validation";
import { startingRegisterCash, timeOptions } from "@/lib/constants";
import { useState } from "react";
import { z } from "zod";

export default function Page() {
  const { toast } = useToast();
  const {user} = useSession();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [formData, setFormData] = useState({
    expectedCloseoutCash: "",
    startingRegisterCash: startingRegisterCash,
    onlineTipsToast: "",
    onlineTipsKiosk: "",
    onlineTipCash: "",
    totalTipDeduction: "0",
    ownedToRestaurantSafe: -1 * startingRegisterCash,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const fvlues = { ...formData, [name]: value };
    var totalTipDeduction =
      parseFloat(fvlues.onlineTipsToast || 0) +
      parseFloat(fvlues.onlineTipsKiosk || 0);
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
        // console.log(fieldErrors);
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
    setIsLoading(true); // Start loader
    if (!user) {
      toast({
        variant: "destructive",
        title: "User not logged in",
        description: "Please login to submit the form.",
      });
      setIsLoading(false); // Stop loader
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
      datetime: selectedDate,
      shiftNumber: parseInt(selectedTime),
      createdBy: user?.id || "",
    };
    if (!validateForm(data)) {
      setIsLoading(false); // Stop loader
      return;
    }

    try {
      const response = await createCashSummary(data);
      console.log('response', response);
      if (response.status === "SUCCESS") {

        await downloadCashSummary({...data,username:user?.name}); // Download the PDF
        //reset the form
        setFormData({
          expectedCloseoutCash: "",
          startingRegisterCash: startingRegisterCash,
          onlineTipsToast: "",
          onlineTipsKiosk: "",
          onlineTipCash: "",
          totalTipDeduction: "0",
          ownedToRestaurantSafe: -1 * startingRegisterCash,
        });
        setIsPopupVisible(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while submitting the form.",
      });
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false); // Hide the popup
  };

  return (
    <div>
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex flex-col px-8 py-2">
          <div className="w-full flex justify-between items-center m-4">
            <p className="text-base font-semibold text-red-500">
              Staff Name: <span className="text-black">{user?.name}</span>
            </p>
            <div className="flex space-x-4 items-center">
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Date:</p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-2 py-1 text-sm border ${errors.datetime ? "border-red-600" : "border-gray-300"}  rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Shift Time:</p>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className={`px-2 py-1 text-sm border ${errors.shiftNumber ? "border-red-600" : "border-gray-300"} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
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

          <form className="space-y-2" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-2">
              <div className="">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Expected Closeout Cash
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
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
                  className={`mt-1 w-full px-4 py-1 border ${errors.expectedCloseoutCash ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="startingRegisterCash"
                  value={formData.startingRegisterCash}
                  onChange={handleInputChange}
                  disabled={true}
                  placeholder="$---"
                  className={`mt-1 w-full px-4 py-1 border ${errors.shiftNumber ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 m-4">
              <div>
                <p className="text-lg font-bold">Online Tips</p>
              </div>
              <div>
                <p className="text-lg font-bold">Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Toast
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Kiosk
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Cash
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <input
                  type="text"
                  name="onlineTipsToast"
                  value={formData.onlineTipsToast}
                  onChange={handleInputChange}
                  placeholder="$---"
                  className={`mt-1 w-full px-4 py-2 border ${errors.onlineTipsToast ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="onlineTipsKiosk"
                  value={formData.onlineTipsKiosk}
                  onChange={handleInputChange}
                  placeholder="$---"
                  className={`mt-1 w-full px-4 py-2 border ${errors.onlineTipsKiosk ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="onlineTipCash"
                  value={formData.onlineTipCash}
                  onChange={handleInputChange}
                  placeholder="$---"
                  className={`mt-1 w-full px-4 py-2 border ${errors.onlineTipCash ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>

            <hr className="my-4 border-gray-300 font-extrabold" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Total Tip Deduction
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Owned To Restaurant Safe
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
                  className={`mt-1 w-full px-4 py-2 border ${errors.totalTipDeduction ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <input
                  type="text"
                  name="ownedToRestaurantSafe"
                  value={formData.ownedToRestaurantSafe}
                  onChange={handleInputChange}
                  disabled={true}
                  placeholder="$XX"
                  className={`mt-1 w-full px-4 py-2 border ${errors.ownedToRestaurantSafe ? "border-red-600" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
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
