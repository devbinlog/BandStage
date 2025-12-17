import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Band-Stage | 밴드 중심 공연 플랫폼",
  description:
    "밴드가 공연을 만들고 팬이 공연을 찾는 전 과정을 하나로 연결하는 공연 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 임시로 auth() 호출 제거 - 데이터베이스 연결 문제 해결 전까지
  const session = null;

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
