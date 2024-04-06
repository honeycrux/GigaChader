import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
export const testContract = c.router({
    upload: {
        method: "POST",
        path: "/api/test/upload",
        body: null,
        responses: {
            200: z.object({
                urls: z.array(z.string()),
            }),
        },
        summary: "Test endpoint for image upload",
    },
});
