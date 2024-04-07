// This file defines standard query functions for: Post
// These are useful for getting results for standard response types.

import { PostInfo, SimplePostInfo } from "#/shared/models/post";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../data/db";
import { simpleUserInfoFindManyAsRecord } from "./user";

const postInfoSelectObj = {
    id: true,
    content: true,
    createdAt: true,
    userMedia: true,
    author: {
        select: {
            username: true,
        },
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
} satisfies Prisma.PostSelect;

export async function postInfoFindMany(props: { postId: string[] }): Promise<PostInfo[]> {
    const data = await prismaClient.post.findMany({
        select: postInfoSelectObj,
        where: {
            id: {
                in: props.postId,
            },
        },
    });

    const authorlist = data.map((post) => post.author.username);
    const authordata = await simpleUserInfoFindManyAsRecord({ username: authorlist });

    const postInfo = data.map((post) => {
        const { _count, author, ...rest } = post;
        return {
            ...rest,
            author: authordata[author.username],
            likeCount: _count.likedByUsers,
            repostCount: _count.repostedOnPosts,
            commentCount: _count.childPosts,
            saveCount: _count.savedByUsers,
        };
    });

    return postInfo;
}

export async function postInfoFindManyAsRecord(props: { postId: string[] }): Promise<Record<string, PostInfo>> {
    const data = await postInfoFindMany({ postId: props.postId });
    const result: Record<string, PostInfo> = {};
    for (const d of data) {
        result[d.id] = d;
    }
    return result;
}

export async function postInfoFindOne(props: { postId: string }): Promise<PostInfo | null> {
    const data = await postInfoFindMany({ postId: [props.postId] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}

const simplePostInfoSelectObj = {
    id: true,
    author: {
        select: {
            username: true,
        },
    },
} satisfies Prisma.PostSelect;

export async function simplePostInfoFindMany(props: { postId: string[] }): Promise<SimplePostInfo[]> {
    const data = await prismaClient.post.findMany({
        select: simplePostInfoSelectObj,
        where: {
            id: {
                in: props.postId,
            },
        },
    });

    const authorlist = data.map((post) => post.author.username);
    const authordata = await simpleUserInfoFindManyAsRecord({ username: authorlist });

    const simplePostInfo = data.map((post) => {
        const { author, ...rest } = post;
        return {
            ...rest,
            author: authordata[author.username],
        };
    });

    return simplePostInfo;
}

export async function simplePostInfoFindManyAsRecord(props: { postId: string[] }): Promise<Record<string, SimplePostInfo>> {
    const data = await simplePostInfoFindMany({ postId: props.postId });
    const result: Record<string, SimplePostInfo> = {};
    for (const d of data) {
        result[d.id] = d;
    }
    return result;
}

export async function simplePostInfoFindOne(props: { postId: string }): Promise<SimplePostInfo | null> {
    const data = await simplePostInfoFindMany({ postId: [props.postId] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}
