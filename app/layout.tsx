import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { UserProvider } from "./context/UserContext";
import '../app/lib/initAdmin'; // Admin başlatma kodu

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LoveTree - İlişkinizi Yeşertin",
  description: "Anılarınızı ve özel anlarınızı sevdiğinizle paylaşın",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <UserProvider>
            {children}
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
