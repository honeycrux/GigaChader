import { PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import "./globals.css";
import "primeicons/primeicons.css";

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
      <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
        <body>
          <ThemeSwitcher />
          {children}
        </body>
      </PrimeReactProvider>
    </html>
  );
}
