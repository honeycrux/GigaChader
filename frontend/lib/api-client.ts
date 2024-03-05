import { initClient } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts"
import { ENV } from "./env";

export const apiClient = initClient(apiContract, {
  baseUrl: ENV.BACKEND_API_BASEURL,
  baseHeaders: {},
});