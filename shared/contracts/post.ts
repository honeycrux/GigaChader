import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { simpleUserInfoSchema } from "../models/user";
import { postCreationPropsSchema, postInfoSchema } from "../models/post";

const c = initContract();
export const postContract = c.router({
    getPost: {
        method: "GET",
        path: "/api/post/fetch/:postId",
        responses: {
            200: postInfoSchema.nullable(),
        },
        summary: "Fetch a post",
    },

    getLikes: {
        method: "GET",
        path: "/api/post/likes",
        query: z.object({
            postId: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(simpleUserInfoSchema).nullable(),
        },
        summary: "Get likes on a post",
    },

    getComments: {
        method: "GET",
        path: "/api/post/comments",
        query: z.object({
            postId: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get comments on a post",
    },

    getReposts: {
        method: "GET",
        path: "/api/post/reposts",
        query: z.object({
            postId: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get reposts on a post",
    },

    postSearch: {
        method: "GET",
        path: "/api/post/search",
        query: z.object({
            query: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Search for post by context or username",
    },

    getGlobalFeeds: {
        method: "GET",
        path: "/api/post/global-feeds",
        query: z.object({
            from: z.optional(z.coerce.number().int().min(0)),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get global feeds",
    },

    postCreate: {
        method: "POST",
        path: "/api/post/create",
        body: postCreationPropsSchema,
        responses: {
            200: postInfoSchema.nullable(),
        },
        summary: "Create a post",
    },

    postLike: {
        method: "POST",
        path: "/api/post/like",
        body: z.object({
            postId: z.string(),
            set: z.boolean(),
        }),
        responses: {
            200: postInfoSchema.nullable(),
        },
        summary: "Add or remove a like to/from a post",
    },

    postSave: {
        method: "POST",
        path: "/api/post/save",
        body: z.object({
            postId: z.string(),
            set: z.boolean(),
        }),
        responses: {
            200: postInfoSchema.nullable(),
            400: z.object({
                error: z.string(),
            }),
        },
        summary: "Save or unsave a post",
    },
});
