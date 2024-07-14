import "@/app/globals.css";
import "primeicons/primeicons.css";
import "@/app/theme/theme.css";
import "@/app/theme/custom-styles.css";
import HeaderNavbar from "@/components/home/HeaderNavbar";
import LeftSidebar from "@/components/home/LeftSidebar";
import RightSidebar from "@/components/home/RightSidebar";
// import { Button } from "primereact/button";

// define general layout with HeaderNavbar on top, LeftSidebar on left, and main content in the middle
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen">
      {/* define size of area below navbar */}
      <HeaderNavbar />
      <div className="flex h-[calc(100%-4rem)]">
        <LeftSidebar />
        <div className="flex flex-col w-full items-center">{children}</div>
      </div>

       {/* righ sidebar start */}
       <div className="fixed bottom-4 right-5">
        <RightSidebar/>
      </div>
      {/* right sidebar end */}
    </div>
  );
}
