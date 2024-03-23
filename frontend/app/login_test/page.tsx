"use client";

import { Button } from "primereact/button";
import { logout, validateUser } from "@/lib/actions/auth";
import { use } from "react";

function LoginTest() {
  const auth = use(validateUser());

  if ("error" in auth) {
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
      <p>email: {auth.user.email}</p>
      <Button onClick={() => logout()} label="Sign out" />
    </>
  );
}

export default LoginTest;
