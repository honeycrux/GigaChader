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
    <>
        <Toast ref={toast}></Toast>
        {/* main content start */}
        <main className='flex w-full justify-center'>
            {/* main content with margin */}
            <div className="flex flex-col w-[60%] space-y-4">
                <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                    <p className="text-3xl font-bold">Home</p>
                    <Button label="Add" onClick={handleAddPost} />
                </div>

                {dummyPost.map((post, index) => <PostBox key={index} {...post} />)}
            </div>              
        </main>
        {/* main content end */}
    </>
    )
}

export default home