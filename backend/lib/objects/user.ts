// This file defines standardized query objects for: User
// These are useful for making Prisma selections and data transformations to the standard response types.

import { prismaClient, StandardizedQuery } from "../data/db";
import { PersonalUserInfo, SimpleUserInfo, UserProfile } from "#/shared/models/user";
import { stdCryptoInfo } from "./crypto";

const stdPersonalInfoSelectObj = {
    username: true,
    email: true,
    role: true,
    userConfig: true,
    userCryptoInfo: true,
};

export const stdPersonalUserInfo = new StandardizedQuery<
    typeof stdPersonalInfoSelectObj,
    Omit<PersonalUserInfo, "userCryptoInfo"> & { userCryptoInfo: { cryptoHoldings: { symbol: string; amount: number }[] } },
    PersonalUserInfo
>({
    select: stdPersonalInfoSelectObj,
    filter: async function (data) {
        const { userConfig, userCryptoInfo, ...rest } = data;
        const cryptolist = userCryptoInfo.cryptoHoldings.map((d) => {
            return d.symbol;
        });
        let cryptodata = await prismaClient.crypto.findMany({
            select: stdCryptoInfo.select,
            where: {
                symbol: {
                    in: cryptolist,
                },
            },
        });
        if (!cryptodata) {
            cryptodata = [];
        }
        const cryptoHoldings = cryptodata.map((crypto) => {
            let holding = userCryptoInfo.cryptoHoldings.find((a) => a.symbol === crypto.symbol);
            return {
                crypto: crypto,
                amount: holding!.amount,
            };
        });
        const personalUserInfo: PersonalUserInfo = {
            ...rest,
            userConfig: {
                displayName: userConfig.displayName,
                imageUrl: userConfig.imageUrl,
                bio: userConfig.bio,
            },
            userCryptoInfo: {
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
    userConfig: true,
    userCryptoInfo: true,
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
        userCryptoInfo: { cryptoHoldings: { symbol: string; amount: number }[] };
        _count: { followers: number; followedUsers: number; posts: number };
    },
    UserProfile
>({
    select: stdUserProfileSelectObj,
    filter: async function (data) {
        const { userCryptoInfo, _count, ...rest } = data;
        const cryptolist = userCryptoInfo.cryptoHoldings.map((d) => {
            return d.symbol;
        });
        let cryptodata = await prismaClient.crypto.findMany({
            select: stdCryptoInfo.select,
            where: {
                symbol: {
                    in: cryptolist,
                },
            },
        });
        if (!cryptodata) {
            cryptodata = [];
        }
        const cryptoHoldings = cryptodata.map((crypto) => {
            let holding = userCryptoInfo.cryptoHoldings.find((a) => a.symbol === crypto.symbol);
            return {
                crypto: crypto,
                amount: holding!.amount,
            };
        });
        return {
            ...rest,
            userCryptoInfo: { cryptoHoldings: cryptoHoldings },
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
    userConfig: true,
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
