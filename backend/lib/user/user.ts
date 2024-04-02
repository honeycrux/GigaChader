import { prismaClient } from "../data/db";
import { PersonalUserInfo, SimpleUserInfo, UserProfile } from "#/shared/models/user";

export async function getPersonalUserInfo(props: { username: string }): Promise<PersonalUserInfo | null> {
    const data = await prismaClient.user.findUnique({
        select: {
            username: true,
            email: true,
            role: true,
            userConfig: true,
            userCryptoInfo: true,
        },
        where: {
            username: props.username,
        },
    });
    if (!data) {
        return null;
    }
    const { userConfig, userCryptoInfo, ...rest } = data;
    const personalUserInfo: PersonalUserInfo = {
        ...rest,
        userConfig: {
            displayName: userConfig.displayName,
            imageUrl: userConfig.imageUrl,
            bio: userConfig.bio,
        },
        userCryptoInfo: {
            cryptoBookmarks: userCryptoInfo.cryptoBookmarks,
            cryptoHoldings: userCryptoInfo.cryptoHoldings,
        },
    };
    return personalUserInfo;
}

export async function getUserProfile(props: { username: string }): Promise<UserProfile | null> {
    const data = await prismaClient.user.findUnique({
        select: {
            username: true,
            userConfig: true,
            userCryptoInfo: true,
            // _count: {
            //     select: {
            //         followers: true,
            //         followedUsers: true,
            //         posts: true,
            //     },
            // },
        },
        where: {
            username: props.username,
        },
    });
    if (!data) {
        return null;
    }
    return data;
}

export async function getSimpleUserInfo(props: { username: string }): Promise<SimpleUserInfo | null> {
    const data = await prismaClient.user.findUnique({
        select: {
            username: true,
            userConfig: true,
        },
        where: {
            username: props.username,
        },
    });
    if (!data) {
        return null;
    }
    const { userConfig, ...rest } = data;
    const simpleUserInfo: SimpleUserInfo = {
        ...rest,
        userConfig: {
            displayName: userConfig.displayName,
            imageUrl: userConfig.imageUrl,
        },
    };
    return simpleUserInfo;
}
