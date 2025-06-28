import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { SocketProvider } from "../lib/WebSocketContext";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "VibeSync",
  description: "Chat in groups with your friends and listen music together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]`}
      >
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
