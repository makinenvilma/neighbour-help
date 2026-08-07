import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Koto",
  description: "Community notice board",
};

// The sidebar lives in AppShell rather than here, so the community layout can
// pass it the community being viewed.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-dvh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-inherit flex`}>
        {children}
      </body>
    </html>
  );
}
