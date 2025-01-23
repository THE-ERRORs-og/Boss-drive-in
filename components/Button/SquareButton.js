import React from "react";
import Image from "next/image";

const SquareButton = ({ text, imageUrl, onClick}) => {
  return (
   
      <button onClick={onClick} className="text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500">
        <Image src={imageUrl} alt="Admin Icon" className="w-20 h-20 mb-4" />
        {text}
      </button>
    
  );
};

export default SquareButton;
