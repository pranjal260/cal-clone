"use client";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <main className="lg:ml-[250px] pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-[960px] mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
