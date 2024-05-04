/**
 * Name: Crypto Service Utilities
 * Description: Proivde utilities to support crypto features
 */

import { CryptoInfo } from "#/shared/models/crypto";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../data/db";
import axios from "axios";

/* Utilities ot fetch crypto information using Coincap API */

type CoincapAsset = {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
    explorer: string;
};

async function fetchAllCoincapAssets(): Promise<Omit<CryptoInfo, "updatedAt">[]> {
    const assetsUrl = "https://api.coincap.io/v2/assets";
    const limit = 2000;
    let cryptoinfo: Prisma.CryptoCreateInput[] = [];
    for (let i = 0; true; i++) {
        const response = await axios.get<{ data: CoincapAsset[] }>(assetsUrl, {
            params: { limit: limit, offset: i * limit },
        });
        if (!("data" in response)) {
            break;
        }
        cryptoinfo = cryptoinfo.concat(
            response.data.data
                .filter((d) => {
                    return d.id.trim() !== "" && d.name.trim() !== "" && d.symbol.trim() !== "";
                })
                .map((d) => {
                    const { id: cryptoId, symbol, name, priceUsd } = d;
                    return {
                        cryptoId,
                        symbol,
                        name,
                        priceUsd: Number(priceUsd),
                    };
                })
        );
        if (cryptoinfo.length !== limit) {
            break;
        }
    }
    return cryptoinfo;
}

export async function fetchSelectedCoincapAssets(ids: string[]): Promise<Record<string, Omit<CryptoInfo, "updatedAt">> | null> {
    ids = ids.filter((id) => id.trim() !== "");
    if (ids.length < 1) {
        return {};
    }
    const assetsUrl = "https://api.coincap.io/v2/assets/";
    const response = await axios.get<{ data: CoincapAsset[] }>(`${assetsUrl}`, {
        params: { ids: ids },
    });
    if (!("data" in response)) {
        return null;
    }
    const result: Record<string, Omit<CryptoInfo, "updatedAt">> = {};
    for (const cryptoData of response.data.data) {
        const { id: cryptoId, symbol, name, priceUsd } = cryptoData;
        const data = {
            cryptoId,
            symbol,
            name,
            priceUsd: Number(priceUsd),
        };
        // place into database
        prismaClient.crypto.update({
            data: data,
            where: {
                cryptoId: cryptoId,
            },
        });
        result[cryptoId] = data;
    }

    return result;
}

/* Check the updatedness of the list of cryptos on our database, which expires in one day. Fetch from Coincap and update if necessary. */

function readLastUpdatedData(value: Prisma.JsonValue): number {
    return (value as { lastUpdated: number }).lastUpdated;
}

export async function checkExchange() {
    const expiryPeriod = 24 * 60 * 60 * 1000; // one day
    const currentTime = new Date();
    let systemdata = await prismaClient.systemMetadata.findUnique({
        where: {
            key: "crypto/coincap-fetch-everything",
        },
    });
    const dataIsFresh = systemdata && typeof systemdata.value === "object" && currentTime.valueOf() < readLastUpdatedData(systemdata.value) + expiryPeriod;
    if (dataIsFresh) {
        return {
            lastUpdated: readLastUpdatedData(systemdata.value),
            expiry: readLastUpdatedData(systemdata.value) + expiryPeriod,
        };
    }
    const assetsdata = await fetchAllCoincapAssets();
    if (!assetsdata) {
        return false;
    }
    const [_res0, _res1, newsystemdata] = await prismaClient.$transaction([
        // clear old data from database
        prismaClient.crypto.deleteMany({}),
        // create new data in database
        prismaClient.crypto.createMany({
            data: assetsdata,
        }),
        prismaClient.systemMetadata.upsert({
            select: {
                value: true,
            },
            update: {
                value: { lastUpdated: Date.now() },
            },
            create: {
                key: "crypto/coincap-fetch-everything",
                value: { lastUpdated: Date.now() },
            },
            where: {
                key: "crypto/coincap-fetch-everything",
            },
        }),
    ]);
    return {
        lastUpdated: readLastUpdatedData(newsystemdata.value),
        expiry: readLastUpdatedData(newsystemdata.value) + expiryPeriod,
    };
}

/* Get full crypto list for internal use (currently for textual topic identification) */

export async function getFullCryptoList() {
    const cryptoList = await prismaClient.crypto.findMany({
        select: {
            cryptoId: true,
            name: true,
            symbol: true,
        },
    });
    return cryptoList;
}
