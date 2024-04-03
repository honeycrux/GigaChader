import { initServer } from "@ts-rest/express";
import { apiContract } from "#/shared/contracts";
import { protectRoute } from "@/middlewares/auth";
import { getPersonalUserInfo, getUserProfile } from "@/lib/user/user";

const s = initServer();

const userRouter = s.router(apiContract.user, {
    getInfo: {
        middleware: [protectRoute.user],
        handler: async ({ res }) => {
            const userinfo = await getPersonalUserInfo({ username: res.locals.user!.username });
            console.log("handler getInfo");
            return {
                status: 200,
                body: userinfo,
            };
        },
    },
    getProfile: {
        handler: async ({ params: { username } }) => {
            const userinfo = await getUserProfile({ username });
            return {
                status: 200,
                body: userinfo,
            };
        },
    },
});

export { userRouter };
