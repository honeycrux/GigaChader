import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { simpleUserInfoSchema } from "../models/user";
import { postInfoSchema } from "../models/post";

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
            limit: z.optional(z.number().int().min(1)),
        }),
        responses: {
            200: z.array(simpleUserInfoSchema).nullable(),
        },
        summary: "Get likes of a user",
    },

    getComments: {
        method: "GET",
        path: "/api/post/comments",
        query: z.object({
            postId: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get comments of a user",
    },

    getReposts: {
        method: "GET",
        path: "/api/post/reposts",
        query: z.object({
            postId: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get reposts of a user",
    },
});
