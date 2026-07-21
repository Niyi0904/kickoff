import type { Metadata } from "next";
import { Geist, Geist_Mono, Teko, Inter } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "./RootLayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Teko — display typeface for league names, big numbers, scoreboard
// Chosen for its semi-condensed, signage-ready character that evokes
// African stadium scoreboards and hand-painted Lagos match posters.
const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Inter — clean, highly legible body face with real tabular figures
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KICKOFF - Team Management",
  description: "Manage your teams, players, and match records with KICKOFF",
  icons: {
    icon: "/kickoff-logo-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${teko.variable} ${inter.variable} antialiased`}
      >
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}

// Sidebar is a client component; imported directly above and rendered inside AppDataProvider