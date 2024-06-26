/**
 * Name: Admin Contract
 * Description: Create TS-REST subcontract that defines API routes and types
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { simpleUserInfoSchema } from "../models/user";
import { postCreationPropsSchema, postInfoSchema, postModifyPropsSchema, simplePostInfoSchema } from "../models/post";

const c = initContract();
export const adminContract = c.router({
    suspendUser: {
        method: "POST",
        path: "/api/admin/suspend-user",
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
        summary: "Suspend a user",
    },

    suspendPost: {
        method: "POST",
        path: "/api/admin/suspend-post",
        body: z.object({
            postId: z.string(),
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
        summary: "Suspend a post",
    },

    opModifyPost: {
        method: "POST",
        path: "/api/admin/modify-post",
        body: postModifyPropsSchema,
        responses: {
            200: simplePostInfoSchema.nullable(),
        },
        summary: "Modify a post",
    },

    opListUsers: {
        method: "GET",
        path: "/api/admin/list-users",
        query: z.object({
            query: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(simpleUserInfoSchema).nullable(),
        },
        summary: "List all users, including suspended ones",
    },

    opListPosts: {
        method: "GET",
        path: "/api/admin/list-posts",
        query: z.object({
            query: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "List all posts, including suspended ones",
    },
});
