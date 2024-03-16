"use client";
import { Button } from 'primereact/button';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

const login_test = () => {

  const { data: session } = useSession();

  console.log("user: " + JSON.stringify(session?.user));

  return (
    <>
    <p>login success</p>
    {/* <p>name: {session?.user?.name}</p> */}
    <p>email: {session?.user?.email}</p>
    <Button onClick={() => signOut()} label="Sign out" />
    </>
  )
}

export default login_test