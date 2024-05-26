"use client";

import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useAuthContext } from "@/providers/auth-provider";
import { SimplePostInfo } from "#/shared/models/post";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { siteLinkBuilder } from "@/lib/utils";

interface ActionOption {
  name: string;
  code: string;
}

// dummy page and unused
const PostMangement = () => {
  const { user } = useAuthContext();
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
  const [selectedPost, setSelectedPost] = useState<{
    postId: string;
    deleted: boolean;
    index: number;
  } | null>(null);
  const actions: (deleted: boolean) => ActionOption[] = (deleted: boolean) => [
    { name: "Edit", code: "ED" },
    { name: deleted ? "Undelete" : "Delete", code: "SP" },
  ];
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<SimplePostInfo[] | null>(null);

  useEffect(() => {
    // abuse search function to list all users
    handleSearch("");
  }, []);

  // submit search query to backend
  const handleSearch = async (searchParams: string) => {
    setSearchText(searchParams);
    const searchResult = await apiClient.admin.opListPosts({ query: { query: searchParams } });
    if (searchResult.status === 200 && searchResult.body) {
      console.log(searchResult.body);
      setSearchResult(searchResult.body);
    }
  };

  const actionTemplate = (option: ActionOption) => {
    return (
      <div className={`p-d-flex p-ai-center ${option.code === "SP" ? "text-red-500" : ""}`}>
        <span className="p-ml-2">{option.name}</span>
      </div>
    );
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const onActionChange = (postId: string, deleted: boolean, index: number) => (e: DropdownChangeEvent) => {
    setSelectedPost({ postId, deleted, index });
    setSelectedAction(e.value);
    if (e.value.code === "SP") {
      setShowConfirmDialog(true);
    }
  };

  async function handlePostDeletion() {
    if (!selectedPost) {
      return;
    }
    const { postId, deleted, index } = selectedPost;
    const newValue = !deleted;
    const res = await apiClient.admin.suspendPost({
      body: { postId, set: newValue },
    });
    console.log(res);
    if (res.status === 200 && res.body.success) {
      if (searchResult) {
        searchResult[index].suspended = newValue;
      }
      setSearchResult(searchResult);
    }
    setShowConfirmDialog(false);
    setSelectedAction(null);
    handleSearch(searchText);
  }

  const renderFooter = () => {
    return (
      <div>
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={() => {
            /* handle removal logic here */
            handlePostDeletion();
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
          <InputText
            className="border p-2 rounded-md mb-4 ml-6 mt-1 w-[95%] "
            value={searchText}
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value)}
          />{" "}
          {/* This adds a search box */}
          {/* this part for the table */}
          <table className="table-auto border-collapse w-full">
            <thead>
              <tr className="rounded-lg text-left border-b border-gray-300">
                <th className="px-8 py-2">PostID</th>
                <th className="px-8 py-2">Username</th>
                <th className="px-8 py-2">Post content</th>
                <th className="px-8 py-2">Status</th>
                <th className="px-8 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-normal text-gray-700">
              {searchResult &&
                searchResult.map((post, index) => (
                  <tr key={index} className=" border-b border-gray-300 py-10">
                    <td className="px-8 py-4">
                      <Link href={siteLinkBuilder.post({ postId: post.id })} className="text-orange1 hover:underline">
                        {post.id}
                      </Link>
                    </td>
                    <td className="px-8 py-4">{post.author.username}</td>
                    <td className="px-8 py-4">{post.content}</td>
                    <td className="px-8 py-4">{post.suspended ? "Deleted" : "OK"}</td>
                    <td className="px-8 py-4">
                      <Dropdown
                        className="border border-gray-300 py-0 rounded-lg"
                        value={null}
                        options={actions(post.suspended)}
                        onChange={onActionChange(post.id, post.suspended, index)}
                        itemTemplate={actionTemplate}
                        optionLabel="name"
                        placeholder="Choose an action"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
      {/* main content end */}
      <Dialog header="Confirmation" visible={showConfirmDialog} style={{ width: "50vw" }} footer={renderFooter()} onHide={() => setShowConfirmDialog(false)}>
        Do you want to {selectedPost && selectedPost.deleted ? "undelete" : "delete"} this post?
      </Dialog>
    </>
  );
};

export default PostMangement;
