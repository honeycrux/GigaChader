"use client";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect } from "react";
import { Image } from 'primereact/image';
import cheem from "@/public/cheem.jpg";
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import PostBox from "@/components/home/PostBox";
import dummyPost from "@/dummy_data/dummyPosts.json";
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { useAuthContext } from "@/providers/auth-provider";
import { getUserInfo } from "@/lib/actions/user";

const home = () => {
    const toast = useRef<Toast>(null);
    const handleAddPost = () => {
        // if (toast.current) {
        //     toast.current.show({ severity: "info", summary: "Success", detail: "Fake add post" });
        // }
        setbAddPostDiagVisible(true);
    }

    const { user, logout } = useAuthContext();

    useEffect(() => {
        const wrapper = async () => {
            if (!user) {
                setbIsLoggedin(false);
            } else {
                setbIsLoggedin(true);
            }
        };

        wrapper();
    }, [user]);

    const [bAddPostDiagVisible, setbAddPostDiagVisible] = useState(false);
    const [postContent, setPostContent] = useState<string>('');
    const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);

    const footerContent = (
        <Button label="Post" onClick={() => {
            if (toast.current) {
                toast.current.show({ severity: "info", summary: "Success", detail: "Fake post added" });
            }
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
                        <Button label="Add" onClick={handleAddPost} />
                    )}
                </div>

                {dummyPost.map((post, index) => <PostBox key={index} {...post} />)}
            </div>              
        </main>
        {/* main content end */}
    </>
    )
}

export default home