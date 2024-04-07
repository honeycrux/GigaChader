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
            response.data.data.map((d) => {
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

export async function checkExchange(): Promise<boolean> {
    const currentTime = new Date();
    let systemdata = await prismaClient.systemMetadata.findUnique({
        where: {
            key: "crypto/coincap-fetch-everything",
        },
    });
    const dataIsFresh =
        systemdata &&
        typeof systemdata.value === "object" &&
        currentTime.valueOf() - (systemdata.value as { lastUpdated: number }).lastUpdated < 24 * 60 * 60 * 1000;
    if (dataIsFresh) {
        return true;
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
    await prismaClient.systemMetadata.upsert({
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
    return true;
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
