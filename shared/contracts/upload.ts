import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { userMediaTypeSchema } from "../models/post";

const c = initContract();
export const uploadContract = c.router({
    uploadMedia: {
        method: "POST",
        path: "/api/upload/media",
        contentType: "multipart/form-data",
        body: c.type<{ media: File[] }>(),
        responses: {
            200: z
                .array(
                    z.object({
                        url: z.string(),
                        type: userMediaTypeSchema,
                    })
                )
                .nullable(),
        },
        summary: "File upload for post media (at most 10 files)",
    },

    uploadProfile: {
        method: "POST",
        path: "/api/upload/profile",
        contentType: "multipart/form-data",
        body: c.type<{ avatar: File[]; banner: File[] }>(),
        responses: {
            200: z.object({
                avatarUrl: z.optional(z.string()),
                bannerUrl: z.optional(z.string()),
            }),
        },
        summary: "File upload for profile",
    },
});
