import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { StarfieldCanvas } from "@/components/shell/StarfieldCanvas";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cTRNG Raffle — Verifiable Space Randomness Campaigns",
  description: "Provably fair off-chain drawings powered by SpaceComputer cTRNG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="w-full h-full bg-space-950 text-slate-200 relative overflow-hidden m-0 p-0">
        {/* Global Space Atmosphere Backdrop */}
        <div className="nebula-bg" />
        <div className="cyber-grid" />
        <StarfieldCanvas />

        {/* Global HUD Guide Rails */}
        <div className="hud-rail-left" />
        <div className="hud-rail-right" />

        <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
