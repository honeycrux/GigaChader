import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";

const s = initServer();

const postRouter = s.router(apiContract.post, {});

export { postRouter };
