"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Clock, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getAvailability, setBulkAvailability, getUser, updateUser } from "@/lib/api";
import { DEFAULT_USER_ID, DAY_NAMES, TIME_OPTIONS, TIMEZONES } from "@/lib/constants";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(
    DAY_NAMES.map((_, i) => ({
      dayOfWeek: i,
      enabled: false,
      startTime: DEFAULT_START,
      endTime: DEFAULT_END,
    }))
  );
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchAvailability = useCallback(async () => {
    try {
      const [availRes, userRes] = await Promise.all([
        getAvailability(DEFAULT_USER_ID),
        getUser(DEFAULT_USER_ID)
      ]);
      const data = availRes.data || [];
      if (userRes.data?.timezone) {
        setTimezone(userRes.data.timezone);
      }

      setSchedule((prev) =>
        prev.map((item) => {
          const match = data.find((a) => a.dayOfWeek === item.dayOfWeek);
          if (match) {
            return {
              ...item,
              enabled: true,
              startTime: match.startTime,
              endTime: match.endTime,
            };
          }
          return { ...item, enabled: false };
        })
      );
    } catch (err) {
      console.error("Failed to fetch availability:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const toggleDay = (dayOfWeek) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s
      )
    );
    setSaved(false);
  };

  const updateTime = (dayOfWeek, field, value) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const schedules = schedule
        .filter((s) => s.enabled)
        .map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        }));

      await Promise.all([
        setBulkAvailability({
          userId: DEFAULT_USER_ID,
          schedules,
        }),
        updateUser(DEFAULT_USER_ID, { timezone })
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save availability:", err);
      alert("Failed to save. Please check your time ranges.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure times when you are available for bookings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm
            ${
              saved
                ? "bg-green-600 text-white"
                : "bg-foreground text-white hover:opacity-90"
            }
            disabled:opacity-50`}
        >
          {saved ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            <>
              <Save size={16} />
              Save
            </>
          )}
        </button>
      </div>

      {/* Schedule card */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {/* Timezone selector */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>Timezone</span>
          </div>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-ring bg-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Day rows */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {schedule.map((item) => (
              <div
                key={item.dayOfWeek}
                className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                  item.enabled ? "bg-white" : "bg-accent"
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(item.dayOfWeek)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${
                    item.enabled ? "bg-foreground" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                      item.enabled ? "left-[20px]" : "left-[2px]"
                    }`}
                  />
                </button>

                {/* Day name */}
                <span
                  className={`w-28 text-sm font-medium ${
                    item.enabled
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {DAY_NAMES[item.dayOfWeek]}
                </span>

                {/* Time selectors */}
                {item.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={item.startTime}
                      onChange={(e) =>
                        updateTime(item.dayOfWeek, "startTime", e.target.value)
                      }
                      className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted-foreground text-sm">
                      –
                    </span>
                    <select
                      value={item.endTime}
                      onChange={(e) =>
                        updateTime(item.dayOfWeek, "endTime", e.target.value)
                      }
                      className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
