"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DURATION_OPTIONS } from "@/lib/constants";

export default function EventTypeModal({ isOpen, onClose, onSubmit, editData = null }) {
  const isEdit = !!editData;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens or editData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(editData?.title || "");
      setSlug(editData?.slug || "");
      setDuration(editData?.duration || 30);
      setDescription(editData?.description || "");
      setError("");
    }
  }, [isOpen, editData]);

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

    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    const trimmedDescription = description.trim();

    // Validate title
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }
    if (trimmedTitle.length < 2) {
      setError("Title must be at least 2 characters");
      return;
    }
    if (trimmedTitle.length > 100) {
      setError("Title must be less than 100 characters");
      return;
    }

    // Validate slug
    if (!trimmedSlug) {
      setError("URL slug is required");
      return;
    }
    if (trimmedSlug.length < 2) {
      setError("Slug must be at least 2 characters");
      return;
    }
    if (trimmedSlug.length > 100) {
      setError("Slug must be less than 100 characters");
      return;
    }
    if (!/^[a-z0-9\-]+$/.test(trimmedSlug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    // Validate duration
    if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
      setError("Duration must be between 15 and 480 minutes");
      return;
    }

    // Validate description
    if (trimmedDescription && trimmedDescription.length > 500) {
      setError("Description must be less than 500 characters");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ 
        title: trimmedTitle, 
        slug: trimmedSlug, 
        duration, 
        description: trimmedDescription || null 
      });
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError("This slug is already in use. Please choose a different one.");
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">
            {isEdit ? "Edit Event Type" : "Add a new event type"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Quick Chat"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">URL *</label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_2px_rgb(17_24_39/0.08)]">
              <span className="px-3 py-2 bg-muted text-sm text-muted-foreground border-r border-border whitespace-nowrap">
                cal.clone/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="quick-chat"
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Duration</label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    duration === opt.value
                      ? "border-foreground bg-foreground text-white"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief description of your event..."
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Saving..." : isEdit ? "Save" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
