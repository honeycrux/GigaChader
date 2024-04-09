import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { lucia } from "@/lib/helpers/auth";
import { searchPost, searchUser } from "@/lib/helpers/search";
import { postInfoFindManyOrdered } from "@/lib/objects/post";
import { simpleUserInfoFindManyOrdered } from "@/lib/objects/user";
import { protectRoute } from "@/middlewares/auth";
import { initServer } from "@ts-rest/express";

const s = initServer();

export const adminRouter = s.router(apiContract.admin, {
    suspendUser: {
        middleware: [protectRoute.admin],
        handler: async ({ res, body: { username, set } }) => {
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
                        id: true,
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
                if (set) {
                    await lucia.invalidateUserSessions(data.id);
                }
                await prismaClient.moderationRecord.create({
                    data: {
                        comment: "",
                        descriptor: "SUSPEND_USER",
                        details: [{ user: { suspended: { from: !set, to: set } } }],
                        initiator: {
                            connect: {
                                id: res.locals.user!.id,
                            },
                        },
                        targetType: ["USER"],
                        targetUser: {
                            connect: {
                                username: username,
                            },
                        },
                    },
                });
            }
            return {
                status: 200,
                body: { success: true },
            };
        },
    },

    suspendPost: {
        middleware: [protectRoute.admin],
        handler: async ({ res, body: { postId, set } }) => {
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
                await prismaClient.moderationRecord.create({
                    data: {
                        comment: "",
                        descriptor: "SUSPEND_POST",
                        details: [{ post: { suspended: { from: !set, to: set } } }],
                        initiator: {
                            connect: {
                                id: res.locals.user!.id,
                            },
                        },
                        targetType: ["POST"],
                        targetPost: {
                            connect: {
                                id: postId,
                            },
                        },
                    },
                });
            }
            return {
                status: 200,
                body: { success: true },
            };
        },
    },

    opListUsers: {
        middleware: [protectRoute.admin],
        handler: async ({ query: { query, from, limit } }) => {
            const result = await searchUser({ query, from, limit, previliged: true });
            return {
                status: 200,
                body: result,
            };
        },
    },

    opListPosts: {
        middleware: [protectRoute.admin],
        handler: async ({ query: { query, from, limit }, res }) => {
            const result = await searchPost({ query, from, limit, previliged: true, requesterId: res.locals.user!.id });
            return {
                status: 200,
                body: result,
            };
        },
    },
});
