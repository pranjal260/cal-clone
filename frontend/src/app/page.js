"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Link2, Clock, Copy, Check, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EventTypeModal from "@/components/EventTypeModal";
import { getEventTypes, createEventType, updateEventType, deleteEventType } from "@/lib/api";
import { useUser } from "@/lib/userContext";
import { EVENT_COLORS } from "@/lib/constants";

export default function EventTypesPage() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    try { setLoading(true); const res = await getEventTypes(user.id); setEvents(res.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = async (data) => {
    await createEventType({ ...data, userId: user.id });
    setModalOpen(false); await fetchEvents();
  };
  const handleEdit = (ev) => { setEditingEvent(ev); setModalOpen(true); };
  const handleUpdate = async (data) => {
    await updateEventType(editingEvent.id, { ...data, userId: user.id });
    setEditingEvent(null); setModalOpen(false); await fetchEvents();
  };
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteEventType(deleteConfirm.id, user.id);
    setDeleteConfirm(null); await fetchEvents();
  };
  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopiedId(slug); setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Event Types</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Create events to share for people to book on your calendar.</p>
        </div>
        <button onClick={() => { setEditingEvent(null); setModalOpen(true); }} className="btn btn-primary text-[13px]">
          <Plus size={15} strokeWidth={2.5} /> New
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-[68px]" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-lg bg-white">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#f3f4f6] rounded-full flex items-center justify-center">
            <Link2 size={20} className="text-[#9ca3af]" />
          </div>
          <h2 className="text-[15px] font-semibold text-[#111827] mb-1">No event types yet</h2>
          <p className="text-[13px] text-[#6b7280] mb-4">Create your first event type to start receiving bookings.</p>
          <button onClick={() => { setEditingEvent(null); setModalOpen(true); }} className="btn btn-primary text-[13px]">
            <Plus size={15} /> New Event Type
          </button>
        </div>
      ) : (
        <div className="border border-[#e5e7eb] rounded-lg overflow-hidden bg-white divide-y divide-[#e5e7eb]">
          {events.map((ev, i) => (
            <div key={ev.id} className="group relative hover:bg-[#fafafa] transition-colors animate-fade-in">
              <div className="absolute top-0 left-0 w-[4px] h-full" style={{ backgroundColor: EVENT_COLORS[i % EVENT_COLORS.length] }} />
              <div className="pl-5 pr-4 py-3.5 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-medium text-[#111827] truncate">{ev.title}</h3>
                  {ev.description && <p className="text-[12px] text-[#9ca3af] truncate mt-0.5">{ev.description}</p>}
                  <div className="flex items-center gap-2.5 mt-1 text-[12px] text-[#9ca3af]">
                    <span className="flex items-center gap-1"><Clock size={11} />{ev.duration}m</span>
                    <span className="text-[#e5e7eb]">·</span>
                    <span className="font-mono text-[11px]">/{ev.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyLink(ev.slug)} className="p-1.5 rounded hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151]" title="Copy link">
                    {copiedId === ev.slug ? <Check size={14} className="text-[#059669]" /> : <Copy size={14} />}
                  </button>
                  <a href={`/${ev.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151]" title="Preview">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => handleEdit(ev)} className="p-1.5 rounded hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151]" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteConfirm(ev)} className="p-1.5 rounded hover:bg-[#fef2f2] text-[#9ca3af] hover:text-[#ef4444]" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventTypeModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSubmit={editingEvent ? handleUpdate : handleCreate} editData={editingEvent} />

      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-scale-in border border-[#e5e7eb] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-[16px] font-semibold mb-2">Delete Event Type</h2>
            <p className="text-[13px] text-[#6b7280] mb-1">Are you sure you want to delete <strong className="text-[#111827]">{deleteConfirm.title}</strong>?</p>
            <p className="text-[12px] text-[#ef4444] bg-[#fef2f2] px-3 py-2 rounded mb-5">This will also delete all associated bookings.</p>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary text-[13px]">Cancel</button>
              <button onClick={handleDelete} className="btn btn-danger text-[13px]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}