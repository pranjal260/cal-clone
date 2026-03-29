"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getBookingsByUser, cancelBooking } from "@/lib/api";
import { useUser } from "@/lib/userContext";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getBookingsByUser(user.id);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const now = new Date();

  const filtered = bookings.filter((b) => {
    const start = new Date(b.startTime);
    if (activeTab === "upcoming") return b.status === "booked" && start > now;
    if (activeTab === "past")
      return b.status === "completed" || (b.status === "booked" && start <= now);
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelConfirm.id);
      setCancelConfirm(null);
      await fetchBookings();
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status, startTime) => {
    const start = new Date(startTime);
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
          <XCircle size={12} /> Cancelled
        </span>
      );
    }
    if (status === "completed" || start <= now) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          <CheckCircle size={12} /> Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
        <CheckCircle size={12} /> Confirmed
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-[100px] rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-lg">
          <div className="w-14 h-14 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Calendar size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No {activeTab} bookings</h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === "upcoming"
              ? "You don't have any upcoming bookings."
              : activeTab === "past"
              ? "You don't have any past bookings."
              : "You don't have any cancelled bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking, i) => (
            <div
              key={booking.id}
              className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Event title + status */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[15px]">
                      {booking.eventType?.title || "Event"}
                    </h3>
                    {getStatusBadge(booking.status, booking.startTime)}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(booking.startTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatTime(booking.startTime)} –{" "}
                      {formatTime(booking.endTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User size={14} />
                      {booking.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {booking.email}
                    </span>
                  </div>
                </div>

                {/* Cancel button (only for upcoming) */}
                {activeTab === "upcoming" &&
                  booking.status === "booked" &&
                  new Date(booking.startTime) > now && (
                    <button
                      onClick={() => setCancelConfirm(booking)}
                      className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200
                        rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      Cancel
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCancelConfirm(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-lg">Cancel Booking</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to cancel the booking with{" "}
              <strong>{cancelConfirm.name}</strong> on{" "}
              <strong>{formatDate(cancelConfirm.startTime)}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border
                  hover:bg-muted transition-colors"
              >
                Keep
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white
                  hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
