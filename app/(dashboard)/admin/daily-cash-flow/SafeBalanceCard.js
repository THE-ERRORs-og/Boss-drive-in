import MainButton from '@/components/Button/MainButton';
import { getDateString } from '@/lib/utils';
import React from 'react';

const SafeBalanceCard = ({ item }) => {
  const date = new Date(item.createdAt);

  // Format Date: "MM/DD/YYYY"
  const dateStr = getDateString(date);

  // Format Time: "12:00 PM"
  const time = date
    .toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/^0/, "");

  return (
    <div className="space-y-4 border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between">
      <div className="flex items-center justify-between w-full">
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Date :</span> {dateStr}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Time :</span> {time}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Ordered By :</span>{" "}
          {item.createdBy.name}
        </p>
      </div>

      <p className="font-md text-xl">
        <span className="font-semibold text-xl">Deposited Amount :</span>{" "}
        {item.amount}
      </p>
      <MainButton text="Download PDF" className="" />
    </div>
  );
};

export default SafeBalanceCard;
