import { CryptoInfo } from "#/shared/models/crypto";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../data/db";
import axios from "axios";
import { cryptoInfoFindOne } from "../objects/crypto";

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

async function fetchCoincapAssets(): Promise<Omit<CryptoInfo, "updatedAt">[]> {
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
            response.data.data.filter((d) => {
                return d.id.trim() !== "" && d.name.trim() !== "" && d.symbol.trim() !== ""
            }).map((d) => {
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

async function fetchCoincapAsset(id: string): Promise<Omit<CryptoInfo, "updatedAt"> | null> {
    if (id.trim() === "") {
        return null;
    }
    const assetsUrl = "https://api.coincap.io/v2/assets/";
    const response = await axios.get<{ data: CoincapAsset }>(`${assetsUrl}/${id}`);
    if (!("data" in response)) {
        return null;
    }
    const { id: cryptoId, symbol, name, priceUsd } = response.data.data;
    return {
        cryptoId,
        symbol,
        name,
        priceUsd: Number(priceUsd),
    };
}

function readLastUpdatedData(value: Prisma.JsonValue): number {
    return (value as { lastUpdated: number }).lastUpdated;
}

export async function checkExchange() {
    const expiryPeriod = 24 * 60 * 60 * 1000;
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
    const assetsdata = await fetchCoincapAssets();
    if (!assetsdata) {
        return false;
    }
    await prismaClient.crypto.deleteMany({
        where: {
            cryptoId: { in: assetsdata.map((d) => d.cryptoId) },
        },
    });
    await prismaClient.crypto.createMany({
        data: assetsdata,
    });
    const newsystemdata = await prismaClient.systemMetadata.upsert({
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
    });
    return {
        lastUpdated: readLastUpdatedData(newsystemdata.value),
        expiry: readLastUpdatedData(newsystemdata.value) + expiryPeriod,
    };
}

// get full crypto list for internal use (currently for textual topic identification)
export async function getFullCryptoList() {
    const res = await checkExchange();
    if (!res) {
        return null;
    }
    const cryptoList = await prismaClient.crypto.findMany({
        select: {
            cryptoId: true,
            name: true,
            symbol: true,
        },
    });
    return cryptoList;
}

export async function fetchCrypto(cryptoId: string): Promise<CryptoInfo | null> {
    const check = await checkExchange();
    if (!check) {
        return null;
    }

    const currentTime = new Date();
    const data = await cryptoInfoFindOne({ cryptoId });
    if (!data) {
        return null;
    }
    if (currentTime.valueOf() - data.updatedAt.valueOf() < 5 * 60 * 1000) {
        // data was already updated past 5 minutes
        return data;
    }
    const freshdata = await fetchCoincapAsset(data.cryptoId);
    if (!freshdata) {
        return null;
    }
    const crypto = await prismaClient.crypto.upsert({
        select: {
            cryptoId: true,
        },
        where: {
            cryptoId: freshdata.cryptoId,
        },
        update: freshdata,
        create: freshdata,
    });
    const result = await cryptoInfoFindOne({ cryptoId });

    return result;
}
