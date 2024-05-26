"use client";

import { Image } from "primereact/image";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useAuthContext } from "@/providers/auth-provider";
import { PostModifyProps, SimplePostInfo } from "#/shared/models/post";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { siteLinkBuilder } from "@/lib/utils";
import { InputTextarea } from "primereact/inputtextarea";

interface ActionOption {
  name: string;
  code: string;
}

interface PostItemProps {
  postInfo: SimplePostInfo;
  index: number;
}

// dummy page and unused
const PostMangement = () => {
  const { user } = useAuthContext();
  const [selectedPost, setSelectedPost] = useState<PostItemProps | null>(null);
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

  /**
   * Post Actions
   */
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = useState(false);
  const [showPostModificationDialog, setShowPostModificationDialog] = useState(false);
  const actionTemplate = (option: ActionOption) => {
    return (
      <div className={`p-d-flex p-ai-center ${option.code === "SP" ? "text-red-500" : ""}`}>
        <span className="p-ml-2">{option.name}</span>
      </div>
    );
  };
  const onActionChange = (props: PostItemProps) => (e: DropdownChangeEvent) => {
    setSelectedPost(props);
    if (e.value.code === "SP") {
      setShowDeleteConfirmationDialog(true);
    }
    if (e.value.code === "ED") {
      setEditContent(props.postInfo.content);
      setRemoveUserMedia(false);
      setShowPostModificationDialog(true);
    }
  };

  /**
   * Post Deletion
   */
  async function handlePostDeletion() {
    if (!selectedPost) {
      return;
    }
    const { postInfo, index } = selectedPost;
    const newValue = !postInfo.suspended;
    const res = await apiClient.admin.suspendPost({
      body: { postId: postInfo.id, set: newValue },
    });
    console.log(res);
    if (res.status === 200 && res.body.success) {
      if (searchResult) {
        searchResult[index].suspended = newValue;
      }
      setSearchResult(searchResult);
    }
    setShowDeleteConfirmationDialog(false);
    handleSearch(searchText);
  }

  const deleteConfirmationFooter = (
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
          setShowDeleteConfirmationDialog(false);
        }}
        className="p-button"
      />
    </div>
  );

  /**
   * Post Modification
   */
  const [editContent, setEditContent] = useState<string | null>(null);
  const [removeUserMedia, setRemoveUserMedia] = useState<boolean | null>(null);
  async function handlePostModification(props: { content: string; removeUserMedia: boolean }) {
    if (!selectedPost) {
      return;
    }
    const { content: newContent, removeUserMedia } = props;
    const { postInfo, index } = selectedPost;
    const payload: PostModifyProps = { postId: postInfo.id };
    let hasModification = false;
    if (postInfo.content !== newContent) {
      payload.content = newContent;
      hasModification = true;
    }
    if (removeUserMedia) {
      payload.userMedia = [];
      hasModification = true;
    }
    console.log(hasModification);
    if (hasModification) {
      const res = await apiClient.admin.opModifyPost({
        body: payload,
      });
      console.log(res);
      if (res.status === 200 && res.body) {
        if (searchResult) {
          searchResult[index] = res.body;
          setSearchResult(searchResult);
        }
      }
    }
    setShowPostModificationDialog(false);
  }

  const postModificationFooter = (
    <div>
      <Button
        label="OK"
        icon="pi pi-check"
        onClick={() => {
          console.log(editContent, removeUserMedia);
          if (editContent !== null && removeUserMedia !== null) {
            handlePostModification({ content: editContent, removeUserMedia: removeUserMedia });
          }
        }}
        autoFocus
      />
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setShowPostModificationDialog(false);
        }}
        className="p-button"
      />
    </div>
  );

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
                  <tr className="hover:bg-gray-100 border-b border-gray-300 py-10" key={index}>
                    <td className="px-8 py-4">
                      <Link href={siteLinkBuilder.post({ postId: post.id })} className="text-orange1 hover:underline">
                        {post.id}
                      </Link>
                    </td>
                    <td className="px-8 py-4">{post.author.username}</td>
                    <td className="px-8 py-4">{post.content}</td>
                    <td className="px-8 py-4">{post.suspended ? "Deleted" : post.editedByModerator ? "Edited" : "OK"}</td>
                    <td className="px-8 py-4">
                      <Dropdown
                        className="border border-gray-300 py-0 rounded-lg"
                        value={null}
                        options={actions(post.suspended)}
                        onChange={onActionChange({
                          postInfo: post,
                          index: index,
                        })}
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

      {/* Delete/Undelete Confirmation Dialog */}
      <Dialog
        header="Confirmation"
        visible={showDeleteConfirmationDialog}
        style={{ width: "50vw" }}
        footer={deleteConfirmationFooter}
        onHide={() => setShowDeleteConfirmationDialog(false)}
      >
        Do you want to {selectedPost && selectedPost.postInfo.suspended ? "undelete" : "delete"} this post?
      </Dialog>

      {/* Post Modification Dialog */}
      <Dialog
        header="Confirmation"
        visible={showPostModificationDialog}
        style={{ width: "50vw" }}
        footer={postModificationFooter}
        onHide={() => setShowPostModificationDialog(false)}
      >
        {selectedPost && editContent && (
          <>
            <div>
              <p className="text-xl">Content</p>
              <div className="flex w-96">
                <InputTextarea className="w-full" value={editContent} maxLength={1000} onChange={(e) => setEditContent(e.target.value)} rows={4} autoResize />
              </div>
              <p>Text length: {editContent.length}/1000</p>
            </div>
            {!removeUserMedia && selectedPost.postInfo.userMedia && selectedPost.postInfo.userMedia.length > 0 && (
              <div className="flex flex-wrap">
                {selectedPost.postInfo.userMedia.map((media: { url: string; type: string }, index: number) => (
                  <div key={index} className="my-2">
                    {media.type === "IMAGE" ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_BACKEND_URL + media.url}
                        alt="image"
                        preview
                        pt={{
                          image: { className: "rounded-lg" },
                        }}
                      />
                    ) : (
                      <video controls>
                        <source src={process.env.NEXT_PUBLIC_BACKEND_URL + media.url} type="video/mp4" />
                        {/* if browser does not support video tag, display this message */}
                        <span>Your browser does not support the video tag.</span>
                      </video>
                    )}
                  </div>
                ))}
                <Button text label="Remove Media" onClick={() => setRemoveUserMedia(true)} />
              </div>
            )}
          </>
        )}
      </Dialog>
    </>
  );
};

export default PostMangement;
