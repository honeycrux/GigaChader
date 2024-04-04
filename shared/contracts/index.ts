// import all contracts and merge them into one big contract

import { initContract } from "@ts-rest/core";
import { authContract } from "./auth";
import { postContract } from "./post";
import { userContract } from "./user";
import { cryptoContract } from "./crypto";

const c = initContract();
export const apiContract = c.router({
    auth: authContract,
    post: postContract,
    user: userContract,
    crypto: cryptoContract,
});
