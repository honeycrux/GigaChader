import { z } from "zod";
import { simpleUserInfoSchema } from "./user";

export const userMediaTypeSchema = z.union([z.literal("IMAGE"), z.literal("VIDEO")]);

export const textualContextSchema = z.object({
    href: z.string().nullable(),
    text: z.string(),
});

export const postInfoSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.date(),
    userMedia: z.array(
        z.object({
            url: z.string(),
            type: userMediaTypeSchema,
        })
    ),
    postHashtags: z.array(z.string()),
    postCryptoTopics: z.array(z.string()),
    textualContexts: z.array(textualContextSchema),
    author: simpleUserInfoSchema,
    repostingPostId: z.string().nullable(),
    parentPostId: z.string().nullable(),
    likeCount: z.number(),
    repostCount: z.number(),
    commentCount: z.number(),
    saveCount: z.number(),
    likedByRequester: z.boolean().nullable(),
    savedByRequester: z.boolean().nullable(),
});

export type PostInfo = z.infer<typeof postInfoSchema>;

export const simplePostInfoSchema = z.object({
    id: z.string(),
    author: simpleUserInfoSchema,
});

export type SimplePostInfo = z.infer<typeof simplePostInfoSchema>;

export const postCreationPropsSchema = z.object({
    content: z.string(),
    repostingPostId: z.optional(z.string()),
    parentPostId: z.optional(z.string()),
    userMedia: z.optional(
        z.array(
            z.object({
                url: z.string(),
                type: userMediaTypeSchema,
                altText: z.optional(z.string()),
            })
        )
    ),
});

export type PostCreationProps = z.infer<typeof postCreationPropsSchema>;
