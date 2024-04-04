import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { protectRoute } from "@/middlewares/auth";
import { stdPersonalUserInfo, stdUserProfile } from "@/lib/objects/user";
import { prismaClient } from "@/lib/data/db";
import { stdPostInfo } from "@/lib/objects/post";

const s = initServer();

const userRouter = s.router(apiContract.user, {
    getInfo: {
        middleware: [protectRoute.user],
        handler: async ({ res }) => {
            const userinfo = await stdPersonalUserInfo.sample({ username: res.locals.user!.username });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    getProfile: {
        handler: async ({ params: { username } }) => {
            const userinfo = await stdUserProfile.sample({ username });
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
                cursor: from ? { id: from } : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: stdPostInfo.select,
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
                return stdPostInfo.filter(d);
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
                    followedUsers: set ? { connect: [{ username }] } : { disconnect: [{ username }] },
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
                cursor: from ? { id: from } : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: stdPostInfo.select,
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
                return stdPostInfo.filter(d);
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
                cursor: from ? { id: from } : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: stdPostInfo.select,
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
                return stdPostInfo.filter(d);
            });
            return {
                status: 200,
                body: postlist,
            };
        },
    },
});

export { userRouter };
