import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { protectRoute } from "@/middlewares/auth";
import { getPersonalUserInfo, getUserProfile } from "@/lib/user/user";
import { prismaClient } from "@/lib/data/db";

const s = initServer();

const userRouter = s.router(apiContract.user, {
    getInfo: {
        middleware: [protectRoute.user],
        handler: async ({ res }) => {
            const userinfo = await getPersonalUserInfo({ username: res.locals.user!.username });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },
    getProfile: {
        handler: async ({ params: { username } }) => {
            const userinfo = await getUserProfile({ username });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    getFeeds: {
        middleware: [protectRoute.user],
        handler: async ({ query: { from, limit }, res }) => {
            const userdata = await prismaClient.user.findUnique({
                select: {
                    followedUsers: {
                        select: {
                            id: true,
                        },
                    },
                },
                where: {
                    username: res.locals.user!.username,
                },
            });
            if (!userdata) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const listOfFollowedUserIds = userdata.followedUsers.map((d) => {
                return d.id;
            });
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: {
                    id: from,
                },
                orderBy: {
                    createdAt: "desc",
                },
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
                    authorId: {
                        in: listOfFollowedUserIds,
                    },
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

    postFollow: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { username, set } }) => {
            const userdata = await prismaClient.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username: username,
                },
            });
            if (!userdata) {
                return {
                    status: 400,
                    body: {
                        error: `User ${username} not found.`,
                    },
                };
            }
            const data = await prismaClient.user.update({
                data: {
                    followedUserIds: {
                        push: userdata.id,
                    },
                },
                select: {
                    _count: {
                        select: {
                            followedUsers: true,
                        },
                    },
                },
                where: {
                    username: res.locals.user!.username,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: {
                        success: false,
                    },
                };
            }
            return {
                status: 200,
                body: {
                    success: true,
                },
            };
        },
    },

    getPosts: {
        handler: async ({ query: { username, from, limit } }) => {
            const userdata = await prismaClient.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username: username,
                },
            });
            if (!userdata) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: {
                    id: from,
                },
                orderBy: {
                    createdAt: "desc",
                },
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
                    authorId: userdata.id,
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

    getSavedPosts: {
        middleware: [protectRoute.user],
        handler: async ({ res, query: { from, limit } }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: {
                    id: from,
                },
                orderBy: {
                    createdAt: "desc",
                },
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
                    savedByUserIds: {
                        has: res.locals.user!.id,
                    },
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

export { userRouter };
