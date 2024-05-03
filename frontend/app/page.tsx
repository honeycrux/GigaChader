"use client";

import LoginBox from "@/components/authentication/LoginBox";
import LogoSideBar from "@/components/authentication/LogoSideBar";
import { useAuthContext } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// root page is login page
const Login = () => {
  const { user, userInfo, refreshUserInfo } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // fetch user info on load

    const wrapper = async () => {
      await refreshUserInfo();
    };

    wrapper();
  }, [refreshUserInfo]);

  useEffect(() => {
    if (user && userInfo) {
      // logged in users are redirected to home page
      router.push("/home");
    }
  }, [user, userInfo, router]);

  return (
    <>
      <div className="flex">
        {/* left container */}
        <LogoSideBar />
        {/* right container */}
        <LoginBox />
      </div>
    </>
  );
};

export default Login;
