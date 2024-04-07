import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { protectRoute, validateUser } from "@/middlewares/auth";
import { prismaClient } from "@/lib/data/db";
import { ProfileUploadFiles, profileUploadMiddleware } from "@/middlewares/mediaUpload";
import { Prisma } from "@prisma/client";
import { compressAndUploadMedia, deleteMedia } from "@/lib/data/mediaHandler";
import { personalUserInfoFindOne, simpleUserInfoFindManyOrdered, userProfileFindOne } from "@/lib/objects/user";
import { postInfoFindManyOrdered } from "@/lib/objects/post";

const s = initServer();

const userRouter = s.router(apiContract.user, {
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
        handler: async ({ query: { username, from, limit }, res }) => {
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
                    authorId: userdata.id,
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
                    userId: res.locals.user!.id,
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
            const data = await prismaClient.user.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                select: {
                    username: true,
                },
                where: {
                    OR: [{ username: { contains: query } }],
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

    userConfig: {
        middleware: [protectRoute.user, profileUploadMiddleware],
        handler: async ({ req, res, body: { username, displayName, bio, deleteAvatar, deleteBanner, cryptoBookmarks, cryptoHoldings } }) => {
            const changeObject: Prisma.UserUpdateInput = {};
            if (username) {
                const existing = await prismaClient.user.findUnique({
                    select: {
                        id: true,
                    },
                    where: {
                        username: username,
                    },
                });
                if (existing) {
                    return {
                        status: 400,
                        body: { error: `Username ${username} was taken` },
                    };
                }
                changeObject.username = username;
                changeObject.accountInfoLastUpdated = new Date();
            }

            // handle changes to userConfig
            let avatarFile: Express.Multer.File | undefined;
            let bannerFile: Express.Multer.File | undefined;
            const files = req.files as ProfileUploadFiles;
            if (files) {
                if (files.avatar) {
                    avatarFile = files.avatar[0];
                }
                if (files.banner) {
                    bannerFile = files.banner[0];
                }
            }
            if (displayName || bio || deleteAvatar || deleteBanner || avatarFile || bannerFile) {
                let newImageUrl: string | undefined;
                let newBannerUrl: string | undefined;

                if (avatarFile) {
                    const data = await prismaClient.user.findUnique({
                        select: {
                            userConfig: {
                                select: { imageUrl: true },
                            },
                        },
                        where: {
                            id: res.locals.user!.id,
                        },
                    });
                    if (data?.userConfig.imageUrl) {
                        // Delete image from storage
                        const res = await deleteMedia({ url: data.userConfig.imageUrl });
                        if (!res) {
                            return {
                                status: 400,
                                body: { error: "Something went wrong when changing avatar" },
                            };
                        }
                        // Upload media
                        const res2 = await compressAndUploadMedia({
                            maxPixelSize: 550,
                            container: "avatar",
                            file: avatarFile,
                            type: "image",
                        });
                        newImageUrl = res2.url;
                    }
                }
                if (bannerFile) {
                    const data = await prismaClient.user.findUnique({
                        select: {
                            userConfig: {
                                select: { bannerUrl: true },
                            },
                        },
                        where: {
                            id: res.locals.user!.id,
                        },
                    });
                    if (data?.userConfig.bannerUrl) {
                        // Delete image from storage
                        const res = await deleteMedia({ url: data.userConfig.bannerUrl });
                        if (!res) {
                            return {
                                status: 400,
                                body: { error: "Something went wrong when changing banner" },
                            };
                        }
                        // Upload media
                        const res2 = await compressAndUploadMedia({
                            maxPixelSize: 1080,
                            container: "avatar",
                            file: bannerFile,
                            type: "image",
                        });
                        newBannerUrl = res2.url;
                    }
                }

                changeObject.userConfig = {
                    displayName: displayName,
                    imageUrl: newImageUrl ? newImageUrl : deleteAvatar ? null : undefined,
                    bannerUrl: newBannerUrl ? newBannerUrl : deleteBanner ? null : undefined,
                    bio: bio,
                    lastUpdated: new Date(),
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
                    cryptoBookmarks: cryptoBookmarks,
                    cryptoHoldings: cryptoHoldings,
                    lastUpdated: new Date(),
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
            return {
                status: 200,
                body: {
                    success: true,
                },
            };
        },
    },
});

export { userRouter };
