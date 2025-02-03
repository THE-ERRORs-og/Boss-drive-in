import React from "react";

const MainButton = ({ text, className = "", handleFormSubmit }) => {
  return (
    <button
      type="submit"
      onClick={handleFormSubmit}
      className={` ${className} 
      px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
      bg-[#ED1C24] text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border border-gray-400 rounded-xl 
      hover:bg-white hover:text-[#ED1C24] 
      transition duration-300 ease-in-out`}
    >
      {text}
    </button>
  );
};

export default MainButton;
