import "@/app/globals.css";
import "primeicons/primeicons.css";
import "@/app/theme/theme.css";
import "@/app/theme/custom-styles.css";

import LeftSideBar from "@/components/adminHome/LeftSideBar";
import HeaderNavBar from "@/components/home/HeaderNavbar";

// define general layout with HeaderNavbar on top, LeftSidebar on left, and main content in the middle
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen">
      {/* define size of area below navbar */}
      {/* set bUseAdmin to true to show the admin word in the navbar */}
      <HeaderNavBar bUseAdmin={true} />
      <div className="flex h-[calc(100%-4rem)]">
        <LeftSideBar />
        <div className="flex w-[calc(100%-15rem)] justify-center">{children}</div>
      </div>
    </div>
  );
}
