"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "primereact/image";
import PostBox from "@/components/home/PostBox";
import { Button } from "primereact/button";
import { getUserInfo, getProfileInfo } from "@/lib/actions/user";
import { useAuthContext } from "@/providers/auth-provider";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { apiClient } from "@/lib/apiClient";
import { PersonalUserInfo, UserProfile } from "#/shared/models/user";
import { apiContract } from "#/shared/contracts";
import { ClientInferResponseBody } from "@ts-rest/core";
import { PostInfo } from "#/shared/models/post";

type FollowListResponse = ClientInferResponseBody<typeof apiContract.user.getFollowedUsers, 200>;

const Profile = ({ params }: { params: { username: string } }) => {
  const { user } = useAuthContext();
  let profileUsername = params.username;

  const [userinfo, setUserinfo] = useState<PersonalUserInfo | UserProfile | null>(null);
  const [bEditProfileDiagVisible, setbEditProfileDiagVisible] = useState<boolean>(false);
  const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);
  const [followList, setFollowList] = useState<FollowListResponse | null>(null);

  const getFollowList = useCallback(async () => {
    if (user) {
      // const res = await apiClient.user.getFollows({ query: { username: user.username }});
      const res = await apiClient.user.getFollowedUsers({ query: { username: user.username } });
      if (res.status === 200 && res.body) {
        console.log(res.body);
        setFollowList(res.body);
      }
    }
  }, [user]);

  useEffect(() => {
    const wrapper = async () => {
      const userinfo = await getUserInfo();
      if (!user && "error" in userinfo) {
        // logged out users
        setbIsLoggedin(false);
      } else {
        setbIsLoggedin(true);
      }
    };

    wrapper();
  }, [user]);

  useEffect(() => {
    const wrapper = async () => {
      if (!profileUsername) {
        if (user) {
          const userinfo_fetched = await getUserInfo();
          if ("error" in userinfo_fetched) {
            console.log("Your own profile requested not found");
          } else {
            setUserinfo(userinfo_fetched);
            setEditDisplayName(userinfo_fetched.userConfig.displayName);
            setEditBio(userinfo_fetched.userConfig.bio);
          }
        }
      } else {
        const userinfo_fetched = await getProfileInfo({ username: profileUsername });
        if ("error" in userinfo_fetched) {
          console.log("Profile " + profileUsername + " requested not found");
        } else {
          // console.log("from profile2");
          // console.log(userinfo_fetched);
          setUserinfo(userinfo_fetched);
          setbHasFollowed(!!userinfo_fetched.followedByRequester);
        }
      }

      if (user && !profileUsername) {
        getPostsOfUser(user.username);
      }

      if (profileUsername) {
        getPostsOfUser(profileUsername[0]);
      }
    };

    wrapper();
  }, [user, profileUsername]);

  const [posts, setPosts] = useState<PostInfo[] | null>(null);
  const [comments, setComments] = useState<PostInfo[] | null>(null);

  const getPostsOfUser = async (username: string) => {
    // console.log("received username: " + username);
    const res = await apiClient.user.getPosts({ query: { username: username } });

    if (res.status === 200 && res.body) {
      let posts = res.body;
      console.log(posts);

      // Filter posts where parentPostId is not empty and store them in comments
      const comments = posts.filter((post) => post.parentPostId);
      setComments(comments);

      // Filter posts where parentPostId is empty and store them in posts
      const mainPosts = posts.filter((post) => !post.parentPostId);
      setPosts(mainPosts);
    }
  };

  const divRef = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      setMarginTop(divRef.current.clientHeight - 70);
    }
  }, [userinfo]);

  const [selectedButton, setSelectedButton] = useState("Posts");

  const handleSaveProfile = async () => {
    const userConfig: { displayName: string; bio: string; avatarUrl?: string; bannerUrl?: string } = {
      displayName: editDisplayName,
      bio: editBio,
    };

    if (editAvatarUrl) {
      userConfig.avatarUrl = editAvatarUrl;
    }

    if (editBannerUrl) {
      userConfig.bannerUrl = editBannerUrl;
    }

    const res = await apiClient.user.userConfig({ body: userConfig });
    console.log(res);
    const userinfo_fetched = await getUserInfo();
    if ("error" in userinfo_fetched) {
      console.log("Your own profile requested not found");
    } else {
      setUserinfo(userinfo_fetched);
      setEditDisplayName(userinfo_fetched.userConfig.displayName);
      setEditBio(userinfo_fetched.userConfig.bio);
    }
    setbEditProfileDiagVisible(false);
  };

  const [editBannerUrl, setEditBannerUrl] = useState<string>();
  const handleEditBannerClicked = () => {
    const formData = new FormData();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.addEventListener("change", async () => {
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          formData.append("banner", input.files[i]);
        }
        const res = await apiClient.upload.uploadProfile({
          body: formData,
        });
        console.log(res);
        if (res.status === 200 && res.body) {
          const bannerUrl = res.body.bannerUrl;
          setEditBannerUrl(bannerUrl);
        }
      }
    });
  };

  const [editAvatarUrl, setEditAvatarUrl] = useState<string>();
  const handleEditProfilePicClicked = () => {
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
          setEditAvatarUrl(avatarUrl);
        }
      }
    });
  };

  const footerElement = (
    <div>
      <Button label="Save" icon="pi pi-check" onClick={handleSaveProfile} />
    </div>
  );
  const [editDisplayName, setEditDisplayName] = useState("");
  // const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  const [bHasFollowed, setbHasFollowed] = useState<boolean>(false);

  const handleFollow = async () => {
    console.log("username: " + profileUsername[0] + " set: " + !bHasFollowed);
    const res = await apiClient.user.userFollow({ body: { username: profileUsername[0], set: !bHasFollowed } });
    setbHasFollowed(!bHasFollowed);
    console.log(res);
  };

  return (
    <div className="flex w-full h-full flex-col overflow-y-auto overflow-x-clip">
      <Dialog
        header="Edit Profile"
        footer={footerElement}
        visible={bEditProfileDiagVisible}
        className="w-[50vw] min-h-[80%]"
        onHide={() => setbEditProfileDiagVisible(false)}
      >
        <div>
          <div className="flex flex-col w-full bg-[#e5eeee] relative">
            <Image
              className="z-0 h-40"
              src={
                (editBannerUrl && process.env.NEXT_PUBLIC_BACKEND_URL + editBannerUrl) ||
                (userinfo && userinfo.userConfig.bannerUrl && process.env.NEXT_PUBLIC_BACKEND_URL + userinfo.userConfig.bannerUrl) ||
                ""
              }
              alt="profile background pic"
              pt={{
                root: { className: "cursor-pointer" },
                image: { className: "object-cover h-full w-full" },
                previewContainer: { className: "z-20" },
              }}
              onClick={handleEditBannerClicked}
            />
            <div className="absolute top-full transform translate-x-10 -translate-y-[4.5rem] z-10 ">
              <div className="flex mb-4 w-fit">
                <Image
                  src={
                    (editAvatarUrl && process.env.NEXT_PUBLIC_BACKEND_URL + editAvatarUrl) ||
                    (userinfo && userinfo.userConfig.avatarUrl && process.env.NEXT_PUBLIC_BACKEND_URL + userinfo.userConfig.avatarUrl) ||
                    "/placeholder_profilePic_white-bg.jpg"
                  }
                  alt="profile pic"
                  pt={{
                    image: { className: "rounded-full h-36 w-36 object-cover cursor-pointer" },
                    previewContainer: { className: "z-20" },
                  }}
                  onClick={handleEditProfilePicClicked}
                />
              </div>
              <div className="[&>div]:mb-4">
                <p className="text-xl">Display name</p>
                <div className="flex w-96">
                  <InputText className="w-full" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
                </div>
                {/* <p className="text-xl">Username</p>
                <div className="flex w-96">
                  <InputText className="w-full" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                </div> */}
                <p className="text-xl">Bio</p>
                <div className="flex w-96">
                  <InputTextarea className="w-full" value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={4} autoResize />
                </div>
              </div>
            </div>

            {!profileUsername && (
              <div className="flex w-full absolute top-full z-10 justify-end mt-10 pr-10">
                {/* <Button className='w-36' label='Edit Flexfolio' onClick={() => setbEditProfileDiagVisible(true)} /> */}
              </div>
            )}
          </div>
        </div>
      </Dialog>
      <div className="flex flex-col w-full bg-[#e5eeee] relative">
        <Image
          className="z-0 h-72"
          src={(userinfo && userinfo.userConfig.bannerUrl && process.env.NEXT_PUBLIC_BACKEND_URL + userinfo.userConfig.bannerUrl) || ""}
          alt="profile background pic"
          pt={{
            image: { className: "object-cover h-full w-full" },
            previewContainer: { className: "z-20" },
          }}
          preview
        />
        <div ref={divRef} className="absolute top-full transform translate-x-10 -translate-y-[4.5rem] z-10 ">
          <div className="flex mb-4">
            <Image
              src={
                (userinfo && userinfo.userConfig.avatarUrl && process.env.NEXT_PUBLIC_BACKEND_URL + userinfo.userConfig.avatarUrl) ||
                "/placeholder_profilePic_white-bg.jpg"
              }
              alt="profile pic"
              pt={{
                image: { className: "rounded-full h-36 w-36 object-cover" },
                previewContainer: { className: "z-20" },
              }}
              preview
            />
            <div className="flex flex-col min-h-full justify-end ml-2">
              <p className="text-3xl">{userinfo && userinfo.userConfig.displayName}</p>
              <p className="text-xl text-gray-600">@{userinfo && userinfo.username}</p>
            </div>
          </div>
          <p className="text-xl whitespace-pre-wrap max-w-96">{userinfo && userinfo.userConfig.bio}</p>
        </div>

        {user && !profileUsername ? (
          <div className="flex w-full absolute top-full z-10 justify-end mt-10 pr-10">
            <Button className="w-36" label="Edit Profile" onClick={() => setbEditProfileDiagVisible(true)} />
          </div>
        ) : (
          bIsLoggedin && (
            <div className="flex w-full absolute top-full z-10 justify-end mt-10 pr-10">
              <Button className="w-36" label={bHasFollowed ? "Unfollow" : "Follow"} outlined={bHasFollowed} onClick={() => handleFollow()} />
            </div>
          )
        )}
      </div>
      <div style={{ marginTop: `${marginTop}px` }}>
        <div className="flex justify-between w-full">
          <Button
            className={`w-full ${selectedButton === "Posts" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Posts"
            text
            onClick={() => setSelectedButton("Posts")}
            // pt={{
            //   root: {className: "!border-0"},
            // }}
          />
          <Button
            className={`w-full ${selectedButton === "Replies" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Replies"
            text
            onClick={() => setSelectedButton("Replies")}
          />
        </div>
      </div>

      {/* <div className="bg-slate-500 h-96 w-10"></div> */}
      {/* {dummyPost.map((post, index) => <PostBox key={index} post={post} />)} */}

      {posts && posts.length > 0 ? (
        selectedButton === "Posts" ? (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col w-[60%] items-center justify-center [&>*]:mt-2">
              {posts.map((post, index) => (
                <PostBox key={index} post={post} currentUserName={user?.username} />
              ))}
            </div>
          </div>
        ) : selectedButton === "Replies" ? (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col w-[60%] items-center justify-center [&>*]:mt-2">
              {comments && comments.map((comment, index) => <PostBox key={index} post={comment} currentUserName={user?.username} bVisitParentPost={true} />)}
            </div>
          </div>
        ) : null
      ) : (
        <p className="text-xl my-4">No posts yet ._.</p>
      )}
    </div>
  );
};

export default Profile;
