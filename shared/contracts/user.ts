import { initContract } from "@ts-rest/core";
import { personalUserInfoSchema, userProfileSchema } from "../models/user";
import { z } from "zod";

const c = initContract();
export const userContract = c.router({
    // example:
    getInfo: {
        method: "GET",
        path: "/api/user/info",
        responses: {
            200: personalUserInfoSchema.nullable(),
        },
        summary: "Get user personal info",
    },
    getProfile: {
        method: "GET",
        path: "/api/user/profile/:username",
        responses: {
            200: userProfileSchema.nullable(),
        },
        summary: "Get user profile",
    },
});
