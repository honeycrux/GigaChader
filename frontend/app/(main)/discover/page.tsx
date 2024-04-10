"use client";
import { CryptoInfo } from "#/shared/models/crypto";
import { PostInfo } from "#/shared/models/post";
import PostBox from "@/components/home/PostBox";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";

type ButtonTabState = "Posts" | "Hashtags" | "Topics";

function DiscoverPage() {
  const { user } = useAuthContext();
  const [selectedButton, setSelectedButton] = useState<ButtonTabState>("Posts");
  const [trendingPosts, setTrendingPosts] = useState<PostInfo[] | null>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<{ tagText: string; postCount: number }[] | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<{ cryptoInfo: CryptoInfo; postCount: number }[] | null>(null);

  async function getTrendingPosts() {
    const res = await apiClient.trends.trendingPosts();
    if (res.status === 200) {
      return res.body;
    }
    return null;
  }

  async function getTrendingHashtags() {
    const res = await apiClient.trends.trendingHashtags();
    if (res.status === 200) {
      return res.body;
    }
    return null;
  }

  async function getTrendingTopics() {
    const res = await apiClient.trends.trendingTopics();
    if (res.status === 200) {
      return res.body;
    }
    return null;
  }

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
      <div className="mt-5 ml-12">
        <p className="text-3xl font-bold">Discover</p>
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
              trendingPosts && trendingPosts.map((post, index) => <PostBox key={index} {...post} currentUserName={user?.username} />)
            ) : selectedButton === "Hashtags" ? (
              <div>Hashtags</div>
            ) : selectedButton === "Topics" ? (
              <div>Topics</div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscoverPage;
