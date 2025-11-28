import "./globals.css";

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
