import { initClient } from "@ts-rest/core";
import { apiContract } from "#/shared/contracts";

export const apiClient = initClient(apiContract, {
  // baseUrl: `${process.env.BACKEND_URL}/${process.env.BACKEND_PROXY}`,
  baseUrl: `http://localhost:3000/backend`,
  baseHeaders: {},
});
