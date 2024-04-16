import { apiContract } from "#/shared/contracts";
import { analysePostContent } from "@/lib/helpers/textual";
import { initServer } from "@ts-rest/express";

const s = initServer();

export const testRouter = s.router(apiContract.test, {
    test: {
        handler: async ({ query: { text } }) => {
            const payload = await analysePostContent({ content: text });
            return {
                status: 200,
                body: payload,
            };
        },
    },
});
