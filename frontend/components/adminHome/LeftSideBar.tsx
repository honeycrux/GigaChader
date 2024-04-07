"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const LeftSideBar = () => {
    const [selectedButton, setSelectedButton] = useState('');
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname.includes('userManagement')) {
            setSelectedButton('User management');
        } else if (pathname.includes('postManagement')) {
            setSelectedButton('Post management');
        } 
        
    }, [pathname]); // Re-run the effect when `pathname` changes
    return (
        <>
            {/* sidebar start */}
            <aside className="flex flex-col bg-orange2 w-60 px-4 py-2 overflow-y-auto">

                <button
                    className={`flex items-center my-2 w-full py-2 h-16 pl-5 rounded-lg ${selectedButton === 'User management' ? 'bg-orange1 text-white' : ' text-black'}`}
                    onClick={() => {setSelectedButton('User management'); router.push('/admin/userManagement')}}
                >
                    <i className="pi pi-user-edit text-2xl"></i>
                    <span className="ml-3 text-2xl">User management</span>
                </button>
                <button
                    className={`flex items-center my-4 w-full py-2 h-16 pl-5 rounded-lg ${selectedButton === 'Post management' ? 'bg-orange1 text-white' : ' text-black'}`}
                    onClick={() => {setSelectedButton('Post management'); router.push('/admin/postManagement')}}
                >
                    <i className="pi pi-comments text-2xl"></i>
                    <span className="ml-3 text-2xl">Post management</span>
                </button>
            </aside>

            {/* sidebar end */}
        </>
    );
};

export default LeftSideBar;
