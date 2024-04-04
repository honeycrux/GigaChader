import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { stdPostInfo } from "@/lib/objects/post";
import { stdSimpleUserInfo } from "@/lib/objects/user";
import { protectRoute } from "@/middlewares/auth";

const s = initServer();

const postRouter = s.router(apiContract.post, {
    getPost: {
        handler: async ({ params: { postId } }) => {
            const postinfo = await stdPostInfo.sample({ postId });
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
                cursor: from ? { username: from } : undefined,
                skip: from ? 1 : undefined,
                select: stdSimpleUserInfo.select,
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
            const userlist = await Promise.all(
                data.map((d) => {
                    return stdSimpleUserInfo.filter(d);
                })
            );
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
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: stdPostInfo.select,
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
            const postlist = await Promise.all(
                data.map((d) => {
                    return stdPostInfo.filter(d);
                })
            );
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
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: stdPostInfo.select,
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
            const postlist = await Promise.all(
                data.map((d) => {
                    return stdPostInfo.filter(d);
                })
            );
            return {
                status: 200,
                body: postlist,
            };
        },
    },

    getGlobalFeeds: {
        handler: async ({ query: { from, limit } }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: stdPostInfo.select,
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postlist = await Promise.all(
                data.map((d) => {
                    return stdPostInfo.filter(d);
                })
            );
            return {
                status: 200,
                body: postlist,
            };
        },
    },

    postLike: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { postId, set } }) => {
            const data = await prismaClient.post.update({
                data: {
                    likedByUsers: set ? { connect: { id: res.locals.user!.id } } : { disconnect: { id: res.locals.user!.id } },
                },
                select: stdPostInfo.select,
                where: {
                    id: postId,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postinfo = await stdPostInfo.filter(data);
            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    postSave: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { postId, set } }) => {
            const data = await prismaClient.post.update({
                data: {
                    savedByUsers: set ? { connect: { id: res.locals.user!.id } } : { disconnect: { id: res.locals.user!.id } },
                },
                select: stdPostInfo.select,
                where: {
                    id: postId,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postinfo = await stdPostInfo.filter(data);
            return {
                status: 200,
                body: postinfo,
            };
        },
    },
});

export { postRouter };
