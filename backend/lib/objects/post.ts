/**
 * Name: Post Standard Objects
 * Description: Creates a set of common query functions that returns some standard object types from Post Models
 *              These are useful for getting results for response types.
 */

import { PostInfo, SimplePostInfo } from "#/shared/models/post";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../data/db";
import { simpleUserInfoFindManyAsRecord } from "./user";

/* Standard query functions for PostInfo */

const postInfoSelectObj = {
    id: true,
    content: true,
    createdAt: true,
    userMedia: true,
    postHashtags: {
        select: {
            tagText: true,
        },
    },
    postCryptoTopics: true,
    textualContexts: true,
    suspended: true,
    author: {
        select: {
            username: true,
        },
    },
    repostingPostId: true,
    repostChainIds: true,
    parentPostId: true,
    _count: {
        select: {
            postLikes: {
                where: {
                    user: {
                        suspended: false,
                    },
                },
            },
            postSaves: {
                where: {
                    user: {
                        suspended: false,
                    },
                },
            },
            repostedOnPosts: true,
            childPosts: true,
        },
    },
} satisfies Prisma.PostSelect;

export async function postInfoFindMany(props: { postId: string[]; requesterId: string | undefined; suppressReposts?: boolean }): Promise<PostInfo[]> {
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

    // get repost chain
    let allRepostChainPosts: Record<string, PostInfo> | null;

    if (!props.suppressReposts) {
        const allRepostChainPostIds = data
            .flatMap((d) => d.repostChainIds || []) // list of post IDs from all repost chains
            .filter((value, index, arr) => arr.indexOf(value) === index); // deduplicate
        allRepostChainPosts = await postInfoFindManyAsRecord({
            postId: allRepostChainPostIds,
            requesterId: props.requesterId,
            suppressReposts: true,
        });
    }

    const postInfo: PostInfo[] = data.map((post) => {
        const { _count, author, postHashtags, postCryptoTopics, repostChainIds, ...rest } = post;

        // construct reposting chain
        let repostingPost: PostInfo | null = null;
        if (!props.suppressReposts && allRepostChainPosts) {
            for (let repostId of repostChainIds.toReversed() /* (scan from oldest in chain) */) {
                if (repostId in allRepostChainPosts) {
                    if (repostingPost) {
                        // attach this to current reposting post
                        repostingPost = {
                            ...allRepostChainPosts[repostId],
                            repostingPost: repostingPost,
                        };
                    } else {
                        // start the chain with this post
                        repostingPost = allRepostChainPosts[repostId];
                    }
                } else {
                    // the chain is broken for some reason - set null and continue
                    repostingPost = null;
                }
            }
        }

        return {
            ...rest,
            repostingPost: repostingPost,
            postHashtags: postHashtags.map((tag) => tag.tagText),
            postCryptoTopics: postCryptoTopics.map((topic) => topic.cryptoId),
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

export async function postInfoFindManyAsRecord(props: {
    postId: string[];
    requesterId: string | undefined;
    suppressReposts?: boolean;
}): Promise<Record<string, PostInfo>> {
    const data = await postInfoFindMany({ postId: props.postId, requesterId: props.requesterId, suppressReposts: props.suppressReposts });
    const result: Record<string, PostInfo> = {};
    for (const d of data) {
        result[d.id] = d;
    }
    return result;
}

export async function postInfoFindManyOrdered(props: { postId: string[]; requesterId: string | undefined; suppressReposts?: boolean }): Promise<PostInfo[]> {
    const data = await postInfoFindManyAsRecord({ postId: props.postId, requesterId: props.requesterId, suppressReposts: props.suppressReposts });
    const result = props.postId.filter((id) => !!data[id]).map((id) => data[id]);
    return result;
}

export async function postInfoFindOne(props: { postId: string; requesterId: string | undefined; suppressReposts?: boolean }): Promise<PostInfo | null> {
    const data = await postInfoFindMany({ postId: [props.postId], requesterId: props.requesterId, suppressReposts: props.suppressReposts });
    if (!data[0]) {
        return null;
    }
    return data[0];
}

/* Standard query functions for SimplePostInfo */

const simplePostInfoSelectObj = {
    id: true,
    content: true,
    createdAt: true,
    userMedia: true,
    postHashtags: {
        select: {
            tagText: true,
        },
    },
    postCryptoTopics: true,
    textualContexts: true,
    suspended: true,
    author: {
        select: {
            username: true,
        },
    },
    repostingPostId: true,
    repostChainIds: true,
    parentPostId: true,
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
        const { postHashtags, postCryptoTopics, author, ...rest } = post;
        return {
            ...rest,
            postHashtags: postHashtags.map((tag) => tag.tagText),
            postCryptoTopics: postCryptoTopics.map((topic) => topic.cryptoId),
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
