import { PrimeReactProvider } from "primereact/api";
// import Tailwind from "primereact/passthrough/tailwind";
// import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import "./globals.css";
import "primeicons/primeicons.css";
// import "primereact/resources/themes/lara-light-teal/theme.css";
import "./theme/theme.css";
import "./theme/custom-styles.css"
import { Source_Sans_3 } from 'next/font/google'
import { AuthProvider } from "./Providers";

const sourceSans3 = Source_Sans_3({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </PrimeReactProvider>
    </html>
  );
}
