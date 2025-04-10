import React from "react";

const MainButton = ({
  text,
  className = "",
  handleFormSubmit,
  isLoading = false,
  onClick=()=>{},
  type="submit"
}) => {
  return (
    <button
    type={type}
    onClick={onClick}
    onSubmit={handleFormSubmit}
    className={` ${className} 
      px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 
       text-white text-sm sm:text-base md:text-md lg:text-lg 
      font-semibold border border-gray-400 rounded-xl 
      transition duration-300 ease-in-out
       ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-500 hover:bg-red-600"
      }`}
    >
   {text}
  </button>
  )
}

export default MainButton;
