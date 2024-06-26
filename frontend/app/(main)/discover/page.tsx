"use client";
import { apiContract } from "#/shared/contracts";
import { CryptoInfo } from "#/shared/models/crypto";
import { PostInfo } from "#/shared/models/post";
import PostBox from "@/components/home/PostBox";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { ClientInferResponseBody } from "@ts-rest/core";
import Link from "next/link";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useEffect, useState } from "react";

type ButtonTabState = "Posts" | "Hashtags" | "Topics";
type TrendingPostsResponse = ClientInferResponseBody<typeof apiContract.trends.trendingPosts, 200>;
type TrendingHashtagsResponse = ClientInferResponseBody<typeof apiContract.trends.trendingHashtags, 200>;
type TrendingTopicsResponse = ClientInferResponseBody<typeof apiContract.trends.trendingTopics, 200>;

function DiscoverPage() {
  const { user } = useAuthContext();
  const [selectedButton, setSelectedButton] = useState<ButtonTabState>("Posts");
  const [trendingPosts, setTrendingPosts] = useState<TrendingPostsResponse | null>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtagsResponse | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopicsResponse | null>(null);

  // get trending posts from backend, i.e. posts with the most likes this week
  async function getTrendingPosts() {
    const res = await apiClient.trends.trendingPosts();
    if (res.status === 200) {
      return res.body;
    }
    return null;
  }

  // get trending hashtags from backend, i.e. hashtags with the most posts this week
  async function getTrendingHashtags() {
    const res = await apiClient.trends.trendingHashtags();
    if (res.status === 200) {
      return res.body;
    }
    return null;
  }

  // get trending topics from backend, i.e. crypto related keywords with the most posts this week
  async function getTrendingTopics() {
    const res = await apiClient.trends.trendingTopics();
    if (res.status === 200) {
      return res.body;
    }
    return null;
  }

  // get trending posts, hashtags, and topics when the page is loaded
  useEffect(() => {
    async function wrapper() {
      getTrendingPosts().then((data) => {
        setTrendingPosts(data);
      });
      getTrendingHashtags().then((data) => {
        setTrendingHashtags(data);
      });
      getTrendingTopics().then((data) => {
        setTrendingTopics(data);
      });
    }
    wrapper();
  }, []);

  return (
    <div className="flex w-full h-full flex-col overflow-y-auto overflow-x-clip">
      <div className="flex flex-col mt-5 ml-12">
        <p className="text-3xl font-bold">Discover</p>
        <p className="font-light">{"See what's trending this week."}</p>
      </div>
      <div className="mt-5">
        <div className="flex justify-between w-full">
          <Button
            className={`w-full ${selectedButton === "Posts" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Trending Posts"
            text
            onClick={() => setSelectedButton("Posts")}
          />
          <Button
            className={`w-full ${selectedButton === "Hashtags" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Trending Hashtags"
            text
            onClick={() => setSelectedButton("Hashtags")}
          />
          <Button
            className={`w-full ${selectedButton === "Topics" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Trending Topics"
            text
            onClick={() => setSelectedButton("Topics")}
          />
        </div>
        <div className="flex w-full justify-center overflow-y-auto mt-5">
          <div className="flex flex-col w-[60%] space-y-4">
            {selectedButton === "Posts" ? (
              trendingPosts ? (
                trendingPosts.length > 0 ? (
                  trendingPosts.map((post, index) => <PostBox key={index} post={post} currentUserName={user?.username} />)
                ) : (
                  <p className="text-center">No trending post this week.</p>
                )
              ) : (
                <p className="text-center">Not loaded yet ._.</p>
              )
            ) : selectedButton === "Hashtags" ? (
              trendingHashtags ? (
                trendingHashtags.length > 0 ? (
                  trendingHashtags.map((hashtag, index) => <HashtagCard key={index} index={index} {...hashtag} />)
                ) : (
                  <p className="text-center">No trending hashtags this week.</p>
                )
              ) : (
                <p className="text-center">Not loaded yet ._.</p>
              )
            ) : selectedButton === "Topics" ? (
              trendingTopics ? (
                trendingTopics.length > 0 ? (
                  trendingTopics.map((data, index) => <CryptoTopicCard key={index} index={index} {...data} />)
                ) : (
                  <p className="text-center">No trending topics this week.</p>
                )
              ) : (
                <p className="text-center">Not loaded yet ._.</p>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type HashtagCardProps = {
  index: number;
  tagText: string;
  postCount: number;
};
function HashtagCard({ index, tagText, postCount }: HashtagCardProps) {
  return (
    <Card
      pt={{
        content: { className: "p-0" },
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center">
          <i className="pi pi-hashtag text-xl"></i>
          <div className="pl-4">
            <p className="text-lg text-black font-bold">
              <span>{index + 1}</span>
            </p>
            <p className="text-sm text-gray-500">
              #{tagText} · On {postCount} post(s)
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center">
          <Link href={`/search?query=${encodeURIComponent("#" + tagText)}`}>
            <Button label={`See #${tagText}`.toUpperCase()} className="bg-blue-400 border-blue-400 hover:bg-blue-600" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

type CryptoTopicCardProps = {
  index: number;
  cryptoInfo: CryptoInfo;
  postCount: number;
};
function CryptoTopicCard({ index, cryptoInfo, postCount }: CryptoTopicCardProps) {
  return (
    <Card
      pt={{
        content: { className: "p-0" },
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center">
          <i className="pi pi-dollar text-xl"></i>
          <div className="pl-4">
            <p className="text-lg text-black font-bold">
              #{index + 1} {cryptoInfo.name}
            </p>
            {/* <p className="text-sm text-gray-500">{cryptoInfo.symbol}</p> */}
            <p className="text-sm text-gray-500">{postCount} POST(S)</p>
          </div>
        </div>

        <div className="flex flex-row items-center">
          <p className="text-lg text-black font-bold pr-4">${cryptoInfo.priceUsd}</p>
          <Link href={`/search?query=${encodeURIComponent("topic:" + cryptoInfo.cryptoId)}`}>
            <Button label="Discover Topic" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default DiscoverPage;
