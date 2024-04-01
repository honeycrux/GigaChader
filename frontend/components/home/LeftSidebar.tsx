"use client";

import { useState } from 'react'

const LeftSidebar = () => {
    const [selectedButton, setSelectedButton] = useState('Home');
  return (
    <>
    {/* sidebar start */}
    <aside className="bg-orange2 w-60 overflow-y-auto flex flex-col items-start px-4 py-2">
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Home' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => setSelectedButton('Home')}
        >
            <i className="pi pi-home text-3xl"></i>
            <span className="ml-3 font-bold text-3xl">Home</span>
        </button> 
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Search' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => setSelectedButton('Search')}
        >
            <i className="pi pi-search text-3xl"></i>
            <span className="ml-3 font-bold text-3xl">Search</span>
        </button>
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Activity' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => setSelectedButton('Activity')}
        >
            <i className="pi pi-heart text-3xl"></i>
            <span className="ml-3 font-bold text-3xl">Activity</span>
        </button>
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Profile' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => setSelectedButton('Profile')}
        >
            <i className="pi pi-user text-3xl"></i>
            <span className="ml-3 font-bold text-3xl">Profile</span>
        </button>
    </aside>

    {/* sidebar end */}
    </>
  )
}

export default LeftSidebar