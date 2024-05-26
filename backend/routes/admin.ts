/**
 * Name: Admin Routes
 * Description: Implement TS-REST subrouter for a TS-REST subcontract (Admin Contract)
 */

import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { lucia } from "@/lib/helpers/auth";
import { createExpirableMediaStash } from "@/lib/helpers/expirables";
import { searchPost, searchUser } from "@/lib/helpers/search";
import { analysePostContent } from "@/lib/helpers/textual";
import { simplePostInfoFindOne } from "@/lib/objects/post";
import { protectRoute } from "@/middlewares/auth";
import { Prisma } from "@prisma/client";
import { initServer } from "@ts-rest/express";

const s = initServer();

function arrayEqual(array1: Array<any>, array2: Array<any>) {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
}

export const adminRouter = s.router(apiContract.admin, {
    suspendUser: {
        middleware: [protectRoute.admin],
        handler: async ({ res, body: { username, set } }) => {
            const checkuser = await prismaClient.user.findUnique({
                select: {
                    suspended: true,
                },
                where: {
                    username: username,
                },
            });
            if (!checkuser) {
                return {
                    status: 400,
                    body: { error: `User ${username} does not exist` },
                };
            }
            if (set !== checkuser.suspended) {
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
            const checkpost = await prismaClient.post.findUnique({
                select: {
                    suspended: true,
                },
                where: {
                    id: postId,
                },
            });
            if (!checkpost) {
                return {
                    status: 400,
                    body: { error: `Post with id ${postId} does not exist` },
                };
            }
            if (set !== checkpost.suspended) {
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

    opModifyPost: {
        middleware: [protectRoute.admin],
        handler: async ({ res, body: { postId, content, repostingPostId, parentPostId, removeRepostingPost, removeParentPost, userMedia } }) => {
            const changeObject: Prisma.PostUpdateInput = {};
            const modificationHistoryObject: Record<string, { from: any; to: any }> = {};
            const oldPostData = await simplePostInfoFindOne({ postId: postId });
            if (!oldPostData) {
                return {
                    status: 400,
                    body: "Post does not exist",
                };
            }

            const contentChanged = content !== undefined && content !== oldPostData.content;
            let hashtags: string[] = [];
            let cryptoTopics: string[] = [];
            if (contentChanged) {
                const analysis = await analysePostContent({ content: content });
                const { textualContexts } = analysis;
                ({ hashtags, cryptoTopics } = analysis);
                if (content !== oldPostData.content) {
                    changeObject.content = { set: content };
                    changeObject.textualContexts = { set: textualContexts };
                    modificationHistoryObject.content = { from: oldPostData.content, to: content };
                }
            }

            if (userMedia !== undefined) {
                // Received an array. If old data is not an array, or if the new array is not the same as the old, update the array.
                if (!Array.isArray(oldPostData.userMedia) || !arrayEqual(userMedia, oldPostData.userMedia)) {
                    changeObject.userMedia = [];
                    modificationHistoryObject.userMedia = { from: oldPostData.userMedia, to: userMedia };
                    // add unused old media to media stash so that they will be deleted
                    const unusedMediaList = oldPostData.userMedia.filter((media) => !userMedia.find((newMedia) => newMedia.url === media.url));
                    createExpirableMediaStash({ urls: unusedMediaList.map((media) => media.url) });
                }
            }

            if (removeRepostingPost && oldPostData.repostingPostId !== null) {
                changeObject.repostingPost = {
                    disconnect: true,
                };
                modificationHistoryObject.repostingPostId = { from: oldPostData.repostingPostId, to: null };
            } else if (repostingPostId && repostingPostId !== oldPostData.repostingPostId) {
                changeObject.repostingPost = {
                    connect: {
                        id: repostingPostId,
                    },
                };
                modificationHistoryObject.repostingPostId = { from: oldPostData.repostingPostId, to: repostingPostId };
            }

            if (removeParentPost && oldPostData.parentPostId !== null) {
                changeObject.parentPost = {
                    disconnect: true,
                };
                modificationHistoryObject.parentPostId = { from: oldPostData.parentPostId, to: null };
            } else if (parentPostId && parentPostId !== oldPostData.parentPostId) {
                changeObject.parentPost = {
                    connect: {
                        id: parentPostId,
                    },
                };
                modificationHistoryObject.parentPostId = { from: oldPostData.parentPostId, to: parentPostId };
            }

            const hasModification = Object.keys(modificationHistoryObject).length > 0;
            if (hasModification) {
                // update the post
                const data = await prismaClient.post.update({
                    data: changeObject,
                    where: {
                        id: postId,
                    },
                    select: {
                        id: true,
                    },
                });
                if (!data) {
                    return {
                        status: 400,
                        body: "Failed to update post",
                    };
                }

                // update the post hashtags and topics if any
                if (contentChanged) {
                    await prismaClient.$transaction([
                        prismaClient.postHashtag.deleteMany({
                            where: {
                                postId: postId,
                            },
                        }),
                        prismaClient.postCryptoTopic.deleteMany({
                            where: {
                                postId: postId,
                            },
                        }),
                    ]);
                    if (hashtags.length > 0) {
                        await prismaClient.postHashtag.createMany({
                            data: hashtags.map((tag) => ({ postId: postId, tagText: tag })),
                        });
                    }
                    if (cryptoTopics.length > 0) {
                        await prismaClient.postCryptoTopic.createMany({
                            data: cryptoTopics.map((cryptoId) => ({ postId: postId, cryptoId: cryptoId })),
                        });
                    }
                }

                // update
                await prismaClient.moderationRecord.create({
                    data: {
                        comment: "",
                        descriptor: "MODIFY_POST",
                        details: [{ post: modificationHistoryObject }],
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

            const postData = await simplePostInfoFindOne({ postId: postId });
            return {
                status: 200,
                body: postData,
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
