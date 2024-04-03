import { z } from "zod";
import { simpleUserInfoSchema } from "./user";

export const userMediaTypeSchema = z.union([z.literal("IMAGE"), z.literal("VIDEO")]);

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
    author: simpleUserInfoSchema,
    repostingPostId: z.string().nullable(),
    parentPostId: z.string().nullable(),
    likeCount: z.number(),
    repostCount: z.number(),
    commentCount: z.number(),
    saveCount: z.number(),
});

export type PostInfo = z.infer<typeof postInfoSchema>;

export const simplePostInfoSchema = z.object({
    id: z.string(),
    author: simpleUserInfoSchema,
});

export type SimplePostInfo = z.infer<typeof simplePostInfoSchema>;
