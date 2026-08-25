import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "Apex-HR",
  description: "An HR leave management app",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${plexMono.variable} antialiased`}
      >
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </body>
    </html>
  );
}
