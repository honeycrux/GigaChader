/**
 * Name: Routes (Main)
 * Description: Construct all TS-REST subrouters into one "API router"
 */

import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { authRouter } from "./auth";
import { postRouter } from "./post";
import { userRouter } from "./user";
import { cryptoRouter } from "./crypto";
import { uploadRouter } from "./upload";
import { testRouter } from "./test";
import { adminRouter } from "./admin";
import { trendsRouter } from "./trends";

// construct all API routes

const s = initServer();

const apiRouter = s.router(apiContract, {
    auth: authRouter,
    post: postRouter,
    user: userRouter,
    crypto: cryptoRouter,
    upload: uploadRouter,
    admin: adminRouter,
    trends: trendsRouter,
    test: testRouter,
});

export { apiRouter };
