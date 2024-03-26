"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { Image } from 'primereact/image';
import cheem from "@/public/cheem.jpg";
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import PostBox from "@/components/home/PostBox";
import dummyPost from "@/dummy_data/dummyPosts.json";

const home = () => {
    const toast = useRef<Toast>(null);
    const handleAddPost = () => {
        if (toast.current) {
            toast.current.show({ severity: "info", summary: "Success", detail: "Fake add post" });
        }
    }
    
  return (
    // force page size to fit screen
    <div className='w-screen h-screen'>
        <Toast ref={toast}></Toast>
        {/* header start */}
        <nav className="flex bg-orange2 h-16 items-center [&>*]:mx-2">
            {/* border-4 border-black */}
            <p className='!mx-0'>header</p>
            <p>item1</p>
            <p>item2</p>
        </nav>
        {/* header end */}

            {/* define size of area below navbar */}
            <div className='flex h-[calc(100%-4rem)]'>
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

                {/* main content start */}
                <main className='flex w-[calc(100%-15rem)] justify-center'>
                    {/* main content with margin */}
                    {selectedButton === 'Home' && (
                    <div className="flex flex-col w-[70%] [&>*]:my-4 border-x-0 border-black">
                        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                            <p className="text-3xl font-bold">Home</p>
                            <Button label="Add" onClick={handleAddPost} />
                        </div>

                        {dummyPost.map((post, index) => <PostBox key={index} {...post} />)}
                    </div>
                    )}

                    {selectedButton === 'Search' && (
                    <div className="flex flex-col w-[70%] [&>*]:my-4 border-x-0 border-black">
                        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                            <p className="text-3xl font-bold">Search</p>
                        </div>
                    </div>
                    )}

                    {selectedButton === 'Activity' && (
                    <div className="flex flex-col w-[70%] [&>*]:my-4 border-x-0 border-black">
                        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                            <p className="text-3xl font-bold">Activity</p>
                        </div>
                    </div>
                    )}

                    {selectedButton === 'Profile' && (
                    <div className="flex flex-col w-[70%] [&>*]:my-4 border-x-0 border-black">
                        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                            <p className="text-3xl font-bold">Profile</p>
                        </div>
                    </div>
                    )}
                    
                </main>
                {/* main content end */}
            </div>

        </div>
    )
}

export default home