"use client";
import { useEffect, useState, useCallback, use } from "react";
import { Clock, Globe, ChevronLeft, ChevronRight, Video, AlertCircle, Loader2, ArrowLeft, User, Mail } from "lucide-react";
import { getEventBySlug, getAvailableSlots, getAvailability, createBooking } from "@/lib/api";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function CalendarGrid({ month, selectedDate, onSelectDate, availableDays }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const year = month.getFullYear(), mo = month.getMonth();
  const firstDayOfWeek = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, mo, d); date.setHours(0,0,0,0);
    const isPast = date < today;
    const dayOfWeek = date.getDay();
    const isAvailable = !isPast && availableDays.includes(dayOfWeek);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    cells.push({ day: d, date, isPast, isAvailable, isSelected });
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          return (
            <button key={cell.day} onClick={() => cell.isAvailable && onSelectDate(cell.date)}
              disabled={cell.isPast || !cell.isAvailable}
              className={`aspect-square rounded-full text-sm font-medium transition-colors flex items-center justify-center
                ${cell.isSelected
                  ? "bg-primary text-primary-foreground"
                  : cell.isAvailable
                    ? "text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}>
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PublicBookingPage({ params }) {
  const { slug } = use(params);
  const [event, setEvent] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState("calendar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
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
      setSlots(r.slots || []); setError(!r.slots?.length ? "No available times on this day." : "");
    } catch { setError("Failed to load slots."); setSlots([]); }
    finally { setSlotsLoading(false); }
  }, [event?.id]);

  const fmtSlotTime = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const fmtDateFull = (d) => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };
  const fmtDateShort = (d) => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  const handleBook = async (e) => {
    e.preventDefault(); setError("");
    const n = name.trim(), em = email.trim();
    if (!n) { setError("Name is required"); return; }
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError("Valid email required"); return; }
    if (!selectedSlot) { setError("Select a time slot"); return; }
    setSubmitting(true);
    try {
      const r = await createBooking({ eventTypeId: event.id, name: n, email: em, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime });
      setBookingData({ ...r.data, eventTitle: event.title }); setStep("confirmed");
    } catch (err) { setError(err.response?.data?.message || "Booking failed."); }
    finally { setSubmitting(false); }
  };

  const accentColor = "#3b82f6";

  if (eventLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (eventError || !event) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground">Event not found</h1>
        <p className="text-muted-foreground mt-2">This event type does not exist or is unavailable.</p>
      </div>
    </div>
  );

  if (step === "confirmed" && bookingData) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 text-center shadow-sm animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">Booking Confirmed</h1>
        <p className="text-sm text-muted-foreground mb-6">You are scheduled.</p>
        <div className="bg-muted rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
          <div><span className="font-medium text-foreground">What:</span> <span className="text-muted-foreground">{bookingData.eventTitle}</span></div>
          <div><span className="font-medium text-foreground">When:</span> <span className="text-muted-foreground">{fmtSlotTime(bookingData.startTime)} – {fmtSlotTime(bookingData.endTime)}</span></div>
          <div><span className="font-medium text-foreground">Who:</span> <span className="text-muted-foreground">{name} ({email})</span></div>
        </div>
        <a href={`/${slug}`} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">Book Another</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left panel — event info */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border p-8">
              {step === "form" && (
                <button onClick={() => setStep("calendar")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}

              <div className="w-10 h-10 rounded-full mb-5" style={{ backgroundColor: accentColor }} />
              <h1 className="text-xl font-bold text-foreground">{event.title}</h1>
              {event.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{event.description}</p>}

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" /> {event.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="w-4 h-4 shrink-0" /> Web conferencing details provided
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4 shrink-0" /> {event.user?.timezone || "Asia/Kolkata"}
                </div>
              </div>

              {selectedDate && selectedSlot && (
                <div className="mt-6 p-3 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    {fmtDateFull(selectedDate)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">
                    {fmtSlotTime(selectedSlot.startTime)} ({event.duration} min)
                  </p>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="flex-1 p-8">
              {step === "calendar" ? (
                <div>
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-foreground">
                      {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <CalendarGrid month={currentMonth} selectedDate={selectedDate}
                    onSelectDate={d => { setSelectedDate(d); setSelectedSlot(null); fetchSlots(d); }}
                    availableDays={availableDays} />

                  {/* Time slots */}
                  {selectedDate && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-foreground mb-3">{fmtDateShort(selectedDate)}</h3>
                      {slotsLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading available times...
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No available times on this day.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {slots.map((slot, i) => {
                            const isSelected = selectedSlot?.startTime === slot.startTime;
                            return (
                              <button key={i} onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                                className={`px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors
                                  ${isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-foreground hover:border-primary hover:text-primary"
                                  }`}>
                                {fmtSlotTime(slot.startTime)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : step === "form" ? (
                <div>
                  <button onClick={() => setStep("calendar")}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-lg font-semibold text-foreground mb-6">Enter your details</h2>

                  <form onSubmit={handleBook} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Your name <span className="text-destructive">*</span></label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required autoFocus
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email address <span className="text-destructive">*</span></label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" required
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Additional notes</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                        placeholder="Please share anything that will help prepare for our meeting."
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button type="submit" disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? "Confirming..." : "Confirm booking"}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}