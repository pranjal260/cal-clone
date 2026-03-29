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
      // Fallback
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
    <div className="group relative bg-white border border-border rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in">
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-lg"
        style={{ backgroundColor: color }}
      />

      <div className="pl-5 pr-4 py-4 flex items-center justify-between">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="font-semibold text-[15px] text-foreground truncate">
              {event.title}
            </h3>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {event.duration} min
            </span>
            <span className="flex items-center gap-1">
              <ExternalLink size={13} />
              /{event.slug}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Copy booking link"
          >
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>

          {/* Preview link */}
          <a
            href={`/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Preview booking page"
          >
            <ExternalLink size={16} />
          </a>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-border rounded-lg shadow-lg py-1 animate-scale-in">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(event);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(event);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
