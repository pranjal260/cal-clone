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

  useEffect(() => {
    if (isOpen) { setTitle(editData?.title || ""); setSlug(editData?.slug || ""); setDuration(editData?.duration || 30); setDescription(editData?.description || ""); setError(""); }
  }, [isOpen, editData]);

  const handleTitleChange = (v) => { setTitle(v); if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const t = title.trim(), s = slug.trim(), d = description.trim();
    if (!t) { setError("Title is required"); return; }
    if (!s || !/^[a-z0-9-]+$/.test(s)) { setError("Valid URL slug is required"); return; }
    setLoading(true);
    try { await onSubmit({ title: t, slug: s, duration, description: d || null }); onClose(); }
    catch (err) { setError(err.response?.status === 409 ? "Slug already in use" : err.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px] animate-scale-in border border-[#e5e7eb]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-[15px] font-semibold text-[#111827]">{isEdit ? "Edit Event Type" : "Add a new event type"}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f3f4f6] text-[#9ca3af]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Quick Chat" className="input-field" autoFocus />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">URL *</label>
            <div className="flex border border-[#e5e7eb] rounded-md overflow-hidden focus-within:border-[#111827] focus-within:shadow-[0_0_0_2px_rgba(17,24,39,0.06)]">
              <span className="px-3 py-[9px] bg-[#f9fafb] text-[13px] text-[#9ca3af] border-r border-[#e5e7eb]">cal.com/</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="quick-chat" className="flex-1 px-3 py-[9px] text-[13px] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Duration</label>
            <div className="flex gap-1.5 flex-wrap">
              {DURATION_OPTIONS.map(o => (
                <button key={o.value} type="button" onClick={() => setDuration(o.value)}
                  className={`px-3 py-[6px] text-[13px] rounded-md border transition-colors ${duration === o.value ? "border-[#111827] bg-[#111827] text-white" : "border-[#e5e7eb] text-[#374151] hover:border-[#d1d5db]"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="A brief description..." className="input-field resize-none" />
          </div>
          {error && <p className="text-[12px] text-[#ef4444] bg-[#fef2f2] px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary text-[13px]">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary text-[13px]">{loading ? "Saving..." : isEdit ? "Save" : "Continue"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
