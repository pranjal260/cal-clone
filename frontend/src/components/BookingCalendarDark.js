"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Cal.com starts week on Monday
const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BookingCalendarDark({
  availableDays = [],
  selectedDate,
  onSelectDate,
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const jsToMondayStart = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);

  const calendarDays = useMemo(() => {
    const firstDayJS = new Date(viewYear, viewMonth, 1).getDay();
    const firstDay = jsToMondayStart(firstDayJS);
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
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({ day: d, date, isPast, isAvailable, isToday, isSelected });
    }

    return days;
  }, [viewMonth, viewYear, availableDays, selectedDate, today]);

  return (
    <div className="select-none">
      {/* Month/Year header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base">
          <span className="font-bold text-white">{MONTH_NAMES[viewMonth]}</span>{" "}
          <span className="text-[#a1a1a1] font-normal">{viewYear}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-1.5 rounded-md text-[#a1a1a1] hover:text-white hover:bg-[#262626] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md text-[#a1a1a1] hover:text-white hover:bg-[#262626] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-[#737373] py-2 tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-[2px]">
        {calendarDays.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="aspect-square" />;

          return (
            <button
              key={cell.day}
              disabled={!cell.isAvailable}
              onClick={() => cell.isAvailable && onSelectDate(cell.date)}
              className={`
                relative aspect-square flex items-center justify-center
                text-sm font-medium rounded-md transition-all duration-100
                ${cell.isSelected
                  ? "bg-white text-black"
                  : cell.isAvailable
                    ? "bg-[#333333] hover:bg-[#404040] text-white cursor-pointer"
                    : "text-[#404040] cursor-not-allowed"
                }
                ${cell.isToday && !cell.isSelected ? "font-bold" : ""}
              `}
            >
              {cell.day}
              {cell.isToday && !cell.isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
