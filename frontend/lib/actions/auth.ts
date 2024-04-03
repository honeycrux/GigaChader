import { apiClient } from "../apiClient";

export async function signup(props: { username: string; displayName: string; email: string; password: string }) {
  const { body, status } = await apiClient.auth.signup({
    body: {
      username: props.username,
      displayName: props.displayName,
      email: props.email,
      password: props.password,
    },
  });
  if (status === 200) {
    return true;
  } else if (status === 400 || status === 500) {
    return {
      error: body.error,
    };
  } else {
    return {
      error: "Unknown server error",
    };
  }
}

export async function login(props: { email: string; password: string }) {
  const { body, status } = await apiClient.auth.login({
    body: {
      email: props.email,
      password: props.password,
    },
  });
  if (status === 200) {
    return true;
  } else if (status === 400 || status === 500) {
    return {
      error: body.error,
    };
  } else {
    return {
      error: "Unknown server error",
    };
  }
}

export async function logout() {
  const { status } = await apiClient.auth.logout({
    body: {},
  });
  if (status === 200) {
    return true;
  } else {
    return {
      error: "Unknown server error",
    };
  }
}

export async function validateUser() {
  const { body, status } = await apiClient.auth.validate();
  if (status === 200) {
    return body;
  } else if (status === 401) {
    return {
      error: "Failed user validation",
    };
  } else {
    return {
      error: "Unknown server error",
    };
  }
}
