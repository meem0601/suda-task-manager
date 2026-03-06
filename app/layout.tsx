import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import ToastProvider from "@/src/components/common/ToastProvider";

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "須田タスク管理 - Monday.com Sidekick風",
  description: "須田様専用タスク管理システム（月額1万円クオリティ）",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "タスク管理",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#a855f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${notoSansJP.className} antialiased`}>
        <ServiceWorkerRegistration />
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
