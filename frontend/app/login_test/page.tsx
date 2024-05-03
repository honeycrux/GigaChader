"use client";

import { Button } from "primereact/button";
import { logout } from "@/lib/actions/auth";
import { useAuthContext } from "@/providers/auth-provider";

// display login status, unused
function LoginTest() {
  const { user } = useAuthContext();

  if (!user) {
    console.log("Login failed");
    return (
      <>
        <p>login failed</p>
      </>
    );
  }
  console.log("user: " + JSON.stringify(user));

  return (
    <>
      <p>login success</p>
      {/* <p>name: {session?.user?.name}</p> */}
      <p>email: {user.username}</p>
      <Button onClick={() => logout()} label="Sign out" />
    </>
  );
}

export default LoginTest;
