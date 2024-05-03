"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "primereact/image";
import { Avatar } from "primereact/avatar";
import { InputTextarea } from "primereact/inputtextarea";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { Dialog } from "primereact/dialog";
import { PostInfo, SimplePostInfo } from "#/shared/models/post";
import { SimpleUserInfo } from "#/shared/models/user";
import SimpleUserBox from "./SimpleUserBox";

type Props = {
  post: PostInfo;
  currentUserName?: string; // for evaluating whether some actions (like/repost/save) are shown
  currentPostPageId?: string;
  bVisitParentPost?: boolean;
  bButtonvisible?: boolean;
  bshowBorder?: boolean;
  onRepostSubmit?: Function;
};

const PostBox = ({
  post: postInfo,
  currentUserName,
  currentPostPageId,
  bVisitParentPost,
  bButtonvisible = true,
  bshowBorder = false,
  onRepostSubmit,
}: Props) => {
  const {
    id,
    parentPostId,
    content,
    textualContexts,
    author,
    createdAt,
    commentCount,
    likeCount,
    likedByRequester,
    userMedia,
    savedByRequester,
    repostingPost,
  } = postInfo;

  const toast = useRef<Toast>(null);

  /**
   * Display likes
   */
  const [postLikes, setPostLikes] = useState<SimpleUserInfo[] | null>(null);
  const [bLikeListVisible, setbLikeListVisible] = useState<boolean>(false);

  const fetchLikes = async () => {
    const res = await apiClient.post.getLikes({ query: { postId: id } });
    if (res.status === 200 && res.body) {
      setPostLikes(res.body);
    }
  };

  /**
   * Liking
   */
  const [heartPath, setHeartPath] = useState("/heart.svg");
  const bisLiked = useRef(likedByRequester);
  const [likeCountInternal, setlikeCountInternal] = useState(likeCount);

  const updateLiked = async (liked: boolean, likeCount: number) => {
    bisLiked.current = liked;
    setlikeCountInternal(likeCount);

    if (liked) {
      setHeartPath("/heart_red.svg");
    } else {
      setHeartPath("/heart.svg");
    }
  };

  // update like status on load or like button click
  useEffect(() => {
    updateLiked(!!likedByRequester, likeCount);
  }, [id, likedByRequester, likeCount]);

  // on like button click, update like status and send request to backend
  const handleHeartClick = async () => {
    bisLiked.current = !bisLiked.current;
    // show red heart if liked
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

  /**
   * Commenting
   */
  const [commentContent, setCommentContent] = useState("");
  // abandoned comment box design
  const [bShowCommentBox, setBShowCommentBox] = useState(false);
  const handleCommentClick = () => {
    setBShowCommentBox((prevbShowCommentBox) => !prevbShowCommentBox);
  };

  // abandoned comment box design
  const handleCommentSubmit = () => {
    if (toast.current) {
      toast.current.show({ severity: "info", summary: "Success", detail: "Fake submit comment" });
    }
  };

  /**
   * Reposting
   */
  const [visible, setVisible] = useState(false);
  const [repostContent, setRepostContent] = useState<string>("");
  const handleRepostClick = () => {
    setVisible(true);
  };
  const handleRepostSubmit = async () => {
    console.log(id, typeof id);

    const res = await apiClient.post.postCreate({
      body: {
        content: repostContent,
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
    <div className="flex justify-between w-full items-center">
      <p>Text length: {repostContent.length}/1000</p>
      <Button label="Submit" className="w-fit" onClick={handleRepostSubmit} />
    </div>
  );

  /**
   * Bookmarking
   */
  const [bookmarkPath, setBookmarkPath] = useState("/bookmark_empty.svg");
  const bisBookmarked = useRef(savedByRequester);
  const updateBookmarked = async (bookmarked: boolean) => {
    bisBookmarked.current = bookmarked;
    if (bookmarked) {
      setBookmarkPath("/bookmark_filled.svg");
    } else {
      setBookmarkPath("/bookmark_empty.svg");
    }
  };

  useEffect(() => {
    updateBookmarked(!!savedByRequester);
  }, [id, savedByRequester]);

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
  };

  return (
    <div className="flex flex-col w-full bg-orange2 rounded-2xl p-4">
      <Toast ref={toast}></Toast>
      <div className="flex">
        <div className="flex flex-col items-center">
          <Link href={`/profile/${author.username}`}>
            {/* if author has avatar, display it, else display placeholder */}
            <Avatar
              className="mr-2"
              image={author.avatarUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + author.avatarUrl : "/placeholder_profilePic_white-bg.jpg"}
              shape="circle"
              size="large"
            />
          </Link>
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
            <p>
              {textualContexts
                ? textualContexts.map((context, index) => {
                  // if context is a link, display it as a link
                  if (context.href) {
                    return (
                      <Link key={index} href={context.href} className="text-orange1 hover:underline">
                        {context.text}
                      </Link>
                    );
                  } else {
                    return <span key={index}>{context.text}</span>;
                  }
                })
                : content}
            </p>
            {/* show image or video if any */}
            {userMedia && userMedia.length > 0 && (
              <div className="flex flex-wrap">
                {userMedia.map((media: { url: string; type: string }, index: number) => (
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
              </div>
            )}
            {/* if is reposting, display the reposted post */}
            {repostingPost && (
              <div className="border border-gray-500 rounded-lg m-2">
                <PostBox post={repostingPost} bButtonvisible={true} currentUserName={currentUserName} onRepostSubmit={onRepostSubmit} />
              </div>
            )}
          </div>
          {/* if is logged in, display like, comment, repost, bookmark buttons */}
          {bButtonvisible && (
            <div className="inline-flex [&>*]:mr-2 items-end">
              {currentUserName && <Image src={heartPath} width="24" alt="heart" onClick={handleHeartClick} className="cursor-pointer" />}
              {/* <Link href={bVisitParentPost && parentPostId ? `/post/${parentPostId}` : `/post/${id}`}> */}
              <Link href={`/post/${id}`}>
                <Image src="/comment.svg" width="24" alt="comment" className="cursor-pointer" />
              </Link>
              {currentUserName && <Image src="/retweet-round.svg" width="24" alt="repost" onClick={handleRepostClick} className="cursor-pointer" />}
              {currentUserName && <Image src={bookmarkPath} width="24" alt="bookmark" onClick={handleBookmarkClick} className="cursor-pointer" />}
              <span className="text-gray-600 text-sm">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    setbLikeListVisible(true);
                    fetchLikes();
                  }}
                >
                  {likeCountInternal} like(s)
                </span>
                {", "}
                <Link href={`/post/${id}`} className="hover:underline">
                  {commentCount} comment(s)
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600">{formatDate(createdAt.toString())}</p>
      {parentPostId &&
        (parentPostId !== currentPostPageId && (
          <Link href={`/post/${parentPostId}`} className="text-gray-600 hover:underline">
            Go to parent post
          </Link>
        ))}

        {/* abandoned comment box design */}
      {bShowCommentBox && (
        <div className="flex flex-col w-full">
          <p className="text-xl">Comment</p>
          <InputTextarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} rows={4} cols={30} autoResize className="mb-2" />
          <Button label="Submit" className="w-fit" onClick={handleCommentSubmit} />
        </div>
      )}

      <Dialog
        header="Repost"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          setVisible(false);
          setRepostContent("");
        }}
        footer={dialogFooter}
      >
        <InputTextarea className="w-full" value={repostContent} maxLength={1000}
          onChange={(e) => setRepostContent(e.target.value)} rows={6} autoResize />

        <PostBox post={postInfo} bButtonvisible={false} />
      </Dialog>

      <Dialog
        header="Post Liked By"
        visible={bLikeListVisible}
        style={{ width: "50vw" }}
        onHide={() => {
          setbLikeListVisible(false);
          setPostLikes(null);
        }}
      >
        {postLikes ? (
          postLikes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {postLikes.map((user, index) => {
                return <SimpleUserBox user={user} key={index} />;
              })}
            </div>
          ) : (
            <p className="text-center text-md">Wow, such empty!</p>
          )
        ) : (
          <p className="text-center text-md">Not fetched yet ._.</p>
        )}
      </Dialog>
    </div>
  );
};

export default PostBox;
