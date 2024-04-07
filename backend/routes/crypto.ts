import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { prismaClient } from "@/lib/data/db";
import { checkExchange, fetchCrypto } from "@/lib/helpers/crypto";
import { cryptoInfoFindMany } from "@/lib/objects/crypto";

const s = initServer();

const cryptoRouter = s.router(apiContract.crypto, {
    getCrypto: {
        handler: async ({ params: { cryptoId } }) => {
            const check = await checkExchange();
            if (!check) {
                return {
                    status: 500,
                    body: {
                        error: "Failed to fetch exchange data",
                    },
                };
            }
            const data = await fetchCrypto(cryptoId);
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
            await checkExchange();
            const data = await prismaClient.crypto.findMany({
                take: limit,
                cursor: from ? { cryptoId: from } : undefined,
                skip: from ? 1 : undefined,
                select: {
                    cryptoId: true,
                },
                where: {
                    OR: [{ symbol: { contains: query } }, { name: { contains: query } }, { cryptoId: { contains: query } }],
                },
            });
            if (!data) {
                return {
                    status: 200,
                    body: null,
                };
            }
            const cryptolist = data.map((crypto) => crypto.cryptoId);
            const result = await cryptoInfoFindMany({ cryptoId: cryptolist });
            return {
                status: 200,
                body: result,
            };
        },
    },
});

export { cryptoRouter };
