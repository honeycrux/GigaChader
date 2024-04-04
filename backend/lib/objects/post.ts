// This file defines standardized query objects for: Post
// These are useful for making Prisma selections and data transformations to the standard response types.

import { PostInfo, SimplePostInfo } from "#/shared/models/post";
import { prismaClient, StandardizedQuery } from "../data/db";
import { stdSimpleUserInfo } from "./user";

const stdPostInfoSelectObj = {
    id: true,
    content: true,
    createdAt: true,
    userMedia: true,
    author: {
        select: stdSimpleUserInfo.select,
    },
    repostingPostId: true,
    parentPostId: true,
    _count: {
        select: {
            likedByUsers: true,
            repostedOnPosts: true,
            childPosts: true,
            savedByUsers: true,
        },
    },
};

export const stdPostInfo = new StandardizedQuery<
    typeof stdPostInfoSelectObj,
    Omit<PostInfo, "author" | "likeCount" | "repostCount" | "commentCount" | "saveCount"> & {
        author: { username: string; userConfig: { displayName: string; imageUrl: string | null } };
        _count: { likedByUsers: number; repostedOnPosts: number; childPosts: number; savedByUsers: number };
    },
    PostInfo
>({
    select: stdPostInfoSelectObj,
    filter: async function (data) {
        const { _count, author, ...rest } = data;
        return {
            ...rest,
            author: await stdSimpleUserInfo.filter(author),
            likeCount: _count.likedByUsers,
            repostCount: _count.repostedOnPosts,
            commentCount: _count.childPosts,
            saveCount: _count.savedByUsers,
        };
    },
    sample: async function (props: { postId: string }) {
        const data = await prismaClient.post.findUnique({
            select: this.select,
            where: {
                id: props.postId,
            },
        });
        if (!data) {
            return null;
        }
        return this.filter(data);
    },
});

const stdSimplePostInfoSelectObj = {
    id: true,
    author: {
        select: stdSimpleUserInfo.select,
    },
};

export const stdSimplePostInfo = new StandardizedQuery<
    typeof stdSimplePostInfoSelectObj,
    Omit<SimplePostInfo, "author"> & { author: { username: string; userConfig: { displayName: string; imageUrl: string | null } } },
    SimplePostInfo
>({
    select: stdSimplePostInfoSelectObj,
    filter: async function (data) {
        const { author, ...rest } = data;
        return {
            ...rest,
            author: await stdSimpleUserInfo.filter(author),
        };
    },
    sample: async function (props: { postId: string }) {
        const data = await prismaClient.post.findUnique({
            select: this.select,
            where: {
                id: props.postId,
            },
        });
        if (!data) {
            return null;
        }
        return this.filter(data);
    },
});
