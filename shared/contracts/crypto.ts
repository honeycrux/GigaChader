import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { cryptoInfoSchema } from "../models/crypto";

const c = initContract();
export const cryptoContract = c.router({
    getCrypto: {
        method: "GET",
        path: "/api/crypto/fetch/:cryptoId",
        responses: {
            200: cryptoInfoSchema.nullable(),
        },
        summary: "Get info for a crypto currency",
    },

    cryptoSearch: {
        method: "GET",
        path: "/api/crypto/search",
        query: z.object({
            query: z.string(),
            from: z.optional(z.string()),
            limit: z.optional(z.coerce.number().int().min(1)),
        }),
        responses: {
            200: z.array(cryptoInfoSchema).nullable(),
        },
        summary: "Search for a crypto currency",
    },
});
