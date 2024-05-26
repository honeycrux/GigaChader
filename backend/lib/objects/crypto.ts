/**
 * Name: Crypto Standard Objects
 * Description: Creates a set of common query functions that returns some standard object types from Crypto Models
 *              These are useful for getting results for response types.
 */

import { CryptoInfo } from "#/shared/models/crypto";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../data/db";
import { fetchSelectedCoincapAssets } from "../helpers/crypto";

/* Standard query functions for CryptoInfo */

const cryptoInfoSelectObj = {
    cryptoId: true,
    symbol: true,
    name: true,
    priceUsd: true,
    updatedAt: true,
} satisfies Prisma.CryptoSelect;

export async function cryptoInfoFindMany(props: { cryptoId: string[] }): Promise<CryptoInfo[]> {
    let data = await prismaClient.crypto.findMany({
        select: cryptoInfoSelectObj,
        where: {
            cryptoId: {
                in: props.cryptoId,
            },
        },
    });
    data = data || [];
    const expiredIds: string[] = [];
    const currentTime = new Date();
    for (const d of data) {
        if (currentTime.valueOf() - d.updatedAt.valueOf() > 5 * 60 * 1000) {
            // data was not updated past 5 minutes - mark as expired
            expiredIds.push(d.cryptoId);
        }
    }

    if (expiredIds.length > 0) {
        // refetch the data
        const response = await fetchSelectedCoincapAssets(expiredIds);

        // update the data in memory
        for (const id of expiredIds) {
            if (response && id in response) {
                const crypto = response[id];
                const index = data.findIndex((value) => value.cryptoId === id);
                if (index > -1) {
                    data[index] = {
                        ...crypto,
                        updatedAt: currentTime,
                    };
                }
            } else {
                // here, we can choose to remove the non-updated value to ensure updatedness
                // or keep the expired value
                // for now, we keep the expired value
            }
        }

        // update the data in database
        if (response) {
            try {
                await prismaClient.$transaction(
                    Object.entries(response).map((entry) => {
                        const [key, value] = entry;
                        return prismaClient.crypto.update({
                            data: value,
                            where: { cryptoId: key },
                        });
                    })
                );
            } catch {
                // should be a write conflict due to multiple requests; ignore for now
            }
        }
    }

    return data;
}

export async function cryptoInfoFindManyAsRecord(props: { cryptoId: string[] }): Promise<Record<string, CryptoInfo>> {
    const data = await cryptoInfoFindMany({ cryptoId: props.cryptoId });
    const result: Record<string, CryptoInfo> = {};
    for (const d of data) {
        result[d.cryptoId] = d;
    }
    return result;
}

export async function cryptoInfoFindManyOrdered(props: { cryptoId: string[] }): Promise<CryptoInfo[]> {
    const data = await cryptoInfoFindManyAsRecord({ cryptoId: props.cryptoId });
    const result = props.cryptoId.filter((id) => !!data[id]).map((id) => data[id]);
    return result;
}

export async function cryptoInfoFindOne(props: { cryptoId: string }): Promise<CryptoInfo | null> {
    const data = await cryptoInfoFindMany({ cryptoId: [props.cryptoId] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}
