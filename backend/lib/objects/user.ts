// This file defines standard query functions for: User
// These are useful for getting results for standard response types.

import { prismaClient } from "../data/db";
import { PersonalUserInfo, SimpleUserInfo, UserProfile } from "#/shared/models/user";
import { cryptoInfoFindManyAsRecord } from "./crypto";
import { Prisma } from "@prisma/client";

const personalUserInfoSelectObj = {
    username: true,
    email: true,
    role: true,
    userConfig: {
        select: {
            displayName: true,
            imageUrl: true,
            bannerUrl: true,
            bio: true,
        },
    },
    userCryptoInfo: {
        select: {
            cryptoHoldings: true,
            cryptoBookmarks: true,
        },
    },
} satisfies Prisma.UserSelect;

export async function personalUserInfoFindMany(props: { username: string[] }): Promise<PersonalUserInfo[]> {
    const data = await prismaClient.user.findMany({
        select: personalUserInfoSelectObj,
        where: {
            username: {
                in: props.username,
            },
        },
    });

    // Fetch crypto info
    let allCryptoIds = data.flatMap((user) => {
        const cryptosInBookmarks = user.userCryptoInfo.cryptoBookmarks || [];
        const holdings = user.userCryptoInfo.cryptoHoldings || [];
        const cryptosInHolding = holdings.map((holding) => holding.cryptoId);
        return cryptosInBookmarks.concat(cryptosInHolding);
    }); // get all cryptos in bookmarks and holdings to be queried
    allCryptoIds = allCryptoIds.filter((v, i, arr) => arr.indexOf(v) === i); // remove duplicates
    const cryptodata = await cryptoInfoFindManyAsRecord({ crpytoId: allCryptoIds });

    const personalUserInfo: PersonalUserInfo[] = data.map((user) => {
        const { userCryptoInfo, ...rest } = user;

        const cryptoHoldings = userCryptoInfo.cryptoHoldings.map((holding) => {
            return {
                crypto: cryptodata[holding.cryptoId] || null,
                amount: holding.amount,
            };
        });

        const cryptoBookmarks = userCryptoInfo.cryptoBookmarks.map((cryptoId) => {
            return cryptodata[cryptoId] || null;
        });

        return {
            ...rest,
            userCryptoInfo: {
                cryptoBookmarks: cryptoBookmarks,
                cryptoHoldings: cryptoHoldings,
            },
        };
    });

    return personalUserInfo;
}

export async function personalUserInfoFindManyAsRecord(props: { username: string[] }): Promise<Record<string, PersonalUserInfo>> {
    const data = await personalUserInfoFindMany({ username: props.username });
    const result: Record<string, PersonalUserInfo> = {};
    for (const d of data) {
        result[d.username] = d;
    }
    return result;
}

export async function personalUserInfoFindOne(props: { username: string }): Promise<PersonalUserInfo | null> {
    const data = await personalUserInfoFindMany({ username: [props.username] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}

const userProfileSelectObj = {
    username: true,
    userConfig: {
        select: {
            displayName: true,
            imageUrl: true,
            bannerUrl: true,
        },
    },
    userCryptoInfo: {
        select: {
            cryptoHoldings: true,
            cryptoBookmarks: true,
        },
    },
    _count: {
        select: {
            followers: true,
            followedUsers: true,
            posts: true,
        },
    },
} satisfies Prisma.UserSelect;

export async function userProfileFindMany(props: { username: string[] }): Promise<UserProfile[]> {
    const data = await prismaClient.user.findMany({
        select: userProfileSelectObj,
        where: {
            username: {
                in: props.username,
            },
        },
    });

    // Fetch crypto info
    let allCryptoIds = data.flatMap((user) => {
        const cryptosInBookmarks = user.userCryptoInfo.cryptoBookmarks || [];
        const holdings = user.userCryptoInfo.cryptoHoldings || [];
        const cryptosInHolding = holdings.map((holding) => holding.cryptoId);
        return cryptosInBookmarks.concat(cryptosInHolding);
    }); // get all cryptos in bookmarks and holdings to be queried
    allCryptoIds = allCryptoIds.filter((v, i, arr) => arr.indexOf(v) === i); // remove duplicates
    const cryptodata = await cryptoInfoFindManyAsRecord({ crpytoId: allCryptoIds });

    const userProfile: UserProfile[] = data.map((user) => {
        const { _count, userCryptoInfo, ...rest } = user;

        const cryptoHoldings = userCryptoInfo.cryptoHoldings.map((holding) => {
            return {
                crypto: cryptodata[holding.cryptoId] || null,
                amount: holding.amount,
            };
        });

        const cryptoBookmarks = userCryptoInfo.cryptoBookmarks.map((cryptoId) => {
            return cryptodata[cryptoId] || null;
        });

        return {
            ...rest,
            followerCount: _count.followers,
            followedUserCount: _count.followedUsers,
            postCount: _count.posts,
            userCryptoInfo: {
                cryptoBookmarks: cryptoBookmarks,
                cryptoHoldings: cryptoHoldings,
            },
        };
    });

    return userProfile;
}

export async function userProfileFindManyAsRecord(props: { username: string[] }): Promise<Record<string, UserProfile>> {
    const data = await userProfileFindMany({ username: props.username });
    const result: Record<string, UserProfile> = {};
    for (const d of data) {
        result[d.username] = d;
    }
    return result;
}

export async function userProfileFindOne(props: { username: string }): Promise<UserProfile | null> {
    const data = await userProfileFindMany({ username: [props.username] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}

const simpleUserInfoSelectObj = {
    username: true,
    userConfig: {
        select: {
            displayName: true,
            imageUrl: true,
        },
    },
} satisfies Prisma.UserSelect;

export async function simpleUserInfoFindMany(props: { username: string[] }): Promise<SimpleUserInfo[]> {
    const data = await prismaClient.user.findMany({
        select: simpleUserInfoSelectObj,
        where: {
            username: {
                in: props.username,
            },
        },
    });
    const simpleUserInfo = data.map((user) => {
        const { userConfig, ...rest } = user;
        return {
            ...rest,
            displayName: userConfig.displayName,
            imageUrl: userConfig.imageUrl,
        };
    });
    return simpleUserInfo;
}

export async function simpleUserInfoFindManyAsRecord(props: { username: string[] }): Promise<Record<string, SimpleUserInfo>> {
    const data = await simpleUserInfoFindMany({ username: props.username });
    const result: Record<string, SimpleUserInfo> = {};
    for (const d of data) {
        result[d.username] = d;
    }
    return result;
}

export async function simpleUserInfoFindOne(props: { username: string }): Promise<SimpleUserInfo | null> {
    const data = await simpleUserInfoFindMany({ username: [props.username] });
    if (!data[0]) {
        return null;
    }
    return data[0];
}
