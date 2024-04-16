import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
export const testContract = c.router({
    test: {
        method: "GET",
        path: "/api/test/test",
        query: z.object({
            text: z.string(),
        }),
        responses: c.type<any>(),
        summary: "Test endpoint to test anything",
    },
});
