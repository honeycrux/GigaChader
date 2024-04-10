"use client";
import { Image } from "primereact/image";
import placeholder_profilePic from "@/public/placeholder_profilePic.png";
import { FileUpload } from "primereact/fileupload";
import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { apiClient, axiosClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { getUserInfo } from "@/lib/actions/user";
import { useRouter } from "next/navigation";

function Onboarding() {
  const toast = useRef<Toast>(null);
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const [uploadFile, setUploadFile] = useState<File | null>(null);

  

  const [displayName, setDisplayName] = useState<any>();
  const [userName, setUserName] = useState<any>();
  const [bio, setBio] = useState<any>();
  const [profilePicUrl, setProfilePicUrl] = useState<any>();
  const [userinfo, setUserInfo] = useState<any>();

  const handleContinue = async () => {
    // if (toast.current) {
    //   toast.current.show({ severity: "info", summary: "Success", detail: "Go to home" });
    // }
    const userConfig: { displayName: string; bio: string; avatarUrl?: string; onBoardingCompleted: boolean } = {
      displayName: displayName,
      bio: bio,
      onBoardingCompleted: true,
    };

    const res = await apiClient.user.userConfig({ body: userConfig });
    console.log(res);
    router.replace("/home");
  };

  useEffect(() => {
    const wrapper = async () => {
      if (!user) {
        setDisplayName("guest");
      } else {
        const userinfo = await getUserInfo();
        if ("error" in userinfo) {
          setDisplayName("guest");
        } else {
          setDisplayName(userinfo.userConfig.displayName);
          setUserName(userinfo.username);
          setBio(userinfo.userConfig.bio);
          setUserInfo(userinfo);
          if (userinfo.userConfig.avatarUrl) {
            setProfilePicUrl(userinfo.userConfig.avatarUrl);
          }
          console.log("from onboarding");
          console.log(userinfo);
          const res = await apiClient.user.userConfig({ body: {avatarUrl: profilePicUrl} });
          console.log(res);
        }
      }
    };

    wrapper();
  }, [user]);

  const handleUpload = async () => {
    const formData = new FormData();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.addEventListener('change', async () => {
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          formData.append('avatar', input.files[i]);
        }
        const res = await apiClient.upload.uploadProfile({
          body: formData,
        });
        console.log(res);
        if (res.status === 200 && res.body) {
          const avatarUrl = res.body.avatarUrl;
          setProfilePicUrl(avatarUrl);
          const res2 = await apiClient.user.userConfig({ body: {avatarUrl: avatarUrl} });
          console.log(res2);
          setUserInfo(await getUserInfo());
        }
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center my-10">
        <div className="">
          <Toast ref={toast}></Toast>
          <p className="text-3xl mb-2">Onboarding</p>
          <p className="text-xl font-light mb-5">Complete your profile to get started</p>
          <div className="flex flex-col p-12 w-[35rem] h-auto custom-shadow-border rounded-[50px]">
            <div className="flex items-center">
              <Image className="mr-5"
              src={(userinfo && userinfo.userConfig.avatarUrl && process.env.NEXT_PUBLIC_BACKEND_URL + userinfo.userConfig.avatarUrl)
                || "placeholder_profilePic_white-bg.jpg"
              } 
              width="100" alt="placeholder profilePic" 
              preview
              pt={{
                image: { className: "rounded-full h-36 w-36 object-cover cursor-pointer" },
                previewContainer: { className: "z-20" },
              }} />
              {/* <FileUpload mode="basic" name="profilePic" accept="image/*" chooseLabel="Upload Profile Picture"
              customUpload auto uploadHandler={handleProfilePicUpload} /> */}
              <Button label="Upload Avatar"
                onClick={handleUpload} />
            </div>
            <div className="[&>*]:my-2">
              <p className="!mt-4 text-xl">Username: &nbsp;
                <span className="text-gray-600">@{userName}</span>
              </p>
              <p className="text-xl">Display name</p>
              <InputText className="custom-shadow-border-light w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <p className="text-xl">Bio</p>
              <InputTextarea className="w-full" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} autoResize />
              <div className="flex justify-center">
                <Button onClick={handleContinue} className="px-20" label="Continue" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Onboarding;
