import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { stdPostInfo } from "@/lib/objects/post";
import { stdSimpleUserInfo } from "@/lib/objects/user";
import { protectRoute } from "@/middlewares/auth";
import { MediaUploadFiles, mediaUploadMiddleware } from "@/middlewares/mediaUpload";
import { compressAndUploadMedia } from "@/lib/data/mediaHandler";

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

    postCreate: {
        middleware: [protectRoute.user, mediaUploadMiddleware],
        handler: async ({ req, res, body: { content, repostingPostId, parentPostId, mediaProps } }) => {
            if (repostingPostId) {
                const post = await prismaClient.post.findUnique({
                    select: {
                        id: true,
                    },
                    where: {
                        id: repostingPostId,
                    },
                });
                if (!post) {
                    return {
                        status: 400,
                        body: { error: `Reposted post ${repostingPostId} does not exist` },
                    };
                }
            }
            if (parentPostId) {
                const post = await prismaClient.post.findUnique({
                    select: {
                        id: true,
                    },
                    where: {
                        id: parentPostId,
                    },
                });
                if (!post) {
                    return {
                        status: 400,
                        body: { error: `Parent post ${parentPostId} does not exist` },
                    };
                }
            }

            mediaProps = mediaProps || [];
            const files = req.files as MediaUploadFiles;
            const uploadPromises: ReturnType<typeof compressAndUploadMedia>[] = [];
            const mediaData: {
                altText: string | undefined;
                type: "IMAGE" | "VIDEO";
            }[] = [];
            for (const i in files.media) {
                const file = files.media[i];
                let type = file.mimetype.split("/")[0];
                if (["image", "video"].indexOf(type) === -1) {
                    return {
                        status: 400,
                        body: { error: `Unknown media type ${file.mimetype}` },
                    };
                }
                const goodtype = type as "image" | "video";
                const goodtype2 = type.toUpperCase() as "IMAGE" | "VIDEO";
                uploadPromises.push(
                    compressAndUploadMedia({
                        maxPixelSize: 1920,
                        container: "media",
                        file: file,
                        type: goodtype,
                    })
                );
                mediaData.push({
                    altText: mediaProps[i]?.altText,
                    type: goodtype2,
                });
            }
            const uploadResults = await Promise.all(uploadPromises);
            const mediaUrls = uploadResults.map((res) => res.url);
            const userMedia = mediaData.map((data, i) => {
                return {
                    ...data,
                    url: mediaUrls[i],
                };
            });

            const hashtagex = /#[^ !"#$%&'()*+,\-.\/:;<=>?@[\]^_`{|}~]*/g;
            const hashtagMatches = content.match(hashtagex);
            let hashtags: string[] = [];
            if (hashtagMatches) {
                // remove duplicate tags
                hashtags = hashtagMatches.filter((tag, i) => hashtagMatches?.indexOf(tag) === i);
            }

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
                    parentPost: parentPostId
                        ? {
                              connect: { id: parentPostId },
                          }
                        : undefined,
                    postHashtags:
                        hashtags.length > 0
                            ? {
                                  create: hashtags.map((tag) => {
                                      return { tagText: tag };
                                  }),
                              }
                            : undefined,
                },
                select: stdPostInfo.select,
            });
            if (!data) {
                return {
                    status: 400,
                    body: { error: "Failed to create user" },
                };
            }
            const postinfo = await stdPostInfo.filter(data);
            return {
                status: 200,
                body: postinfo,
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
