import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { stdPostInfo } from "@/lib/objects/post";
import { stdSimpleUserInfo } from "@/lib/objects/user";

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
                skip: 1,
                cursor: from ? { username: from } : undefined,
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
            const userlist = data.map((d) => {
                return stdSimpleUserInfo.filter(d);
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
                cursor: from ? { id: from } : undefined,
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
            const postlist = data.map((d) => {
                return stdPostInfo.filter(d);
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
                cursor: from ? { id: from } : undefined,
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

export { postRouter };
