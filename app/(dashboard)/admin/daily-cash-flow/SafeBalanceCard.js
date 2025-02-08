import MainButton from '@/components/Button/MainButton';
import React from 'react';

const SafeBalanceCard = ({item}) => {
   const date = new Date(item._updatedAt);

   // Format Date: "11/Feb/2025"
   const dateStr =
     date.getDate().toString().padStart(2, "0") +
     "/" +
     date.toLocaleString("en-US", { month: "short" }) +
     "/" +
     date.getFullYear();

   // Format Time: "12:00 PM"
   const time = date
     .toLocaleString("en-US", {
       hour: "2-digit",
       minute: "2-digit",
       hour12: true,
     })
     .replace(/^0/, ""); 
     
  return (
    <div
      //   key={item._id}
      className=" space-y-4 border-2 border-black rounded-xl m-1 p-4 mb-4 flex flex-col md:flex-col items-center justify-between"
    >
      <div className="flex items-center justify-between w-full">
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Date :</span> {dateStr}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Time :</span> {time}
        </p>
        <p className="font-md text-xl">
          <span className="font-semibold text-xl">Ordered By :</span>{" "}
          {item.submittedBy.name}
        </p>
      </div>

      <p className="font-md text-xl">
        <span className="font-semibold text-xl">Deposited Amount :</span>{" "}
        {item.depositAmount}
      </p>
      <MainButton text="Download PDF" className="" />
    </div>
  );
}

export default SafeBalanceCard;
