"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";

type TabSelectValue = "Home" | "Search" | "Discover" | "Global" | "Activity" | "Profile" | "Bookmarks" | "Crypto";

const LeftSidebar = () => {
  const [selectedButton, setSelectedButton] = useState<TabSelectValue | "">("");
  const pathname = usePathname();
  const router = useRouter();

  const { user, userInfo } = useAuthContext();
  const [bIsGuest, setbIsGuest] = useState(true);

  // check if user is logged in
  useEffect(() => {
    const wrapper = async () => {
      if (!user) {
        setbIsGuest(true);
      } else {
        setbIsGuest(false);
      }
    };

    wrapper();
  }, [user]);

  useEffect(() => {
    if (pathname.includes("home")) {
      setSelectedButton("Home");
    } else if (pathname.includes("search")) {
      setSelectedButton("Search");
    } else if (pathname.includes("discover")) {
      setSelectedButton("Discover");
    } else if (pathname.includes("global")) {
      setSelectedButton("Global");
    } else if (pathname.includes("activity")) {
      setSelectedButton("Activity");
    } else if (pathname.includes("profile")) {
      setSelectedButton("Profile");
    } else if (pathname.includes("bookmarks")) {
      setSelectedButton("Bookmarks");
    } else if (pathname.includes("crypto")) {
      setSelectedButton("Crypto");
    } else {
      // setSelectedButton("");
    }
  }, [pathname]); // Re-run the effect when `pathname` changes

  return (
    <>
      {/* sidebar start */}
      <aside className="flex flex-col bg-orange2 w-60 px-4 py-2 overflow-y-auto overflow-x-hidden">
        {bIsGuest && (
          <button
            className="flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg text-black border-2 border-orange1"
            onClick={() => {
              router.push("/");
            }}
          >
            <i className="pi pi-sign-in text-2xl"></i>
            <span className="ml-3 text-2xl">Login</span>
          </button>
        )}

        {!bIsGuest && (
          <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Home" ? "bg-orange1 text-white" : " text-black"}`}
            onClick={() => {
              setSelectedButton("Home");
              router.push("/home");
            }}
          >
            <i className="pi pi-home text-2xl"></i>
            <span className="ml-3 text-2xl">Home</span>
          </button>
        )}

        <button
          className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Global" ? "bg-orange1 text-white" : " text-black"}`}
          onClick={() => {
            setSelectedButton("Global");
            router.push("/global");
          }}
        >
          <i className=" pi pi-globe text-2xl"></i>
          <span className="ml-3 text-2xl">Global</span>
        </button>

        <button
          className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Discover" ? "bg-orange1 text-white" : " text-black"}`}
          onClick={() => {
            setSelectedButton("Discover");
            router.push("/discover");
          }}
        >
          <i className=" pi pi-compass text-2xl"></i>
          <span className="ml-3 text-2xl">Discover</span>
        </button>

        <button
          className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Search" ? "bg-orange1 text-white" : " text-black"}`}
          onClick={() => {
            setSelectedButton("Search");
            router.push("/search");
          }}
        >
          <i className="pi pi-search text-2xl"></i>
          <span className="ml-3 text-2xl">Search</span>
        </button>

        {!bIsGuest && (
          <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Activity" ? "bg-orange1 text-white" : " text-black"}`}
            onClick={() => {
              setSelectedButton("Activity");
              router.push("/activity");
            }}
          >
            <i className="pi pi-bell text-2xl"></i>
            <span className="ml-3 text-2xl">Activity</span>
            {userInfo && userInfo.unreadNotificationCount > 0 ? (
              <>
                <i className="pi ml-4 pi-circle-fill text-xs text-blue-500"></i>
                <span className="ml-1 text-xl font-bold text-blue-500">{userInfo.unreadNotificationCount}</span>
              </>
            ) : null}
          </button>
        )}

        {!bIsGuest && (
          <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Profile" ? "bg-orange1 text-white" : " text-black"}`}
            onClick={() => {
              setSelectedButton("Profile");
              router.push("/profile");
            }}
          >
            <i className="pi pi-user text-2xl"></i>
            <span className="ml-3 text-2xl">Profile</span>
          </button>
        )}

        {!bIsGuest && (
          <button
            className={`-translate-x-[2px] flex items-center my-2 w-fit pr-2 py-2 h-14 pl-5 rounded-lg ${
              selectedButton === "Bookmarks" ? "bg-orange1 text-white" : " text-black"
            }`}
            onClick={() => {
              setSelectedButton("Bookmarks");
              router.push("/bookmarks");
            }}
          >
            <i className="pi pi-bookmark text-2xl"></i>
            <span className="ml-3 text-2xl">Bookmarks</span>
          </button>
        )}

        {!bIsGuest && (
          <button
            className={`flex items-center my-2 w-full py-2 h-14 pl-5 rounded-lg ${selectedButton === "Crypto" ? "bg-orange1 text-white" : " text-black"}`}
            onClick={() => {
              setSelectedButton("Crypto");
              router.push("/crypto");
            }}
          >
            <i className=" pi pi-bitcoin text-2xl"></i>
            <span className="ml-3 text-2xl">Crypto</span>
          </button>
        )}
      </aside>

      {/* sidebar end */}
    </>
  );
};

export default LeftSidebar;
