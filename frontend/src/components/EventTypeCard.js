"use client";

import { useState } from "react";
import { Clock, ExternalLink, Copy, MoreHorizontal, Pencil, Trash2, Check } from "lucide-react";

export default function EventTypeCard({ event, color, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${event.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = bookingUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative bg-white border border-border rounded-md hover:border-border-strong transition-all duration-150 animate-fade-in">
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-md"
        style={{ backgroundColor: color }}
      />

      <div className="pl-5 pr-4 py-3.5 flex items-center justify-between">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-medium text-sm text-foreground truncate">
              {event.title}
            </h3>
          </div>

          {event.description && (
            <p className="text-[13px] text-muted-foreground mb-1.5 line-clamp-1">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {event.duration}m
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              /{event.slug}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Copy booking link"
          >
            {copied ? (
              <Check size={15} className="text-success" />
            ) : (
              <Copy size={15} />
            )}
          </button>

          {/* Preview link */}
          <a
            href={`/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Preview booking page"
          >
            <ExternalLink size={15} />
          </a>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal size={15} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white border border-border rounded-md shadow-lg py-1 animate-scale-in">
                  <button
                    onClick={() => { setShowMenu(false); onEdit(event); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onDelete(event); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Copy button always visible on mobile */}
        <button
          onClick={handleCopy}
          className="lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground ml-2"
        >
          {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}
