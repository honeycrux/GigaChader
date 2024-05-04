"use client";

import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useAuthContext } from "@/providers/auth-provider";
interface ActionOption {
  name: string;
  code: string;
}

// dummy page and unused
const PostMangement = () => {
  const { user } = useAuthContext();
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
  const actions: ActionOption[] = [
    { name: "Edit", code: "ED" },
    { name: "Suspend", code: "SP" },
  ];

  const actionTemplate = (option: ActionOption) => {
    return (
      <div className={`p-d-flex p-ai-center ${option.code === "SP" ? "text-red-500" : ""}`}>
        <span className="p-ml-2">{option.name}</span>
      </div>
    );
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const onActionChange = (e: DropdownChangeEvent) => {
    setSelectedAction(e.value);
    if (e.value.code === "SP") {
      setShowConfirmDialog(true);
    }
  };

  const renderFooter = () => {
    return (
      <div>
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={() => {
            /* handle removal logic here */
          }}
          autoFocus
        />
        <Button
          label="No"
          icon="pi pi-times"
          onClick={() => {
            setShowConfirmDialog(false);
            setSelectedAction(null);
          }}
          className="p-button"
        />
      </div>
    );
  };

  if (user?.role !== "ADMIN") {
    return <p>User is not logged in as an admin</p>;
  }

  return (
    <>
      {/* main content start */}
      <main className="flex w-[95%] justify-center">
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
              <tr className="rounded-lg text-left border-b border-gray-300">
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
                  <Dropdown
                    className="border border-gray-300 py-0 rounded-lg"
                    value={selectedAction}
                    options={actions}
                    onChange={onActionChange}
                    itemTemplate={actionTemplate}
                    optionLabel="name"
                    placeholder="Choose an action"
                  />

                  <Dialog
                    header="Confirmation"
                    visible={showConfirmDialog}
                    style={{ width: "50vw" }}
                    footer={renderFooter()}
                    onHide={() => setShowConfirmDialog(false)}
                  >
                    Do you want to suspend this post?
                  </Dialog>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      {/* main content end */}
    </>
  );
};

export default PostMangement;
