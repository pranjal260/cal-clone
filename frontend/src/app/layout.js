// Build v3 — UI overhaul from Replit
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/userContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Cal - Scheduling Made Simple",
  description:
    "Book time with professionals, automatically. A scheduling and booking platform inspired by Cal.com.",
  keywords: ["scheduling", "booking", "calendar", "cal.com", "meetings"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
