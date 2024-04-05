"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect, Key } from "react";
import { Image } from 'primereact/image';
import cheem from "@/public/cheem.jpg";
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import PostBox from "@/components/home/PostBox";
import dummyPost from "@/dummy_data/dummyPosts.json";
import { Dialog } from 'primereact/dialog';
import { useAuthContext } from "@/providers/auth-provider";
import { getUserInfo } from "@/lib/actions/user";
import { apiClient } from "@/lib/apiClient";

const home = () => {
    const toast = useRef<Toast>(null);
    // const handleAddPost = () => {
    //     setbAddPostDiagVisible(true);
    // }

    const { user, logout } = useAuthContext();
    const [globalFeeds, setGlobalFeeds] = useState<any>();

    const getGlobalFeeds = async () => {
        const feeds = (await apiClient.post.getGlobalFeeds()).body;
        setGlobalFeeds(feeds);
    };

    useEffect(() => {
        const wrapper = async () => {
            if (!user) {
                setbIsLoggedin(false);
            } else {
                setbIsLoggedin(true);
                getGlobalFeeds();
            }
        };

        wrapper();
    }, [user]);

    useEffect(() => {
        console.log(globalFeeds);
    }, [globalFeeds]);

    const [bAddPostDiagVisible, setbAddPostDiagVisible] = useState(false);
    const [postContent, setPostContent] = useState<string>('');
    const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);

    const handlePostSubmit = async () => {
        
        const res = await apiClient.post.postCreate({
            body: {
                content: postContent,
                // mediaProps: []
            },
        });

        console.log(res);
        getGlobalFeeds();

        if (toast.current) {
            toast.current.show({ severity: "info", summary: "Success", detail: "post added" });
        }
    }

    const footerContent = (
        <Button label="Post" onClick={() => {
            console.log('post content', postContent);
            handlePostSubmit();
        }} />
    );
    
  return (
    <>
        <Dialog header="Create Post"
        footer={footerContent}
        visible={bAddPostDiagVisible} style={{ width: '50vw' }}
        onHide={() => setbAddPostDiagVisible(false)}>
            <InputTextarea className="w-full" value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={6} autoResize />
        </Dialog>
        <Toast ref={toast}></Toast>
        {/* main content start */}
        <main className='flex w-full justify-center overflow-y-auto'>
            {/* main content with margin */}
            <div className="flex flex-col w-[60%] space-y-4">
                <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                    <p className="text-3xl font-bold">Home</p>
                    {bIsLoggedin && (
                        <Button label="Create Post" onClick={() => setbAddPostDiagVisible(true)} />
                    )}
                </div>

                {globalFeeds && (
                    globalFeeds.map((post: any, index: Key | null | undefined) => <PostBox key={index} {...post} currentUserName={user?.username} />)
                )}
            </div>              
        </main>
        {/* main content end */}
    </>
    )
}

export default home