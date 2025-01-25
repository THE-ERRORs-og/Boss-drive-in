import React from 'react'

const MainButton = ({text ,className="" , handleFormSubmit}) => {
  return (
    <button
    type="submit"
    onSubmit={handleFormSubmit}
    className={` ${className} p-10 bg-[#ED1C24] text-white text:sm font-semibold py-2 border border-gray-400 rounded-lg hover:bg-white hover:text-[#ED1C24] transition duration-300 ease-in-out`}
  >
   {text}
  </button>
  )
}

export default MainButton
