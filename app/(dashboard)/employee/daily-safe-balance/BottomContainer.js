"use client";
import MainButton from "@/components/Button/MainButton";
import StaticDataBox from "@/components/Textbox/StaticDataBox";
import { useToast } from "@/hooks/use-toast";
import { depositSafeBalance } from "@/lib/actions/safeBalance";
import React, { useState } from "react";

const BottomContainer = ({ currentSafeBalance }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const { toast } = useToast();

  const handleFormSubmit = async () => {
    setIsLoading(true); // Start loader
    try {
      const result = await depositSafeBalance();
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: "Safe balance deposited successfully",
        });
        setIsPopupVisible(false);
        window.location.reload(); // Refresh the page
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error in depositSafeBalance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deposit safe balance",
      });
    } finally {
      setIsLoading(false); // Stop loader
      setIsPopupVisible(false);
    }
  };

  const showPopup = (e) => {
    e.preventDefault();
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <form
      onSubmit={showPopup}
      className="flex w-full justify-between pl-8 pr-8 space-x-3 items-center"
    >
      <MainButton
        className="md:text-xl md:w-1/3"
        text="Deposit to bank & Download PDF"
      />
      <div className="flex w-2/3 justify-end space-x-6 items-center">
        <p className="text-md md:text-2xl font-semibold">
          Available Safe Balance
        </p>
        <StaticDataBox
          text={`$ ${currentSafeBalance}`}
          className="text-md pr-8 md:w-1/6"
        />
      </div>

      {isPopupVisible && (
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
    </form>
  );
};

export default BottomContainer;
