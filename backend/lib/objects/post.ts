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
            postLikes: true,
            postSaves: true,
            repostedOnPosts: true,
            childPosts: true,
        },
    },
} satisfies Prisma.PostSelect;

export async function postInfoFindMany(props: { postId: string[]; requesterId: string | undefined }): Promise<PostInfo[]> {
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

    // Populate map for posts liked or saved by requester
    const likemap: Record<string, boolean> = {};
    const savemap: Record<string, boolean> = {};
    if (props.requesterId) {
        const likedata = await prismaClient.postLike.findMany({
            where: {
                post: {
                    id: {
                        in: props.postId,
                    },
                },
                user: {
                    id: props.requesterId,
                },
            },
            select: {
                post: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        const savedata = await prismaClient.postSave.findMany({
            where: {
                post: {
                    id: {
                        in: props.postId,
                    },
                },
                user: {
                    id: props.requesterId,
                },
            },
            select: {
                post: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        for (const d of likedata) {
            likemap[d.post.id] = true;
        }
        for (const d of savedata) {
            savemap[d.post.id] = true;
        }
    }

    const postInfo: PostInfo[] = data.map((post) => {
        const { _count, author, ...rest } = post;
        return {
            ...rest,
            author: authordata[author.username],
            likeCount: _count.postLikes,
            saveCount: _count.postSaves,
            repostCount: _count.repostedOnPosts,
            commentCount: _count.childPosts,
            likedByRequester: props.requesterId ? !!likemap[post.id] : null,
            savedByRequester: props.requesterId ? !!savemap[post.id] : null,
        };
    });

    return postInfo;
}

export async function postInfoFindManyAsRecord(props: { postId: string[]; requesterId: string | undefined }): Promise<Record<string, PostInfo>> {
    const data = await postInfoFindMany({ postId: props.postId, requesterId: props.requesterId });
    const result: Record<string, PostInfo> = {};
    for (const d of data) {
        result[d.id] = d;
    }
    return result;
}

export async function postInfoFindManyOrdered(props: { postId: string[]; requesterId: string | undefined }): Promise<PostInfo[]> {
    const data = await postInfoFindManyAsRecord({ postId: props.postId, requesterId: props.requesterId });
    const result = props.postId.filter((id) => !!data[id]).map((id) => data[id]);
    return result;
}

export async function postInfoFindOne(props: { postId: string; requesterId: string | undefined }): Promise<PostInfo | null> {
    const data = await postInfoFindMany({ postId: [props.postId], requesterId: props.requesterId });
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

export async function simplePostInfoFindManyOrdered(props: { postId: string[] }): Promise<SimplePostInfo[]> {
    const data = await simplePostInfoFindManyAsRecord({ postId: props.postId });
    const result = props.postId.filter((id) => !!data[id]).map((id) => data[id]);
    return result;
}

export async function simplePostInfoFindOne(props: { postId: string }): Promise<SimplePostInfo | null> {
    const data = await simplePostInfoFindMany({ postId: [props.postId] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}
