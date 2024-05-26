"use client";

import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { apiClient } from "@/lib/apiClient";
import { SimpleUserInfo } from "#/shared/models/user";
import { useAuthContext } from "@/providers/auth-provider";

// page for suspending users
const UserManagement = () => {
  const { user } = useAuthContext();
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showUnsuspendDialog, setShowUnsuspendDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<SimpleUserInfo[] | null>(null);

  useEffect(() => {
    // abuse search function to list all users
    handleSearch("");
  }, []);

  // submit search query to backend
  const handleSearch = async (searchParams: string) => {
    setSearchText(searchParams);
    const searchResult = await apiClient.admin.opListUsers({ query: { query: searchParams } });
    if (searchResult.status === 200 && searchResult.body) {
      console.log(searchResult.body);
      setSearchResult(searchResult.body);
    }
  };

  const renderFooter = () => {
    return (
      <div>
        <Button label="Yes" className="p-button-danger" onClick={() => handleSuspendUser()} />
        <Button label="No" className="p-button" onClick={() => setShowSuspendDialog(false)} />
      </div>
    );
  };

  const renderUnsuspendFooter = () => {
    return (
      <div>
        <Button label="Yes" className="p-button-danger" onClick={() => handleUnsuspendUser()} />
        <Button label="No" className="p-button" onClick={() => setShowUnsuspendDialog(false)} />
      </div>
    );
  };

  // show confirm dialog when suspending a user
  const handleSuspendClick = (user: SimpleUserInfo) => {
    setSelectedUser(user);
    setShowSuspendDialog(true);
  };

  // show confirm dialog when unsuspending a user
  const handleUnsuspendClick = (user: SimpleUserInfo) => {
    setSelectedUser(user);
    setShowUnsuspendDialog(true);
  };

  const handleSuspendUser = async () => {
    const res = await apiClient.admin.suspendUser({ body: { username: selectedUser.username, set: true } });
    console.log(res);
    setShowSuspendDialog(false);
  };

  const handleUnsuspendUser = async () => {
    const res = await apiClient.admin.suspendUser({ body: { username: selectedUser.username, set: false } });
    console.log(res);
    setShowUnsuspendDialog(false);
  };

  const [selectedUser, setSelectedUser] = useState({ username: "", displayName: "" });

  // edit user is unused
  const handleEditClick = (user: SimpleUserInfo) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };
  // Add this Dialog component for editing
  const renderEditDialog = () => {
    if (!selectedUser) return null;
    return (
      <Dialog visible={showEditDialog} style={{ width: "450px" }} header="Edit User" modal footer={renderFooter()} onHide={() => setShowEditDialog(false)}>
        {/* <p>UserID: {selectedUser.id}</p> */}
        <p>Username: {selectedUser.username}</p>
        <p>Display Name: {selectedUser.displayName}</p>
      </Dialog>
    );
  };

  // show confirm dialog when suspending a user
  const renderSuspendDialog = () => {
    // if (!selectedUser) return null;
    return (
      <Dialog visible={showSuspendDialog} className="w-[50vw]" header="Delete User" modal footer={renderFooter()} onHide={() => setShowSuspendDialog(false)}>
        <p className="text-xl font-bold">Confirm suspend the following user?</p>
        {/* <p>UserID: {selectedUser.id}</p> */}
        <p>Username: {selectedUser.username}</p>
        <p>Display Name: {selectedUser.displayName}</p>
      </Dialog>
    );
  };

  // show confirm dialog when unsuspending a user
  const renderUnsuspendDialog = () => {
    // if (!selectedUser) return null;
    return (
      <Dialog
        visible={showUnsuspendDialog}
        className="w-[50vw]"
        header="Delete User"
        modal
        footer={renderUnsuspendFooter()}
        onHide={() => setShowUnsuspendDialog(false)}
      >
        <p className="text-xl font-bold">Confirm unsuspend the following user?</p>
        {/* <p>UserID: {selectedUser.id}</p> */}
        <p>Username: {selectedUser.username}</p>
        <p>Display Name: {selectedUser.displayName}</p>
      </Dialog>
    );
  };

  if (user?.role !== "ADMIN") {
    return <p>User is not logged in as an admin</p>;
  }

  return (
    <>
      {/* main content start */}
      <main className="flex w-full justify-center overflow-y-auto">
        {/* main content with margin */}

        <div className="flex flex-col w-full [&>*]:my-3  border-x-0 border-black ">
          <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
            <p className="text-3xl mt-6 ml-6">User Management</p>
          </div>
          <hr className="border-gray-1000 mb-2 " /> {/* This adds a grey line */}
          <p className="text-xl mb-2 ml-6">Search</p> {/* This adds the "Search" text */}
          <InputText
            className="border p-2 rounded-md mb-4 ml-6 mt-1 w-[95%]"
            value={searchText}
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value)}
          />{" "}
          {/* This adds a search box */}
          {/* this part for the table */}
          <table className="table-auto border-collapse w-full">
            <thead>
              <tr className="rounded-lg text-left border-b border-gray-300">
                {/* <th className="px-8 py-2">UserID</th> */}
                <th className="px-8 py-2">Username</th>
                <th className="px-8 py-2">Display Name</th>
                <th className="px-8 py-2">Suspend Status</th>
                <th className="px-8 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-normal text-gray-700">
              {searchResult &&
                searchResult.map((user, index) => (
                  <tr className="hover:bg-gray-100 border-b border-gray-300 py-10" key={index}>
                    {/* <td className="px-8 py-4">{user.id}</td> */}
                    <td className="px-8 py-4">{user.username}</td>
                    <td className="px-8 py-4">{user.displayName}</td>
                    <td className="px-8 py-4">{user.suspended.toString()}</td>
                    <td className="px-8 py-4 flex space-x-4">
                      {/* <button className="bg-orange1  text-white py-2 px-10 rounded-lg"
                                            onClick={() => handleEditClick(user)}>
                                            Edit
                                        </button> */}
                      <button className="bg-red-500 text-white py-2 px-7 rounded-lg" onClick={() => handleSuspendClick(user)}>
                        Suspend
                      </button>
                      <button className="bg-orange1 text-white py-2 px-7 rounded-lg" onClick={() => handleUnsuspendClick(user)}>
                        Unsuspend
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {renderEditDialog()}
          {renderSuspendDialog()}
          {renderUnsuspendDialog()}
        </div>
      </main>
      {/* main content end */}
    </>
  );
};

export default UserManagement;
