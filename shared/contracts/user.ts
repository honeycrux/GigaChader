/**
 * Name: User Contract
 * Description: Create TS-REST subcontract that defines API routes and types
 */

import { initContract } from "@ts-rest/core";
import { notificationInfoSchema, personalUserInfoSchema, simpleUserInfoSchema, userConfigPropsSchema, userProfileSchema } from "../models/user";
import { postInfoSchema } from "../models/post";
import { z } from "zod";

const c = initContract();
export const userContract = c.router({
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
            from: z.optional(z.coerce.number().int().min(0)),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get user's own feeds, or global feeds for guests",
    },

    getFollows: {
        method: "GET",
        path: "/api/user/follows",
        query: z.object({
            username: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(simpleUserInfoSchema).nullable(),
        },
        summary: "Get followers of a user",
    },

    getFollowedUsers: {
        method: "GET",
        path: "/api/user/followed-users",
        query: z.object({
            username: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(simpleUserInfoSchema).nullable(),
        },
        summary: "Get followed users of a user",
    },

    getPosts: {
        method: "GET",
        path: "/api/user/posts",
        query: z.object({
            username: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
            filter: z.optional(z.union([z.literal("post"), z.literal("reply")])),
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
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get user's own saved posts",
    },

    userSearch: {
        method: "GET",
        path: "/api/user/search",
        query: z.object({
            query: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(simpleUserInfoSchema).nullable(),
        },
        summary: "Search for users by username",
    },

    getNotifications: {
        method: "GET",
        path: "/api/user/notifications",
        query: z.object({
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
            mode: z.union([z.literal("unread"), z.literal("read")]),
        }),
        responses: {
            200: z.array(notificationInfoSchema).nullable(),
        },
        summary: 'Get user\'s own notifications (from/limit only applies to "read" mode)',
    },

    readNotifications: {
        method: "POST",
        path: "/api/user/read-notifications",
        body: z.object({}),
        responses: {
            200: z.object({
                success: z.boolean(),
            }),
        },
        summary: "Indicate user have read the notifications.",
    },

    userConfig: {
        method: "POST",
        path: "/api/user/config",
        body: userConfigPropsSchema,
        responses: {
            200: userProfileSchema.nullable(),
            400: z.object({
                error: z.string(),
            }),
        },
        summary: "Change a user's own settings",
    },

    userFollow: {
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
});
