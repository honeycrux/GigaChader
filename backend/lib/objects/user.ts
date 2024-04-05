// This file defines standardized query objects for: User
// These are useful for making Prisma selections and data transformations to the standard response types.

import { prismaClient, StandardizedQuery } from "../data/db";
import { PersonalUserInfo, SimpleUserInfo, UserProfile } from "#/shared/models/user";
import { stdCryptoInfo } from "./crypto";

const stdPersonalInfoSelectObj = {
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
};

export const stdPersonalUserInfo = new StandardizedQuery<
    typeof stdPersonalInfoSelectObj,
    Omit<PersonalUserInfo, "userCryptoInfo"> & { userCryptoInfo: { cryptoBookmarks: string[]; cryptoHoldings: { cryptoId: string; amount: number }[] } },
    PersonalUserInfo
>({
    select: stdPersonalInfoSelectObj,
    filter: async function (data) {
        const { userCryptoInfo, ...rest } = data;

        // Handle crypto holdings
        const cryptolist = (userCryptoInfo.cryptoHoldings || []).map((d) => {
            return d.cryptoId;
        });
        let cryptodata = await prismaClient.crypto.findMany({
            select: stdCryptoInfo.select,
            where: {
                cryptoId: {
                    in: cryptolist,
                },
            },
        });
        if (!cryptodata) {
            cryptodata = [];
        }
        const cryptoHoldings = cryptodata.map((crypto) => {
            let holding = userCryptoInfo.cryptoHoldings.find((a) => a.cryptoId === crypto.cryptoId);
            return {
                crypto: crypto,
                amount: holding!.amount,
            };
        });

        // Handle crypto bookmarks
        const cryptolist2 = userCryptoInfo.cryptoBookmarks || [];
        let cryptodata2 = await prismaClient.crypto.findMany({
            select: stdCryptoInfo.select,
            where: {
                cryptoId: {
                    in: cryptolist2,
                },
            },
        });
        if (!cryptodata2) {
            cryptodata2 = [];
        }
        const cryptoBookmarks = cryptodata2;

        const personalUserInfo: PersonalUserInfo = {
            ...rest,
            userCryptoInfo: {
                cryptoBookmarks: cryptoBookmarks,
                cryptoHoldings: cryptoHoldings,
            },
        };
        return personalUserInfo;
    },
    sample: async function (props: { username: string }) {
        const data = await prismaClient.user.findUnique({
            select: this.select,
            where: {
                username: props.username,
            },
        });
        if (!data) {
            return null;
        }
        return this.filter(data);
    },
});

const stdUserProfileSelectObj = {
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
};
export const stdUserProfile = new StandardizedQuery<
    typeof stdUserProfileSelectObj,
    Omit<UserProfile, "followerCount" | "followedUserCount" | "postCount" | "userCryptoInfo"> & {
        userCryptoInfo: { cryptoBookmarks: string[]; cryptoHoldings: { cryptoId: string; amount: number }[] };
        _count: { followers: number; followedUsers: number; posts: number };
    },
    UserProfile
>({
    select: stdUserProfileSelectObj,
    filter: async function (data) {
        const { userCryptoInfo, _count, ...rest } = data;

        // Handle crypto holdings
        const cryptolist = (userCryptoInfo.cryptoHoldings || []).map((d) => {
            return d.cryptoId;
        });
        let cryptodata = await prismaClient.crypto.findMany({
            select: stdCryptoInfo.select,
            where: {
                cryptoId: {
                    in: cryptolist,
                },
            },
        });
        if (!cryptodata) {
            cryptodata = [];
        }
        const cryptoHoldings = cryptodata.map((crypto) => {
            let holding = userCryptoInfo.cryptoHoldings.find((a) => a.cryptoId === crypto.cryptoId);
            return {
                crypto: crypto,
                amount: holding!.amount,
            };
        });

        // Handle crypto bookmarks
        const cryptolist2 = userCryptoInfo.cryptoBookmarks || [];
        let cryptodata2 = await prismaClient.crypto.findMany({
            select: stdCryptoInfo.select,
            where: {
                cryptoId: {
                    in: cryptolist2,
                },
            },
        });
        if (!cryptodata2) {
            cryptodata2 = [];
        }
        const cryptoBookmarks = cryptodata2;

        return {
            ...rest,
            userCryptoInfo: {
                cryptoBookmarks: cryptoBookmarks,
                cryptoHoldings: cryptoHoldings,
            },
            followerCount: _count.followers,
            followedUserCount: _count.followedUsers,
            postCount: _count.posts,
        };
    },
    sample: async function (props: { username: string }) {
        const data = await prismaClient.user.findUnique({
            select: this.select,
            where: {
                username: props.username,
            },
        });
        if (!data) {
            return null;
        }
        return this.filter(data);
    },
});

const stdSimpleUserInfoSelectObj = {
    username: true,
    userConfig: {
        select: {
            displayName: true,
            imageUrl: true,
        },
    },
};

export const stdSimpleUserInfo = new StandardizedQuery<
    typeof stdSimpleUserInfoSelectObj,
    Omit<SimpleUserInfo, "displayName" | "imageUrl"> & { userConfig: { displayName: string; imageUrl: string | null } },
    SimpleUserInfo
>({
    select: stdSimpleUserInfoSelectObj,
    filter: async function (data) {
        const { userConfig, ...rest } = data;
        const simpleUserInfo: SimpleUserInfo = {
            ...rest,
            displayName: userConfig.displayName,
            imageUrl: userConfig.imageUrl,
        };
        return simpleUserInfo;
    },
    sample: async function (props: { username: string }) {
        const data = await prismaClient.user.findUnique({
            select: this.select,
            where: {
                username: props.username,
            },
        });
        if (!data) {
            return null;
        }
        return this.filter(data);
    },
});
