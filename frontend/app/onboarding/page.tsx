"use client";
import Image from "next/image";
import placeholder_profilePic from "@/public/placeholder_profilePic.png";
import { FileUpload } from "primereact/fileupload";
import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { apiClient, axiosClient } from "@/lib/apiClient";

function Onboarding() {
  const toast = useRef<Toast>(null);

  // @ts-ignore
  const handleProfilePicUpload = async ({files}) => {
    if (toast.current) {
      toast.current.show({ severity: "info", summary: "Success", detail: "Fake file upload" });
    }
    console.log(files);
    // const res = await apiClient.user.simpleUpload({ body: { file: files[0] } });
    // console.log(res);
  };

  const fakeContinue = () => {
    if (toast.current) {
      toast.current.show({ severity: "info", summary: "Success", detail: "Go to home" });
    }
  };

  const [displayName, setDisplayName] = useState("Chad");
  const [userName, setUserName] = useState("@chadmaster");
  const [bio, setBio] = useState("All in or nothing.");

  return (
    <>
      <div className="flex flex-col items-center justify-center my-10">
        <div className="">
          <Toast ref={toast}></Toast>
          <p className="text-3xl mb-2">Onboarding</p>
          <p className="text-xl font-light mb-5">Complete your profile to get started</p>
          <div className="flex flex-col p-12 w-[35rem] h-auto custom-shadow-border rounded-[50px]">
            <div className="flex items-center">
              <Image className="mr-5" src={placeholder_profilePic} width={100} alt="placeholder profilePic" />
              <FileUpload mode="basic" name="profilePic" accept="image/*" chooseLabel="Upload Profile Picture"
              customUpload auto uploadHandler={handleProfilePicUpload} />
            </div>
            <div className="[&>*]:my-2">
              <p className="!mt-4 text-xl">Username: &nbsp;
                <span className="text-gray-600">{userName}</span>
              </p>
              <p className="text-xl">Display name</p>
              <InputText className="custom-shadow-border-light w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <p className="text-xl">Bio</p>
              <InputTextarea className="w-full" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} autoResize />
              <div className="flex justify-center">
                <Button onClick={fakeContinue} className="px-20" label="Continue" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Onboarding;
