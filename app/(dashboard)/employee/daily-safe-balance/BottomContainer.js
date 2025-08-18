"use client";
import MainButton from "@/components/Button/MainButton";
import StaticDataBox from "@/components/Textbox/StaticDataBox";
import { useToast } from "@/hooks/use-toast";
import { depositSafeBalance } from "@/lib/actions/safeBalance";
import React, { useState } from "react";

const BottomContainer = ({ currentSafeBalance, locationId, locationName }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async () => {
    if (!currentSafeBalance || currentSafeBalance <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No funds available to deposit",
      });
      setIsPopupVisible(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await depositSafeBalance(locationId);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: `Successfully deposited $${currentSafeBalance.toFixed(2)} to bank from ${result.data.locationName || locationName || "selected location"}`,
        });
        setIsPopupVisible(false);
        window.location.reload(); // Refresh the page to show updated balance
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to deposit safe balance",
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
      setIsLoading(false);
    }
  };

  const showPopup = (e) => {
    e.preventDefault();
    
    if (!locationId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a location first",
      });
      return;
    }
    
    if (!currentSafeBalance || currentSafeBalance <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No funds available to deposit",
      });
      return;
    }
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <form
      onSubmit={showPopup}
      className="flex w-full mt-1 justify-between pl-8 pr-8 space-x-3 items-center"
    >
      <MainButton
        className=""
        text="Deposit to bank & Download PDF"
        disabled={!locationId || !currentSafeBalance || currentSafeBalance <= 0}
      />
      <div className="flex w-2/3 justify-end space-x-6 items-center">
        <p className="text-md md:text-2xl font-semibold">
          Available Safe Balance
          {locationName && <span className="text-sm ml-2">({locationName})</span>}
        </p>
        <StaticDataBox
          text={`$ ${currentSafeBalance?.toFixed(2) || "0.00"}`}
          className="text-xs pr-8 md:w-1/6"
        />
      </div>

      {isPopupVisible && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">
              Are You Sure You Want to Deposit Safe Balance to Bank?
            </p>
            <p className="mt-2 text-gray-600">
              Amount to deposit: ${currentSafeBalance?.toFixed(2) || "0.00"}
            </p>
            {locationName && (
              <p className="mt-1 text-gray-600">
                Location: {locationName}
              </p>
            )}

            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={handleFormSubmit}
                disabled={isLoading}
                className={`mt-4 px-6 py-2 rounded-lg font-medium w-auto transition duration-300 ${
                  isLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {isLoading ? "Processing..." : "Submit"}
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
