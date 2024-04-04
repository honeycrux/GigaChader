import { initContract } from "@ts-rest/core";
import { personalUserInfoSchema, userProfileSchema } from "../models/user";
import { postInfoSchema } from "../models/post";
import { z } from "zod";

const c = initContract();
export const userContract = c.router({
    // example:
    getInfo: {
        method: "GET",
        path: "/api/user/info",
        responses: {
            200: personalUserInfoSchema.nullable(),
        },
        summary: "Get user's own personal info",
    },

    getProfile: {
        method: "GET",
        path: "/api/user/profile/:username",
        responses: {
            200: userProfileSchema.nullable(),
        },
        summary: "Get profile of a user",
    },

    getFeeds: {
        method: "GET",
        path: "/api/user/feeds",
        query: z.object({
            from: z.optional(z.string()),
            limit: z.optional(z.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get user's own feeds, or global feeds for guests",
    },

    postFollow: {
        method: "POST",
        path: "/api/user/follow",
        body: z.object({
            username: z.string(),
            set: z.boolean(),
        }),
        responses: {
            200: z.object({
                success: z.boolean(),
            }),
            400: z.object({
                error: z.string(),
            }),
        },
        summary: "Add or remove a user follow",
    },

    getPosts: {
        method: "GET",
        path: "/api/user/posts",
        query: z.object({
            username: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get posts of a user",
    },

    getSavedPosts: {
        method: "GET",
        path: "/api/user/saved-posts",
        query: z.object({
            from: z.optional(z.string()),
            limit: z.optional(z.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get user's own saved posts",
    },
});
