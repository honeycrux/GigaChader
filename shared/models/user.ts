/**
 * Name: Post Shared Models
 * Description: Create common zod schemas and types
 */

import { cryptoInfoSchema } from "./crypto";
import { z } from "zod";

export const userRoleSchema = z.union([z.literal("USER"), z.literal("VERIFIED_USER"), z.literal("ADMIN")]);

export type UserRole = z.infer<typeof userRoleSchema>;

// scope: personal information that only the owner has access to
// and are useful for displaying or configuring in places other than user profile
export const personalUserInfoSchema = z.object({
    username: z.string(),
    suspended: z.boolean(),
    onBoardingCompleted: z.boolean(),
    email: z.string(),
    role: userRoleSchema,
    userConfig: z.object({
        displayName: z.string(),
        avatarUrl: z.nullable(z.string()),
        bannerUrl: z.nullable(z.string()),
        bio: z.string(),
    }),
    userCryptoInfo: z.object({
        cryptoBookmarks: z.array(cryptoInfoSchema),
        cryptoHoldings: z.array(
            z.object({
                crypto: cryptoInfoSchema,
                amount: z.number(),
            })
        ),
    }),
    unreadNotificationCount: z.number(),
});

export type PersonalUserInfo = z.infer<typeof personalUserInfoSchema>;

// scope: information for user profile
export const userProfileSchema = z.object({
    username: z.string(),
    suspended: z.boolean(),
    userConfig: z.object({
        displayName: z.string(),
        avatarUrl: z.nullable(z.string()),
        bannerUrl: z.nullable(z.string()),
        bio: z.string(),
    }),
    userCryptoInfo: z.object({
        cryptoBookmarks: z.array(cryptoInfoSchema.nullable()),
        cryptoHoldings: z.array(
            z.object({
                crypto: cryptoInfoSchema.nullable(),
                amount: z.number(),
            })
        ),
    }),
    followerCount: z.number(),
    followedUserCount: z.number(),
    postCount: z.number(),
    followedByRequester: z.boolean().nullable(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// scope: the most basic information for displaying any user on the platform
export const simpleUserInfoSchema = z.object({
    username: z.string(),
    suspended: z.boolean(),
    displayName: z.string(),
    avatarUrl: z.nullable(z.string()),
});

export type SimpleUserInfo = z.infer<typeof simpleUserInfoSchema>;

// user session that only the owner has access to
export const userSessionSchema = z.object({
    id: z.string(),
    expiresAt: z.date(),
    fresh: z.boolean(),
    userId: z.string(),
});

export type UserSession = z.infer<typeof userSessionSchema>;

export const userConfigPropsSchema = z.object({
    // UserConfig
    displayName: z.optional(z.string()),
    bio: z.optional(z.string()),
    deleteAvatar: z.optional(z.boolean()),
    deleteBanner: z.optional(z.boolean()),
    avatarUrl: z.optional(z.string()),
    bannerUrl: z.optional(z.string()),
    onBoardingCompleted: z.optional(z.boolean()),
    // UserCryptoInfo
    cryptoBookmarks: z.optional(z.array(z.string())),
    cryptoHoldings: z.optional(
        z.array(
            z.object({
                cryptoId: z.string(),
                amount: z.number(),
            })
        )
    ),
});

export type UserConfigProps = z.infer<typeof userConfigPropsSchema>;

export const notificationInfoSchema = z.object({
    content: z.string(),
    link: z.string().nullable(),
    unread: z.boolean(),
    createdAt: z.date(),
});

export type NotificationInfo = z.infer<typeof notificationInfoSchema>;
