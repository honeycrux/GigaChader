/**
 * Name: Post Routes
 * Description: Implement TS-REST subrouter for a TS-REST subcontract (Post Contract)
 */

import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { protectRoute, validateUser } from "@/middlewares/auth";
import { postInfoFindManyOrdered, postInfoFindOne } from "@/lib/objects/post";
import { simpleUserInfoFindManyOrdered } from "@/lib/objects/user";
import { searchPost } from "@/lib/helpers/search";
import { analysePostContent } from "@/lib/helpers/textual";
import { createExpirableNotification } from "@/lib/helpers/expirables";

const s = initServer();

export const postRouter = s.router(apiContract.post, {
    getPost: {
        middleware: [validateUser],
        handler: async ({ params: { postId }, res }) => {
            const postinfo = await postInfoFindOne({ postId, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    getLikes: {
        handler: async ({ query: { postId, from, limit } }) => {
            const fromUser = from
                ? await prismaClient.user.findUnique({
                      select: {
                          id: true,
                      },
                      where: {
                          username: from,
                      },
                  })
                : null;
            const data = await prismaClient.postLike.findMany({
                take: limit,
                cursor: fromUser ? { postId_userId: { postId: postId, userId: fromUser.id } } : undefined,
                skip: fromUser ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    user: {
                        select: {
                            username: true,
                        },
                    },
                },
                where: {
                    post: {
                        id: postId,
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
            const userlist = data.map((postlike) => postlike.user.username);
            const userInfo = await simpleUserInfoFindManyOrdered({ username: userlist });
            return {
                status: 200,
                body: userInfo,
            };
        },
    },

    getComments: {
        middleware: [validateUser],
        handler: async ({ query: { postId, from, limit }, res }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                },
                where: {
                    parentPost: {
                        id: postId,
                    },
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

    getReposts: {
        middleware: [validateUser],
        handler: async ({ query: { postId, from, limit }, res }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                },
                where: {
                    repostingPost: {
                        id: postId,
                    },
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

    postSearch: {
        middleware: [validateUser],
        handler: async ({ query: { query, from, limit }, res }) => {
            const result = await searchPost({ query, from, limit, requesterId: res.locals.user!.id });
            return {
                status: 200,
                body: result,
            };
        },
    },

    getGlobalFeeds: {
        middleware: [validateUser],
        handler: async ({ query: { from, limit }, res }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                skip: from ? from : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                },
                where: {
                    suspended: false,
                    author: {
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
            const postlist = data.map((post) => post.id);
            const postinfo = await postInfoFindManyOrdered({ postId: postlist, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    postCreate: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { content, repostingPostId, parentPostId, userMedia } }) => {
            let repostOriginalAuthorId: string | undefined;
            let commentOriginalAuthorId: string | undefined;
            let repostChainIds: string[] = [];

            if (content.trim() === "") {
                return {
                    status: 400,
                    body: { error: `Post has no text content` },
                };
            }

            if (content.length > 1000) {
                return {
                    status: 400,
                    body: { error: `Post exceeded character limit (${content.length}/1000)` },
                };
            }

            if (repostingPostId) {
                const post = await prismaClient.post.findUnique({
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                            },
                        },
                        repostChainIds: true,
                    },
                    where: {
                        id: repostingPostId,
                        suspended: false,
                        author: {
                            suspended: false,
                        },
                    },
                });
                if (!post) {
                    return {
                        status: 400,
                        body: { error: `Reposted post ${repostingPostId} does not exist` },
                    };
                }
                repostOriginalAuthorId = post.author.id;
                repostChainIds = post.repostChainIds;
            }
            if (parentPostId) {
                const post = await prismaClient.post.findUnique({
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                            },
                        },
                    },
                    where: {
                        id: parentPostId,
                        suspended: false,
                        author: {
                            suspended: false,
                        },
                    },
                });
                if (!post) {
                    return {
                        status: 400,
                        body: { error: `Parent post ${parentPostId} does not exist` },
                    };
                }
                commentOriginalAuthorId = post.author.id;
            }

            const { hashtags, cryptoTopics, textualContexts } = await analysePostContent({ content: content });

            const data = await prismaClient.post.create({
                data: {
                    content: content,
                    userMedia: userMedia,
                    author: {
                        connect: { id: res.locals.user!.id },
                    },
                    repostingPost: repostingPostId
                        ? {
                              connect: { id: repostingPostId },
                          }
                        : undefined,
                    repostChainIds: repostingPostId ? [repostingPostId].concat(repostChainIds) : undefined,
                    parentPost: parentPostId
                        ? {
                              connect: { id: parentPostId },
                          }
                        : undefined,
                    textualContexts: textualContexts,
                    postHashtags:
                        hashtags.length > 0
                            ? {
                                  create: hashtags.map((tag) => {
                                      return { tagText: tag };
                                  }),
                              }
                            : undefined,
                    postCryptoTopics:
                        cryptoTopics.length > 0
                            ? {
                                  create: cryptoTopics.map((topic) => {
                                      return { cryptoId: topic };
                                  }),
                              }
                            : undefined,
                },
                select: {
                    id: true,
                },
            });
            if (!data) {
                return {
                    status: 400,
                    body: { error: "Failed to create user" },
                };
            }
            const postinfo = await postInfoFindOne({ postId: data.id, requesterId: res.locals.user?.id });

            // Delete uploaded media from stash
            if (userMedia) {
                const uploadedMediaUrls = userMedia.map((media) => media.url);
                await prismaClient.mediaStash.deleteMany({
                    where: {
                        url: { in: uploadedMediaUrls },
                    },
                });
            }

            // Handle push noitifications
            if (repostingPostId && repostOriginalAuthorId && res.locals.user!.id !== repostOriginalAuthorId) {
                await createExpirableNotification({
                    content: `@${res.locals.user!.username} reposted your post.`,
                    link: `/post/${data.id}`,
                    receiverId: repostOriginalAuthorId,
                });
            }
            if (parentPostId && commentOriginalAuthorId && res.locals.user!.id !== commentOriginalAuthorId) {
                await createExpirableNotification({
                    content: `@${res.locals.user!.username} added a comment to your post.`,
                    link: `/post/${data.id}`,
                    receiverId: commentOriginalAuthorId,
                });
            }

            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    postLike: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { postId, set } }) => {
            const postdata = await prismaClient.post.findUnique({
                select: {
                    id: true,
                    author: {
                        select: {
                            id: true,
                        },
                    },
                },
                where: {
                    id: postId,
                    suspended: false,
                    author: {
                        suspended: false,
                    },
                },
            });
            if (!postdata) {
                return {
                    status: 400,
                    body: { error: `Post ${postId} does not exist` },
                };
            }
            const originalPostAuthorId = postdata.author.id;
            const data = await prismaClient.post.update({
                data: {
                    postLikes: set
                        ? {
                              connectOrCreate: {
                                  where: {
                                      postId_userId: {
                                          postId: postId,
                                          userId: res.locals.user!.id,
                                      },
                                  },
                                  create: {
                                      user: {
                                          connect: {
                                              id: res.locals.user!.id,
                                          },
                                      },
                                  },
                              },
                          }
                        : {
                              delete: {
                                  postId_userId: {
                                      postId: postId,
                                      userId: res.locals.user!.id,
                                  },
                              },
                          },
                },
                select: {
                    id: true,
                },
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
            const postinfo = await postInfoFindOne({ postId: data.id, requesterId: res.locals.user?.id });

            // Handle push notification
            if (set && res.locals.user!.id !== originalPostAuthorId) {
                await createExpirableNotification({
                    content: `@${res.locals.user!.username} liked your post.`,
                    link: `/post/${data.id}`,
                    receiverId: originalPostAuthorId,
                });
            }

            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    postSave: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { postId, set } }) => {
            const postdata = await prismaClient.post.findUnique({
                select: {
                    id: true,
                },
                where: {
                    id: postId,
                    suspended: false,
                    author: {
                        suspended: false,
                    },
                },
            });
            if (!postdata) {
                return {
                    status: 400,
                    body: { error: `Post ${postId} does not exist` },
                };
            }
            const data = await prismaClient.post.update({
                data: {
                    postSaves: set
                        ? {
                              connectOrCreate: {
                                  where: {
                                      postId_userId: {
                                          postId: postId,
                                          userId: res.locals.user!.id,
                                      },
                                  },
                                  create: {
                                      user: {
                                          connect: {
                                              id: res.locals.user!.id,
                                          },
                                      },
                                  },
                              },
                          }
                        : {
                              delete: {
                                  postId_userId: {
                                      postId: postId,
                                      userId: res.locals.user!.id,
                                  },
                              },
                          },
                },
                select: {
                    id: true,
                },
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
            const postinfo = await postInfoFindOne({ postId: data.id, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },
});
