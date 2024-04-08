"use client";


import { Image } from "primereact/image";
import { InputText } from 'primereact/inputtext';
import { useState } from "react";
import { Dropdown } from 'primereact/dropdown';

interface ActionOption {
    name: string;
    code: string;
}

const postMangement = () => {


    const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
    const actions: ActionOption[] = [
        { name: 'Edit', code: 'ED' },
        { name: 'Remove', code: 'RM' }
    ];

    const actionTemplate = (option: ActionOption) => {
        return (
            <div className={`p-d-flex p-ai-center ${option.code === 'RM' ? 'text-red-500' : ''}`}>
                <span className="p-ml-2">{option.name}</span>
            </div>
        );
    };

        return (
        <>
            {/* main content start */}
            <main className='flex w-[95%] justify-center'>
                {/* main content with margin */}

                <div className="flex flex-col w-[100%] [&>*]:my-3  border-x-0 border-black ">
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

            </main>
            {/* main content end */}
        </>
    )

}

export default postMangement