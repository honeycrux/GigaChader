import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { checkMediaUpload, compressAndUploadMedia, SupportedMediaType } from "@/lib/data/mediaHandler";
import { createExpirableMediaStash } from "@/lib/helpers/expirables";
import { protectRoute } from "@/middlewares/auth";
import { MediaUploadFiles, mediaUploadMiddleware, ProfileUploadFiles, profileUploadMiddleware } from "@/middlewares/mediaUpload";
import { initServer } from "@ts-rest/express";

const s = initServer();

export const uploadRouter = s.router(apiContract.upload, {
    uploadMedia: {
        middleware: [protectRoute.user, mediaUploadMiddleware],
        handler: async (req) => {
            const files = req.files as MediaUploadFiles;
            const uploadPromises: ReturnType<typeof compressAndUploadMedia>[] = [];
            let urls: string[] = [];
            const types: SupportedMediaType[] = [];
            if (files) {
                if (files.media) {
                    for (const i in files.media) {
                        const file = files.media[i];
                        const type = checkMediaUpload({ file: file, allowedTypes: ["IMAGE", "VIDEO"] });
                        if (!type) {
                            return {
                                status: 400,
                                body: {
                                    error: `File of type ${file.mimetype} is not supported`,
                                },
                            };
                        }
                        types.push(type);
                    }
                    for (const i in files.media) {
                        uploadPromises.push(
                            compressAndUploadMedia({
                                maxPixelSize: 1920,
                                container: "media",
                                file: files.media[i],
                                type: types[i],
                            })
                        );
                    }
                    const responses = await Promise.all(uploadPromises);
                    urls = responses.map((response) => response.url);
                }
            }
            if (urls.length > 0) {
                createExpirableMediaStash({ urls: urls });
            }
            return {
                status: 200,
                body: urls.length
                    ? urls.map((_, i) => {
                          return {
                              url: urls[i],
                              type: types[i],
                          };
                      })
                    : null,
            };
        },
    },

    uploadProfile: {
        middleware: [protectRoute.user, profileUploadMiddleware],
        handler: async (req) => {
            const files = req.files as ProfileUploadFiles;
            let avatarUrl: string | undefined;
            let bannerUrl: string | undefined;
            if (files) {
                if (files.avatar && files.avatar[0]) {
                    const file = files.avatar[0];
                    const type = checkMediaUpload({ file: file, allowedTypes: ["IMAGE"] });
                    if (!type) {
                        return {
                            status: 400,
                            body: {
                                error: `File of type ${file.mimetype} is not supported`,
                            },
                        };
                    }
                    const response = await compressAndUploadMedia({
                        maxPixelSize: 1920,
                        container: "media",
                        file: file,
                        type: "IMAGE",
                    });
                    avatarUrl = response.url;
                }
                if (files.banner && files.banner[0]) {
                    const file = files.banner[0];
                    const type = checkMediaUpload({ file: file, allowedTypes: ["IMAGE"] });
                    if (!type) {
                        return {
                            status: 400,
                            body: {
                                error: `File of type ${file.mimetype} is not supported`,
                            },
                        };
                    }
                    const response = await compressAndUploadMedia({
                        maxPixelSize: 1920,
                        container: "media",
                        file: file,
                        type: "IMAGE",
                    });
                    bannerUrl = response.url;
                }
            }
            if (avatarUrl || bannerUrl) {
                const urls: string[] = [];
                if (avatarUrl) {
                    urls.push(avatarUrl);
                }
                if (bannerUrl) {
                    urls.push(bannerUrl);
                }
                createExpirableMediaStash({ urls: urls });
            }
            return {
                status: 200,
                body: { avatarUrl, bannerUrl },
            };
        },
    },
});
