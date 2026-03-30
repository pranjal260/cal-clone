"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BookingCalendar({ availableDays = [], selectedDate, onSelectDate }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();
      const isPast = date < today;
      const isAvailable = !isPast && availableDays.includes(dayOfWeek);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({ day: d, date, isPast, isAvailable, isToday, isSelected });
    }

    return days;
  }, [viewMonth, viewYear, availableDays, selectedDate, today]);

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] font-semibold text-[#111827] tracking-tight">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="aspect-square" />;

          return (
            <button
              key={cell.day}
              disabled={!cell.isAvailable}
              onClick={() => cell.isAvailable && onSelectDate(cell.date)}
              className={`
                aspect-square flex items-center justify-center
                text-[14px] rounded-lg transition-all duration-150
                ${
                  cell.isSelected
                    ? "bg-[#0069ff] text-white font-bold shadow-sm"
                    : cell.isAvailable
                      ? "text-[#111827] font-semibold hover:bg-[#eff6ff] hover:text-[#0069ff] cursor-pointer"
                      : "text-[#d1d5db] cursor-not-allowed"
                }
                ${cell.isToday && !cell.isSelected ? "ring-1 ring-[#0069ff]/30 font-bold" : ""}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
