import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { userRoleSchema, userSessionSchema } from "#/shared/models/user";

const c = initContract();

const authUserObject = z.object({
    session: userSessionSchema,
    user: z.object({
        username: z.string(),
        role: userRoleSchema,
    }),
});

const authFailObject = z.object({
    session: z.null(),
    user: z.null(),
});

export const authContract = c.router({
    signup: {
        method: "POST",
        path: "/api/auth/signup",
        body: z.object({
            username: z.string(),
            displayName: z.string(),
            email: z.string(),
            password: z.string(),
        }),
        responses: {
            200: z.object({
                success: z.boolean(),
            }),
            400: z.object({
                error: z.string(),
            }),
            500: z.object({
                error: z.string(),
            }),
        },
        summary: "User sign up",
    },

    login: {
        method: "POST",
        path: "/api/auth/login",
        body: z.object({
            email: z.string(),
            password: z.string(),
        }),
        responses: {
            200: z.object({
                success: z.boolean(),
            }),
            400: z.object({
                error: z.string(),
            }),
            500: z.object({
                error: z.string(),
            }),
        },
        summary: "User sign in",
    },

    logout: {
        method: "POST",
        path: "/api/auth/logout",
        body: z.object({}),
        responses: {
            200: z.object({
                success: z.boolean(),
            }),
            401: z.object({
                success: z.boolean(),
            }),
        },
        summary: "User sign in",
    },

    validate: {
        method: "GET",
        path: "/api/auth/validate",
        responses: {
            200: authUserObject,
            401: authFailObject,
        },
        summary: "Validate user session",
    },
});
