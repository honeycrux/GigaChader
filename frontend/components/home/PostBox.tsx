"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { use, useEffect, useRef, useState } from "react";
import { Image } from "primereact/image";
import { Avatar } from "primereact/avatar";
import { InputTextarea } from "primereact/inputtextarea";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { Dialog } from "primereact/dialog";
import { on } from "events";
import { classNames } from "primereact/utils";
interface Props {
  id: string;
  currentUserName?: string; // for checking if the current user can delete a post
  parentPostId: string | null; // for comments
  repostingPostId?: string | null; // for reposts
  content: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  createdAt: Date;
  isComment?: boolean;
  commentCount: number;
  likeCount: number;
  bVisitParentPost?: boolean;
  bButtonvisible?: boolean;
  bshowBorder?: boolean;
  onRepostSubmit?: any;
  likedByRequester: boolean | null;
  userMedia?: any;
  savedByRequester: boolean | null;
}

const PostBox = ({
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
  likedByRequester,
  userMedia,
  savedByRequester,
}: Props) => {
  // console.log("Likedbyrequester:", likedByRequester);
  const toast = useRef<Toast>(null);
  const [heartPath, setHeartPath] = useState("/heart.svg");
  const bisLiked = useRef(likedByRequester);
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
    bshowBorder,
    likedByRequester,
    userMedia,
    savedByRequester,
  };

  const [parentPost, setParentPost] = useState<any>();

  const getParentpostInfo = async () => {
    if (repostingPostId) {
      const res = await apiClient.post.getPost({ params: { postId: repostingPostId } });
      // console.log(res.body);
      setParentPost(res.body);
    }
  };

  const updateLiked = async (liked: boolean, likeCount: number) => {
    // const res = await apiClient.post.getLikes({ query: { postId: id } });
    // bisLiked.current = res.body;
    //console.log("post content:");
    //console.log(content);
    // console.log(res.body);
    // @ts-ignore
    bisLiked.current = liked;
    // @ts-ignore
    setlikeCountInternal(likeCount);

    if (liked) {
      setHeartPath("/heart_red.svg");
    } else {
      setHeartPath("/heart.svg");
    }
  };

  useEffect(() => {
    updateLiked(!!likedByRequester, likeCount);
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
    if (res.status === 200 && res.body) {
      updateLiked(!!res.body.likedByRequester, res.body.likeCount);
    }
  };

  const [commentContent, setCommentContent] = useState("");
  const [bShowCommentBox, setBShowCommentBox] = useState(false);
  const handleCommentClick = () => {
    setBShowCommentBox((prevbShowCommentBox) => !prevbShowCommentBox);
  };

  const handleCommentSubmit = () => {
    if (toast.current) {
      toast.current.show({ severity: "info", summary: "Success", detail: "Fake submit comment" });
    }
  };

  const [visible, setVisible] = useState(false);
  const [postContent, setPostContent] = useState<string>("");
  const handleRepostClick = () => {
    setVisible(true);
  };
  const handleRepostSubmit = async () => {
    console.log(id, typeof id);

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
  };
  const dialogFooter = (
    <div className="p-d-flex p-jc-end">
      <Button label="Submit" className="w-fit" onClick={handleRepostSubmit} />
    </div>
  );

  const [bookmarkPath, setBookmarkPath] = useState("/bookmark_empty.svg");
  const bisBookmarked = useRef(savedByRequester);
  const updateBookmarked = async (bookmarked: boolean) => {
    bisBookmarked.current = bookmarked;
    if (bookmarked) {
      setBookmarkPath("/bookmark_filled.svg");
    } else {
      setBookmarkPath("/bookmark_empty.svg");
    }
  }

  useEffect(() => {
    updateBookmarked(!!savedByRequester);
  }, [id]);

const handleBookmarkClick = async () => {
  bisBookmarked.current = !bisBookmarked.current;
  if (bisBookmarked.current) {
    setBookmarkPath("/bookmark_filled.svg");
  } else {
    setBookmarkPath("/bookmark_empty.svg");
  }
  const res = await apiClient.post.postSave({ body: { postId: id, set: bisBookmarked.current } });
  console.log(res);
  if (res.status === 200 && res.body) {
    updateBookmarked(!!res.body.savedByRequester);
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
            <Link className="mr-2 hover:underline" href={`/profile/${author.username}`}>
              {author.displayName} &nbsp;
              <span className="text-gray-600">@{author.username}</span>
            </Link>
          </div>
          <div>
            <p>{content}</p>
            {/* retrieve image */}
            {userMedia && userMedia.length > 0 && (
              <div className="flex flex-wrap">
                {userMedia.map((media: { url: string; type: string }, index: number) => (
                  <div key={index} className="my-2">
                    {media.type === "IMAGE" ? (
                      <Image src={process.env.NEXT_PUBLIC_BACKEND_URL + media.url} alt="image" preview
                      pt={{
                        image: { className: "rounded-lg" },
                      }} />
                    ) : (
                      <video controls>
                        <source src={process.env.NEXT_PUBLIC_BACKEND_URL + media.url} type="video/mp4" />
                      </video>
                    )}
                  </div>
                ))}
              </div>
            )}
            {repostingPostId && parentPost && (
              <div className="border border-gray-500 rounded-lg m-2">
                <PostBox {...parentPost} bButtonvisible={true} currentUserName={currentUserName} />
              </div>
            )}
          </div>
          {bButtonvisible && (
            <div className="inline-flex [&>*]:mr-2 items-end">
              {currentUserName && <Image src={heartPath} width="24" alt="heart" onClick={handleHeartClick} className="cursor-pointer" />}
              {/* <Link href={bVisitParentPost && parentPostId ? `/post/${parentPostId}` : `/post/${id}`}> */}
              <Link href={`/post/${id}`}>
                <Image src="/comment.svg" width="24" alt="comment" className="cursor-pointer" />
              </Link>
              {currentUserName && <Image src="/retweet-round.svg" width="24" alt="repost" onClick={handleRepostClick} className="cursor-pointer" />}
              {currentUserName && <Image src={bookmarkPath}  width="24" alt="bookmark" onClick={handleBookmarkClick} className="cursor-pointer" />}
              <span className="text-gray-600 text-sm">
                {likeCountInternal} like(s), {commentCount} comment(s)
              </span>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600">{formatDate(createdAt.toString())}</p>
      {parentPostId && (
        <Link href={`/post/${parentPostId}`} className="text-gray-600 hover:underline">
          Go to parent post
        </Link>
      )}
      {bShowCommentBox && (
        <div className="flex flex-col w-full">
          <p className="text-xl">Comment</p>
          <InputTextarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} rows={4} cols={30} autoResize className="mb-2" />
          <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
        </div>
      )}

      <Dialog header="Repost" visible={visible} style={{ width: "50vw" }} onHide={() => setVisible(false)} footer={dialogFooter}>
        <InputTextarea className="w-full" value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={6} autoResize />

        <PostBox {...parentPostInfo} bButtonvisible={false} />
      </Dialog>
    </div>
  );
};

export default PostBox;
