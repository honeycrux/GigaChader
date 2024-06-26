/**
 * Name: Auth Middlewares
 * Description: Provide middlewares to facilitate user authentication and authorization
 * Attribution: This file uses code from the lucia-auth guide: https://lucia-auth.com/
 *              These are explicitly stated before the pieces of code
 */

import { Request, Response, NextFunction } from "express";
import { lucia } from "@/lib/helpers/auth";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";
import { Role } from "@prisma/client";

/* App-level middleware to enforce CSRF protection for security */
export async function csrfProtection(req: Request, res: Response, next: NextFunction) {
    console.log("[middleware] csrfProtection");
    if (req.method === "GET") {
        return next();
    }
    const originHeader = req.headers.origin ?? null;
    // NOTE: You may need to use `X-Forwarded-Host` instead
    const hostHeader = req.headers.host ?? null;
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [process.env.BACKEND_URL, process.env.FRONTEND_URL])) {
        return res.status(403).end();
    }
    return next();
}

/* Route-level middleware - populates user information in res.locals */
/* The following code snippet has heavy reference on an external reference on Lucia Auth: */
/* https://lucia-auth.com/guides/validate-session-cookies/ */
export async function validateUser(req: Pick<Request, "headers">, res: Pick<Response, "locals" | "appendHeader">, next: NextFunction) {
    console.log("[middleware] validateUser");
    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
    if (!sessionId) {
        res.locals.user = null;
        res.locals.session = null;
        return next();
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
        res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
    }
    if (!session) {
        res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
    }
    res.locals.user = user;
    res.locals.session = session;
    return next();
}

/* Route-level middleware - authorize or block with 403 (forbidden) for protected routes - add when necessary */
function protectionFunction(restrictionLevel: Role, allowedRoles: Role[]) {
    return async (req: any, res: Pick<Response, "status" | "json" | "end" | "locals" | "appendHeader">, next: NextFunction) => {
        await validateUser(req, res, function () {
            const result = (res: string) => `[middleware] protectRoute level=${restrictionLevel} result=${res}`;
            if (!res.locals.user || !res.locals.session || res.locals.user.suspended || allowedRoles.indexOf(res.locals.user.role) === -1) {
                console.log(result("failed"));
                return res
                    .status(401)
                    .json({
                        error: "Unauthorized",
                    })
                    .end();
            }
            console.log(result("success"));
            return next();
        });
    };
}

// To get a specific authorization middleware, use this object (e.g. protectRoute.admin)
export const protectRoute = {
    admin: protectionFunction("ADMIN", ["ADMIN"]),
    verified_user: protectionFunction("VERIFIED_USER", ["ADMIN", "VERIFIED_USER"]),
    user: protectionFunction("USER", ["ADMIN", "VERIFIED_USER", "USER"]),
};

declare global {
    namespace Express {
        interface Locals {
            user: User | null;
            session: Session | null;
        }
    }
}
