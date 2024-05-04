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
import { SimpleUserInfo, UserConfigProps, UserProfile } from "#/shared/models/user";
import { PostInfo } from "#/shared/models/post";
import { Card } from "primereact/card";
import FlexfolioEdit from "@/components/crypto/FlexfolioEdit";
import SimpleUserBox from "@/components/home/SimpleUserBox";
import Chart from "react-apexcharts";

type ButtonTabState = "Posts" | "Comments" | "Flexfolio";

const Profile = ({ params }: { params: { username?: string[] } }) => {
  const { user, userInfo: myInfo, refreshUserInfo: refreshMyInfo } = useAuthContext();
  let profileUsername = params.username?.[0] || user?.username;
  let bIsViewingSelf = !!profileUsername && profileUsername === user?.username;

  const [selectedButton, setSelectedButton] = useState<ButtonTabState>("Posts");
  const [displayedUserInfo, setDisplayedUserInfo] = useState<UserProfile | null>(null);
  const [bEditProfileDiagVisible, setbEditProfileDiagVisible] = useState<boolean>(false);
  const [bIsLoggedin, setbIsLoggedin] = useState<boolean>(false);
  const [bFollowListVisible, setbFollowListVisible] = useState<boolean>(false);
  const [bFollowerListVisible, setbFollowerListVisible] = useState<boolean>(false);
  const [followList, setFollowList] = useState<SimpleUserInfo[] | null>(null);
  const [followerList, setFollowerList] = useState<SimpleUserInfo[] | null>(null);
  const [bIsSuspended, setbIsSuspended] = useState<boolean>(false);
  const [bNotFound, setbNotFound] = useState<boolean>(false);
  const [cryptoUpdatedTime, setCryptoUpdatedTime] = useState<string>("");

  // get follow list of the user from the backend
  const getFollowList = useCallback(async () => {
    if (profileUsername) {
      const res = await apiClient.user.getFollowedUsers({ query: { username: profileUsername } });
      if (res.status === 200 && res.body) {
        console.log(res.body);
        setFollowList(res.body);
      }
    }
  }, [profileUsername]);

  // get follower list of the user from the backend
  const getFollowerList = useCallback(async () => {
    if (profileUsername) {
      const res = await apiClient.user.getFollows({ query: { username: profileUsername } });
      if (res.status === 200 && res.body) {
        console.log(res.body);
        setFollowerList(res.body);
      }
    }
  }, [profileUsername]);

  // check if the user is logged in
  useEffect(() => {
    if (!myInfo) {
      // logged out users
      setbIsLoggedin(false);
    } else {
      setbIsLoggedin(true);
    }
  }, [myInfo]);

  // fetch user profile info from the backend
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
          // use the first crypto holding's updated time as the updated time for the chart
          if (res.body.userCryptoInfo.cryptoHoldings.length > 0) {
            const updatedAt = res.body.userCryptoInfo.cryptoHoldings[0].crypto?.updatedAt;
            const cryptoUpdatedTimeString = updatedAt
              ? new Date(updatedAt).toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                  hour12: false,
                })
              : "";
            setCryptoUpdatedTime(cryptoUpdatedTimeString);
          }
        }
        setbHasFollowed(!!res.body.followedByRequester);
      } else {
        setbNotFound(true);
        console.log("Profile " + profileUsername + " requested not found");
      }
    }
  }, [profileUsername]);

  // fetch user profile info on page load
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

  // fetch post if a new post is created, possibly a repost
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

  // get posts of the user from the backend, filter by post or reply
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

  // magic for determining the bottom margin of bio section
  const divRef = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      setMarginTop(divRef.current.clientHeight - 70);
    }
  }, [displayedUserInfo]);

  // save the edited profile info to the backend
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

  // on banner click, open file dialog to upload a new banner
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

  // on avatar click, open file dialog to upload a new avatar
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
  const [editBio, setEditBio] = useState("");

  const [bHasFollowed, setbHasFollowed] = useState<boolean>(false);

  // on follow button click, follow or unfollow the user
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
                  <InputTextarea className="w-full" value={editBio} maxLength={1000}
                  onChange={(e) => setEditBio(e.target.value)} rows={4} autoResize />
                </div>
                <p>Text length: {editBio.length}/1000</p>
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
            <div className="flex flex-row my-1 text-xl space-x-2 rounded-md border border-orange1">
              <div
                className="px-6 py-2 rounded-md bg-transparent hover:bg-gray-600 hover:bg-opacity-20
                transition duration-300 cursor-pointer"
                onClick={async () => {
                  setbFollowerListVisible(true);
                  getFollowerList();
                }}
              >
                <span className="font-bold mr-2">Followers: </span>
                {displayedUserInfo.followerCount}
              </div>
              <div
                className="px-6 py-2 rounded-md bg-transparent hover:bg-gray-600 hover:bg-opacity-20
                transition duration-300 cursor-pointer"
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
          <div className="flex items-center justify-center w-full flex-col mt-2">
            <FlexfolioEdit
              bEditFlexfolioDiagVisible={bEditFlexfolioDiagVisible}
              onExit={() => {
                setbEditFlexfolioDiagVisible(false);
              }}
              onSave={async () => {
                await fetchProfileInfo();
              }}
            />
            <Card
              pt={{
                content: { className: "p-0" },
              }}
            >
              <div className="justify-between flex flex-row gap-11 min-w-fit w-[40vw] min-h-fit">
                <p className="text-3xl font-bold justify-start">Flexfolio</p>
                {bIsViewingSelf && (
                  <div className="flex justify-end ml-11">
                    <Button className="w-36" label="Edit Flexfolio" onClick={() => setbEditFlexfolioDiagVisible(true)} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg">
                  @{displayedUserInfo && displayedUserInfo.username}
                  {displayedUserInfo && displayedUserInfo.userCryptoInfo.cryptoHoldings.length > 0 ? (
                    <span> is investing in</span>
                  ) : (
                    <span> has not shared their investment</span>
                  )}
                </p>
              </div>
              {/* <Chart type="pie" data={chartData} options={chartOptions} className="w-full md:w-30rem" /> */}
              {displayedUserInfo && displayedUserInfo.userCryptoInfo.cryptoHoldings.length > 0 && (
                <div className="w-full flex flex-col items-end">
                  <div className="w-full flex justify-center">
                    <Chart
                      options={{
                        labels: displayedUserInfo.userCryptoInfo.cryptoHoldings
                          .map((cryptoObject) =>
                            cryptoObject.crypto
                              ? `${cryptoObject.crypto.name} (${cryptoObject.crypto.symbol})
                            <br/>
                            ${cryptoObject.amount} = $${(cryptoObject.crypto.priceUsd * cryptoObject.amount).toFixed(4)}`
                              : ""
                          )
                          .filter((label) => label !== ""),
                      }}
                      series={displayedUserInfo.userCryptoInfo.cryptoHoldings
                        .map((cryptoObject) => (cryptoObject.crypto ? cryptoObject.crypto.priceUsd * cryptoObject.amount : null))
                        .filter((amount) => amount !== null)
                        .map((amount) => amount as number)}
                      type="pie"
                      width={450}
                    />
                  </div>
                  <p className="text-gray-500 text-sm">Prices updated at: {cryptoUpdatedTime}</p>
                  <p className="text-gray-500 text-sm">
                    Data source:&nbsp;
                    <a href="https://coincap.io/" target="_blank" rel="noreferrer" className="text-gray-500 hover:underline text-sm">
                      coincap.io
                    </a>
                  </p>
                </div>
              )}
            </Card>
          </div>
        ) : null
      ) : (
        <p className="text-xl my-4 text-center">
          {bNotFound ? "User not found." : bIsSuspended ? "User is suspended." : user ? "User not loaded yet ._." : "Log in to see your own profile"}
        </p>
      )}
    </div>
  );
};

export default Profile;
