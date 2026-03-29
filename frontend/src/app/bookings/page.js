"use client";
import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User, Mail, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getBookingsByUser, cancelBooking } from "@/lib/api";
import { useUser } from "@/lib/userContext";

const TABS = [{ key: "upcoming", label: "Upcoming" }, { key: "past", label: "Past" }, { key: "cancelled", label: "Cancelled" }];

export default function BookingsPage() {
  const { user } = useUser();
  const [tab, setTab] = useState("upcoming");
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
  const filtered = bookings.filter(b => {
    const s = new Date(b.startTime);
    if (tab === "upcoming") return b.status === "booked" && s > now;
    if (tab === "past") return b.status === "completed" || (b.status === "booked" && s <= now);
    return b.status === "cancelled";
  });

  const doCancel = async () => {
    if (!cancelConfirm) return; setCancelling(true);
    try { await cancelBooking(cancelConfirm.id); setCancelConfirm(null); await fetch(); }
    catch (e) { console.error(e); } finally { setCancelling(false); }
  };

  const fmtDate = d => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const fmtTime = d => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();

  const badge = (status, st) => {
    const s = new Date(st);
    if (status === "cancelled") return <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#ef4444]"><XCircle size={11} />Cancelled</span>;
    if (status === "completed" || s <= now) return <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#6b7280]"><CheckCircle size={11} />Completed</span>;
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669]"><CheckCircle size={11} />Confirmed</span>;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Bookings</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">See upcoming and past events booked through your event type links.</p>
      </div>

      <div className="flex gap-0 mb-6 border-b border-[#e5e7eb]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? "border-[#111827] text-[#111827]" : "border-transparent text-[#6b7280] hover:text-[#111827]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-[#e5e7eb] rounded-lg bg-white">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#f3f4f6] rounded-full flex items-center justify-center">
            <Calendar size={20} className="text-[#9ca3af]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#111827] mb-1">No {tab} bookings</h3>
          <p className="text-[13px] text-[#6b7280]">You don&apos;t have any {tab} bookings.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#e5e7eb] border border-[#e5e7eb] rounded-lg bg-white overflow-hidden">
          {filtered.map((b, i) => (
            <div key={b.id} className="px-5 py-3.5 hover:bg-[#fafafa] transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-medium text-[#111827]">{b.eventType?.title || "Event"}</h3>
                    {badge(b.status, b.startTime)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#6b7280]">
                    <span className="flex items-center gap-1"><Calendar size={12} />{fmtDate(b.startTime)}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</span>
                    <span className="flex items-center gap-1"><User size={12} />{b.name}</span>
                    <span className="flex items-center gap-1"><Mail size={12} />{b.email}</span>
                  </div>
                </div>
                {tab === "upcoming" && b.status === "booked" && new Date(b.startTime) > now && (
                  <button onClick={() => setCancelConfirm(b)} className="ml-4 px-3 py-1.5 text-[12px] font-medium text-[#ef4444] border border-[#fecaca] rounded-md hover:bg-[#fef2f2] shrink-0">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in border border-[#e5e7eb]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#fef2f2] rounded-full flex items-center justify-center"><AlertCircle size={18} className="text-[#ef4444]" /></div>
              <h3 className="text-[15px] font-semibold">Cancel Booking</h3>
            </div>
            <p className="text-[13px] text-[#6b7280] mb-5">Cancel booking with <strong className="text-[#111827]">{cancelConfirm.name}</strong> on <strong className="text-[#111827]">{fmtDate(cancelConfirm.startTime)}</strong>?</p>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setCancelConfirm(null)} className="btn btn-secondary text-[13px]">Keep</button>
              <button onClick={doCancel} disabled={cancelling} className="btn btn-danger text-[13px]">{cancelling ? "Cancelling..." : "Cancel Booking"}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
