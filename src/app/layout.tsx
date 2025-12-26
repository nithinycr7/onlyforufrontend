import type { Metadata, Viewport } from "next";
import { Noto_Sans, Inter } from "next/font/google";
import "./globals.css";

// Existing font configurations...
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#667eea",
};

export const metadata: Metadata = {
  title: "OnlyForU - Connect with Creators",
  description: "Connect with creators. Resolve your queries. Join exclusive communities.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OnlyForU",
  },
};

import ClientLayout from "@/components/layout/ClientLayout";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${inter.variable}`}>
        <AuthProvider>
          <div className="app-container">
            <ClientLayout>
              {children}
            </ClientLayout>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
