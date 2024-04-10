'use client';

import { apiClient } from '@/lib/apiClient';
import PostBox from "@/components/home/PostBox";
import {useEffect, useState } from "react";
import { PostInfo } from '#/shared/models/post';
import { useAuthContext } from "@/providers/auth-provider";

const bookmarkedPost = ({ params }: { params: { id: string } }) => {

  const { user } = useAuthContext();
  const [savedPosts, setsavedPosts] = useState<PostInfo[] | null>(null);

  const getSavedPosts = async () => {
    const res = await apiClient.user.getSavedPosts(
      { query: {} } // Add the 'postId' property to the 'query' object
    );

    if (res.status === 200) {
      setsavedPosts(res.body);
    }

  }

  useEffect(() => {
    if (user) {
      getSavedPosts();
    }
  }, [user]);

  return (
    <div className='flex flex-col items-center w-full overflow-y-auto'>
      <div className="flex flex-col w-[60%] space-y-4">
        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
          <p className="text-3xl font-bold">Bookmarks</p>
        </div>
        {savedPosts && savedPosts.map((post, index) => (
            <PostBox key={index} {...post} currentUserName={user?.username} />
          ))}
      </div>
    </div>
  )
}

export default bookmarkedPost;
