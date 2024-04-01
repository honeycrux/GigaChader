"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const LeftSidebar = () => {
    const [selectedButton, setSelectedButton] = useState('');
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname.includes('home')) {
            setSelectedButton('Home');
        } else if (pathname.includes('search')) {
            setSelectedButton('Search');
        } else if (pathname.includes('activity')) {
            setSelectedButton('Activity');
        } else if (pathname.includes('profile')) {
            setSelectedButton('Profile');
        }
    }, [pathname]); // Re-run the effect when `pathname` changes
  return (
    <>
    {/* sidebar start */}
    <aside className="flex flex-col bg-orange2 w-60 px-4 py-2 overflow-y-auto">
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Home' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => {setSelectedButton('Home'); router.push('/home')}}
        >
            <i className="pi pi-home text-2xl"></i>
            <span className="ml-3 text-2xl">Home</span>
        </button> 
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Search' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => {setSelectedButton('Search'); router.push('/search')}}
        >
            <i className="pi pi-search text-2xl"></i>
            <span className="ml-3 text-2xl">Search</span>
        </button>
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Activity' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => {setSelectedButton('Activity'); router.push('/activity')}}
        >
            <i className="pi pi-heart text-2xl"></i>
            <span className="ml-3 text-2xl">Activity</span>
        </button>
        <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === 'Profile' ? 'bg-orange1 text-white' : ' text-black'}`}
            onClick={() => {setSelectedButton('Profile'); router.push('/profile')}}
        >
            <i className="pi pi-user text-2xl"></i>
            <span className="ml-3 text-2xl">Profile</span>
        </button>
    </aside>

    {/* sidebar end */}
    </>
  )
}

export default LeftSidebar