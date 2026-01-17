import "./globals.css";
import { IntercomProvider } from "../src/components/IntercomProvider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weya",
  description: "A system-intelligence layer for capital, trust, and coordination.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Eski sınıfları (bg-zinc-900, flex, items-center vs.) sildik.
        Artık kontrol tamamen senin css dosyalarında.
      */}
      <body>
        <IntercomProvider>{children}</IntercomProvider>
      </body>
    </html>
  );
}
