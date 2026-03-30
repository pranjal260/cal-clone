"use client";
import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Mail, X, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getBookingsByUser, cancelBooking } from "@/lib/api";
import { useUser } from "@/lib/userContext";

export default function BookingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetch = useCallback(async () => {
    if (!user?.id) return;
    try { const r = await getBookingsByUser(user.id); setBookings(r.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const now = new Date();
  const upcoming = bookings.filter(b => b.status === "booked" && new Date(b.startTime) > now);
  const past = bookings.filter(b => b.status === "completed" || (b.status === "booked" && new Date(b.startTime) <= now));
  const cancelled = bookings.filter(b => b.status === "cancelled");

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past", label: "Past", count: past.length },
    { key: "cancelled", label: "Cancelled", count: cancelled.length },
  ];

  const currentBookings = activeTab === "upcoming" ? upcoming : activeTab === "past" ? past : cancelled;

  const doCancel = async () => {
    if (!cancelConfirm) return; setCancelling(true);
    try { await cancelBooking(cancelConfirm.id); setCancelConfirm(null); await fetch(); }
    catch (e) { console.error(e); } finally { setCancelling(false); }
  };

  const fmtDate = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = d => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1 text-sm hidden sm:block">Manage all your scheduled appointments.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors relative
                ${activeTab === tab.key
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}>
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Loading bookings...
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No {activeTab} bookings</p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "upcoming" ? "You have no upcoming bookings."
                : activeTab === "past" ? "No past bookings found."
                : "No cancelled bookings."}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {currentBookings.map((b) => (
              <div key={b.id} className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm shrink-0">
                  {b.name?.charAt(0).toUpperCase() || "?"}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="font-medium text-foreground text-sm truncate">{b.name}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium
                      ${b.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                      }`}>
                      {b.status === "cancelled"
                        ? <><XCircle className="w-3 h-3" /> cancelled</>
                        : <><CheckCircle className="w-3 h-3" /> confirmed</>
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">{b.email}</p>
                  </div>
                  {/* Mobile date/time - shown only on small screens */}
                  <div className="flex items-center gap-2 mt-1 sm:hidden text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(b.startTime)} · {fmtTime(b.startTime)}
                  </div>
                </div>

                {/* Event info - hidden on very small screens */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{b.eventType?.title || "Event"}</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{b.eventType?.duration || 30} min</p>
                  </div>
                </div>

                {/* Date/time - hidden on small, shown on md+ */}
                <div className="text-right shrink-0 hidden md:block">
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {fmtDate(b.startTime)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</p>
                </div>

                {/* Cancel */}
                {b.status !== "cancelled" && new Date(b.startTime) > now && (
                  <button onClick={() => setCancelConfirm(b)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Cancel booking">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancel modal */}
        {cancelConfirm && (
          <div className="modal-backdrop" onClick={() => setCancelConfirm(null)}>
            <div className="bg-card rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-foreground mb-3">Cancel Booking</h3>
              <p className="text-sm text-muted-foreground mb-5">Cancel booking with <strong className="text-foreground">{cancelConfirm.name}</strong> on <strong className="text-foreground">{fmtDate(cancelConfirm.startTime)}</strong>?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setCancelConfirm(null)} className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80">Keep</button>
                <button onClick={doCancel} disabled={cancelling} className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 disabled:opacity-60">
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
