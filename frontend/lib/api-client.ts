import { initClient } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts"

export const apiClient = initClient(apiContract, {
  baseUrl: process.env.BACKEND_API_BASEURL,
  baseHeaders: {},
});