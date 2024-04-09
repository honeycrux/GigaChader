import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { postInfoFindManyOrdered } from "@/lib/objects/post";
import { simpleUserInfoFindManyOrdered } from "@/lib/objects/user";
import { protectRoute } from "@/middlewares/auth";
import { initServer } from "@ts-rest/express";

const s = initServer();

export const adminRouter = s.router(apiContract.admin, {
    suspendUser: {
        middleware: [protectRoute.admin],
        handler: async ({ body: { username, set } }) => {
            const prerequest = await prismaClient.user.findUnique({
                select: {
                    suspended: true,
                },
                where: {
                    username: username,
                },
            });
            if (!prerequest) {
                return {
                    status: 400,
                    body: { error: `User ${username} does not exist` },
                };
            }
            if (set !== prerequest.suspended) {
                const data = await prismaClient.user.update({
                    select: {
                        suspended: true,
                    },
                    where: {
                        username: username,
                    },
                    data: {
                        suspended: set,
                    },
                });
                if (!data) {
                    return {
                        status: 200,
                        body: { success: false },
                    };
                }
            }
            return {
                status: 200,
                body: { success: true },
            };
        },
    },

    suspendPost: {
        middleware: [protectRoute.admin],
        handler: async ({ body: { postId, set } }) => {
            const prerequest = await prismaClient.post.findUnique({
                select: {
                    suspended: true,
                },
                where: {
                    id: postId,
                },
            });
            if (!prerequest) {
                return {
                    status: 400,
                    body: { error: `Post with id ${postId} does not exist` },
                };
            }
            if (set !== prerequest.suspended) {
                const data = await prismaClient.post.update({
                    select: {
                        suspended: true,
                    },
                    where: {
                        id: postId,
                    },
                    data: {
                        suspended: set,
                    },
                });
                if (!data) {
                    return {
                        status: 200,
                        body: { success: false },
                    };
                }
            }
            return {
                status: 200,
                body: { success: true },
            };
        },
    },

    opListUsers: {
        middleware: [protectRoute.admin],
        handler: async ({ query: { from, limit } }) => {
            const data = await prismaClient.user.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                select: {
                    username: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const userlist = data.map((user) => user.username);
            const userinfo = await simpleUserInfoFindManyOrdered({ username: userlist });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    opListPosts: {
        middleware: [protectRoute.admin],
        handler: async ({ query: { from, limit }, res }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                select: {
                    id: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postlist = data.map((post) => post.id);
            const postinfo = await postInfoFindManyOrdered({ postId: postlist, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },
});
