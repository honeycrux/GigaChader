import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { getPostInfo } from "@/lib/post/post";
import { prismaClient } from "@/lib/data/db";

const s = initServer();

const postRouter = s.router(apiContract.post, {
    getPost: {
        handler: async ({ params: { postId } }) => {
            const postinfo = await getPostInfo({ postId });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    getLikes: {
        handler: async ({ query: { postId, from, limit } }) => {
            const data = await prismaClient.user.findMany({
                take: limit,
                skip: 1,
                cursor: {
                    username: from,
                },
                select: {
                    // refer: simple user info
                    username: true,
                    userConfig: true,
                },
                orderBy: {
                    username: "asc",
                },
                where: {
                    likedPostIds: {
                        has: postId,
                    },
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const userlist = data.map((d) => {
                const { userConfig, ...rest } = d;
                return {
                    ...rest,
                    displayName: userConfig.displayName,
                    imageUrl: userConfig.imageUrl,
                };
            });
            return {
                status: 200,
                body: userlist,
            };
        },
    },

    getComments: {
        handler: async ({ query: { postId, from, limit } }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                skip: 1,
                cursor: {
                    id: from,
                },
                select: {
                    // refer: post info
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
                orderBy: {
                    createdAt: "desc",
                },
                where: {
                    parentPostId: postId,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postlist = data.map((d) => {
                const { _count, author, ...rest } = d;
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
            });
            return {
                status: 200,
                body: postlist,
            };
        },
    },

    getReposts: {
        handler: async ({ query: { postId, from, limit } }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                skip: 1,
                cursor: {
                    id: from,
                },
                select: {
                    // refer: post info
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
                orderBy: {
                    createdAt: "desc",
                },
                where: {
                    repostingPostId: postId,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postlist = data.map((d) => {
                const { _count, author, ...rest } = d;
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
            });
            return {
                status: 200,
                body: postlist,
            };
        },
    },
});

export { postRouter };
