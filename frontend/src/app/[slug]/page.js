"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Clock, Globe, ArrowLeft, User, Mail, CheckCircle2 } from "lucide-react";
import { getEventBySlug, getAvailableSlots, getAvailability, createBooking } from "@/lib/api";
import BookingCalendar from "@/components/BookingCalendar";
import TimeSlotPicker from "@/components/TimeSlotPicker";

// Steps: 'calendar' → 'form' → 'confirmed'
export default function PublicBookingPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [event, setEvent] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Form step
  const [step, setStep] = useState("calendar"); // calendar | form | confirmed
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventError, setEventError] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      setEventLoading(true);
      setEventError(null);
      try {
        const res = await getEventBySlug(slug);
        
        if (!res.data) {
          setEventError("Event not found");
          setEvent(null);
          return;
        }
        
        setEvent(res.data);

        // Fetch availability to know which days are open
        if (res.data?.userId) {
          try {
            const availRes = await getAvailability(res.data.userId);
            const days = (availRes.data || []).map((a) => a.dayOfWeek);
            setAvailableDays(days);
          } catch (availErr) {
            console.error("Failed to fetch availability:", availErr);
            setAvailableDays([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
        if (err.response?.status === 404) {
          setEventError("Event not found. Please check the URL.");
        } else {
          setEventError("Failed to load event. Please try again later.");
        }
        setEvent(null);
      } finally {
        setEventLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  // Fetch slots when date changes
  const fetchSlots = useCallback(
    async (date) => {
      if (!event?.id || !date) return;
      setSlotsLoading(true);
      setSelectedSlot(null);
      setError("");
      try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const res = await getAvailableSlots(event.id, dateStr);
        
        if (!res.slots || res.slots.length === 0) {
          setError("No available slots for this date. Please try another date.");
          setSlots([]);
        } else {
          setSlots(res.slots);
          setError("");
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setError("Failed to load available slots. Please try again.");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [event?.id]
  );

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleSlotConfirm = (slot) => {
    setSelectedSlot(slot);
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Trim inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Validate name
    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (trimmedName.length > 100) {
      setError("Name must be less than 100 characters");
      return;
    }

    // Validate email
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({
        eventTypeId: event.id,
        name: trimmedName,
        email: trimmedEmail,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      setBookingData({
        ...res.data,
        eventTitle: event.title,
        duration: event.duration,
        hostName: event.user?.name || "Host",
      });
      setStep("confirmed");
    } catch (err) {
      console.error("Booking error:", err);
      if (err.response?.status === 409) {
        setError("This time slot has already been booked. Please select another.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Booking failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Loading state
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  // Error state - event not found or failed to load
  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold mb-2 text-red-600">Event Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {eventError || "The event you're looking for doesn't exist or has been deleted."}
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 text-sm font-medium bg-foreground text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  // ─── Confirmed Step ─────────────────────────────────────
  if (step === "confirmed" && bookingData) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4">
        <div className="bg-white border border-border rounded-2xl shadow-sm w-full max-w-md p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Booking Confirmed</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You are scheduled with {bookingData.hostName}.
          </p>

          <div className="bg-accent rounded-lg p-4 text-left space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">What:</span>
              <span className="text-muted-foreground">
                {bookingData.eventTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">When:</span>
              <span className="text-muted-foreground">
                {formatDate(bookingData.startTime)},{" "}
                {formatTime(bookingData.startTime)} –{" "}
                {formatTime(bookingData.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Who:</span>
              <span className="text-muted-foreground">
                {name} ({email})
              </span>
            </div>
          </div>

          <a
            href={`/${slug}`}
            className="inline-block px-5 py-2.5 text-sm font-medium border border-border rounded-lg
              hover:bg-muted transition-colors"
          >
            Book Another
          </a>
        </div>
      </div>
    );
  }

  // ─── Main Booking UI ────────────────────────────────────
  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="bg-white border border-border rounded-2xl shadow-sm w-full max-w-3xl overflow-hidden">
        <div className="flex flex-col sm:flex-row min-h-[500px]">
          {/* Left Panel — Event Info */}
          <div className="sm:w-[280px] p-6 border-b sm:border-b-0 sm:border-r border-border flex-shrink-0">
            {step === "form" && (
              <button
                onClick={() => setStep("calendar")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}

            {/* User avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mb-3">
              {event.user?.name?.[0] || "J"}
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {event.user?.name || "John Doe"}
            </p>

            <h1 className="text-xl font-bold text-foreground mb-3">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {event.duration} min
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} />
                {event.user?.timezone || "Asia/Kolkata"}
              </div>
            </div>

            {/* Show selected date/time in form step */}
            {step === "form" && selectedSlot && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-1">
                  {selectedDate &&
                    selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(selectedSlot.startTime)} –{" "}
                  {formatTime(selectedSlot.endTime)}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-6">
            {step === "calendar" ? (
              <div className="flex flex-col sm:flex-row gap-6 h-full">
                {/* Calendar */}
                <div className="flex-1">
                  <BookingCalendar
                    availableDays={availableDays}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                  />
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="sm:w-[180px] sm:border-l sm:border-border sm:pl-6">
                    <p className="text-sm font-medium mb-3">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <TimeSlotPicker
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      onConfirm={handleSlotConfirm}
                      loading={slotsLoading}
                    />
                  </div>
                )}
              </div>
            ) : step === "form" ? (
              /* Booking Form */
              <div className="max-w-sm animate-fade-in">
                <h2 className="text-lg font-semibold mb-5">Your Details</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm
                          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                          placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm
                          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                          placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 text-sm font-medium rounded-lg bg-foreground text-white
                      hover:opacity-90 transition-colors disabled:opacity-50 mt-2"
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}