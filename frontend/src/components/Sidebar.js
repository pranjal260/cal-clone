"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, Link2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/userContext";

const NAV = [
  { label: "Event Types", href: "/", icon: Link2 },
  { label: "Bookings", href: "/bookings", icon: Calendar },
  { label: "Availability", href: "/availability", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const active = (h) => (h === "/" ? pathname === "/" : pathname.startsWith(h));
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?";

  return (
    <>
      {/* Mobile bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-white border-b border-[#e5e7eb] px-4 flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">Cal.com</span>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-[#f3f4f6]">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-[250px] bg-white border-r border-[#e5e7eb] flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-14 px-5 flex items-center gap-2.5 border-b border-[#e5e7eb]">
          <div className="w-8 h-8 bg-[#111827] rounded-md flex items-center justify-center">
            <Calendar size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Cal.com</span>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const a = active(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-[7px] rounded-md text-[13px] font-medium transition-colors ${a ? "bg-[#f3f4f6] text-[#111827]" : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]"}`}>
                <Icon size={16} strokeWidth={a ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-semibold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium truncate leading-tight">{user?.name || "User"}</p>
              <p className="text-[11px] text-[#9ca3af] truncate leading-tight">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
