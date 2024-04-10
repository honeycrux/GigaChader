import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
export const testContract = c.router({
    upload: {
        method: "POST",
        path: "/api/test/upload",
        contentType: "multipart/form-data",
        body: c.type<{ media: File[] }>(),
        responses: {
            200: z.object({
                urls: z.array(z.string()),
            }),
        },
        summary: "Test endpoint for image upload",
    },

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
