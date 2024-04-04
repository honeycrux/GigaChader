import { CryptoInfo } from "#/shared/models/crypto";
import { prismaClient, StandardizedQuery } from "../data/db";

const stdCryptoInfoSelectObj = {
    cryptoId: true,
    symbol: true,
    name: true,
    priceUsd: true,
    updatedAt: true,
};

export const stdCryptoInfo = new StandardizedQuery<typeof stdCryptoInfoSelectObj, CryptoInfo, CryptoInfo>({
    select: stdCryptoInfoSelectObj,
    filter: async function (data) {
        return data;
    },
    sample: async function (props: { cryptoId: string }) {
        const data = await prismaClient.crypto.findUnique({
            select: this.select,
            where: {
                cryptoId: props.cryptoId,
            },
        });
        if (!data) {
            return null;
        }
        return data;
    },
});
