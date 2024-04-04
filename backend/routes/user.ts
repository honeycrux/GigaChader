import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { protectRoute } from "@/middlewares/auth";
import { stdPersonalUserInfo, stdSimpleUserInfo, stdUserProfile } from "@/lib/objects/user";
import { prismaClient } from "@/lib/data/db";
import { stdPostInfo } from "@/lib/objects/post";
import { ProfileUploadFiles, profileUploadMiddleware } from "@/middlewares/mediaUpload";
import { Prisma } from "@prisma/client";
import { compressAndUploadMedia, deleteMedia } from "@/lib/data/mediaHandler";

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
                skip: from ? 1 : undefined,
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
            if (!userdata) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const data = await prismaClient.user.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    username: "asc",
                },
                select: stdSimpleUserInfo.select,
                where: {
                    followers: {
                        some: {
                            id: userdata.id,
                        },
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
            if (!userdata) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const data = await prismaClient.user.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    username: "asc",
                },
                select: stdSimpleUserInfo.select,
                where: {
                    followedUsers: {
                        some: {
                            id: userdata.id,
                        },
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
                skip: from ? 1 : undefined,
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

    getSavedPosts: {
        middleware: [protectRoute.user],
        handler: async ({ res, query: { from, limit } }) => {
            const data = await prismaClient.post.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
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

    userSearch: {
        handler: async ({ query: { query, from, limit } }) => {
            const data = await prismaClient.user.findMany({
                take: limit,
                cursor: from ? { id: from } : undefined,
                skip: from ? 1 : undefined,
                select: stdSimpleUserInfo.select,
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
            const files = req.files as ProfileUploadFiles;
            const avatarFile = files.avatar[0];
            const bannerFile = files.banner[0];
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
                            maxPixelSize: 300,
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
                changeObject.userCryptoInfo = {
                    cryptoBookmarks: cryptoBookmarks,
                    cryptoHoldings: cryptoHoldings,
                    lastUpdated: new Date(),
                };
            }

            // commit changes
            const data = await prismaClient.user.update({
                data: changeObject,
                select: stdUserProfile.select,
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
            const userinfo = await stdUserProfile.filter(data);
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
});

export { userRouter };
