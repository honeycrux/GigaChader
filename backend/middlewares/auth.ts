// src/middleware.ts
import { Request, Response, NextFunction } from "express";
import { lucia } from "@/lib/auth";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";

/* App-level middleware */
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

/* App-level middleware */
export async function validateUser(req: Request, res: Response, next: NextFunction) {
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

/* App-level middleware */
export function createLog(req: Request, res: Response, next: NextFunction) {
    console.log("[middleware] createLog");
    res.on("finish", function () {
        console.log(req.method, decodeURI(req.url), res.statusCode, res.statusMessage);
    });
    next();
}

declare global {
    namespace Express {
        interface Locals {
            user: User | null;
            session: Session | null;
        }
    }
}
