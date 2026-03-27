import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "자동 참관보고서 생성기",
  description: "EMR 또는 학생 필기를 기반으로 참관보고서를 자동 생성합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
