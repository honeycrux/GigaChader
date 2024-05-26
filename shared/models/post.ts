/**
 * Name: Post Shared Models
 * Description: Create common zod schemas and types
 */

import { z } from "zod";
import { simpleUserInfoSchema } from "./user";

export const userMediaTypeSchema = z.union([z.literal("IMAGE"), z.literal("VIDEO")]);

export const textualContextSchema = z.object({
    href: z.string().nullable(),
    text: z.string(),
});

const basePostInfoSchema = z.object({
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
    suspended: z.boolean(),
    author: simpleUserInfoSchema,
    repostingPostId: z.string().nullable(),
    parentPostId: z.string().nullable(),
    likeCount: z.number(),
    repostCount: z.number(),
    commentCount: z.number(),
    saveCount: z.number(),
    likedByRequester: z.boolean().nullable(),
    editedByModerator: z.boolean(),
    savedByRequester: z.boolean().nullable(),
});

// this is how you build a recursive type according to documentation
export type PostInfo = z.infer<typeof basePostInfoSchema> & {
    repostingPost: PostInfo | null;
};

export const postInfoSchema: z.ZodType<PostInfo> = basePostInfoSchema.extend({
    repostingPost: z.lazy(() => postInfoSchema.nullable()),
});

export const simplePostInfoSchema = z.object({
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
    suspended: z.boolean(),
    author: simpleUserInfoSchema,
    repostingPostId: z.string().nullable(),
    parentPostId: z.string().nullable(),
    editedByModerator: z.boolean(),
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

export const postModifyPropsSchema = z.object({
    postId: z.string(),
    content: z.optional(z.string()),
    repostingPostId: z.optional(z.string()),
    parentPostId: z.optional(z.string()),
    removeRepostingPost: z.optional(z.boolean()),
    removeParentPost: z.optional(z.boolean()),
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

export type PostModifyProps = z.infer<typeof postModifyPropsSchema>;
