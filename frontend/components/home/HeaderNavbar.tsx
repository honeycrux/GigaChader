"use client";

import { logout } from "@/lib/actions/auth";
import { Image } from "primereact/image";
import { useEffect, useRef, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { checkAuth } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { axiosClient } from "@/lib/apiClient";

const HeaderNavbar = () => {
  const auth = checkAuth();
  const op = useRef(null);
  const toast = useRef<Toast>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const wrapper = async () => {
      if (!auth || "error" in auth) {
        setDisplayName("guest");
      } else {
        const userinfo = await axiosClient.get("/api/user/info");
        // console.log(userinfo);
        setDisplayName(userinfo.data.userConfig.displayName);
      }
    };

    wrapper();
  }, [auth]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <>
      <Toast ref={toast}></Toast>
      <OverlayPanel ref={op}>
        <Button label="Logout" onClick={handleLogout} />
      </OverlayPanel>
      {/* header start */}
      <nav className="flex bg-orange2 h-16 items-center space-x-2 justify-between px-4">
        <a className="flex items-center space-x-2" href="/home">
          <Image src="/gigachader_notext.png" alt="gigachad logo" width="50" />
          <span className="text-xl font-bold">GigaChader</span>
        </a>

        <button
          className="flex items-center space-x-2 
          transition duration-300 ease-in-out hover:bg-[hsl(40,32%,71%)] 
          rounded-md p-2"
          onClick={(e) => (op.current as OverlayPanel | null)?.toggle(e)}
        >
          <Image src="/placeholder_profilePic.png" alt="user profile pic" width="50" />
          <span>{displayName}</span>
        </button>
      </nav>
      {/* header end */}
    </>
  );
};

export default HeaderNavbar;
