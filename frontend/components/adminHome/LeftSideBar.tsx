"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// sidebar for admin home page
type TabSelectValue = "User Management" | "Post Management";

const LeftSideBar = () => {
  const [selectedButton, setSelectedButton] = useState<TabSelectValue>();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.includes("manage-user")) {
      setSelectedButton("User Management");
    } else if (pathname.includes("manage-post")) {
      setSelectedButton("Post Management");
    }
  }, [pathname]); // Re-run the effect when `pathname` changes

  return (
    <>
      {/* sidebar start */}
      <aside className="flex flex-col bg-orange2 w-60 px-4 py-2 overflow-y-auto">
        <button
          className={`flex items-center my-2 w-full py-2 h-16 pl-5 rounded-lg ${
            selectedButton === "User Management" ? "bg-orange1 text-white" : " text-black"
          }`}
          onClick={() => {
            setSelectedButton("User Management");
            router.push("/admin/manage-user");
          }}
        >
          <i className="pi pi-user-edit text-2xl"></i>
          <span className="ml-3 text-2xl">User management</span>
        </button>
        <button
          className={`flex items-center my-4 w-full py-2 h-16 pl-5 rounded-lg ${
            selectedButton === "Post Management" ? "bg-orange1 text-white" : " text-black"
          }`}
          onClick={() => {
            setSelectedButton("Post Management");
            router.push("/admin/manage-post");
          }}
        >
          <i className="pi pi-comments text-2xl"></i>
          <span className="ml-3 text-2xl">Post management</span>
        </button>
      </aside>

      {/* sidebar end */}
    </>
  );
};

export default LeftSideBar;
