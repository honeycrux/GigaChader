"use client";

import { InputText } from 'primereact/inputtext';
import { useState } from "react";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';


const userMangement = () => {

    const [showSuspendDialog, setShowSuspendDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const renderFooter = () => {
        return (
            <div>
                <Button label="Yes" className="p-button-danger" onClick={() => handleSuspendUser()} />
                <Button label="No" className="p-button" onClick={() => setShowSuspendDialog(false)} />
                
            </div>
        );
    };

    const handleSuspendClick = () => {
        setShowSuspendDialog(true);
    };

    const handleSuspendUser = () => {
        // Add logic here to Suspend the user
        console.log('User Suspended');
        setShowSuspendDialog(false);
    };

    const [selectedUser, setSelectedUser] = useState({id: '', username: '', displayName: ''}); 
    const handleEditClick = (user:any) => { // Add this function
        setSelectedUser(user);
        setShowEditDialog(true);
    };
// Add this Dialog component for editing
const renderEditDialog = () => {
    if (!selectedUser) return null;
    return (
        <Dialog visible={showEditDialog} style={{ width: '450px' }} header="Edit User"
            modal footer={renderFooter()} onHide={() => setShowEditDialog(false)}>
            <p>UserID: {selectedUser.id}</p>
            <p>Username: {selectedUser.username}</p>
            <p>Display Name: {selectedUser.displayName}</p>
        </Dialog>
    );
};
    return (
        <>
            {/* main content start */}
            <main className='flex w-[95%] justify-center'>
                {/* main content with margin */}

                <div className="flex flex-col w-full [&>*]:my-3  border-x-0 border-black ">
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
                                <td className="px-8 py-4">1234</td>
                                <td className="px-8 py-4">user1</td>
                                <td className="px-8 py-4">dsname</td>
                                <td className="px-8 py-4 flex space-x-4">
                                <button className="bg-orange1  text-white py-2 px-10 rounded-lg"
                onClick={() => handleEditClick({id: '1234', username: 'user1', displayName: 'dsname'})}>
                Edit
            </button>
            {renderEditDialog()}
                                    <button className="bg-red-500 text-white py-2 px-7 rounded-lg"
                                        onClick={handleSuspendClick}>
                                        Suspend
                                    </button>
                                    {/* Add this Dialog component */}
                                    <Dialog visible={showSuspendDialog} style={{ width: '450px' }} header="Confirmation"
                                        modal footer={renderFooter()} onHide={() => setShowSuspendDialog(false)}>
                                        Do you want to suspend this user?
                                    </Dialog>
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

export default userMangement