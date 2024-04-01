import React from 'react'

const HeaderNavbar = () => {
  return (
    <>
    {/* header start */}
    <nav className="flex bg-orange2 h-16 items-center [&>*]:mx-2">
        {/* border-4 border-black */}
        <p className='!mx-0'>header</p>
        <p>item1</p>
        <p>item2</p>
    </nav>
    {/* header end */}
    </>
  )
}

export default HeaderNavbar