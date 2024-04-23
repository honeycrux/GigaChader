"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect, use } from "react";
import { Image } from "primereact/image";
import { InputTextarea } from "primereact/inputtextarea";
import PostBox from "@/components/home/PostBox";
import { Dialog } from "primereact/dialog";
import { useAuthContext } from "@/providers/auth-provider";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { ClientInferResponseBody } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts";
import InfiniteScroll from "react-infinite-scroll-component";

type FollowedPostsResponse = ClientInferResponseBody<typeof apiContract.user.getFeeds, 200>;

const Home = () => {
  const toast = useRef<Toast>(null);

  const router = useRouter();

  const { user, userInfo } = useAuthContext();
  const [followedPosts, setFollowedPosts] = useState<FollowedPostsResponse | null>(null);
  const [globalFeeds, setGlobalFeeds] = useState<FollowedPostsResponse | null>(null);

  const [from, setFrom] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  const getGlobalFeeds = async () => {
    const res = await apiClient.post.getGlobalFeeds({ query: { from: from, limit: limit } });
    if (res.status === 200 && res.body) {
      setGlobalFeeds(res.body);
      if (res.body.length < limit) {
        setHasMorePosts(false);
      }
      if (globalFeeds) {
        setGlobalFeeds([...globalFeeds, ...res.body]);
      } else {
        setGlobalFeeds(res.body);
      }
    }
  };

  const getFollowedPosts = async () => {
    const res = await apiClient.user.getFeeds({ query: { from: from, limit: limit } });
    if (res.status === 200 && res.body) {
      console.log(res.body);
      if (res.body.length < limit) {
        setHasMorePosts(false);
      }
      if (followedPosts) {
        setFollowedPosts([...followedPosts, ...res.body]);
      } else {
        setFollowedPosts(res.body);
      }
    }
  };

  useEffect(() => {
    if (bIsLoggedin) {
      getFollowedPosts();
    } else {
      getGlobalFeeds();
    }
  }, [from]);

  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const fecthMoreFollowedPosts = () => {
    setFrom((f) => f + limit);
    if (followedPosts && followedPosts.length < limit) {
      setHasMorePosts(false);
    }
  };

  const fetchMoreGlobalPosts = () => {
    setFrom((f) => f + limit);
    if (globalFeeds && globalFeeds.length < limit) {
      setHasMorePosts(false);
    }
  };

  const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);

  useEffect(() => {
    if (userInfo) {
      if (!user || "error" in userInfo) {
        // logged out users or error
        setbIsLoggedin(false);
      } else if (user && userInfo.onBoardingCompleted === false) {
        router.replace("/onboarding");
      } else {
        setbIsLoggedin(true);
        getFollowedPosts();
      }
    }
  }, [userInfo]);

  const [bAddPostDiagVisible, setbAddPostDiagVisible] = useState(false);
  const [postContent, setPostContent] = useState<string>("");
  const [bIsSummitingPost, setbIsSummitingPost] = useState(false);

  const handlePostSubmit = async () => {
    setbIsSummitingPost(true);
    if (!mediaPreview && !videoPreview) {
      const res = await apiClient.post.postCreate({
        body: {
          content: postContent,
        },
      });
    } else if (mediaPreview) {
      const res = await apiClient.post.postCreate({
        body: {
          content: postContent,
          userMedia: [{ url: mediaPreview, type: "IMAGE" }],
        },
      });
    } else if (videoPreview) {
      const res = await apiClient.post.postCreate({
        body: {
          content: postContent,
          userMedia: [{ url: videoPreview, type: "VIDEO" }],
        },
      });
    }
    setbIsSummitingPost(false);

    // console.log(res);
    fetchOnCreatePost();

    if (toast.current) {
      toast.current.show({ severity: "info", summary: "Success", detail: "post added" });
    }

    setPostContent("");
    setbAddPostDiagVisible(false);
  };

  const fetchOnCreatePost = async () => {
    const res2 = await apiClient.user.getFeeds({ query: { from: 0, limit: 1 } });
    if (res2.status === 200 && res2.body) {
      console.log(res2.body);
      if (followedPosts) {
        setFollowedPosts([...res2.body, ...followedPosts]);
      } else {
        setFollowedPosts(res2.body);
      }
    }
  };

  const [mediaPreview, setMediaPreview] = useState<string | undefined>();
  const [videoPreview, setVideoPreview] = useState<string | undefined>();
  const handleMediaUpload = async () => {
    setMediaPreview(undefined);
    setVideoPreview(undefined);
    const formData = new FormData();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.click();
    input.addEventListener("change", async () => {
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          formData.append("media", input.files[i]);
        }
        const res = await apiClient.upload.uploadMedia({
          body: formData,
        });
        console.log(res);
        if (res.status === 200 && res.body) {
          const mediaUrls = res.body.map((media: { type: "IMAGE" | "VIDEO"; url: string }) => media.url);
          console.log(mediaUrls[0]);
          // axiosClient.get(mediaUrls[0], { responseType: 'blob' }).then((response) => {
          //     const reader = new FileReader();
          //     reader.readAsDataURL(response.data);
          //     reader.onload = () => {
          //         setMediaPreview(reader.result);
          //     }
          // });
          if (res.body[0].type === "IMAGE") {
            setMediaPreview(mediaUrls[0]);
          } else {
            setVideoPreview(mediaUrls[0]);
          }
        }
      }
    });
  };

  const footerContent = (
    <Button
      label="Post"
      onClick={() => {
        // console.log('post content', postContent);
        handlePostSubmit();
      }}
      loading={bIsSummitingPost}
    />
  );

  return (
    <>
      <Dialog header="Create Post" footer={footerContent} visible={bAddPostDiagVisible} style={{ width: "50vw" }} onHide={() => setbAddPostDiagVisible(false)}>
        <div className="flex flex-col">
          <InputTextarea className="w-full" value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={6} autoResize />
          <Image src="/upload-image.svg" alt="upload image" className="cursor-pointer w-10" onClick={handleMediaUpload} />
          {mediaPreview && (
            <div>
              <p className="text-xl">Media Preview</p>
              <Image src={process.env.NEXT_PUBLIC_BACKEND_URL + mediaPreview} alt="media preview" preview />
            </div>
          )}
          {videoPreview && (
            <div>
              <p className="text-xl">Video Preview</p>
              <video controls>
                <source src={process.env.NEXT_PUBLIC_BACKEND_URL + videoPreview} type="video/mp4" />
              </video>
            </div>
          )}
        </div>
      </Dialog>
      <Toast ref={toast}></Toast>
      {/* main content start */}
      <main id="scrollableMain" className="flex w-full justify-center overflow-y-auto">
        {/* main content with margin */}
        <div className="flex flex-col w-[60%] space-y-4">
          <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
            <div className="flex flex-col h-fit mt-5 !mb-0">
              <p className="text-3xl font-bold">Home</p>
              <p className="font-light">All posts from Chads You Follow.</p>
            </div>
            {user && <Button label="Create Post" onClick={() => setbAddPostDiagVisible(true)} />}
          </div>
          {userInfo && "error" in userInfo && !bIsLoggedin && globalFeeds && (
            <InfiniteScroll
              dataLength={globalFeeds ? globalFeeds.length : 0}
              next={fetchMoreGlobalPosts}
              hasMore={hasMorePosts}
              loader={
                <p className="text-center space-x-2">
                  <i className="pi pi-spin pi-spinner text-sm" />
                  <b>Loading...</b>
                </p>
              }
              endMessage={
                <p className="text-center">
                  <b>{"That's all posts"}</b>
                </p>
              }
              scrollableTarget="scrollableMain"
              className="min-w-fit space-y-4"
            >
              {globalFeeds.map((post, index) => (
                <PostBox key={index} post={post} currentUserName={user?.username} />
              ))}
            </InfiniteScroll>
          )}

          {userInfo && !("error" in userInfo) && bIsLoggedin && followedPosts && followedPosts.length > 0 && (
            <InfiniteScroll
              dataLength={followedPosts ? followedPosts.length : 0}
              next={fecthMoreFollowedPosts}
              hasMore={hasMorePosts}
              loader={
                <p className="text-center space-x-2">
                  <i className="pi pi-spin pi-spinner text-sm" />
                  <b>Loading...</b>
                </p>
              }
              endMessage={
                <p className="text-center">
                  <b>{"That's all posts"}</b>
                </p>
              }
              scrollableTarget="scrollableMain"
              className="min-w-fit space-y-4"
            >
              {followedPosts.map((post, index) => (
                <PostBox key={index} post={post} currentUserName={user?.username} onRepostSubmit={fetchOnCreatePost} />
              ))}
            </InfiniteScroll>
          )}
          {(!followedPosts || followedPosts?.length === 0) && <p className="text-xl">No posts to display yet ._.</p>}
        </div>
      </main>
      {/* main content end */}
    </>
  );
};

export default Home;
