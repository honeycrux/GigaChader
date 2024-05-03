"use client";
import { Image } from "primereact/image";
import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { UserConfigProps } from "#/shared/models/user";

// onboarding page for new users, setting up display name, bio, and profile picture
function Onboarding() {
  const toast = useRef<Toast>(null);
  const { user, userInfo, refreshUserInfo } = useAuthContext();
  const router = useRouter();

  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [displayName, setDisplayName] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [bio, setBio] = useState<string | undefined>();
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>();

  // on continue button click, update user info on backend and redirect to home page
  const handleContinue = async () => {
    // if (toast.current) {
    //   toast.current.show({ severity: "info", summary: "Success", detail: "Go to home" });
    // }
    const userConfig: UserConfigProps = {
      displayName: displayName || "",
      bio: bio || "",
      onBoardingCompleted: true,
      avatarUrl: profilePicUrl,
    };

    const res = await apiClient.user.userConfig({ body: userConfig });
    console.log(res);
    router.replace("/home");
  };

  useEffect(() => {
    // fetch user info on load

    const wrapper = async () => {
      await refreshUserInfo();
    };

    wrapper();
  }, [refreshUserInfo]);

  // fetch user info on load, maybe because user left onboarding in the middle during previous visit
  useEffect(() => {
    if (!userInfo) {
      setDisplayName("guest");
    } else {
      setDisplayName(userInfo.userConfig.displayName);
      setUserName(userInfo.username);
      setBio(userInfo.userConfig.bio);
      if (userInfo.userConfig.avatarUrl) {
        setProfilePicUrl(userInfo.userConfig.avatarUrl);
      }
      console.log("from onboarding");
      console.log(userInfo);
    }
  }, [userInfo]);

  // upload profile picture to backend
  const handleUpload = async () => {
    const formData = new FormData();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.addEventListener("change", async () => {
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          formData.append("avatar", input.files[i]);
        }
        const res = await apiClient.upload.uploadProfile({
          body: formData,
        });
        console.log(res);
        if (res.status === 200 && res.body) {
          const avatarUrl = res.body.avatarUrl;
          setProfilePicUrl(avatarUrl);
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
              <Image
                className="mr-5"
                src={profilePicUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + profilePicUrl : "placeholder_profilePic_white-bg.jpg"}
                width="100"
                alt="placeholder profilePic"
                preview
                pt={{
                  image: { className: "rounded-full h-36 w-36 object-cover cursor-pointer" },
                  previewContainer: { className: "z-20" },
                }}
              />
              {/* <FileUpload mode="basic" name="profilePic" accept="image/*" chooseLabel="Upload Profile Picture"
              customUpload auto uploadHandler={handleProfilePicUpload} /> */}
              <div className="flex flex-col">
                <Button label="Upload Avatar" onClick={handleUpload} />
                <Button text label="Remove Avatar" onClick={() => setProfilePicUrl(undefined)} />
              </div>
            </div>
            <div className="[&>*]:my-2">
              <p className="!mt-4 text-xl">
                Username: &nbsp;
                <span className="text-gray-600">@{userName}</span>
              </p>
              <p className="text-xl">Display name</p>
              <InputText className="custom-shadow-border-light w-full" value={displayName || ""}
              onChange={(e) => setDisplayName(e.target.value)} />
              <p className="text-xl">Bio</p>
              <InputTextarea className="w-full" value={bio || ""} maxLength={1000}
              onChange={(e) => setBio(e.target.value)} rows={4} autoResize />
              <p>Text length: {bio?.length}/1000</p>
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
