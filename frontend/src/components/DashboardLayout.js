"use client";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto lg:ml-64 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
