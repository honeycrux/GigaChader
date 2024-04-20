"use client";
import { useState, useEffect } from "react";
import PostBox from "@/components/home/PostBox";
import { useAuthContext } from "@/providers/auth-provider";
import { apiClient } from "@/lib/apiClient";
import { ClientInferResponseBody } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts";

type GlobalFeedsResponse = ClientInferResponseBody<typeof apiContract.post.getGlobalFeeds, 200>;

const Home = () => {
  const { user } = useAuthContext();
  const [globalFeeds, setGlobalFeeds] = useState<GlobalFeedsResponse | null>(null);

  const getGlobalFeeds = async () => {
    const res = await apiClient.post.getGlobalFeeds();
    if (res.status === 200 && res.body) {
      setGlobalFeeds(res.body);
    }
  };

  useEffect(() => {
    const wrapper = async () => {
      await getGlobalFeeds();
    };

    wrapper();
  }, []);

  return (
    <>
      {/* main content start */}
      <main className="flex w-full justify-center overflow-y-auto">
        {/* main content with margin */}
        <div className="flex flex-col w-[60%] space-y-4">
          <div className="flex flex-col w-full h-fit mt-5 !mb-0">
            <p className="text-3xl font-bold">Global Feeds</p>
            <p className="font-light">Latest posts from All Chads.</p>
          </div>

          {globalFeeds && globalFeeds.map((post, index) => <PostBox key={index} post={post} currentUserName={user?.username} />)}

          {(!globalFeeds || globalFeeds?.length === 0) && <p className="text-xl">No posts to display yet ._.</p>}
        </div>
      </main>
      {/* main content end */}
    </>
  );
};

export default Home;
