import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI 케어브릿지 - 부모님 돌봄 원스톱 지원 서비스",
  description: "AI 에이전트가 장기요양등급 신청부터 맞춤형 복지서비스 연계, 요양시설 탐색, 가족 돌봄 일정 조율까지 모든 과정을 자연어 대화 한 번으로 원스톱 지원하는 서비스입니다.",
  keywords: ["AI 케어브릿지", "돌봄", "장기요양", "복지서비스", "AI 에이전트"],
  authors: [{ name: "박용환" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
