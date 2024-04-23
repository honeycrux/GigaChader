"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "primereact/image";
import PostBox from "@/components/home/PostBox";
import { Button } from "primereact/button";
import { useAuthContext } from "@/providers/auth-provider";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { apiClient } from "@/lib/apiClient";
import { UserConfigProps, UserProfile } from "#/shared/models/user";
import { apiContract } from "#/shared/contracts";
import { ClientInferResponseBody } from "@ts-rest/core";
import { PostInfo } from "#/shared/models/post";
<<<<<<< HEAD
import { Chart } from 'primereact/chart';
import CryptoEdit from "@/components/crypto/CryptoSearch";
import { CryptoInfo } from "#/shared/models/crypto";
import { Card } from "primereact/card";
import FlexfolioEdit from "@/components/crypto/FlexfolioEdit";
=======
import { Chart } from "primereact/chart";
import SimpleUserBox from "@/components/home/SimpleUserBox";
>>>>>>> baed5ca (Add profile page followers and following)

type FollowListResponse = ClientInferResponseBody<typeof apiContract.user.getFollowedUsers, 200>;

const Profile = ({ params }: { params: { username?: string[] } }) => {
  const { user, userInfo: myInfo, refreshUserInfo: refreshMyInfo } = useAuthContext();
  let profileUsername = params.username?.[0] || user?.username;
  let bIsViewingSelf = !!profileUsername && profileUsername === user?.username;

  const [displayedUserInfo, setDisplayedUserInfo] = useState<UserProfile | null>(null);
  const [bEditProfileDiagVisible, setbEditProfileDiagVisible] = useState<boolean>(false);
  const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);
  const [bFollowListVisible, setbFollowListVisible] = useState<boolean>(false);
  const [bFollowerListVisible, setbFollowerListVisible] = useState<boolean>(false);
  const [followList, setFollowList] = useState<FollowListResponse | null>(null);
  const [followerList, setFollowerList] = useState<FollowListResponse | null>(null);
  const [bIsSuspended, setbIsSuspended] = useState<boolean>(false);
  const [bNotFound, setbNotFound] = useState<boolean>(false);

  const getFollowList = useCallback(async () => {
    if (profileUsername) {
      const res = await apiClient.user.getFollowedUsers({ query: { username: profileUsername } });
      if (res.status === 200 && res.body) {
        console.log(res.body);
        setFollowList(res.body);
      }
    }
  }, [profileUsername]);

  const getFollowerList = useCallback(async () => {
    if (profileUsername) {
      const res = await apiClient.user.getFollows({ query: { username: profileUsername } });
      if (res.status === 200 && res.body) {
        console.log(res.body);
        setFollowerList(res.body);
      }
    }
  }, [profileUsername]);

  useEffect(() => {
    if (!myInfo) {
      // logged out users
      setbIsLoggedin(false);
    } else {
      setbIsLoggedin(true);
    }
  }, [myInfo]);

  const fetchProfileInfo = useCallback(async () => {
    if (profileUsername) {
      const res = await apiClient.user.getProfile({ params: { username: profileUsername } });
      if (res.status === 200 && res.body) {
        // console.log("from profile2");
        // console.log(userinfo_fetched);
        if (res.body.suspended) {
          setbIsSuspended(true);
        } else {
          setDisplayedUserInfo(res.body);
        }
        setbHasFollowed(!!res.body.followedByRequester);
      } else {
        setbNotFound(true);
        console.log("Profile " + profileUsername + " requested not found");
      }
    }
  }, [profileUsername]);

  useEffect(() => {
    const wrapper = async () => {
      if (bIsViewingSelf && myInfo) {
        // viewing own profile
        setEditAvatarUrl(myInfo.userConfig.avatarUrl || undefined);
        setEditBannerUrl(myInfo.userConfig.bannerUrl || undefined);
        setEditDisplayName(myInfo.userConfig.displayName);
        setEditBio(myInfo.userConfig.bio);
      }
      fetchProfileInfo();

      if (profileUsername) {
        getPostsOfUser(profileUsername);
      }
    };

    wrapper();
  }, [myInfo, profileUsername, bIsViewingSelf, fetchProfileInfo]);

  const [posts, setPosts] = useState<PostInfo[] | null>(null);
  const [comments, setComments] = useState<PostInfo[] | null>(null);

  const fetchOnCreatePost = async () => {
    if (profileUsername && bIsViewingSelf) {
      const res = await apiClient.user.getPosts({ query: { username: profileUsername, filter: "post", limit: 1 } });
      if (res.status === 200 && res.body) {
        console.log(res.body);
        if (posts) {
          setPosts([...res.body, ...posts]);
        } else {
          setPosts(res.body);
        }
      }
    }
  };

  const getPostsOfUser = async (username: string) => {
    apiClient.user.getPosts({ query: { username: username, filter: "post" } }).then((res) => {
      if (res.status === 200 && res.body) {
        let posts = res.body;
        setPosts(posts);
      }
    });
    apiClient.user.getPosts({ query: { username: username, filter: "reply" } }).then((res) => {
      if (res.status === 200 && res.body) {
        let posts = res.body;
        setComments(posts);
      }
    });
  };

  const divRef = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      setMarginTop(divRef.current.clientHeight - 70);
    }
  }, [displayedUserInfo]);

  const [selectedButton, setSelectedButton] = useState("Posts");

  const handleSaveProfile = async () => {
    const userConfig: UserConfigProps = {
      displayName: editDisplayName,
      bio: editBio,
    };

    if (editAvatarUrl && editAvatarUrl !== myInfo?.userConfig.avatarUrl) {
      userConfig.avatarUrl = editAvatarUrl;
    }

    if (editBannerUrl && editBannerUrl !== myInfo?.userConfig.bannerUrl) {
      userConfig.bannerUrl = editBannerUrl;
    }

    if (!editAvatarUrl && !!myInfo?.userConfig.avatarUrl) {
      userConfig.deleteAvatar = true;
    }

    if (!editBannerUrl && !!myInfo?.userConfig.bannerUrl) {
      userConfig.deleteBanner = true;
    }

    const res = await apiClient.user.userConfig({ body: userConfig });
    console.log(res);
    const newInfo = await refreshMyInfo();
    if (newInfo) {
      setEditDisplayName(newInfo.userConfig.displayName);
      setEditBio(newInfo.userConfig.bio);
    }
    setbEditProfileDiagVisible(false);
    await fetchProfileInfo();
  };

  const [editBannerUrl, setEditBannerUrl] = useState<string | false>(); // "false" indicates banner is to be deleted
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

  const [editAvatarUrl, setEditAvatarUrl] = useState<string | false>(); // "false" indicates avatar is to be deleted
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

  const footerElementProfile = (
    <>
      <Button
        text
        label="Remove Avatar"
        onClick={() => {
          setEditAvatarUrl(false);
        }}
      />
      <Button
        text
        label="Remove Banner"
        onClick={() => {
          setEditBannerUrl(false);
        }}
      />
      <Button label="Save" icon="pi pi-check" onClick={handleSaveProfile} />
    </>
  );
  const [editDisplayName, setEditDisplayName] = useState("");
  // const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  const [bHasFollowed, setbHasFollowed] = useState<boolean>(false);

  const handleFollow = async () => {
    if (profileUsername) {
      console.log("username: " + profileUsername + " set: " + !bHasFollowed);
      const res = await apiClient.user.userFollow({ body: { username: profileUsername, set: !bHasFollowed } });
      setbHasFollowed(!bHasFollowed);
      console.log(res);
      await fetchProfileInfo();
    }
  };

  const [bEditFlexfolioDiagVisible, setbEditFlexfolioDiagVisible] = useState<boolean>(false);

  return (
    <div className="flex w-full h-full flex-col overflow-y-auto overflow-x-clip">
    
      <Dialog
        header="Edit Profile"
        footer={footerElementProfile}
        visible={bEditProfileDiagVisible}
        className="w-[50vw] min-h-[80%]"
        onHide={() => {
          setbEditProfileDiagVisible(false);
          setEditAvatarUrl(myInfo?.userConfig.avatarUrl || undefined);
          setEditBannerUrl(myInfo?.userConfig.bannerUrl || undefined);
          setEditDisplayName(myInfo?.userConfig.displayName || "");
          setEditBio(myInfo?.userConfig.bio || "");
        }}
      >

        <div>

          
            <div className="flex flex-col w-full bg-[#e5eeee] relative">
              <Image
                className="z-0 h-40"
                src={
                  editBannerUrl
                    ? process.env.NEXT_PUBLIC_BACKEND_URL + editBannerUrl
                    : editBannerUrl !== false && displayedUserInfo && displayedUserInfo.userConfig.bannerUrl
                    ? process.env.NEXT_PUBLIC_BACKEND_URL + displayedUserInfo.userConfig.bannerUrl
                    : ""
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
                      (editAvatarUrl !== false &&
                        displayedUserInfo &&
                        displayedUserInfo.userConfig.avatarUrl &&
                        process.env.NEXT_PUBLIC_BACKEND_URL + displayedUserInfo.userConfig.avatarUrl) ||
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

              {bIsViewingSelf && (
                <div className="flex w-full absolute top-full z-10 justify-end mt-10 pr-10">
                  {/* <Button className='w-36' label='Edit Flexfolio' onClick={() => setbEditProfileDiagVisible(true)} /> */}
                </div>
              )}
            </div>
        </div>
          
      </Dialog>
<<<<<<< HEAD

      

=======
      <Dialog
        header="Followers"
        visible={bFollowerListVisible}
        style={{ width: "50vw" }}
        onHide={() => {
          setbFollowerListVisible(false);
          setFollowerList(null);
        }}
      >
        {followerList ? (
          followerList.length > 0 ? (
            <div className="flex flex-col gap-2">
              {followerList.map((follower, index) => {
                return <SimpleUserBox user={follower} key={index} />;
              })}
            </div>
          ) : (
            <p className="text-center text-md">Wow, such empty!</p>
          )
        ) : (
          <p className="text-center text-md">Not fetched yet ._.</p>
        )}
      </Dialog>
      <Dialog
        header="Following"
        visible={bFollowListVisible}
        style={{ width: "50vw" }}
        onHide={() => {
          setbFollowListVisible(false);
          setFollowList(null);
        }}
      >
        {followList ? (
          followList.length > 0 ? (
            <div className="flex flex-col gap-2">
              {followList.map((follower, index) => {
                return <SimpleUserBox user={follower} key={index} />;
              })}
            </div>
          ) : (
            <p className="text-center text-md">Wow, such empty!</p>
          )
        ) : (
          <p className="text-center text-md">Not fetched yet ._.</p>
        )}
      </Dialog>
>>>>>>> baed5ca (Add profile page followers and following)
      <div className="flex flex-col w-full bg-[#e5eeee] relative">
        <Image
          className="z-0 h-72"
          src={
            (displayedUserInfo && displayedUserInfo.userConfig.bannerUrl && process.env.NEXT_PUBLIC_BACKEND_URL + displayedUserInfo.userConfig.bannerUrl) || ""
          }
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
                (displayedUserInfo && displayedUserInfo.userConfig.avatarUrl && process.env.NEXT_PUBLIC_BACKEND_URL + displayedUserInfo.userConfig.avatarUrl) ||
                "/placeholder_profilePic_white-bg.jpg"
              }
              alt="profile pic"
              pt={{
                image: { className: "rounded-full h-36 w-36 object-cover" },
                previewContainer: { className: "z-20" },
              }}
              preview
            />
            {displayedUserInfo && (
              <div className="flex flex-col min-h-full justify-end ml-2">
                <p className="text-3xl">{displayedUserInfo && displayedUserInfo.userConfig.displayName}</p>
                <p className="text-xl text-gray-600">@{displayedUserInfo && displayedUserInfo.username}</p>
              </div>
            )}
          </div>
          <p className="text-xl whitespace-pre-wrap max-w-96">{displayedUserInfo && displayedUserInfo.userConfig.bio}</p>
          {displayedUserInfo && (
            <div className="flex flex-row gap-2 ml-6 my-1 text-xl">
              <div
                className="px-6 py-2 rounded-md bg-transparent hover:bg-gray-600 hover:bg-opacity-20 transition duration-300 cursor-pointer"
                onClick={async () => {
                  setbFollowerListVisible(true);
                  getFollowerList();
                }}
              >
                <span className="font-bold mr-2">Followers: </span>
                {displayedUserInfo.followerCount}
              </div>
              <div
                className="px-6 py-2 rounded-md bg-transparent hover:bg-gray-600 hover:bg-opacity-20 transition duration-300 cursor-pointer"
                onClick={async () => {
                  setbFollowListVisible(true);
                  getFollowList();
                }}
              >
                <span className="font-bold mr-2">Following: </span>
                {displayedUserInfo.followedUserCount}
              </div>
            </div>
          )}
        </div>

        {user && bIsViewingSelf ? (
          <div className="flex w-full absolute top-full z-10 justify-end mt-10 pr-10">
            <Button className="w-36" label="Edit Profile" onClick={() => setbEditProfileDiagVisible(true)} />
          </div>
        ) : (
          bIsLoggedin &&
          displayedUserInfo && (
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
            className={`w-full ${selectedButton === "Comments" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Comments"
            text
            onClick={() => setSelectedButton("Comments")}
          />
          <Button
            className={`w-full ${selectedButton === "Flexfolio" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Flexfolio"
            text
            onClick={() => setSelectedButton("Flexfolio")}
          />
        </div>
      </div>

      {/* <div className="bg-slate-500 h-96 w-10"></div> */}
      {/* {dummyPost.map((post, index) => <PostBox key={index} post={post} />)} */}

      {posts && posts.length > 0 ? (
        selectedButton === "Posts" ? (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col w-[60%] items-center justify-center [&>*]:mt-2">
              {posts.length > 0 ? (
                posts.map((post, index) => <PostBox key={index} post={post} currentUserName={user?.username} onRepostSubmit={fetchOnCreatePost} />)
              ) : (
                <p className="text-xl my-4 text-center">No post to show.</p>
              )}
            </div>
          </div>
        ) : selectedButton === "Comments" ? (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col w-[60%] items-center justify-center [&>*]:mt-2">
              {comments && comments.length > 0 ? (
                comments.map((comment, index) => (
                  <PostBox key={index} post={comment} currentUserName={user?.username} bVisitParentPost={true} onRepostSubmit={fetchOnCreatePost} />
                ))
              ) : (
                <p className="text-xl my-4 text-center">No comment to show.</p>
              )}
            </div>
          </div>
        ) : selectedButton === "Flexfolio" ? (
          <div className="flex items-center justify-center w-full flex-col">
            <FlexfolioEdit bEditFlexfolioDiagVisible={bEditFlexfolioDiagVisible} onExit={() => {
              setbEditFlexfolioDiagVisible(false);
            }} />
            <Card
              pt={{
                    content: { className: "p-0" },
              }}
            >
                <div className="justify-between flex flex-row w-full gap-11">
                    <p className="text-3xl font-bold justify-start">Flexfolio</p>
                    <div className="flex  justify-end ml-11">
                      <Button className="w-36 " label="Edit Flexfolio" onClick={() => setbEditFlexfolioDiagVisible(true)} />
                    </div>
                </div>
                <div>
                  <p className="text-lg">@{myInfo && myInfo.username} is investing in</p>
                </div>
                {/* <Chart type="pie" data={chartData} options={chartOptions} className="w-full md:w-30rem" /> */}
            </Card>

            
            


          </div>
        ) : null
      ) : (
        <p className="text-xl my-4 text-center">{bNotFound ? "User not found." : bIsSuspended ? "User is suspended." : "User not loaded yet ._."}</p>
      )}
    </div>
  );
};

export default Profile;
