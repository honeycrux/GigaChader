// The endpoints created on this page creates each response schema related to: User
// They serve both as reusable query points and samples to use in your own queries.

import { prismaClient, StandardizedQuery } from "../data/db";
import { PersonalUserInfo, SimpleUserInfo, UserProfile } from "#/shared/models/user";

const stdPersonalInfoSelectObj = {
    username: true,
    email: true,
    role: true,
    userConfig: true,
    userCryptoInfo: true,
};

export const stdPersonalUserInfo = new StandardizedQuery<typeof stdPersonalInfoSelectObj, PersonalUserInfo, PersonalUserInfo>({
    select: stdPersonalInfoSelectObj,
    filter: function (data) {
        const { userConfig, userCryptoInfo, ...rest } = data;
        const personalUserInfo: PersonalUserInfo = {
            ...rest,
            userConfig: {
                displayName: userConfig.displayName,
                imageUrl: userConfig.imageUrl,
                bio: userConfig.bio,
            },
            userCryptoInfo: {
                cryptoHoldings: userCryptoInfo.cryptoHoldings,
            },
        };
        return personalUserInfo;
    },
    sample: async function (props: { username: string }) {
        const data = await prismaClient.user.findUnique({
            select: stdPersonalInfoSelectObj,
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
    Omit<UserProfile, "followerCount" | "followedUserCount" | "postCount"> & { _count: { followers: number; followedUsers: number; posts: number } },
    UserProfile
>({
    select: stdUserProfileSelectObj,
    filter: function (data) {
        const { _count, ...rest } = data;
        return {
            ...rest,
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
    filter: function (data) {
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
