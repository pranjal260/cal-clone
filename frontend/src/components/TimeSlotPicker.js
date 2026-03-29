"use client";

export default function TimeSlotPicker({
  slots = [],
  selectedSlot,
  onSelectSlot,
  onConfirm,
  loading = false,
  dark = false,
}) {
  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`h-10 rounded-md ${dark ? "skeleton-dark" : "skeleton"}`}
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={`text-center py-8 text-sm ${dark ? "text-[#737373]" : "text-muted-foreground"}`}>
        No available slots for this date.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
      {slots.map((slot, i) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;

        return (
          <div
            key={i}
            className="flex gap-2 animate-fade-in"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <button
              onClick={() => onSelectSlot(slot)}
              className={`
                flex-1 py-2.5 px-3 text-sm font-medium rounded-md border transition-all duration-100
                ${dark
                  ? isSelected
                    ? "border-white bg-white text-black"
                    : "border-[#333] hover:border-[#555] text-white"
                  : isSelected
                    ? "border-foreground bg-foreground text-white"
                    : "border-border hover:border-foreground text-foreground"
                }
              `}
            >
              {formatTime(slot.startTime)}
            </button>

            {isSelected && (
              <button
                onClick={() => onConfirm(slot)}
                className={`
                  px-4 py-2.5 text-sm font-medium rounded-md transition-all animate-slide-in
                  ${dark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-foreground text-white hover:bg-gray-800"
                  }
                `}
              >
                Confirm
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
