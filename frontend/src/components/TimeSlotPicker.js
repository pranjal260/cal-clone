"use client";

export default function TimeSlotPicker({
  slots = [],
  selectedSlot,
  onSelectSlot,
  onConfirm,
  loading = false,
}) {
  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-md" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
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
            style={{ animationDelay: `${i * 25}ms` }}
          >
            <button
              onClick={() => onSelectSlot(slot)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-all duration-100
                ${isSelected
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
                className="px-3 py-2 text-sm font-medium rounded-md bg-foreground text-white
                  hover:bg-gray-800 transition-all animate-slide-in"
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
