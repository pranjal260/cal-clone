"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, Globe, Check, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getAvailability, setBulkAvailability, getUser, updateUser } from "@/lib/api";
import { DAY_NAMES, TIME_OPTIONS, TIMEZONES } from "@/lib/constants";
import { useUser } from "@/lib/userContext";

const DAYS = [
  { value: 0, short: "Sun" }, { value: 1, short: "Mon" }, { value: 2, short: "Tue" },
  { value: 3, short: "Wed" }, { value: 4, short: "Thu" }, { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
];

const fmt = (t) => {
  const [h, m] = t.split(":").map(Number);
  const label = `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  return label;
};

export default function AvailabilityPage() {
  const { user } = useUser();
  const [schedule, setSchedule] = useState(DAYS.map((d) => ({ dayOfWeek: d.value, enabled: d.value >= 1 && d.value <= 5, startTime: "09:00", endTime: "17:00" })));
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [a, u] = await Promise.all([getAvailability(user.id), getUser(user.id)]);
      if (u.data?.timezone) setTimezone(u.data.timezone);
      setSchedule(prev => prev.map(s => {
        const m = (a.data || []).find(x => x.dayOfWeek === s.dayOfWeek);
        return m ? { ...s, enabled: true, startTime: m.startTime, endTime: m.endTime } : { ...s, enabled: false };
      }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleDay = (dayOfWeek) => {
    setSchedule(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s));
  };

  const updateTime = (dayOfWeek, field, value) => {
    setSchedule(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
  };

  const save = async () => {
    if (!user?.id) return; setSaving(true);
    try {
      await Promise.all([
        setBulkAvailability({ userId: user.id, schedules: schedule.filter(s => s.enabled).map(s => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })) }),
        updateUser(user.id, { timezone })
      ]);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert("Failed to save"); } finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Availability</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure the times you are available for bookings.</p>
        </div>

        <div className="space-y-6">
          {/* Timezone card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Timezone</h2>
            <div className="flex items-center gap-2 max-w-sm">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {/* Weekly Hours card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Weekly Hours</h2>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="space-y-3">
                {DAYS.map((day) => {
                  const s = schedule.find(s => s.dayOfWeek === day.value);
                  if (!s) return null;
                  return (
                    <div key={day.value} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                      {/* Toggle */}
                      <button type="button" onClick={() => toggleDay(day.value)}
                        className="relative shrink-0 rounded-full transition-colors"
                        style={{ height: "22px", width: "40px", backgroundColor: s.enabled ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)" }}>
                        <span className="absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform"
                          style={{ width: "18px", height: "18px", transform: s.enabled ? "translateX(18px)" : "translateX(0)" }} />
                      </button>

                      {/* Day name */}
                      <span className={`w-12 text-sm font-medium shrink-0 ${s.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                        {day.short}
                      </span>

                      {/* Time selectors */}
                      {s.enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <select value={s.startTime} onChange={e => updateTime(day.value, "startTime", e.target.value)}
                            className="px-2.5 py-1.5 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                          </select>
                          <span className="text-muted-foreground text-sm">—</span>
                          <select value={s.endTime} onChange={e => updateTime(day.value, "endTime", e.target.value)}
                            className="px-2.5 py-1.5 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                          </select>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60
                ${saved
                  ? "bg-green-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
