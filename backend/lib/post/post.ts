// The endpoints created on this page creates each response schema related to: Post
// They serve both as reusable query points and samples to use in your own queries.

import { PostInfo, SimplePostInfo } from "#/shared/models/post";
import { prismaClient } from "../data/db";

export async function getPostInfo(props: { postId: string }): Promise<PostInfo | null> {
    const data = await prismaClient.post.findUnique({
        select: {
            id: true,
            content: true,
            createdAt: true,
            userMedia: true,
            author: {
                select: {
                    // refer: simple user info
                    username: true,
                    userConfig: true,
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
        },
        where: {
            id: props.postId,
        },
    });
    if (!data) {
        return null;
    }
    const { _count, author, ...rest } = data;
    return {
        ...rest,
        author: {
            username: author.username,
            displayName: author.userConfig.displayName,
            imageUrl: author.userConfig.imageUrl,
        },
        likeCount: _count.likedByUsers,
        repostCount: _count.repostedOnPosts,
        commentCount: _count.childPosts,
        saveCount: _count.savedByUsers,
    };
}

export async function getSimplePostInfo(props: { postId: string }): Promise<SimplePostInfo | null> {
    const data = await prismaClient.post.findUnique({
        select: {
            id: true,
            author: {
                select: {
                    // refer: simple user info
                    username: true,
                    userConfig: true,
                },
            },
        },
        where: {
            id: props.postId,
        },
    });
    if (!data) {
        return null;
    }
    const { author, ...rest } = data;
    return {
        ...rest,
        author: {
            username: author.username,
            displayName: author.userConfig.displayName,
            imageUrl: author.userConfig.imageUrl,
        },
    };
}
