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
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[42px] rounded-lg skeleton" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-6 text-[13px] text-[#9ca3af]">
        No available slots for this date.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
      {slots.map((slot, i) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;

        return (
          <div
            key={i}
            className="flex gap-2 animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <button
              onClick={() => onSelectSlot(slot)}
              className={`
                flex-1 py-2.5 px-3 text-[13px] font-medium rounded-lg border transition-all duration-150
                ${
                  isSelected
                    ? "border-[#0069ff] bg-[#0069ff] text-white shadow-sm"
                    : "border-[#e5e7eb] text-[#111827] hover:border-[#0069ff] hover:bg-[#eff6ff] hover:text-[#0069ff]"
                }
              `}
            >
              {formatTime(slot.startTime)}
            </button>

            {isSelected && (
              <button
                onClick={() => onConfirm(slot)}
                className="px-4 py-2.5 text-[13px] font-medium rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] transition-all animate-slide-in shadow-sm"
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
