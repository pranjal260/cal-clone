"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Clock,
  Link2,
  Menu,
  X,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/userContext";

const NAV_ITEMS = [
  { label: "Event Types", href: "/", icon: Link2 },
  { label: "Bookings", href: "/bookings", icon: Calendar },
  { label: "Availability", href: "/availability", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CalendarDays size={16} className="text-white" />
          </div>
          <span className="font-bold text-base">CalClone</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-border
          flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          pt-0
        `}
      >
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm">
            <CalendarDays size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base tracking-tight">CalClone</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500
                  transition-all duration-150 cursor-pointer
                  ${
                    active
                      ? "bg-primary-light text-primary font-600"
                      : "text-foreground-subtle hover:bg-sidebar-hover"
                  }
                `}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-divider mx-4"></div>

        {/* User Profile Section */}
        <div className="h-20 px-4 py-3 flex flex-col justify-between border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-accent to-primary-dark flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-500 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Offset */}
      <style jsx>{`
        @media (min-width: 1024px) {
          body {
            margin-left: 256px;
          }
        }
      `}</style>
    </>
  );
}
