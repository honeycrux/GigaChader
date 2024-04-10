"use client";

import { fakeFetchPost } from "@/lib/utils";
import PostBox from "@/components/home/PostBox";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { apiClient } from "@/lib/apiClient";
import { set } from "zod";
import { useAuthContext } from "@/providers/auth-provider";

const PostDetails = ({ params }: { params: { id: string } }) => {
    // const post = fakeFetchPost(params.id);
    const [post, setPost] = useState<any>();
    const [comments, setComments] = useState<any>();

    const getPost = async () => {
        const post = await apiClient.post.getPost({ params: { postId: params.id } });
        setPost(post.body);
    }

    const getComments = async () => {
        const comments = await apiClient.post.getComments({ query: { postId: params.id } });
        setComments(comments.body);
    }

    useEffect(() => {
        const wrapper = async () => {
            getPost();
            getComments();
        };

        wrapper();
    }, [params.id]);

    // if (!params.id || !post) return null;

    const toast = useRef<Toast>(null);

    const [commentContent, setCommentContent] = useState("");
    // const [bShowCommentBox, setBShowCommentBox] = useState(false);

    const handleCommentSubmit = async () => {
        const res = await apiClient.post.postCreate({
            body: {
                content: commentContent,
                parentPostId: post.id,
            }
        });

        console.log(res);
        getPost();
        getComments();

        if (toast.current) {
            toast.current.show({ severity: "info", summary: "Success", detail: "submit comment" });
        }
    }

    const { user, logout } = useAuthContext();
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
                {post && (
                    <PostBox {...post} currentUserName={user?.username} />
                )}
                {bIsLoggedin && (<div className="flex flex-col w-full mt-4">
                    <p className="text-xl">Make a Comment</p>
                    <InputTextarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)}
                    rows={4} cols={30} autoResize className="mb-2" />
                    <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
                </div>)}
                <p className="text-xl">Comments</p>
                <div className="mt-2 space-y-2">
                    {(comments && comments.length > 0) ? comments.map((comment: any) => (
                        <PostBox key={comment.id} {...comment} currentUserName={user?.username} />
                    )) : 
                    <p>No comments yet ._.</p>}
                </div>
            </div>
        </div>
    )
}

export default PostDetails