import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { prismaClient } from "./db";
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
            username: databaseUserAttributes.username,
            email: databaseUserAttributes.email,
            password: databaseUserAttributes.password,
            userInfo: databaseUserAttributes.userInfo,
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
        username: true;
        email: true;
        password: true;
        userInfo: true;
    };
}>;
