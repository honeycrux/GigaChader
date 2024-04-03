import { initClient } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts";
import axios from "axios";

// this is a TS-REST client, which provides strong type safety for all requests and responses
// it provides all the request/response types immediately and is used without typing the path
// e.g. apiClient.user.getInfo(...)
export const apiClient = initClient(apiContract, {
  baseUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PROXY}`,
  baseHeaders: {},
});

// axios provides an alternative way to call APIs
// there is no type check for the requests and responses
// but you may optionally get types for responses by infering them from the apiContract
// e.g. axiosInstance.get<ServerInferResponseBody<typeof apiContract.user.getInfo>>("/api/user/info")
export const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PROXY}`,
});
