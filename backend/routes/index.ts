// construct all subroutes into one "api" route

import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { authRouter } from "./auth";
import { postRouter } from "./post";
import { userRouter } from "./user";
import { cryptoRouter } from "./crypto";
import { uploadRouter } from "./upload";
import { testRouter } from "./test";

// construct all API routes

const s = initServer();

const apiRouter = s.router(apiContract, {
    auth: authRouter,
    post: postRouter,
    user: userRouter,
    crypto: cryptoRouter,
    upload: uploadRouter,
    test: testRouter,
});

export { apiRouter };
