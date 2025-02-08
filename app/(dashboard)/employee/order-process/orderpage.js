"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { createOrderSummary } from "@/lib/actions/orderSummary";
import { orderSummarySchema } from "@/lib/validation";
import { timeOptions } from "@/lib/constants";
import { z } from "zod";

export default function OrderForm({ orderData: initialOrderData }) {
  const { toast } = useToast();
  const { user } = useSession();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [orderData, setOrderData] = useState(initialOrderData);
  const [errors, setErrors] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPopupVisible2, setIsPopupVisible2] = useState(false);

  const handleInputChange = (e, item, field) => {
    const value = e.target.value;

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setOrderData((prevState) => ({
        ...prevState,
        [item]: {
          ...prevState[item],
          [field]: value,
        },
      }));
    }
  };

  const validateOrderData = () => {
    const newErrors = {};
    Object.entries(orderData).forEach(([itemName, fields]) => {
      Object.entries(fields).forEach(([fieldName, value]) => {
        if (value.trim() === "") {
          newErrors[`${itemName}.${fieldName}`] = "This field is required.";
        }
      });
    });
    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Function to update date and time
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    // Update time every second
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const validateForm = (data) => {
    try {
      orderSummarySchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path.join(".")] = curr.message;
          return acc;
        }, {});
        setErrors(fieldErrors);
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      }
      return false;
    }
  };

  const handleFormSubmit = async (e) => {
    setIsLoading(true);
    setIsPopupVisible(true);
    e.preventDefault();

    const data = {
      createdBy: user?.id || "",
      date: selectedDate,
      shiftNumber: parseInt(selectedTime),
      items: Object.entries(orderData).map(([itemName, values]) => ({
        itemName,
        boh: parseFloat(values.boh) || 0,
        cashOrder: parseFloat(values.cashOrder) || 0,
        inventory: parseFloat(values.inventory) || 0,
      })),
      submissionDate: new Date().toISOString(),
    };

    const isOrderDataValid = validateOrderData();
    const isSchemaValid = validateForm(data);

    if (!isOrderDataValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all the fields.",
      });
    }
    if (!isOrderDataValid || !isSchemaValid) {
      return;
    }

    try {
      const response = await createOrderSummary(data);
      if (response.status === "SUCCESS") {
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
        title: "Submission Error",
        description: "An error occurred while submitting the form.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setIsPopupVisible2(false);
  };

  const handleInventoryChange = (e, item, field) => {
    const { value } = e.target;

    if (!/^\d*\.?\d*$/.test(value)) return;

    // Update the order data
    setOrderData((prevData) => {
      const updatedData = {
        ...prevData,
        [item]: {
          ...prevData[item],
          [field]: value,
        },
      };

      // If "boh" or "cashOrder" is updated, recalculate "inventory"
      if (field === "boh" || field === "cashOrder") {
        updatedData[item].inventory =
          (parseFloat(updatedData[item].boh) || 0) +
          (parseFloat(updatedData[item].cashOrder) || 0);
      }

      return updatedData;
    });
  };

  const handleFormSubmit2 = async () => {
    setIsPopupVisible2(true); // Start loader
    e.preventDefault();
  };
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-center m-4 px-6">
        <p className="text-base font-semibold text-red-500">
          Staff Name: <span className="text-black">{user?.name}</span>
        </p>
        {/* <div className="flex space-x-4 items-center">
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Date:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-2 py-1 text-sm border ${
                errors.date ? "border-red-600" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Shift Time:</p>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={`px-2 py-1 text-sm border ${
                errors.shiftTime ? "border-red-600" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
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
        </div> */}
        <div className="flex space-x-4 items-center">
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Date:</p>
            <p className="text-sm px-2 py-1 border border-gray-300 rounded-lg">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Shift Time:</p>
            <p className="text-sm px-2 py-1 border border-gray-300 rounded-lg">
              {currentTime}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="w-full max-w-3xl px-6 mt-6" onSubmit={handleFormSubmit2}>
        <div className="grid grid-cols-4 gap-4 text-center font-bold text-lg mb-4">
          <p> </p>
          <p>BOH</p>
          <p>Case Order</p>
          <p>Inventory</p>
        </div>

        {Object.keys(orderData).map((item) => (
          <div className="grid grid-cols-4 gap-4 items-center mb-4" key={item}>
            <p className="text-left text-lg font-medium">{item}</p>
            {["boh", "cashOrder", "inventory"].map((field) => (
              <div key={field}>
                <input
                  type="text"
                  value={orderData[item][field]}
                  onChange={
                    field === "inventory"
                      ? undefined
                      : (e) => handleInventoryChange(e, item, field)
                  }
                  placeholder=""
                  readOnly={field === "inventory"} // Make inventory read-only
                  className={`w-full px-4 py-2 border ${
                    errors[`${item}.${field}`]
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {errors[`${item}.${field}`] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[`${item}.${field}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="px-10 py-3 bg-red-500 text-white rounded-lg text-lg font-medium hover:bg-red-600 transition duration-300"
          >
            Place Order
          </button>
        </div>
      </form>

      {isPopupVisible2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">
              Are You Sure You Want to Deposit Safe Balance to Bank?
            </p>

            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={handleFormSubmit}
                disabled={isLoading} // Disable button during loading
                className={`mt-4 px-6 py-2 rounded-lg font-medium w-auto transition duration-300 ${
                  isLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {isLoading ? "Processing..." : "Submit"}{" "}
                {/* Show loader text */}
              </button>
              <button
                onClick={closePopup}
                className="mt-4 px-2 py-2 rounded-lg font-medium border-2 transition duration-300 w-[15vw]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">
              Your Order Summary has been submitted!
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
  );
}
