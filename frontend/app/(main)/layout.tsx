import { PrimeReactProvider } from "primereact/api";
import "@/app/globals.css"
import "primeicons/primeicons.css";
import "@/app/theme/theme.css";
import "@/app/theme/custom-styles.css";
import { Source_Sans_3 } from "next/font/google";
import HeaderNavbar from "@/components/home/HeaderNavbar";
import LeftSidebar from "@/components/home/LeftSidebar";

const sourceSans3 = Source_Sans_3({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const style = document.createElement('style')
              style.innerHTML = '@layer tailwind-base, primereact, tailwind-utilities;'
              style.setAttribute('type', 'text/css')
              document.querySelector('head').prepend(style)
            `,
          }}
        />
      </head>
      <PrimeReactProvider>
        <body className={sourceSans3.className}>
        {/* force page size to fit screen */}
          <div className='w-screen h-screen'>
            {/* define size of area below navbar */}
            <HeaderNavbar />
            <div className='flex h-[calc(100%-4rem)]'>
                <LeftSidebar />
                <div className="flex flex-col w-full items-center">
                  {children}
                </div>
            </div>
          </div>
        </body>
      </PrimeReactProvider>
    </html>
  );
}
