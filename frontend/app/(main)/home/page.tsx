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

// show all posts from users that the logged in user follows
const Home = () => {
  const toast = useRef<Toast>(null);

  const router = useRouter();

  const { user, userInfo } = useAuthContext();
  const [followedPosts, setFollowedPosts] = useState<FollowedPostsResponse | null>(null);

  // limit the number of posts to be fetched, for lazy loading on infinite scroll
  const [from, setFrom] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  // fetch posts from backend
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

  // get followed posts on scroll when 'from' value changes
  useEffect(() => {
    if (bIsLoggedin) {
      getFollowedPosts();
    }
  }, [from]);

  // trigger fetching more followed posts on scroll by increasing the 'from' value
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const fecthMoreFollowedPosts = () => {
    setFrom((f) => f + limit);
    if (followedPosts && followedPosts.length < limit) {
      setHasMorePosts(false);
    }
  };

  const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);

  // check if user is logged in and has completed onboarding
  // if not, redirect to onboarding page
  // if logged in, get followed posts
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
  const [bIsSummitingPost, setbIsSummitingPost] = useState(false);
  const [postContent, setPostContent] = useState<string>("");

  // This function handles the submission of a post.
  // It first checks if the post content is empty. If it is, it shows a toast notification and returns.
  // If the post content is not empty, submit post to the backend.
  // bisSummitingPost is set to true to show a loading spinner on the post button.
  // If there are images or videos attached to the post, add them to the post body and send a request to the backend to create the post.
  // If the post is successfully created, show a success toast notification.
  // If there is an error, show an error toast notification.
  // Fetch the newly created post and add it to the followed posts list too.
  // Finally, clear the post content, media preview, video preview, and close the dialog.
  const handlePostSubmit = async () => {
    // reject empty post
    if (postContent.trim() === "") {
      if (toast.current) {
        toast.current.show({ severity: "info", summary: "Cannot post", detail: "Your post must have text content" });
      }
      return;
    }

    setbIsSummitingPost(true);

    let res;
    if (!mediaPreview && !videoPreview) {
      res = await apiClient.post.postCreate({
        body: {
          content: postContent,
        },
      });
    } else if (mediaPreview) {
      res = await apiClient.post.postCreate({
        body: {
          content: postContent,
          userMedia: [{ url: mediaPreview, type: "IMAGE" }],
        },
      });
    } else if (videoPreview) {
      res = await apiClient.post.postCreate({
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
      if (res && res.status === 200) {
        toast.current.show({ severity: "info", summary: "Success", detail: "post added" });
      } else if (res && res.status === 400 && "error" in (res.body as any)) {
        toast.current.show({ severity: "error", summary: "Error", detail: (res.body as { error: string }).error });
      } else {
        toast.current.show({ severity: "error", summary: "Error", detail: `Some unknown error occured (${res?.status})` });
      }
    }

    setPostContent("");
    setMediaPreview(undefined);
    setVideoPreview(undefined);
    setbAddPostDiagVisible(false);
  };

  // fetch the one newly created post and add it to the followed posts list
  const fetchOnCreatePost = async () => {
    const res = await apiClient.user.getFeeds({ query: { from: 0, limit: 1 } });
    if (res.status === 200 && res.body) {
      console.log(res.body);
      if (followedPosts) {
        setFollowedPosts([...res.body, ...followedPosts]);
      } else {
        setFollowedPosts(res.body);
      }
      setFrom(from + 1);
    }
  };

  // create media upload dialog
  // then upload media to the backend
  const [mediaPreview, setMediaPreview] = useState<string | undefined>();
  const [videoPreview, setVideoPreview] = useState<string | undefined>();
  const handleMediaUpload = async () => {
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

          // only allow one media upload
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
    <div className="flex justify-between w-full items-center">
      <p>Text length: {postContent.length}/1000</p>
      <div>
        <Button
          text
          label="Remove Media"
          onClick={() => {
            setMediaPreview(undefined);
            setVideoPreview(undefined);
          }}
        />
        <Button
          label="Post"
          onClick={() => {
            // console.log('post content', postContent);
            handlePostSubmit();
          }}
          loading={bIsSummitingPost}
        />
      </div>
    </div>
  );

  return (
    <>
      <Dialog
        header="Create Post"
        footer={footerContent}
        visible={bAddPostDiagVisible}
        style={{ width: "50vw" }}
        onHide={() => {
          setbAddPostDiagVisible(false);
          setPostContent("");
          setMediaPreview(undefined);
          setVideoPreview(undefined);
        }}
      >
        <div className="flex flex-col">
          <InputTextarea className="w-full" value={postContent} maxLength={1000}
          onChange={(e) => setPostContent(e.target.value)} rows={6} autoResize />
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
