"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, LinkIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EventTypeCard from "@/components/EventTypeCard";
import EventTypeModal from "@/components/EventTypeModal";
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "@/lib/api";
import { DEFAULT_USER_ID, getEventColor } from "@/lib/constants";

export default function EventTypesPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await getEventTypes(DEFAULT_USER_ID);
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Create event
  const handleCreate = async (data) => {
    await createEventType({ ...data, userId: DEFAULT_USER_ID });
    await fetchEvents();
  };

  // Edit event
  const handleEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateEventType(editingEvent.id, {
      ...data,
      userId: DEFAULT_USER_ID,
    });
    setEditingEvent(null);
    await fetchEvents();
  };

  // Delete event
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteEventType(deleteConfirm.id, DEFAULT_USER_ID);
      setDeleteConfirm(null);
      await fetchEvents();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-white text-sm font-medium
            rounded-lg hover:opacity-90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      {/* Event list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-[88px] rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-lg">
          <div className="w-14 h-14 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <LinkIcon size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No event types yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first event type to start getting booked.
          </p>
          <button
            onClick={() => {
              setEditingEvent(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-foreground text-white text-sm font-medium rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus size={14} className="inline mr-1.5 -mt-0.5" />
            New Event Type
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event, i) => (
            <EventTypeCard
              key={event.id}
              event={event}
              color={getEventColor(i)}
              onEdit={handleEdit}
              onDelete={(e) => setDeleteConfirm(e)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <EventTypeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleUpdate : handleCreate}
        editData={editingEvent}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in border border-border">
            <h3 className="font-semibold text-lg mb-2">Delete Event Type</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.title}</strong>? This action cannot be
              undone and all associated bookings will be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border
                  hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white
                  hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}