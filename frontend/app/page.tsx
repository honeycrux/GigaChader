"use client";

import LoginBox from "@/components/authentication/LoginBox";
import LogoSideBar from "@/components/authentication/LogoSideBar";
import { getUserInfo } from "@/lib/actions/user";
import { useAuthContext } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Login = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const wrapper = async () => {
      const userinfo = await getUserInfo();
      if (user && !("error" in userinfo)) {
        // logged in users
        router.push("/home");
      }
    };

    wrapper();
  }, [user, router]);

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
