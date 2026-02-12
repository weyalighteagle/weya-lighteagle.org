import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Weya",
  description:
    "A system-intelligence layer for capital, trust, and coordination.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      <body>{children}</body>
    </html>
  );
}
