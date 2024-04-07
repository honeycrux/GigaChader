// This file defines standard query functions for: Crypto
// These are useful for getting results for standard response types.

import { CryptoInfo } from "#/shared/models/crypto";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../data/db";

const cryptoInfoSelectObj = {
    cryptoId: true,
    symbol: true,
    name: true,
    priceUsd: true,
    updatedAt: true,
} satisfies Prisma.CryptoSelect;

export async function cryptoInfoFindMany(props: { cryptoId: string[] }): Promise<CryptoInfo[]> {
    const data = await prismaClient.crypto.findMany({
        select: cryptoInfoSelectObj,
        where: {
            cryptoId: {
                in: props.cryptoId,
            },
        },
    });
    return data;
}

export async function cryptoInfoFindManyAsRecord(props: { crpytoId: string[] }): Promise<Record<string, CryptoInfo>> {
    const data = await cryptoInfoFindMany({ cryptoId: props.crpytoId });
    const result: Record<string, CryptoInfo> = {};
    for (const d of data) {
        result[d.cryptoId] = d;
    }
    return result;
}

export async function cryptoInfoFindOne(props: { cryptoId: string }): Promise<CryptoInfo | null> {
    const data = await cryptoInfoFindMany({ cryptoId: [props.cryptoId] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}
