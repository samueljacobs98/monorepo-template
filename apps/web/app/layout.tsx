import type { ReactNode } from "react";
import { Geist_Mono, Public_Sans } from "next/font/google";
import "@frontend/ui/globals.css";
import { cn } from "@frontend/ui/lib/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClientProvider, ThemeProvider } from "@/lib/state/providers";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        publicSans.variable
      )}
    >
      <body>
        <QueryClientProvider>
          <NuqsAdapter>
            <ThemeProvider>{children}</ThemeProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </body>
    </html>
  );
}
