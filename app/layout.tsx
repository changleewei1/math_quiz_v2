import type { Metadata } from "next";
import { Inter, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { getBrandSettings } from "@/lib/brandSettings";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});
const notoSerifTC = Noto_Serif_TC({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "題庫系統 v2",
  description: "數學與理化練習系統",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 取得品牌設定（使用 server-side）
  // 使用 try-catch 確保即使資料庫錯誤也不會導致整個 layout 崩潰
  let brandSettings;
  try {
    brandSettings = await getBrandSettings();
  } catch (error) {
    console.error('載入品牌設定失敗，使用預設值:', error);
    brandSettings = {
      id: 'default',
      brand_name: '名貫補習班',
      logo_url: '/Black and White Circle Business Logo.png',
      font_family: 'var(--font-noto-serif-tc), serif',
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <html lang="zh-TW">
      <body 
        className={`${inter.variable} ${notoSerifTC.variable}`}
        style={{ fontFamily: brandSettings.font_family }}
      >
        {children}
      </body>
    </html>
  );
}


