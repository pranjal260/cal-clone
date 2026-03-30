"use client";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { DURATION_OPTIONS } from "@/lib/constants";

export default function EventTypeModal({ isOpen, onClose, onSubmit, editData = null }) {
  const isEdit = !!editData;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) { setTitle(editData?.title || ""); setSlug(editData?.slug || ""); setDuration(editData?.duration || 30); setDescription(editData?.description || ""); setError(""); }
  }, [isOpen, editData]);

  const handleTitleChange = (v) => { setTitle(v); if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const t = title.trim(), s = slug.trim(), d = description.trim();
    if (!t) { setError("Title is required"); return; }
    if (!s || !/^[a-z0-9-]+$/.test(s)) { setError("Valid URL slug is required (lowercase, hyphens only)"); return; }
    setLoading(true);
    try { await onSubmit({ title: t, slug: s, duration, description: d || null }); onClose(); }
    catch (err) { setError(err.response?.status === 409 ? "Slug already in use" : err.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md border border-border animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{isEdit ? "Edit Event Type" : "New Event Type"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-destructive">*</span></label>
            <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Quick Chat"
              className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">URL Slug <span className="text-destructive">*</span></label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="quick-chat"
              className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Duration</label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_OPTIONS.map(o => (
                <button key={o.value} type="button" onClick={() => setDuration(o.value)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors
                    ${duration === o.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-foreground hover:border-primary hover:text-primary"
                    }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="A brief description of this event type..."
              className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
