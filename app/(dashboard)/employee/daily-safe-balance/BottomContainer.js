'use client';
import MainButton from '@/components/Button/MainButton';
import StaticDataBox from '@/components/Textbox/StaticDataBox';
import React, { useState } from 'react';

const BottomContainer = () => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsPopupVisible(true);

      };
    
      const closePopup = () => {
        setIsPopupVisible(false);
      };

  return (
    <div className="flex w-full justify-between pl-8 pr-8 space-x-3 items-center">
      <MainButton
        className="md:text-xl md:w-1/3"
        text="Deposit to bank & Download PDF"
      />
      <div className="flex w-2/3 justify-end space-x-6 items-center">
        <p className="text-md md:text-2xl font-semibold">
          Available Safe Balance
        </p>
        <StaticDataBox text="$1000" className="text-md pr-8 md:w-1/6 " />
      </div>

      {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium">Your PDF has been downloaded !!</p>
                <button
                  onClick={handleFormSubmit}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>)}
    </div>
  );
}

export default BottomContainer;
