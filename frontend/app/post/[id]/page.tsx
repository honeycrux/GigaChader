"use client";

import { fakeFetchPost } from "@/lib/utils";
import PostBox from "@/components/home/PostBox";
import { InputTextarea } from "primereact/inputtextarea";
import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const postDetails = ({ params }: { params: { id: string } }) => {
    if (!params.id) return null;
    const post = fakeFetchPost(params.id);
    if (!post) return null;

    const toast = useRef<Toast>(null);

    const [commentContent, setCommentContent] = useState("");
    const [bShowCommentBox, setBShowCommentBox] = useState(false);

    const handleCommentSubmit = () => {
        if (toast.current) {
            toast.current.show({ severity: "info", summary: "Success", detail: "Fake submit comment" });
        }
    }
    
    return (
        <>
            <Toast ref={toast}></Toast>
            <PostBox
                id={post.id}
                currentUserId={post.author.id}
                parentId={null}
                content={post.content}
                author={post.author}
                createdAt={post.createdAt}
                comments={post.comments}
            />
            <div className="flex flex-col w-full">
                <p className="text-xl">Comment</p>
                <InputTextarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)}
                rows={4} cols={30} autoResize className="mb-2" />
                <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
            </div>
        </>
    )
}

export default postDetails