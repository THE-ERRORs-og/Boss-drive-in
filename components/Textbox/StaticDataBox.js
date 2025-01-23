import React from 'react'

const StaticDataBox = ({text , className=""} )=> {
  return (
    <p className={`${className} md:text-xl pt-2 pl-2 pb-2 md:pr-16 border border-black rounded-xl font-semibold `}> {text} </p>
  )
}

export default StaticDataBox
