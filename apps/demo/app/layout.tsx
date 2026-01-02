import "./globals.css";
import { IntercomProvider } from "../src/components/IntercomProvider";
import "./avatar-styles.css";

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
