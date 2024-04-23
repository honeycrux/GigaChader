"use client";
import { useState, useEffect } from "react";
import PostBox from "@/components/home/PostBox";
import { useAuthContext } from "@/providers/auth-provider";
import { apiClient } from "@/lib/apiClient";
import { ClientInferResponseBody } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts";
import InfiniteScroll from "react-infinite-scroll-component";

type GlobalFeedsResponse = ClientInferResponseBody<typeof apiContract.post.getGlobalFeeds, 200>;

const Home = () => {
  const { user } = useAuthContext();
  const [globalFeeds, setGlobalFeeds] = useState<GlobalFeedsResponse | null>(null);

  const [from, setFrom] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

  const fetchOnCreatePost = async () => {
    const res = await apiClient.post.getGlobalFeeds({ query: { limit: 1 } });
    if (res.status === 200 && res.body) {
      console.log(res.body);
      if (globalFeeds) {
        setGlobalFeeds([...res.body, ...globalFeeds]);
      } else {
        setGlobalFeeds(res.body);
      }
    }
  };

  const getGlobalFeeds = async () => {
    const res = await apiClient.post.getGlobalFeeds({ query: { from: from, limit: limit } });
    if (res.status === 200 && res.body) {
      setGlobalFeeds(res.body);
      if (res.body.length < limit) {
        setHasMorePosts(false);
      }
      if (globalFeeds) {
        setGlobalFeeds([...globalFeeds, ...res.body]);
      } else {
        setGlobalFeeds(res.body);
      }
    }
  };

  const fetchMoreGlobalPosts = () => {
    setFrom((f) => f + limit);
    if (globalFeeds && globalFeeds.length < limit) {
      setHasMorePosts(false);
    }
  };

  useEffect(() => {
    getGlobalFeeds();
  }, [from]);

  useEffect(() => {
    const wrapper = async () => {
      await getGlobalFeeds();
    };

    wrapper();
  }, []);

  return (
    <>
      {/* main content start */}
      <main id="scrollableMain" className="flex w-full justify-center overflow-y-auto">
        {/* main content with margin */}
        <div className="flex flex-col w-[60%] space-y-4">
          <div className="flex flex-col w-full h-fit mt-5 !mb-0">
            <p className="text-3xl font-bold">Global Feeds</p>
            <p className="font-light">Latest posts from All Chads.</p>
          </div>

          {globalFeeds && (
            <InfiniteScroll
              dataLength={globalFeeds ? globalFeeds.length : 0}
              next={fetchMoreGlobalPosts}
              hasMore={hasMorePosts}
              loader={
                <p className="text-center space-x-2">
                  <i className="pi pi-spin pi-spinner text-sm" />
                  <b>Loading...</b>
                </p>
              }
              endMessage={
                <p className="text-center">
                  <b>{"That's all posts"}</b>
                </p>
              }
              scrollableTarget="scrollableMain"
              className="min-w-fit space-y-4"
            >
              {globalFeeds.map((post, index) => (
                <PostBox key={index} post={post} currentUserName={user?.username} onRepostSubmit={fetchOnCreatePost} />
              ))}
            </InfiniteScroll>
          )}

          {(!globalFeeds || globalFeeds?.length === 0) && <p className="text-xl">No posts to display yet ._.</p>}
        </div>
      </main>
      {/* main content end */}
    </>
  );
};

export default Home;
