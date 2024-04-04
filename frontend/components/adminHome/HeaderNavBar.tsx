"use client";

import { Image } from "primereact/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
const HeaderNavBar = () => {
    return (
        <>
    {/* header start */}
    <nav className="flex bg-orange2 h-16 items-center space-x-2 justify-between px-4">
    <a className="flex items-center space-x-2" href="/home">
        <Image src="/gigachader_notext.png" alt="gigachad logo" width="50" />
        <span className="text-xl font-bold">GigaChader</span>
        <span className="text-xl ">Admin</span>
    </a>

    <button
        className="flex items-center space-x-2 transition duration-300 ease-in-out hover:bg-[hsl(40,32%,71%)] 
         rounded-md p-2"

    >
        <Image src="/placeholder_profilePic.png" alt="user profile pic" width="50" />
        <span className="text-xl ">Admin</span>
    </button>
</nav>
{/* header end */}

</>
);
};

export default HeaderNavBar;