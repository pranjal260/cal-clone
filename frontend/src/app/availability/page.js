"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Clock, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getAvailability, setBulkAvailability, getUser, updateUser } from "@/lib/api";
import { DAY_NAMES, TIME_OPTIONS, TIMEZONES } from "@/lib/constants";
import { useUser } from "@/lib/userContext";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

export default function AvailabilityPage() {
  const { user } = useUser();
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
    if (!user?.id) return;
    try {
      const [availRes, userRes] = await Promise.all([
        getAvailability(user.id),
        getUser(user.id),
      ]);
      const data = availRes.data || [];
      if (userRes.data?.timezone) setTimezone(userRes.data.timezone);

      setSchedule((prev) =>
        prev.map((item) => {
          const match = data.find((a) => a.dayOfWeek === item.dayOfWeek);
          if (match) {
            return { ...item, enabled: true, startTime: match.startTime, endTime: match.endTime };
          }
          return { ...item, enabled: false };
        })
      );
    } catch (err) {
      console.error("Failed to fetch availability:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const toggleDay = (dayOfWeek) => {
    setSchedule((prev) =>
      prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s)
    );
    setSaved(false);
  };

  const updateTime = (dayOfWeek, field, value) => {
    setSchedule((prev) =>
      prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const schedules = schedule
        .filter((s) => s.enabled)
        .map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }));

      await Promise.all([
        setBulkAvailability({ userId: user.id, schedules }),
        updateUser(user.id, { timezone }),
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
          className={`btn ${saved ? "bg-success text-white" : "btn-primary"}`}
        >
          {saved ? <><Check size={15} /> Saved</> : saving ? "Saving..." : <><Save size={15} /> Save</>}
        </button>
      </div>

      {/* Schedule Card */}
      <div className="bg-white border border-border rounded-md overflow-hidden">
        {/* Timezone */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={15} />
            <span>Timezone</span>
          </div>
          <select
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setSaved(false); }}
            className="px-3 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:border-ring bg-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Day rows */}
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {schedule.map((item) => (
              <div
                key={item.dayOfWeek}
                className={`px-5 py-3 flex items-center gap-4 transition-colors ${item.enabled ? "bg-white" : "bg-muted/50"
                  }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(item.dayOfWeek)}
                  className="toggle"
                  data-active={item.enabled.toString()}
                  aria-label={`Toggle ${DAY_NAMES[item.dayOfWeek]}`}
                />

                {/* Day name */}
                <span className={`w-24 text-sm font-medium ${item.enabled ? "text-foreground" : "text-muted-foreground"
                  }`}>
                  {DAY_NAMES[item.dayOfWeek]}
                </span>

                {/* Time selectors */}
                {item.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={item.startTime}
                      onChange={(e) => updateTime(item.dayOfWeek, "startTime", e.target.value)}
                      className="px-2.5 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:border-ring"
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-muted-foreground text-sm">–</span>
                    <select
                      value={item.endTime}
                      onChange={(e) => updateTime(item.dayOfWeek, "endTime", e.target.value)}
                      className="px-2.5 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:border-ring"
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
