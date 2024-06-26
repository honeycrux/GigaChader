/**
 * Name: Auth Utilities
 * Description: Create lucia auth object
 * Attribution: This whole file largely referenced the lucia-auth guide
 *              https://lucia-auth.com/database/prisma
 */

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { prismaClient } from "../data/db";
import { Prisma } from "@prisma/client";

const adapter = new PrismaAdapter(prismaClient.session, prismaClient.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (databaseUserAttributes) => {
        return {
            // only essential attributes
            username: databaseUserAttributes.username,
            role: databaseUserAttributes.role,
            suspended: databaseUserAttributes.suspended,
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

type DatabaseUserAttributes = Prisma.UserGetPayload<{
    select: {
        // only essential attributes
        username: true;
        role: true;
        suspended: true;
    };
}>;
