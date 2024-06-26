/**
 * Name: Auth Routes
 * Description: Implement TS-REST subrouter for a TS-REST subcontract (Auth Contract)
 * Attribution: This file uses code from the lucia-auth guide: https://lucia-auth.com/
 *              These are explicitly stated before the pieces of code
 */

import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { lucia } from "@/lib/helpers/auth";
import { Argon2id } from "oslo/password";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prismaClient } from "@/lib/data/db";
import { z } from "zod";
import { validateUser } from "@/middlewares/auth";
import { createExpirableNotification } from "@/lib/helpers/expirables";

const s = initServer();

export const authRouter = s.router(apiContract.auth, {
    /* The following code snippet has heavy reference on an external reference on Lucia Auth: */
    /* https://github.com/lucia-auth/examples/blob/main/express/username-and-password/routes/signup.ts */
    signup: {
        handler: async ({ body, res }) => {
            const username: string | null = body.username ?? null;
            if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
                return {
                    status: 400,
                    body: {
                        error: "Invalid username",
                    },
                };
            }

            const displayName: string | null = body.displayName ?? null;
            if (!displayName) {
                return {
                    status: 400,
                    body: {
                        error: "Invalid display name",
                    },
                };
            }

            const email: string | null = body.email ?? null;
            const zodEmail = z.string().email();
            if (!email || !zodEmail.safeParse(email).success) {
                return {
                    status: 400,
                    body: {
                        error: "Invalid email",
                    },
                };
            }

            const password: string | null = body.password ?? null;
            if (!password || password.length < 6 || password.length > 255) {
                return {
                    status: 400,
                    body: {
                        error: "Invalid password",
                    },
                };
            }

            const hashedPassword = await new Argon2id().hash(password);

            // Check if username is already used
            const existingUsername = await prismaClient.user.findUnique({
                where: {
                    username: username,
                },
            });
            if (existingUsername) {
                return {
                    status: 400,
                    body: {
                        error: "Username has been chosen",
                    },
                };
            }

            // Check if email is already used
            const existingEmail = await prismaClient.user.findUnique({
                where: {
                    email: email,
                },
            });
            if (existingEmail) {
                return {
                    status: 400,
                    body: {
                        error: "Email has been chosen",
                    },
                };
            }

            try {
                const user = await prismaClient.user.create({
                    data: {
                        username: username,
                        email: email,
                        password: hashedPassword,
                        accountInfoLastUpdated: new Date(),
                        userConfig: {
                            displayName: displayName,
                        },
                        userCryptoInfo: {
                            cryptoBookmarks: [],
                            cryptoHoldings: [],
                        },
                    },
                });
                await createExpirableNotification({
                    content: "Welcome to Gigachader!",
                    receiverId: user.id,
                });

                const session = await lucia.createSession(user.id.toString(), {});
                const sessionCookie = lucia.createSessionCookie(session.id);
                res.appendHeader("Set-Cookie", sessionCookie.serialize());

                return {
                    status: 200,
                    body: {
                        success: true,
                    },
                };
            } catch (e) {
                console.log(e);
                if (e instanceof PrismaClientKnownRequestError) {
                    return {
                        status: 500,
                        body: {
                            error: `[${e.code}] ${e.message}`,
                        },
                    };
                }
                return {
                    status: 500,
                    body: {
                        error: "An unknown error occurred",
                    },
                };
            }
        },
    },

    /* The following code snippet has heavy reference on an external reference on Lucia Auth: */
    /* https://github.com/lucia-auth/examples/blob/main/express/username-and-password/routes/login.ts */
    login: {
        handler: async ({ body, res }) => {
            const email: string | null = body.email ?? null;
            const password: string | null = body.password ?? null;

            const existingUser = await prismaClient.user.findUnique({
                select: {
                    id: true,
                    suspended: true,
                    password: true,
                },
                where: {
                    email: email,
                },
            });

            if (!existingUser || existingUser.suspended) {
                // NOTE:
                // Returning immediately allows malicious actors to figure out valid usernames from response times,
                // allowing them to only focus on guessing passwords in brute-force attacks.
                // As a preventive measure, you may want to hash passwords even for invalid usernames.
                // However, valid usernames can be already be revealed with the signup page among other methods.
                // It will also be much more resource intensive.
                // Since protecting against this is none-trivial,
                // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
                // If usernames are public, you may outright tell the user that the username is invalid.
                return {
                    status: 400,
                    body: {
                        error: "Invalid email or password",
                    },
                };
            }

            const validPassword = await new Argon2id().verify(existingUser.password, password);
            if (!validPassword) {
                return {
                    status: 400,
                    body: {
                        error: "Invalid email or password",
                    },
                };
            }

            const session = await lucia.createSession(existingUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            res.appendHeader("Set-Cookie", sessionCookie.serialize());
            return {
                status: 200,
                body: {
                    success: true,
                },
            };
        },
    },

    /* The following code snippet has heavy reference on an external reference on Lucia Auth: */
    /* https://github.com/lucia-auth/examples/blob/main/express/username-and-password/routes/logout.ts */
    logout: {
        middleware: [validateUser],
        handler: async ({ res }) => {
            if (!res.locals.session) {
                return {
                    status: 401,
                    body: {
                        success: true,
                    },
                };
            }
            await lucia.invalidateSession(res.locals.session.id);
            res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
            return {
                status: 200,
                body: {
                    success: true,
                },
            };
        },
    },

    validate: {
        middleware: [validateUser],
        handler: async ({ res }) => {
            if (!res.locals.session || !res.locals.user) {
                return {
                    status: 401,
                    body: {
                        session: null,
                        user: null,
                    },
                };
            }
            return {
                status: 200,
                body: {
                    session: res.locals.session,
                    user: res.locals.user,
                },
            };
        },
    },
});
