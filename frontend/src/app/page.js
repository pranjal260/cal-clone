"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Link2, Edit, Trash2, Copy, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EventTypeModal from "@/components/EventTypeModal";
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "@/lib/api";
import { useUser } from "@/lib/userContext";

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
    try {
      setLoading(true);
      const res = await getEventTypes(user.id);
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (data) => {
    try {
      await createEventType({ ...data, userId: user.id });
      setModalOpen(false);
      await fetchEvents();
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleUpdate = async (data) => {
    try {
      await updateEventType(editingEvent.id, { ...data, userId: user.id });
      setEditingEvent(null);
      setModalOpen(false);
      await fetchEvents();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteEventType(deleteConfirm.id, user.id);
      setDeleteConfirm(null);
      await fetchEvents();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Event Types
          </h1>
          <button
            onClick={() => {
              setEditingEvent(null);
              setModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Event
          </button>
        </div>
        <p className="text-base text-muted-foreground">
          Create and manage bookable events. Share links with people to let them schedule time with you.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-background-secondary border border-border rounded-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border border-border">
            <Link2 size={24} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No event types yet
          </h2>
          <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first event type to start receiving bookings from others.
          </p>
          <button
            onClick={() => {
              setEditingEvent(null);
              setModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="card hover:shadow-md transition-all duration-200"
            >
              <div className="card-body flex items-start justify-between p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-lg font-bold truncate text-foreground">
                      {event.title}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {event.duration} min
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground-subtle">
                      /{event.slug}
                    </code>
                    <button
                      onClick={() => copyToClipboard(event.slug)}
                      className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                      title="Copy booking link"
                    >
                      {copiedId === event.slug ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Edit event"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(event)}
                    className="p-2 hover:bg-danger-light rounded-lg transition-colors text-muted-foreground hover:text-danger"
                    title="Delete event"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <EventTypeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleUpdate : handleCreate}
        editData={editingEvent}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Delete Event Type</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="text-base text-muted-foreground mb-2">
                Are you sure you want to delete{" "}
                <strong className="text-foreground text-base">{deleteConfirm.title}</strong>?
              </p>
              <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded">
                This will also delete all associated bookings.
              </p>
            </div>
            <div className="modal-footer gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}