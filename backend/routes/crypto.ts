/**
 * Name: Crypto Routes
 * Description: Implement TS-REST subrouter for a TS-REST subcontract (Crypto Contract)
 */

import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { cryptoInfoFindManyOrdered, cryptoInfoFindOne } from "@/lib/objects/crypto";

const s = initServer();

export const cryptoRouter = s.router(apiContract.crypto, {
    getCrypto: {
        handler: async ({ params: { cryptoId } }) => {
            const data = await cryptoInfoFindOne({ cryptoId: cryptoId });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            return {
                status: 200,
                body: data,
            };
        },
    },

    cryptoSearch: {
        handler: async ({ query: { query, from, limit } }) => {
            const data = await prismaClient.crypto.findMany({
                take: limit,
                cursor: from ? { cryptoId: from } : undefined,
                skip: from ? 1 : undefined,
                orderBy: {
                    cryptoId: "asc",
                },
                select: {
                    cryptoId: true,
                },
                where: {
                    OR: [{ symbol: { startsWith: query } }, { name: { startsWith: query } }, { cryptoId: { startsWith: query } }],
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const cryptolist = data.map((crypto) => crypto.cryptoId);
            const result = await cryptoInfoFindManyOrdered({ cryptoId: cryptolist });
            return {
                status: 200,
                body: result,
            };
        },
    },
});
