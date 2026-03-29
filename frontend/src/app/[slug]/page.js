"use client";
import { useEffect, useState, useCallback, use } from "react";
import { Clock, Globe, ArrowLeft, User, Mail, CheckCircle2 } from "lucide-react";
import { getEventBySlug, getAvailableSlots, getAvailability, createBooking } from "@/lib/api";
import BookingCalendarDark from "@/components/BookingCalendarDark";
import TimeSlotPicker from "@/components/TimeSlotPicker";

export default function PublicBookingPage({ params }) {
  const { slug } = use(params);
  const [event, setEvent] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState("calendar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventError, setEventError] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    (async () => {
      setEventLoading(true);
      try {
        const r = await getEventBySlug(slug);
        if (!r.data) { setEventError("Event not found"); return; }
        setEvent(r.data);
        if (r.data?.userId) {
          try { const a = await getAvailability(r.data.userId); setAvailableDays((a.data || []).map(x => x.dayOfWeek)); }
          catch { setAvailableDays([]); }
        }
      } catch (e) { setEventError(e.response?.status === 404 ? "Event not found." : "Failed to load event."); }
      finally { setEventLoading(false); }
    })();
  }, [slug]);

  const fetchSlots = useCallback(async (date) => {
    if (!event?.id || !date) return;
    setSlotsLoading(true); setSelectedSlot(null); setError("");
    try {
      const ds = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
      const r = await getAvailableSlots(event.id, ds);
      if (!r.slots?.length) { setSlots([]); setError("No available slots."); }
      else { setSlots(r.slots); setError(""); }
    } catch { setError("Failed to load slots."); setSlots([]); }
    finally { setSlotsLoading(false); }
  }, [event?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const n = name.trim(), em = email.trim();
    if (!n) { setError("Name is required"); return; }
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError("Valid email required"); return; }
    if (!selectedSlot) { setError("Select a time slot"); return; }
    setSubmitting(true);
    try {
      const r = await createBooking({ eventTypeId: event.id, name: n, email: em, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime });
      setBookingData({ ...r.data, eventTitle: event.title, hostName: event.user?.name || "Host" });
      setStep("confirmed");
    } catch (err) { setError(err.response?.status === 409 ? "Slot already booked." : err.response?.data?.message || "Booking failed."); }
    finally { setSubmitting(false); }
  };

  const fmtDate = d => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const fmtTime = d => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();

  if (eventLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (eventError || !event) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-md w-full p-8 text-center">
        <h1 className="text-[18px] font-bold text-white mb-2">Event Not Found</h1>
        <p className="text-[13px] text-[#737373] mb-5">{eventError || "This event doesn't exist."}</p>
        <a href="/" className="inline-block px-5 py-2 text-[13px] font-medium bg-white text-black rounded-md hover:bg-gray-100">Go Home</a>
      </div>
    </div>
  );

  if (step === "confirmed" && bookingData) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-md w-full p-8 text-center animate-scale-in">
        <div className="w-14 h-14 bg-[#052e16] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-400" />
        </div>
        <h1 className="text-[20px] font-bold text-white mb-1">Booking Confirmed</h1>
        <p className="text-[13px] text-[#a1a1a1] mb-5">You are scheduled with {bookingData.hostName}.</p>
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-left space-y-2.5 mb-5 text-[13px]">
          <div className="flex gap-3"><span className="font-medium text-white w-10">What</span><span className="text-[#a1a1a1]">{bookingData.eventTitle}</span></div>
          <div className="flex gap-3"><span className="font-medium text-white w-10">When</span><span className="text-[#a1a1a1]">{fmtDate(bookingData.startTime)}, {fmtTime(bookingData.startTime)} – {fmtTime(bookingData.endTime)}</span></div>
          <div className="flex gap-3"><span className="font-medium text-white w-10">Who</span><span className="text-[#a1a1a1]">{name} ({email})</span></div>
        </div>
        <a href={`/${slug}`} className="inline-block px-5 py-2 text-[13px] font-medium border border-[#333] text-white rounded-md hover:bg-[#1a1a1a]">Book Another</a>
      </div>
      <p className="text-[11px] text-[#333] mt-6 font-medium">Cal.com</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-[880px] overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[480px]">
          {/* Left: Event info */}
          <div className="md:w-[280px] p-6 border-b md:border-b-0 md:border-r border-[#262626] shrink-0">
            {step === "form" && (
              <button onClick={() => setStep("calendar")} className="flex items-center gap-1 text-[13px] text-[#737373] hover:text-white mb-4">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-bold mb-2.5">
              {event.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <p className="text-[13px] text-[#737373] mb-0.5">{event.user?.name || "Host"}</p>
            <h1 className="text-[18px] font-bold text-white mb-2 tracking-tight">{event.title}</h1>
            {event.description && <p className="text-[13px] text-[#737373] mb-3 leading-relaxed">{event.description}</p>}
            <div className="space-y-2 text-[13px] text-[#737373]">
              <div className="flex items-center gap-2"><Clock size={14} className="text-[#525252]" />{event.duration} min</div>
              <div className="flex items-center gap-2"><Globe size={14} className="text-[#525252]" />{event.user?.timezone || "Asia/Kolkata"}</div>
            </div>
            {step === "form" && selectedSlot && (
              <div className="mt-5 pt-4 border-t border-[#262626]">
                <p className="text-[13px] font-medium text-white">{selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                <p className="text-[13px] text-[#737373]">{fmtTime(selectedSlot.startTime)} – {fmtTime(selectedSlot.endTime)}</p>
              </div>
            )}
          </div>

          {/* Right: Calendar / Form */}
          <div className="flex-1 p-6">
            {step === "calendar" ? (
              <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="flex-1">
                  <BookingCalendarDark availableDays={availableDays} selectedDate={selectedDate}
                    onSelectDate={d => { setSelectedDate(d); fetchSlots(d); }} />
                </div>
                {selectedDate && (
                  <div className="md:w-[180px] md:border-l md:border-[#262626] md:pl-5">
                    <p className="text-[13px] font-medium text-white mb-3">
                      {selectedDate.toLocaleDateString("en-US", { weekday: "short" })}{" "}
                      <span className="text-[#737373]">{selectedDate.getDate()}</span>
                    </p>
                    <TimeSlotPicker slots={slots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot}
                      onConfirm={s => { setSelectedSlot(s); setStep("form"); }} loading={slotsLoading} dark />
                    {error && <p className="text-[11px] text-red-400 mt-2 bg-red-400/10 px-2.5 py-1.5 rounded">{error}</p>}
                  </div>
                )}
              </div>
            ) : step === "form" ? (
              <div className="max-w-sm animate-fade-in">
                <h2 className="text-[16px] font-semibold text-white mb-5">Your Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#a1a1a1] mb-1.5">Your Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="input-dark pl-9" autoFocus />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#a1a1a1] mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="input-dark pl-9" />
                    </div>
                  </div>
                  {error && <p className="text-[12px] text-red-400 bg-red-400/10 px-3 py-2 rounded">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 text-[13px] font-medium rounded-md bg-white text-black hover:bg-gray-100 disabled:opacity-50 mt-1">
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#333] mt-5 font-medium tracking-wide">Cal.com</p>
    </div>
  );
}