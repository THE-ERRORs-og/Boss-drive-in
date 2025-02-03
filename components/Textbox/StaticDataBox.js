import React from 'react'

const StaticDataBox = ({text , className=""} )=> {
  return (
    <p className={`${className} md:text-xl pt-1 pl-1 pb-1 md:pr-16 border border-black rounded-xl font-semibold `}> {text} </p>
  )
}

export default StaticDataBox
