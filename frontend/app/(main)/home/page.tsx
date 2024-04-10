"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect, Key, memo } from "react";
import { Image } from 'primereact/image';
import cheem from "@/public/cheem.jpg";
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import PostBox from "@/components/home/PostBox";
import dummyPost from "@/dummy_data/dummyPosts.json";
import { Dialog } from 'primereact/dialog';
import { useAuthContext } from "@/providers/auth-provider";
import { getUserInfo } from "@/lib/actions/user";
import { apiClient, axiosClient } from "@/lib/apiClient";
import { set } from "zod";
import { useRouter } from "next/navigation";

const Home = () => {
    const toast = useRef<Toast>(null);
    // const handleAddPost = () => {
    //     setbAddPostDiagVisible(true);
    // }

    const router = useRouter();

    const { user, logout } = useAuthContext();
    const [globalFeeds, setGlobalFeeds] = useState<any>();
    const [followedPosts, setFollowedPosts] = useState<any>();

    const getGlobalFeeds = async () => {
        const feeds = (await apiClient.post.getGlobalFeeds()).body;
        setGlobalFeeds(feeds);
    };

    const getFollowedPosts = async () => {
        const followedPosts = (await apiClient.user.getFeeds()).body;
        console.log(followedPosts);
        setFollowedPosts(followedPosts);
    };

    const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);

    useEffect(() => {
        const wrapper = async () => {
            const userinfo = await getUserInfo();
            if (!user || "error" in userinfo) { // logged out users or error
                setbIsLoggedin(false);
                getGlobalFeeds();
            } else if (user && userinfo.onBoardingCompleted === false) {
                router.replace("/onboarding");
            } else {
                setbIsLoggedin(true);
                getFollowedPosts();
            }
        };

        wrapper();
    }, [user]);

    // useEffect(() => {
    //     console.log('bIsLoggedin', bIsLoggedin);
    //     if (!bIsLoggedin) {
    //         getGlobalFeeds();
    //     }
    // }, [bIsLoggedin]);

    useEffect(() => {
        // console.log(globalFeeds);
    }, [globalFeeds]);

    const [bAddPostDiagVisible, setbAddPostDiagVisible] = useState(false);
    const [postContent, setPostContent] = useState<string>('');
    const [bIsSummitingPost, setbIsSummitingPost] = useState(false);

    const handlePostSubmit = async () => {
        setbIsSummitingPost(true);
        if (!mediaPreview && !videoPreview) {
            const res = await apiClient.post.postCreate({
                body: {
                    content: postContent,
                    // mediaProps: []
                },
            });
        } else if (mediaPreview) {
            const res = await apiClient.post.postCreate({
                body: {
                    content: postContent,
                    userMedia: [{ url: mediaPreview, type: "IMAGE" }]
                },
            });
        } else if (videoPreview) {
            const res = await apiClient.post.postCreate({
                body: {
                    content: postContent,
                    userMedia: [{ url: videoPreview, type: "VIDEO" }]
                },
            });
        }
        setbIsSummitingPost(false);

        // console.log(res);
        getFollowedPosts();

        if (toast.current) {
            toast.current.show({ severity: "info", summary: "Success", detail: "post added" });
        }

        setPostContent('');
        setbAddPostDiagVisible(false);
    }

    const [mediaPreview, setMediaPreview] = useState<any>();
    const [videoPreview, setVideoPreview] = useState<any>();
    const handleMediaUpload = async () => {
        setMediaPreview(undefined);
        setVideoPreview(undefined);
        const formData = new FormData();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.click();
        input.addEventListener('change', async () => {
            if (input.files) {
                for (let i = 0; i < input.files.length; i++) {
                    formData.append('media', input.files[i]);
                }
                const res = await apiClient.upload.uploadMedia({
                    body: formData,
                });
                console.log(res);
                if (res.status === 200 && res.body) {
                    const mediaUrls: any = res.body.map((media: { type: "IMAGE" | "VIDEO"; url: string; }) => media.url);
                    console.log(mediaUrls[0]);
                    // axiosClient.get(mediaUrls[0], { responseType: 'blob' }).then((response) => {
                    //     const reader = new FileReader();
                    //     reader.readAsDataURL(response.data);
                    //     reader.onload = () => {
                    //         setMediaPreview(reader.result);
                    //     }
                    // });
                    if (res.body[0].type === 'IMAGE') {
                        setMediaPreview(mediaUrls[0]);
                    } else {
                        setVideoPreview(mediaUrls[0]);
                    }
                }
            }
        });
    }

    const footerContent = (
        <Button label="Post" onClick={() => {
            // console.log('post content', postContent);
            handlePostSubmit();
        }} loading={bIsSummitingPost} />
    );

    return (
        <>
            <Dialog header="Create Post"
                footer={footerContent}
                visible={bAddPostDiagVisible} style={{ width: '50vw' }}
                onHide={() => setbAddPostDiagVisible(false)}>
                <div className="flex flex-col">
                    <InputTextarea className="w-full" value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={6} autoResize />
                    <img src="/upload-image.svg" alt="upload image" className="cursor-pointer w-10"
                        onClick={handleMediaUpload} />
                    {mediaPreview &&
                        <div>
                            <p className="text-xl">Media Preview</p>
                            <Image src={process.env.NEXT_PUBLIC_BACKEND_URL + mediaPreview} alt="media preview" preview />
                        </div>}
                    {videoPreview &&
                        <div>
                            <p className="text-xl">Video Preview</p>
                            <video controls>
                                <source src={process.env.NEXT_PUBLIC_BACKEND_URL + videoPreview} type="video/mp4" />
                            </video>
                        </div>}
                </div>
            </Dialog>
            <Toast ref={toast}></Toast>
            {/* main content start */}
            <main className='flex w-full justify-center overflow-y-auto'>
                {/* main content with margin */}
                <div className="flex flex-col w-[60%] space-y-4">
                    <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                        <p className="text-3xl font-bold">{bIsLoggedin ? "Home" : "All Posts"}</p>
                        {bIsLoggedin && (
                            <Button label="Create Post" onClick={() => setbAddPostDiagVisible(true)} />
                        )}
                    </div>

                    {globalFeeds && (
                        globalFeeds.map((post: any, index: Key | null | undefined) => <PostBox key={index} {...post} currentUserName={user?.username} />)
                    )}

                    {(followedPosts && followedPosts.length > 0) && (
                        followedPosts.map((post: any, index: Key | null | undefined) =>
                            <PostBox key={index} {...post}
                                currentUserName={user?.username} onRepostSubmit={getFollowedPosts} />)
                    )}

                    {((!globalFeeds && !followedPosts) || ((globalFeeds?.length === 0 || followedPosts?.length === 0))) && (
                        <p className="text-xl">No posts to display yet ._.</p>
                    )}
                </div>
            </main>
            {/* main content end */}
        </>
    )
}

export default Home