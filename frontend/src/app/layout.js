import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/userContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CalClone — Scheduling Platform",
  description:
    "A scheduling and booking platform inspired by Cal.com. Create event types, set availability, and let others book time slots.",
  keywords: ["scheduling", "booking", "calendar", "cal.com", "meetings"],
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
