"use client";

import { login, logout, validateUser } from "@/lib/actions/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextProviderProps = {
  children: React.ReactNode;
};

type ValidateUserResponse = Exclude<
  Awaited<ReturnType<typeof validateUser>>,
  {
    error: string;
  }
>;

type IAuthContext = {
  user: ValidateUserResponse["user"] | null;
  session: ValidateUserResponse["session"] | null;
  login: (props: { email: string; password: string }) => ReturnType<typeof login>;
  logout: () => ReturnType<typeof logout>;
  print: () => void;
};

const lsUserKey = "auth-context/user";
const lsSessionKey = "auth-context/session";

const AuthContext = createContext<IAuthContext | null>(null);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<ValidateUserResponse["user"] | null>(null);
  const [session, setSession] = useState<ValidateUserResponse["session"] | null>(null);

  useEffect(() => {
    // hydrate on mount
    const user = localStorage.getItem(lsUserKey);
    const session = localStorage.getItem(lsSessionKey);
    if (user && session) {
      try {
        const userobj = JSON.parse(user);
        const sessionobj = JSON.parse(session);
        setUser(userobj);
        setSession(sessionobj);
      } catch (error) {
        console.log("Malformed user/session stored keys:", error, user, session);
        localStorage.removeItem(lsUserKey);
        localStorage.removeItem(lsSessionKey);
      }
    }
  }, []);

  const loginHandler = async (props: { email: string; password: string }) => {
    const response = await login({ email: props.email, password: props.password });
    if (response === true) {
      const validate = await validateUser();
      if (!("error" in validate)) {
        setUser(validate.user);
        setSession(validate.session);
        localStorage.setItem(lsUserKey, JSON.stringify(validate.user));
        localStorage.setItem(lsSessionKey, JSON.stringify(validate.session));
      }
    }

    return response;
  };

  const logoutHandler = async () => {
    const response = await logout();
    if (response === true) {
      setUser(null);
      setSession(null);
      localStorage.removeItem(lsUserKey);
      localStorage.removeItem(lsSessionKey);
    }

    return response;
  };

  const printHandler = async () => {
    console.log(user);
    console.log(session);
  };

  const store = {
    user,
    session,
    login: loginHandler,
    logout: logoutHandler,
    print: printHandler,
  };

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthContextProvider");
  }
  return context;
}
