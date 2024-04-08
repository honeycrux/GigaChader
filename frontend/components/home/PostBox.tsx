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
import { Dialog } from 'primereact/dialog';
import { on } from "events";
interface Props {
    id: string;
    currentUserName: string;  // for checking if the current user can delete a post
    parentPostId: string | null; // for comments
    repostingPostId?: string | null; // for reposts
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
    bVisitParentPost?: boolean;
    bButtonvisible?: boolean;
    bshowBorder?: boolean;
    onRepostSubmit?: any;
}

const PostBox = (
    {
        id,
        currentUserName,
        parentPostId,
        repostingPostId,
        content,
        author,
        createdAt,
        isComment,
        commentCount,
        likeCount,
        bVisitParentPost,
        bButtonvisible = true,
        bshowBorder = false,
        onRepostSubmit,
    }: Props) => {
    const toast = useRef<Toast>(null);
    const [heartPath, setHeartPath] = useState("/heart.svg");
    const bisLiked = useRef(false);
    const [likeCountInternal, setlikeCountInternal] = useState(likeCount);

    const parentPostInfo = {
        id,
        currentUserName,
        parentPostId,
        repostingPostId,
        content,
        author,
        createdAt,
        isComment,
        commentCount,
        likeCount,
        bVisitParentPost,
        bButtonvisible,
        bshowBorder
    }
    
    const [parentPost, setParentPost] = useState<any>();

    const getParentpostInfo = async() => {
        if (repostingPostId) {
            const res = await apiClient.post.getPost({ params: { postId: repostingPostId } });
            console.log(res.body);
            setParentPost(res.body);
        }
    };

    const checkLiked = async () => {
        const res = await apiClient.post.getLikes({ query: { postId: id } });
        // bisLiked.current = res.body;
        //console.log("post content:");
        //console.log(content);
        // console.log(res.body);
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

    useEffect(() => {
        if (repostingPostId) {
            getParentpostInfo();
        }
    }, [repostingPostId]);

    const handleHeartClick = async () => {
        bisLiked.current = !bisLiked.current;
        if (bisLiked.current) {
            setHeartPath("/heart_red.svg");
        } else {
            setHeartPath("/heart.svg");
        }
        const res = await apiClient.post.postLike({ body: { postId: id, set: bisLiked.current } });
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

    const [visible, setVisible] = useState(false);
    const [postContent, setPostContent] = useState<string>('');
    const handleRepostClick = () => {
        setVisible(true);
    }
    const handleRepostSubmit = async () => {

        const res = await apiClient.post.postCreate({
            body: {
                content: postContent,
                repostingPostId: id,
            },
        });
        console.log(res);

        // Call the callback function passed from the parent component
        if (onRepostSubmit) {
            onRepostSubmit();
        }

        setVisible(false);
    }
    const dialogFooter = (
        <div className="p-d-flex p-jc-end">
            <Button label="Submit" className="w-fit" onClick={handleRepostSubmit} />
        </div>
    );

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
                        <Link className="mr-2 hover:underline" href={`/profile/${author.username}`}>{author.displayName} &nbsp;
                            <span className="text-gray-600">@{author.username}</span>
                        </Link>
                    </div>
                    <div>
                        <p>{content}</p>
                        {(repostingPostId && parentPost) && (
                            <div className="border border-gray-500 rounded-lg m-2">
                                <PostBox {...parentPost} bButtonvisible={true} currentUserName={currentUserName} />
                            </div>
                        )}
                    </div>
                    {bButtonvisible && (<div className="inline-flex [&>*]:mr-2 items-end">
                        {currentUserName && (<Image src={heartPath}
                            width="24"
                            alt="heart"
                            onClick={handleHeartClick}
                            className="cursor-pointer"
                        />)}
                        {/* <Link href={bVisitParentPost && parentPostId ? `/post/${parentPostId}` : `/post/${id}`}> */}
                        <Link href={`/post/${id}`}>
                            <Image src="/comment.svg"
                                width="24"
                                alt="comment"
                                className="cursor-pointer"
                            />
                        </Link>
                        {currentUserName && (<Image src="/retweet-round.svg"
                            width="24"
                            alt="repost"
                            onClick={handleRepostClick}
                            className="cursor-pointer"

                        />)}
                        <span className="text-gray-600 text-sm">
                            {likeCountInternal} like(s), {commentCount} comment(s)
                        </span>
                    </div>)}
                </div>
            </div>
            <p className="text-gray-600">{formatDate(createdAt)}</p>
            {parentPostId && <Link href={`/post/${parentPostId}`} className="text-gray-600 hover:underline">Go to parent post</Link>}
            {
                bShowCommentBox &&
                <div className="flex flex-col w-full">
                    <p className="text-xl">Comment</p>
                    <InputTextarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)}
                        rows={4} cols={30} autoResize className="mb-2" />
                    <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
                </div>
            }


            <Dialog header="Repost" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={dialogFooter}>
                <InputTextarea className="w-full" value={postContent} onChange={(e) => setPostContent(e.target.value)}
                    rows={6} autoResize />
               
                <PostBox {...parentPostInfo} bButtonvisible={false} />
            </Dialog>
        </div>
    )
}

export default PostBox