"use client";

import PostBox from "@/components/home/PostBox";
import { InputTextarea } from "primereact/inputtextarea";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { PostInfo } from "#/shared/models/post";

// get post id from the url
const PostDetails = ({ params }: { params: { id: string } }) => {
  const [post, setPost] = useState<PostInfo | null>(null);
  const [comments, setComments] = useState<PostInfo[] | null>(null);

  // get post details by id
  const getPost = useCallback(async () => {
    const res = await apiClient.post.getPost({ params: { postId: params.id } });
    if (res.status === 200 && res.body) {
      setPost(res.body);
    }
  }, [params.id]);

  // get comments of the post
  const getComments = useCallback(async () => {
    const res = await apiClient.post.getComments({ query: { postId: params.id } });
    if (res.status === 200 && res.body) {
      setComments(res.body);
    }
  }, [params.id]);

  // get post and comments on page load
  useEffect(() => {
    const wrapper = async () => {
      getPost();
      getComments();
    };

    wrapper();
  }, [params.id, getComments, getPost]);

  const toast = useRef<Toast>(null);

  const [commentContent, setCommentContent] = useState("");

  // submit a comment to backend
  const handleCommentSubmit = async () => {
    if (!post) {
      return;
    }

    const res = await apiClient.post.postCreate({
      body: {
        content: commentContent,
        parentPostId: post.id,
      },
    });

    console.log(res);
    if (res.status === 200 && res.body) {
      getPost();
      getComments();
      setCommentContent("");

      if (toast.current) {
        toast.current.show({ severity: "info", summary: "Success", detail: "submit comment" });
      }
    } else {
      if (toast.current) {
        toast.current.show({ severity: "info", summary: "Error", detail: "some error occurred" });
      }
    }
  };

  // check if the user is logged in
  const { user } = useAuthContext();
  const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);
  useEffect(() => {
    const wrapper = async () => {
      if (!user) {
        setbIsLoggedin(false);
      } else {
        setbIsLoggedin(true);
      }
    };

    wrapper();
  }, [user]);

  return (
    <div className="flex w-full overflow-y-auto justify-center">
      <div className="flex flex-col w-[60%]">
        <Toast ref={toast}></Toast>
        <br className="mt-10" />
        {post && <PostBox post={post} currentPostPageId={params.id} currentUserName={user?.username} />}
        {bIsLoggedin && (
          <div className="flex flex-col w-full mt-4">
            <p className="text-xl">Make a Comment</p>
            <InputTextarea value={commentContent} maxLength={1000}
            onChange={(e) => setCommentContent(e.target.value)} rows={4} cols={30} autoResize className="mb-2" />
            <p>Text length: {commentContent.length}/1000</p>
            <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
          </div>
        )}
        <p className="text-xl">Comments</p>
        <div className="mt-2 space-y-2">
          {comments && comments.length > 0 ? (
            comments.map((comment) => <PostBox key={comment.id} post={comment} currentPostPageId={params.id} currentUserName={user?.username} />)
          ) : (
            <p>No comments yet ._.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
