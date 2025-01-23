import React from 'react'

const MainButton = ({text ,className=""}) => {
  return (
    <button
    type="submit"
    className={` ${className} p-10 w-full bg-[#ED1C24] text-white text:sm font-semibold py-2 rounded-lg hover:bg-red-600 transition duration-300`}
  >
   {text}
  </button>
  )
}

export default MainButton
