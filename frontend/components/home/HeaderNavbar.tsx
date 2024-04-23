"use client";

import { Image } from "primereact/image";
import { useEffect, useRef, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";

interface Props {
  bUseAdmin?: boolean;
}

const HeaderNavbar = (props: Props) => {
  const { bUseAdmin } = props;

  const { user, userInfo, logout, refreshUserInfo } = useAuthContext();
  const pathname = usePathname();
  const op = useRef(null);
  const toast = useRef<Toast>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const router = useRouter();
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");

  useEffect(() => {
    if (!userInfo) {
      setDisplayName("guest");
    } else {
      setDisplayName(userInfo.userConfig.displayName);
      if (userInfo.userConfig.avatarUrl) {
        setProfilePicUrl(userInfo.userConfig.avatarUrl);
      }
      console.log("from HeaderNavbar");
      console.log(userInfo);
    }
  }, [userInfo]);

  useEffect(() => {
    refreshUserInfo();
  }, [pathname, refreshUserInfo]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const handleJump = (route: string) => {
    router.push(route);
  };

  return (
    <>
      <Toast ref={toast}></Toast>
      <OverlayPanel ref={op}>
        <div className="flex flex-col gap-2">
          {user?.role === "ADMIN" ? (
            bUseAdmin ? (
              <Button label="Leave Admin Panel" onClick={() => handleJump("/home")} className="whitespace-nowrap" />
            ) : (
              <Button label="Admin Panel" onClick={() => handleJump("/admin")} className="whitespace-nowrap" />
            )
          ) : null}
          <Button label="Logout" onClick={handleLogout} className="whitespace-nowrap" />
        </div>
      </OverlayPanel>
      {/* header start */}
      <nav className="flex bg-orange2 h-16 items-center space-x-2 justify-between px-4">
        <a className="flex items-center space-x-2" href="/home">
          <Image src="/gigachader_notext.png" alt="gigachad logo" width="50" />
          {bUseAdmin ? (
            <div className="space-x-1">
              <span className="text-xl font-bold">GigaChader</span>
              <span className="text-xl font-light">Admin</span>
            </div>
          ) : (
            <span className="text-xl font-bold">GigaChader</span>
          )}
        </a>

        {user && (
          <button
            className="flex items-center space-x-2 
          transition duration-300 ease-in-out hover:bg-[hsl(40,32%,71%)] 
          rounded-md p-2"
            onClick={(e) => (op.current as OverlayPanel | null)?.toggle(e)}
          >
            <Image
              src={(profilePicUrl && process.env.NEXT_PUBLIC_BACKEND_URL + profilePicUrl) || "/placeholder_profilePic_white-bg.jpg"}
              alt="user profile pic"
              pt={{
                image: { className: "rounded-full object-cover h-14 w-14" },
              }}
            />
            <span>{displayName}</span>
          </button>
        )}
      </nav>
      {/* header end */}
    </>
  );
};

export default HeaderNavbar;
