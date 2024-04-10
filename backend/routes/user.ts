import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { protectRoute, validateUser } from "@/middlewares/auth";
import { prismaClient } from "@/lib/data/db";
import { Prisma } from "@prisma/client";
import { deleteMedia } from "@/lib/data/mediaHandler";
import { personalUserInfoFindOne, simpleUserInfoFindManyOrdered, userProfileFindOne } from "@/lib/objects/user";
import { postInfoFindManyOrdered } from "@/lib/objects/post";
import { searchUser } from "@/lib/helpers/search";

const s = initServer();

export const userRouter = s.router(apiContract.user, {
    getInfo: {
        middleware: [protectRoute.user],
        handler: async ({ res }) => {
            const userinfo = await personalUserInfoFindOne({ username: res.locals.user!.username });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    getProfile: {
        middleware: [validateUser],
        handler: async ({ params: { username }, res }) => {
            const userinfo = await userProfileFindOne({ username, requesterId: res.locals.user?.id });
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
                            targetId: true,
                        },
                        where: {
                            target: {
                                suspended: false,
                            },
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
                return d.targetId;
            });

            listOfFollowedUserIds.push(res.locals.user!.id);

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
                    author: {
                        id: {
                            in: listOfFollowedUserIds,
                        },
                        suspended: false,
                    },
                    suspended: false,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postlist = data.map((post) => post.id);
            const postInfo = await postInfoFindManyOrdered({ postId: postlist, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: postInfo,
            };
        },
    },

    getFollows: {
        handler: async ({ query: { username, from, limit } }) => {
            const userdata = await prismaClient.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username: username,
                },
            });
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
            if (!userdata) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const data = await prismaClient.userFollow.findMany({
                take: limit,
                cursor: fromUser ? { initiatorId_targetId: { initiatorId: fromUser.id, targetId: userdata.id } } : undefined,
                skip: fromUser ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    initiator: {
                        select: {
                            username: true,
                        },
                    },
                },
                where: {
                    targetId: userdata.id,
                    initiator: {
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
            const userlist = data.map((userFollow) => userFollow.initiator.username);
            const userinfo = await simpleUserInfoFindManyOrdered({ username: userlist });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    getFollowedUsers: {
        handler: async ({ query: { username, from, limit } }) => {
            const userdata = await prismaClient.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username: username,
                },
            });
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
            if (!userdata) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const data = await prismaClient.userFollow.findMany({
                take: limit,
                cursor: fromUser ? { initiatorId_targetId: { initiatorId: userdata.id, targetId: fromUser.id } } : undefined,
                skip: fromUser ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    target: {
                        select: {
                            username: true,
                        },
                    },
                },
                where: {
                    initiatorId: userdata.id,
                    target: {
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
            const userlist = data.map((userFollow) => userFollow.target.username);
            const userinfo = await simpleUserInfoFindManyOrdered({ username: userlist });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    getPosts: {
        middleware: [validateUser],
        handler: async ({ query: { username, from, limit, filter }, res }) => {
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
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                },
                where: {
                    author: {
                        id: userdata.id,
                        suspended: false,
                    },
                    suspended: false,
                    OR:
                        filter === "post"
                            ? [{ parentPostId: { isSet: false } }, { parentPostId: null }]
                            : filter === "reply"
                            ? [{ parentPostId: { not: null } }]
                            : undefined,
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

    getSavedPosts: {
        middleware: [protectRoute.user],
        handler: async ({ res, query: { from, limit } }) => {
            const data = await prismaClient.postSave.findMany({
                take: limit,
                cursor: from ? { postId_userId: { postId: from, userId: res.locals.user!.id } } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    post: {
                        select: {
                            id: true,
                        },
                    },
                },
                where: {
                    user: {
                        id: res.locals.user!.id,
                    },
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const postlist = data.map((postSave) => postSave.post.id);
            const postinfo = await postInfoFindManyOrdered({ postId: postlist, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: postinfo,
            };
        },
    },

    userSearch: {
        handler: async ({ query: { query, from, limit } }) => {
            const result = await searchUser({ query, from, limit });
            return {
                status: 200,
                body: result,
            };
        },
    },

    getNotifications: {
        middleware: [protectRoute.user],
        handler: async ({ query: { from, limit, mode }, res }) => {
            const notifdata = await prismaClient.notification.findMany({
                take: mode === "read" ? limit : undefined,
                cursor: mode === "read" && from ? { id: from } : undefined,
                skip: mode === "read" && from ? 1 : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                where: {
                    unread: mode === "unread" ? true : false,
                    receiver: {
                        id: res.locals.user!.id,
                    },
                },
            });
            if (!notifdata) {
                return {
                    status: 200,
                    body: null,
                };
            }

            return {
                status: 200,
                body: notifdata.map(({ content, link, unread, createdAt }) => {
                    return { content, link, unread, createdAt };
                }),
            };
        },
    },

    readNotifications: {
        middleware: [protectRoute.user],
        handler: async ({ res }) => {
            // mark all unread posts as read
            const data = await prismaClient.notification.updateMany({
                data: {
                    unread: false,
                },
                where: {
                    receiver: {
                        id: res.locals.user!.id,
                    },
                    unread: true,
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: { success: false },
                };
            }
            return {
                status: 200,
                body: { success: true },
            };
        },
    },

    userConfig: {
        middleware: [protectRoute.user],
        handler: async ({
            res,
            body: { displayName, bio, onBoardingCompleted, deleteAvatar, deleteBanner, avatarUrl, bannerUrl, cryptoBookmarks, cryptoHoldings },
        }) => {
            const changeObject: Prisma.UserUpdateInput = {
                onBoardingCompleted: onBoardingCompleted,
            };

            // handle old avatar/banner deletion
            if (avatarUrl || deleteAvatar || bannerUrl || deleteBanner) {
                const userdata = await prismaClient.user.findUnique({
                    select: {
                        userConfig: {
                            select: {
                                avatarUrl: true,
                                bannerUrl: true,
                            },
                        },
                    },
                    where: {
                        id: res.locals.user!.id,
                    },
                });
                if (userdata) {
                    if (userdata.userConfig.avatarUrl && (avatarUrl || deleteAvatar)) {
                        // asynchronously delete old avatar
                        deleteMedia({ url: userdata.userConfig.avatarUrl });
                    }
                    if (userdata.userConfig.bannerUrl && (bannerUrl || deleteBanner)) {
                        // asynchronously delete old banner
                        deleteMedia({ url: userdata.userConfig.bannerUrl });
                    }
                }
            }

            // handle changes to userConfig
            if (displayName || bio || deleteAvatar || deleteBanner || avatarUrl || bannerUrl) {
                changeObject.userConfig = {
                    update: {
                        displayName: displayName,
                        avatarUrl: avatarUrl ? avatarUrl : deleteAvatar ? null : undefined,
                        bannerUrl: bannerUrl ? bannerUrl : deleteBanner ? null : undefined,
                        bio: bio,
                        lastUpdated: new Date(),
                    },
                };
            }

            // handle changes to userCryptoInfo
            if (cryptoBookmarks || cryptoHoldings) {
                // check uniqueness of crypto in bookmarks and holdings
                if (cryptoBookmarks && cryptoBookmarks.length !== cryptoBookmarks.filter((v, i) => cryptoBookmarks.indexOf(v) === i).length) {
                    return {
                        status: 400,
                        body: { error: "All cryptoBookmarks must be unique" },
                    };
                }
                if (cryptoHoldings) {
                    const cryptolist = cryptoHoldings.map((v) => v.cryptoId);
                    if (cryptolist.length !== cryptolist.filter((v, i) => cryptolist.indexOf(v) === i).length) {
                        return {
                            status: 400,
                            body: { error: "All cryptoId must be unique in cryptoHoldings" },
                        };
                    }
                }

                changeObject.userCryptoInfo = {
                    update: {
                        cryptoBookmarks: cryptoBookmarks,
                        cryptoHoldings: cryptoHoldings,
                        lastUpdated: new Date(),
                    },
                };
            }

            // commit changes
            const data = await prismaClient.user.update({
                data: changeObject,
                select: {
                    username: true,
                },
                where: {
                    id: res.locals.user!.id,
                },
            });
            if (!data) {
                return {
                    status: 400,
                    body: { error: "Failed to push changes to user config" },
                };
            }
            const userinfo = await userProfileFindOne({ username: data.username, requesterId: res.locals.user?.id });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },

    userFollow: {
        middleware: [protectRoute.user],
        handler: async ({ res, body: { username, set } }) => {
            const userdata = await prismaClient.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username: username,
                    suspended: false,
                },
            });
            if (!userdata) {
                return {
                    status: 400,
                    body: {
                        error: `User ${username} not found`,
                    },
                };
            }
            if (res.locals.user!.username === username) {
                return {
                    status: 400,
                    body: {
                        error: `User ${username} cannot follow themselves`,
                    },
                };
            }
            const data = await prismaClient.user.update({
                data: {
                    followedUsers: set
                        ? {
                              connectOrCreate: {
                                  where: {
                                      initiatorId_targetId: {
                                          initiatorId: res.locals.user!.id,
                                          targetId: userdata.id,
                                      },
                                  },
                                  create: {
                                      target: {
                                          connect: { username: username },
                                      },
                                  },
                              },
                          }
                        : {
                              delete: {
                                  initiatorId_targetId: {
                                      initiatorId: res.locals.user!.id,
                                      targetId: userdata.id,
                                  },
                              },
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

            // Handle push notification
            if (set) {
                await prismaClient.notification.create({
                    data: {
                        content: `@${res.locals.user!.username} started to follow you.`,
                        link: `/profile/${res.locals.user!.username}`,
                        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month after creation
                        receiver: {
                            connect: {
                                id: userdata.id,
                            },
                        },
                    },
                });
            }

            return {
                status: 200,
                body: {
                    success: true,
                },
            };
        },
    },
});
