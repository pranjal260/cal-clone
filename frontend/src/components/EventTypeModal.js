"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { DURATION_OPTIONS } from "@/lib/constants";

export default function EventTypeModal({ isOpen, onClose, onSubmit, editData = null }) {
  const isEdit = !!editData;

  const [title, setTitle] = useState(editData?.title || "");
  const [slug, setSlug] = useState(editData?.slug || "");
  const [duration, setDuration] = useState(editData?.duration || 30);
  const [description, setDescription] = useState(editData?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setError("URL slug is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title, slug, duration, description });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-scale-in border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Event Type" : "New Event Type"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Quick Chat"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                placeholder:text-muted-foreground"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              URL Slug *
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
              <span className="px-3 py-2 bg-muted text-sm text-muted-foreground border-r border-border">
                cal.clone/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="quick-chat"
                className="flex-1 px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-ring bg-white"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief description of your event..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-ring
                placeholder:text-muted-foreground"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border
                hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-white
                hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
