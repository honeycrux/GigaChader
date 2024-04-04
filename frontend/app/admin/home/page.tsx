"use client";

import { Image } from "primereact/image";
import { InputText } from 'primereact/inputtext';
import { useState } from "react";
import { Dropdown } from 'primereact/dropdown';

interface ActionOption {
    name: string;
    code: string;
}
const admin = () => {

    const [selectedButton, setSelectedButton] = useState('User management');

    const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
    const actions: ActionOption[] = [
        {name: 'Edit', code: 'ED'},
        {name: 'Remove', code: 'RM'}
    ];

    const actionTemplate = (option: ActionOption) => {
        return (
            <div className={`p-d-flex p-ai-center ${option.code === 'RM' ? 'text-red-500' : ''}`}>
                <span className="p-ml-2">{option.name}</span>
            </div>
        );
    };

    return (
        // force page size to fit screen
        <div className='w-screen h-screen'>
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

            {/* define size of area below navbar */}
            <div className='flex h-[calc(100%-4rem)]'>
                {/* sidebar start */}
                <aside className="flex flex-col bg-orange2 w-60 px-4 py-2 overflow-y-auto">

                    <button
                        className={`flex items-center my-2 w-full py-2 h-16 pl-5 rounded-lg ${selectedButton === 'User management' ? 'bg-orange1 text-white' : ' text-black'}`}
                        onClick={() => setSelectedButton('User management')}
                    >
                        <i className="pi pi-user-edit text-2xl"></i>
                        <span className="ml-3 text-2xl">User management</span>
                    </button>
                    <button
                        className={`flex items-center my-4 w-full py-2 h-16 pl-5 rounded-lg ${selectedButton === 'Post management' ? 'bg-orange1 text-white' : ' text-black'}`}
                        onClick={() => setSelectedButton('Post management')}
                    >
                        <i className="pi pi-comments text-2xl"></i>
                        <span className="ml-3 text-2xl">Post management</span>
                    </button>
                </aside>

                {/* sidebar end */}

                {/* main content start */}
                <main className='flex w-[calc(100%-15rem)] justify-center'>
                    {/* main content with margin */}


                    {selectedButton === 'User management' && (
                        <div className="flex flex-col w-[100%] [&>*]:my-3 border-x-0 border-black ">
                            <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                                <p className="text-3xl mt-6 ml-6">User Management</p>
                            </div>
                            <hr className="border-gray-1000 mb-2 " /> {/* This adds a grey line */}
                            <p className="text-xl mb-2 ml-6">Search</p> {/* This adds the "Search" text */}
                            <InputText className="border p-2 rounded-md mb-4 ml-6 mt-1 w-[95%] " placeholder="Search..." /> {/* This adds a search box */}

                            {/* this part for the table */}
                            <table className="table-auto border-collapse w-full">
                                <thead>
                                    <tr className="rounded-lg text-left border-b border-gray-300" >
                                        <th className="px-8 py-2">UserID</th>
                                        <th className="px-8 py-2">Username</th>
                                        <th className="px-8 py-2">Display Name</th>
                                        <th className="px-8 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-normal text-gray-700">
                                    <tr className="hover:bg-gray-100 border-b border-gray-300 py-10">
                                        <td className="px-8 py-4">User ID-------------</td>
                                        <td className="px-8 py-4">Username</td>
                                        <td className="px-8 py-4">Display Name</td>
                                        <td className="px-8 py-4 flex space-x-4">
                                            <button className="bg-orange1  text-white py-2 px-10 rounded-lg">
                                                Edit
                                            </button>
                                            
                                            <button className="bg-red-500 text-white py-2 px-7 rounded-lg">
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>


                    )}

                    {selectedButton === 'Post management' && (
                        <div className="flex flex-col w-[100%] [&>*]:my-3 border-x-0 border-black">
                            <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                                <p className="text-3xl mt-6 ml-6">Post Management</p>
                            </div>
                            <hr className="border-gray-1000 mb-2 " /> {/* This adds a grey line */}
                            <p className="text-xl mb-2 ml-6">Search</p> {/* This adds the "Search" text */}
                            <InputText className="border p-2 rounded-md mb-4 ml-6 mt-1 w-[95%] " placeholder="Search..." /> {/* This adds a search box */}
                            {/* this part for the table */}
                            <table className="table-auto border-collapse w-full">
                                <thead>
                                    <tr className="rounded-lg text-left border-b border-gray-300" >
                                        <th className="px-8 py-2">PostID</th>
                                        <th className="px-8 py-2">Username</th>
                                        <th className="px-8 py-2">Post content</th>
                                        <th className="px-8 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-normal text-gray-700">
                                    <tr className=" border-b border-gray-300 py-10">
                                        <td className="px-8 py-4">Post ID-------------</td>
                                        <td className="px-8 py-4">Username</td>
                                        <td className="px-8 py-4">Post content</td>
                                        <td className="px-8 py-4">
                                        
                                        <Dropdown className="border border-gray-300 py-0 rounded-lg" value={selectedAction} options={actions} onChange={(e) => setSelectedAction(e.value)} 
                                                  itemTemplate={actionTemplate} placeholder="Choose an action"/>
                                        
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
                       
                        </div>
                    )}
                </main>
                {/* main content end */}
            </div>
        </div>
    )
}
export default admin