"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Image } from 'primereact/image';
import cheem from "@/public/cheem.jpg";
import { Avatar } from 'primereact/avatar';

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
            <aside className="bg-orange2 w-60 overflow-y-auto [&>*]:my-2">
                {/* border-4 border-black */}
                <p className='!my-0'>sidebar</p>
                <p>item1</p>
                <p>item2</p>
            </aside>
            {/* sidebar end */}

            {/* main content start */}
            <main className='flex w-[calc(100%-15rem)] justify-center'>
                {/* main content with margin */}
                <div className="flex flex-col w-[70%] [&>*]:my-4 border-x-0 border-black">
                    <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                        <p className="text-3xl font-bold">Home</p>
                        <Button label="Add" onClick={handleAddPost} />
                    </div>
                    
                    <div className="flex flex-col w-full bg-orange2 rounded-2xl p-4">
                        {/* <Image src="/cheem.jpg"
                                height="12"
                                alt="profile picture"
                                className='object-cover rounded-full aspect-square'>
                        </Image> */}
                        <div className="flex">
                            <div className="flex flex-col items-center">
                                <Avatar className="mr-2" image="/cheem.jpg" shape="circle" size="large" />
                                <div className="relative mt-2 grow w-0.5 rounded-full bg-gray-600" />
                            </div>
                            <div className="whitespace-pre-wrap">
                                <div>
                                    <span className="mr-2">Cheem</span>
                                    <span className="text-gray-600">@cheem</span>
                                </div>
                                <div>
                                    <p>DOGE to the mooooon&#10;&#13;The price's been skyrocketting for the last 12 hours</p>
                                </div>
                            </div>
                        </div>
                        <p>date here</p>
                    </div>
                </div>
            </main>
            {/* main content end */}
        </div>

    </div>
  )
}

export default home