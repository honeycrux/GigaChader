/**
 * Name: Trends Routes
 * Description: Implement TS-REST subrouter for a TS-REST subcontract (Trends Contract)
 */

import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { cryptoInfoFindManyAsRecord } from "@/lib/objects/crypto";
import { postInfoFindManyOrdered } from "@/lib/objects/post";
import { validateUser } from "@/middlewares/auth";
import { initServer } from "@ts-rest/express";

const s = initServer();

function getMostFarBackDate() {
    const mostFarBackDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // get 7 days ago
    return mostFarBackDate;
}

export const trendsRouter = s.router(apiContract.trends, {
    trendingPosts: {
        middleware: [validateUser],
        handler: async ({ query: { from, limit }, res }) => {
            const mostFarBackDate = getMostFarBackDate();
            let data = await prismaClient.postLike.groupBy({
                by: ["postId"],
                _count: {
                    postId: true,
                },
                orderBy: [
                    {
                        _count: {
                            postId: "desc",
                        },
                    },
                ],
                where: {
                    post: {
                        suspended: false,
                        author: { suspended: false },
                        createdAt: { gte: mostFarBackDate },
                    },
                    user: {
                        suspended: false,
                    },
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            if (from) {
                const index = data.findIndex((value) => value.postId === from);
                if (index !== -1) {
                    data = data.toSpliced(0, index + 1);
                }
            }
            if (limit) {
                data = data.toSpliced(limit);
            }
            const postlist = data.map((post) => post.postId);
            const postinfo = await postInfoFindManyOrdered({ postId: postlist, requesterId: res.locals.user?.id });
            const likeCountsRecord: Record<string, number> = {};
            for (const post of data) {
                likeCountsRecord[post.postId] = post._count.postId;
            }
            postinfo.sort((post1, post2) => {
                if (likeCountsRecord[post1.id] > likeCountsRecord[post2.id]) {
                    return -1;
                }
                if (likeCountsRecord[post1.id] < likeCountsRecord[post2.id]) {
                    return 1;
                }
                return post1.createdAt > post2.createdAt ? -1 : post1.createdAt < post2.createdAt ? 1 : 0;
            });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    trendingHashtags: {
        middleware: [validateUser],
        handler: async ({ query: { from, limit } }) => {
            const mostFarBackDate = getMostFarBackDate();
            let data = await prismaClient.postHashtag.groupBy({
                by: ["tagText"],
                _count: {
                    tagText: true,
                },
                orderBy: [
                    {
                        _count: {
                            tagText: "desc",
                        },
                    },
                    {
                        tagText: "asc",
                    },
                ],
                where: {
                    post: {
                        suspended: false,
                        author: { suspended: false },
                    },
                    createdAt: { gte: mostFarBackDate },
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            if (from) {
                const index = data.findIndex((value) => value.tagText === from);
                if (index !== -1) {
                    data = data.toSpliced(0, index + 1);
                }
            }
            if (limit) {
                data = data.toSpliced(limit);
            }
            const trendingHashtags = data.map((hashtag) => {
                return {
                    tagText: hashtag.tagText,
                    postCount: hashtag._count.tagText,
                };
            });
            return {
                status: 200,
                body: trendingHashtags,
            };
        },
    },

    trendingTopics: {
        middleware: [validateUser],
        handler: async ({ query: { from, limit } }) => {
            const mostFarBackDate = getMostFarBackDate();
            let data = await prismaClient.postCryptoTopic.groupBy({
                by: ["cryptoId"],
                _count: {
                    cryptoId: true,
                },
                orderBy: [
                    {
                        _count: {
                            cryptoId: "desc",
                        },
                    },
                    {
                        cryptoId: "asc",
                    },
                ],
                where: {
                    post: {
                        suspended: false,
                        author: { suspended: false },
                    },
                    createdAt: { gte: mostFarBackDate },
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            if (from) {
                const index = data.findIndex((value) => value.cryptoId === from);
                if (index !== -1) {
                    data = data.toSpliced(0, index + 1);
                }
            }
            if (limit) {
                data = data.toSpliced(limit);
            }
            const cryptoInfo = await cryptoInfoFindManyAsRecord({ cryptoId: data.map((crypto) => crypto.cryptoId) });
            const trendingCrypto = data
                .filter((crypto) => {
                    // ensure we have crypto info
                    return !!cryptoInfo[crypto.cryptoId];
                })
                .map((crypto) => {
                    return {
                        cryptoInfo: cryptoInfo[crypto.cryptoId],
                        postCount: crypto._count.cryptoId,
                    };
                });
            return {
                status: 200,
                body: trendingCrypto,
            };
        },
    },
});
