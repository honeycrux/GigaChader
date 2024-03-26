import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
export const postContract = c.router({
    // example:
    // getPosts: {
    //   method: 'GET',
    //   path: '/api/user/posts',
    //   responses: {
    //     200: c.type<string>(),
    //   },
    // },
});
