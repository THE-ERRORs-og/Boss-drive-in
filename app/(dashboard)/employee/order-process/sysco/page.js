"use client";
import MainButton from "@/components/Button/MainButton";
import React, { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { getOrderItems } from "@/lib/actions/orderItems";
import { getLastSyscoOrder, createSyscoOrder } from "@/lib/actions/syscoOrder";
import { timeOptions as SHIFT_OPTIONS } from "@/lib/constants";


const Page = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shiftNumber, setShiftNumber] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [formData, setFormData] = useState({});

  // Fetch order items and last order
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch order items
        const itemsResult = await getOrderItems();
        if (itemsResult.status === "SUCCESS") {
          setOrderItems(itemsResult.data);
          
          // Initialize form data
          const initialFormData = itemsResult.data.reduce((acc, item) => {
            acc[item._id] = {
              itemId: item._id,
              itemName: item.name,
              yesterdayOrder: 0,
              boh: "",
              total: 0,
              order: "",
            };
            return acc;
          }, {});
          setFormData(initialFormData);

          // Fetch last order
          const lastOrderResult = await getLastSyscoOrder();
          console.log('lastOrderResult',lastOrderResult);
          if (lastOrderResult.status === "SUCCESS" && lastOrderResult.data) {
            // Update form data with last order values
            const updatedFormData = { ...initialFormData };
            lastOrderResult.data.items.forEach((item) => {
              if (updatedFormData[item.itemId._id]) {
                updatedFormData[item.itemId._id].yesterdayOrder = item.order || 0;
              }
            });
            setFormData(updatedFormData);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: itemsResult.error || "Failed to fetch items",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Handle BOH input change
  const handleBOHChange = (itemId, value) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => {
        const item = prev[itemId];
        const boh = parseFloat(value) || 0;
        const yesterdayOrder = item.yesterdayOrder || 0;
        return {
          ...prev,
          [itemId]: {
            ...item,
            boh: value,
            total: boh + yesterdayOrder,
          },
        };
      });
    }
  };

  // Handle Order input change
  const handleOrderChange = (itemId, value) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          order: value,
        },
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const items = Object.values(formData);
      const hasEmptyFields = items.some(
        (item) => !item.boh || !item.order
      );

      if (hasEmptyFields) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill all required fields",
        });
        setIsLoading(false);
        return;
      }

      if (!shiftNumber) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select a shift time",
        });
        setIsLoading(false);
        return;
      }

      const orderData = {
        date: new Date(selectedDate),
        shiftNumber: parseInt(shiftNumber),
        items: items.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          yesterdayOrder: item.yesterdayOrder,
          boh: parseFloat(item.boh),
          total: item.total,
          order: parseFloat(item.order),
        })),
      };

      const result = await createSyscoOrder(orderData);
      if (result.status === "SUCCESS") {
        toast({
          title: "Success",
          description: "Sysco order created successfully",
        });
        
        //  refresh the page
        window.location.reload();

        
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create order",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit order",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col items-center">
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
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center">
            <p className="text-base font-semibold mr-2">Shift Time:</p>
            <select
              value={shiftNumber}
              onChange={(e) => setShiftNumber(e.target.value)}
              className="border border-gray-300 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="" disabled>
                Select Time
              </option>
              {SHIFT_OPTIONS.map((shift, idx) => (
                <option key={idx+1} value={idx + 1}>
                  {shift}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <h1 className="text-center text-4xl font-bold">SYSCO</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-6xl px-6 mt-6">
        <div className="grid grid-cols-5 gap-4 text-center font-bold text-lg mb-4">
          <p className="text-left">Item Name</p>
          <p>Yesterday Order</p>
          <p>BOH</p>
          <p>Total</p>
          <p>Order</p>
        </div>
        {orderItems.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-5 gap-4 items-center mb-4"
          >
            <p className="text-left text-lg font-medium">{item.name}</p>
            <input
              type="text"
              value={formData[item._id]?.yesterdayOrder || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
            <input
              type="text"
              value={formData[item._id]?.boh || ""}
              onChange={(e) => handleBOHChange(item._id, e.target.value)}
              placeholder="Enter BOH"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              value={formData[item._id]?.total || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
            <input
              type="text"
              value={formData[item._id]?.order || ""}
              onChange={(e) => handleOrderChange(item._id, e.target.value)}
              placeholder="Enter Order"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}
        <div className="flex justify-center mt-6">
          <MainButton
            type="submit"
            text={isLoading ? "Submitting..." : "Submit"}
            disabled={isLoading}
            className={`bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </form>
    </div>
  );
};

export default Page;
