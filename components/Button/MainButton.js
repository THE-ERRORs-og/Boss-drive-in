import React from "react";

const MainButton = ({
  text,
  className = "",
  isLoading = false,
  handleFormSubmit,
}) => {
  return (
    <button
      type="submit"
      onSubmit={handleFormSubmit}
      disabled={isLoading}
      className={`p-10 text-white text:sm font-semibold py-2 border border-gray-400 rounded-lg transition duration-300 ease-in-out ${className}
      ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-500 hover:bg-red-600"
      }`}
    >
      {text}
    </button>
  );
};

export default MainButton;
