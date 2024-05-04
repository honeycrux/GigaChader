/**
 * Name: Trends Contract
 * Description: Create TS-REST subcontract that defines API routes and types
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { postInfoSchema } from "../models/post";
import { cryptoInfoSchema } from "../models/crypto";

const c = initContract();
export const trendsContract = c.router({
    trendingPosts: {
        method: "GET",
        path: "/api/trends/posts",
        query: z.object({
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(postInfoSchema).nullable(),
        },
        summary: "Get posts with the highest like counts in the past week",
    },

    trendingHashtags: {
        method: "GET",
        path: "/api/trends/hashtags",
        query: z.object({
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z
                .array(
                    z.object({
                        tagText: z.string(),
                        postCount: z.number(),
                    })
                )
                .nullable(),
        },
        summary: "Get hashtags mentioned in the most posts in the past week",
    },

    trendingTopics: {
        method: "GET",
        path: "/api/trends/topics",
        query: z.object({
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z
                .array(
                    z.object({
                        cryptoInfo: cryptoInfoSchema,
                        postCount: z.number(),
                    })
                )
                .nullable(),
        },
    },
});
