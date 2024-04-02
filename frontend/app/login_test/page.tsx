"use client";

import { Button } from "primereact/button";
import { logout, validateUser } from "@/lib/actions/auth";
import { use, useEffect, useState } from "react";
import { checkAuth } from "@/lib/utils";

function LoginTest() {
  const auth = checkAuth();

  if (!auth || "error" in auth) {
    console.log("Login failed");
    return (
      <>
        <p>login failed</p>
      </>
    );
  }
  console.log("user: " + JSON.stringify(auth.user));

  return (
    <>
      <p>login success</p>
      {/* <p>name: {session?.user?.name}</p> */}
      <p>email: {auth.user.username}</p>
      <Button onClick={() => logout()} label="Sign out" />
    </>
  );
}

export default LoginTest;
