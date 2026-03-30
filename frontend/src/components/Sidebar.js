"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, LayoutDashboard, Settings, Link2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/userContext";

const navItems = [
  { label: "Event Types", href: "/", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Availability", href: "/availability", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const isActive = (h) => (h === "/" ? pathname === "/" : pathname.startsWith(h));
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 1) : "?";

  return (
    <>
      {/* Mobile bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-card border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Cal</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Cal</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
