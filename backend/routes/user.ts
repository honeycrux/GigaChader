import { initServer } from '@ts-rest/express';
import { apiContract } from '#/shared/contracts';

const s = initServer();

const userRouter = s.router(apiContract.user, {

});

export { userRouter }