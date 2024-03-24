"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import { formatDate } from "@/lib/utils";

interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
      username: string;
      displayName: string;
      image: string;
      id: string;
    };
    createdAt: string;
    comments: {
      author: {
        image: string;
      };
    }[];
    isComment?: boolean;
  }

const PostBox = (
    {
        id,
        currentUserId,
        parentId,
        content,
        author,
        createdAt,
        comments,
        isComment,
      }: Props) => {
    const toast = useRef<Toast>(null);
    const [heartPath, setHeartPath] = useState("/heart.svg");
    const bisLiked = useRef(false);

    const handleHeartClick = () => {
        bisLiked.current = !bisLiked.current;
        if (bisLiked.current) {
            setHeartPath("/heart_red.svg");
        } else {
            setHeartPath("/heart.svg");
        }
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
                <div className="inline-flex [&>*]:mr-2">
                    <Image src={heartPath}
                            width="24"
                            alt="heart"
                            onClick={handleHeartClick}
                            className="cursor-pointer"
                    />
                    <Image src="/comment.svg"
                            width="24"
                            alt="comment"
                            onClick={handleCommentClick}
                            className="cursor-pointer"
                    />
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