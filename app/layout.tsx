import type { Metadata } from "next";
import { Inter, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const notoSerifTC = Noto_Serif_TC({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-tc",
});

export const metadata: Metadata = {
  title: "國一數題庫系統 v2",
  description: "一元一次方程式練習系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} ${notoSerifTC.variable}`}>{children}</body>
    </html>
  );
}


