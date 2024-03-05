// construct all subroutes into one "api" route

import { userRouter } from './user'
import { initServer } from '@ts-rest/express';
import { apiContract } from '#/shared/contracts';

// construct all API routes

const s = initServer();

const apiRouter = s.router(apiContract, {
    "user": userRouter,
});

export { apiRouter }