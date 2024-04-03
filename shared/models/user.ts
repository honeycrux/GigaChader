import { z } from "zod";

export const userRoleSchema = z.union([z.literal("USER"), z.literal("VERIFIED_USER"), z.literal("ADMIN")]);

export type UserRole = z.infer<typeof userRoleSchema>;

// scope: personal information that only the owner has access to
// and are useful for displaying or configuring in places other than user profile
export const personalUserInfoSchema = z.object({
    username: z.string(),
    email: z.string(),
    role: userRoleSchema,
    userConfig: z.object({
        displayName: z.string(),
        imageUrl: z.nullable(z.string()),
        bio: z.string(),
    }),
    userCryptoInfo: z.object({
        cryptoHoldings: z.array(
            z.object({
                symbol: z.string(),
                amount: z.number(),
            })
        ),
    }),
});

export type PersonalUserInfo = z.infer<typeof personalUserInfoSchema>;

// scope: information for user profile
export const userProfileSchema = z.object({
    username: z.string(),
    userConfig: z.object({
        displayName: z.string(),
        imageUrl: z.nullable(z.string()),
    }),
    userCryptoInfo: z.object({
        // note: cryptoHoldings (data structure for display) will be redesigned
        cryptoHoldings: z.array(
            z.object({
                symbol: z.string(),
                amount: z.number(),
            })
        ),
    }),
    followerCount: z.number(),
    followedUserCount: z.number(),
    postCount: z.number(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// scope: the most basic information for displaying any user on the platform
export const simpleUserInfoSchema = z.object({
    username: z.string(),
    displayName: z.string(),
    imageUrl: z.nullable(z.string()),
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