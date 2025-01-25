"use client";

import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { createOrderSummary } from "@/lib/actions/orderSummary";
import { orderSummarySchema } from "@/lib/validation";
import { z } from "zod";

export default function OrderForm({ orderData: initialOrderData }) {
  const { toast } = useToast();
  const { user } = useSession();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [orderData, setOrderData] = useState(initialOrderData);
  const [errors, setErrors] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const timeOptions = ["5am - 11am", "11am - 5pm", "5pm - 11pm", "11pm - 5am"];

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
    }
  };

  const closePopup = () => setIsPopupVisible(false);

  return (
    <div className="h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-center m-4 px-6">
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
        </div>
      </div>

      {/* Form */}
      <form className="w-full max-w-3xl px-6 mt-6" onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-4 gap-4 text-center font-bold text-lg mb-4">
          <p> </p>
          <p>BOH</p>
          <p>Cash Order</p>
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
                  onChange={(e) => handleInputChange(e, item, field)}
                  placeholder="$---"
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
