// import all contracts and merge them into one big contract

import { initContract } from "@ts-rest/core";
import { authContract } from "./auth";
import { postContract } from "./post";
import { userContract } from "./user";
import { cryptoContract } from "./crypto";
import { uploadContract } from "./upload";
import { testContract } from "./test";
import { adminContract } from "./admin";
import { trendsContract } from "./trends";

const c = initContract();
export const apiContract = c.router({
    auth: authContract,
    post: postContract,
    user: userContract,
    crypto: cryptoContract,
    upload: uploadContract,
    admin: adminContract,
    trends: trendsContract,
    test: testContract,
});
