import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { prismaClient } from "./db";

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
            displayName: databaseUserAttributes.displayName,
            email: databaseUserAttributes.email,
            password: databaseUserAttributes.password,
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
    displayName: string;
    email: string;
    password: string;
}
