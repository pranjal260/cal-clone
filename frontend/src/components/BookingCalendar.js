"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_SHORT, MONTH_NAMES } from "@/lib/constants";

export default function BookingCalendar({
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
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Can't go to past months
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0, 0, 0, 0);

      const dayOfWeek = date.getDay();
      const isPast = date < today;
      const isAvailable = !isPast && availableDays.includes(dayOfWeek);
      const isToday = date.getTime() === today.getTime();
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({
        day: d,
        date,
        isPast,
        isAvailable,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [viewMonth, viewYear, availableDays, selectedDate, today]);

  return (
    <div className="select-none">
      {/* Month / Year header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[15px]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} />;
          }

          return (
            <button
              key={cell.day}
              disabled={!cell.isAvailable}
              onClick={() => cell.isAvailable && onSelectDate(cell.date)}
              className={`
                relative w-full aspect-square flex items-center justify-center
                text-sm rounded-full transition-all duration-150
                ${
                  cell.isSelected
                    ? "bg-foreground text-white font-semibold"
                    : cell.isAvailable
                    ? "hover:bg-muted font-medium text-foreground cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }
              `}
            >
              {cell.day}
              {cell.isToday && !cell.isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
