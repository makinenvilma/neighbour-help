import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neighbour Help",
  description: "Community notice board",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-dvh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-inherit flex`}>
        <Navbar />
        <main className="flex-1 ml-56 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
