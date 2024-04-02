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
    };
}>;
