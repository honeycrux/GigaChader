import { apiClient } from "../apiClient";

export async function getUserInfo() {
  const { body, status } = await apiClient.user.getInfo();
  if (status === 200) {
    if (!body) {
      return {
        error: "User not found",
      };
    }
    return body;
  } else {
    return {
      error: "Unknown server error",
    };
  }
}
