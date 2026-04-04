import type { Metadata } from "next";
import { Jua, Gaegu } from "next/font/google";
import localFont from "next/font/local";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
  display: "swap",
});

const gaegu = Gaegu({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-gaegu",
  display: "swap",
});

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
  variable: "--font-pretendard",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

export const metadata: Metadata = {
  title: "낙서왕 ✏️ 선생님 몰래 낙서 배틀!",
  description: "고등학교 교실에서 선생님 몰래 낙서하는 멀티플레이어 웹 게임",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zoom during drawing
  },
  themeColor: "#faf6e8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "낙서왕",
  },
  openGraph: {
    title: "낙서왕 ✏️",
    description: "선생님 몰래 낙서 배틀! 친구들과 함께하는 멀티플레이어 드로잉 게임",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jua.variable} ${gaegu.variable} ${pretendard.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#faf6e8] text-[#333] font-pretendard">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
