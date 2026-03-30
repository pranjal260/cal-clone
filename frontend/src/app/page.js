"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Clock, ExternalLink, MoreVertical, Pencil, Trash2, Link2, Copy, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EventTypeModal from "@/components/EventTypeModal";
import { getEventTypes, createEventType, updateEventType, deleteEventType } from "@/lib/api";
import { useUser } from "@/lib/userContext";

const EVENT_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export default function EventTypesPage() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

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
  const handleEdit = (ev) => { setEditingEvent(ev); setModalOpen(true); setOpenMenu(null); };
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
    setCopiedSlug(slug); setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Event Types</h1>
            <p className="text-muted-foreground mt-1 text-sm">Create events to share for people to book on your calendar.</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New event type
          </button>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No event types yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first event type to start accepting bookings.</p>
            <button onClick={() => { setEditingEvent(null); setModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> New event type
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev, i) => {
              const color = EVENT_COLORS[i % EVENT_COLORS.length];
              return (
                <div key={ev.id} className="relative bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group">
                  <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl" style={{ backgroundColor: color }} />
                  <div className="pl-2">
                    {/* Title + menu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base leading-tight">{ev.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{ev.duration} minutes</span>
                        </div>
                      </div>
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === ev.id ? null : ev.id)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === ev.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-8 z-20 w-44 bg-card border border-border rounded-xl shadow-lg py-1">
                              <button onClick={() => handleEdit(ev)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-foreground w-full">
                                <Pencil className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => copyLink(ev.slug)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-foreground w-full">
                                <Copy className="w-4 h-4" /> Copy link
                              </button>
                              <a href={`/${ev.slug}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-foreground">
                                <ExternalLink className="w-4 h-4" /> Preview
                              </a>
                              <hr className="my-1 border-border" />
                              <button onClick={() => { setDeleteConfirm(ev); setOpenMenu(null); }}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-destructive w-full">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {ev.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ev.description}</p>
                    )}

                    {/* Footer: slug + view */}
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => copyLink(ev.slug)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted px-2.5 py-1.5 rounded-lg">
                        <Link2 className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{ev.slug}</span>
                      </button>
                      <a href={`/${ev.slug}`} target="_blank" rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <EventTypeModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEvent(null); }}
          onSubmit={editingEvent ? handleUpdate : handleCreate} editData={editingEvent} />

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-card rounded-xl shadow-xl w-full max-w-sm animate-scale-in border border-border p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-foreground mb-2">Delete Event Type</h2>
              <p className="text-sm text-muted-foreground mb-1">Are you sure you want to delete <strong className="text-foreground">{deleteConfirm.title}</strong>?</p>
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-5">This will also delete all associated bookings.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
                <button onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}