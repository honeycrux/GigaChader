"use client";

import LoginBox from "@/components/authentication/LoginBox";
import LogoSideBar from "@/components/authentication/LogoSideBar";

const login = () => {
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

export default login;
