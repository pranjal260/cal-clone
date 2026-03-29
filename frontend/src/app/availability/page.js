"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, Clock, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getAvailability, setBulkAvailability, getUser, updateUser } from "@/lib/api";
import { DAY_NAMES, TIME_OPTIONS, TIMEZONES } from "@/lib/constants";
import { useUser } from "@/lib/userContext";

const fmt = (t) => { const [h, m] = t.split(":").map(Number); return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };

export default function AvailabilityPage() {
  const { user } = useUser();
  const [schedule, setSchedule] = useState(DAY_NAMES.map((_, i) => ({ dayOfWeek: i, enabled: false, startTime: "09:00", endTime: "17:00" })));
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetch = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [a, u] = await Promise.all([getAvailability(user.id), getUser(user.id)]);
      if (u.data?.timezone) setTimezone(u.data.timezone);
      setSchedule(prev => prev.map(s => { const m = (a.data || []).find(x => x.dayOfWeek === s.dayOfWeek); return m ? { ...s, enabled: true, startTime: m.startTime, endTime: m.endTime } : { ...s, enabled: false }; }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    if (!user?.id) return; setSaving(true);
    try {
      await Promise.all([setBulkAvailability({ userId: user.id, schedules: schedule.filter(s => s.enabled).map(s => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })) }), updateUser(user.id, { timezone })]);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert("Failed to save"); } finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Availability</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Configure times when you are available for bookings.</p>
        </div>
        <button onClick={save} disabled={saving} className={`btn text-[13px] ${saved ? "btn-success" : "btn-primary"}`}>
          {saved ? <><Check size={14} /> Saved</> : saving ? "Saving..." : <><Save size={14} /> Save</>}
        </button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2 text-[13px] text-[#6b7280]"><Clock size={14} /> Timezone</div>
          <select value={timezone} onChange={e => { setTimezone(e.target.value); setSaved(false); }}
            className="px-3 py-1.5 border border-[#e5e7eb] rounded-md text-[13px] focus:outline-none focus:border-[#111827] bg-white cursor-pointer">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
        ) : (
          <div className="divide-y divide-[#e5e7eb]">
            {schedule.map(item => (
              <div key={item.dayOfWeek} className={`px-5 py-3 flex items-center gap-4 ${item.enabled ? "bg-white" : "bg-[#fafafa]"}`}>
                <button onClick={() => { setSchedule(p => p.map(s => s.dayOfWeek === item.dayOfWeek ? { ...s, enabled: !s.enabled } : s)); setSaved(false); }}
                  className="toggle" data-active={String(item.enabled)} />
                <span className={`w-24 text-[13px] font-medium ${item.enabled ? "text-[#111827]" : "text-[#9ca3af]"}`}>{DAY_NAMES[item.dayOfWeek]}</span>
                {item.enabled ? (
                  <div className="flex items-center gap-2">
                    <select value={item.startTime} onChange={e => { setSchedule(p => p.map(s => s.dayOfWeek === item.dayOfWeek ? { ...s, startTime: e.target.value } : s)); setSaved(false); }}
                      className="px-2.5 py-1.5 border border-[#e5e7eb] rounded-md text-[13px] bg-white focus:outline-none focus:border-[#111827]">
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                    </select>
                    <span className="text-[#9ca3af] text-[13px]">–</span>
                    <select value={item.endTime} onChange={e => { setSchedule(p => p.map(s => s.dayOfWeek === item.dayOfWeek ? { ...s, endTime: e.target.value } : s)); setSaved(false); }}
                      className="px-2.5 py-1.5 border border-[#e5e7eb] rounded-md text-[13px] bg-white focus:outline-none focus:border-[#111827]">
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                    </select>
                  </div>
                ) : <span className="text-[13px] text-[#9ca3af]">Unavailable</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
