"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { use, useEffect, useRef, useState } from "react";
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

interface Props {
    id: string;
    currentUserName: string;  // for checking if the current user can delete a post
    parentPostId: string | null; // for comments
    content: string;
    author: {
      username: string;
      displayName: string;
      imageUrl: string;
      id: string;
    };
    createdAt: string;
    isComment?: boolean;
    commentCount: number;
    likeCount: number;
  }

const PostBox = (
    {
        id,
        currentUserName,
        parentPostId,
        content,
        author,
        createdAt,
        isComment,
        commentCount,
        likeCount,
      }: any) => {
    const toast = useRef<Toast>(null);
    const [heartPath, setHeartPath] = useState("/heart.svg");
    const bisLiked = useRef(false);
    const [likeCountInternal, setlikeCountInternal] = useState(likeCount);

    const checkLiked = async () => {
        const res = await apiClient.post.getLikes({ query: { postId: id } });
        // bisLiked.current = res.body;
        console.log("post content:");
        console.log(content);
        console.log(res.body);
        // @ts-ignore
        bisLiked.current = res.body.some((user: { username: string }) => user.username === currentUserName);
        // @ts-ignore
        setlikeCountInternal(res.body.length);
        
        if (bisLiked.current) {
            setHeartPath("/heart_red.svg");
        } else {
            setHeartPath("/heart.svg");
        }
    }

    useEffect(() => {
        
        checkLiked();
    }, [id]);

    const handleHeartClick = async () => {
        bisLiked.current = !bisLiked.current;
        if (bisLiked.current) {
            setHeartPath("/heart_red.svg");
        } else {
            setHeartPath("/heart.svg");
        }
        const res = await apiClient.post.postLike({ body: { postId: id, set: bisLiked.current }});
        console.log(res);
        checkLiked();
    }

    const [commentContent, setCommentContent] = useState("");
    const [bShowCommentBox, setBShowCommentBox] = useState(false);
    const handleCommentClick = () => {
        setBShowCommentBox(prevbShowCommentBox => !prevbShowCommentBox);
    }

    const handleCommentSubmit = () => {
        if (toast.current) {
            toast.current.show({ severity: "info", summary: "Success", detail: "Fake submit comment" });
        }
    }
  return (
    <div className="flex flex-col w-full bg-orange2 rounded-2xl p-4">
        <Toast ref={toast}></Toast>
        <div className="flex">
            <div className="flex flex-col items-center">
                <Avatar className="mr-2" image="/cheem.jpg" shape="circle" size="large" />
                <div className="relative mt-2 grow w-0.5 rounded-full bg-gray-600" />
            </div>
            <div className="whitespace-pre-wrap">
                <div>
                    <span className="mr-2">{author.displayName}</span>
                    <span className="text-gray-600">@{author.username}</span>
                </div>
                <div>
                    <p>{content}</p>
                </div>
                <div className="inline-flex [&>*]:mr-2 items-end">
                    {currentUserName && (<Image src={heartPath}
                            width="24"
                            alt="heart"
                            onClick={handleHeartClick}
                            className="cursor-pointer"
                    />)}
                    <Link href={`/post/${id}`}>
                        <Image src="/comment.svg"
                                width="24"
                                alt="comment"
                                // onClick={handleCommentClick}
                                className="cursor-pointer"
                        />
                    </Link>
                    <span className="text-gray-600 text-sm">
                        {likeCountInternal} like(s), {commentCount} comment(s)
                    </span>
                </div>
            </div>
        </div>
        <p className="text-gray-600">{formatDate(createdAt)}</p>
        {
            bShowCommentBox &&
            <div className="flex flex-col w-full">
                <p className="text-xl">Comment</p>
                <InputTextarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)}
                rows={4} cols={30} autoResize className="mb-2" />
                <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
            </div>
        }
    </div>
  )
}

export default PostBox