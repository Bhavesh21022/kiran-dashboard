"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { riskColor } from "@/lib/thermalIndex";
import { fetchLatestReadings, LocationReading } from "@/lib/queries";

export default function AlertsIndiaPage() {
  const [readings, setReadings] = useState<LocationReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestReadings()
      .then(setReadings)
      .catch(() => setReadings([]))
      .finally(() => setLoading(false));
  }, []);

  const active = readings
    .filter((r) => r.category === "High" || r.category === "Extreme")
    .sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen px-4 pb-24 pt-24 font-body sm:pl-64 sm:pr-8">
      <Sidebar />
      <PageHeader
        title="Active Alerts — India"
        subtitle="Model-based, real-time. Locations currently at High or Extreme heat risk."
      />

      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : active.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-white/40">
          {readings.length === 0
            ? "No live data yet — connect Supabase (Phase 2 README) to see real readings here."
            : "No locations are currently at High or Extreme risk. 🎉"}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4" style={{ borderLeft: `3px solid ${riskColor[r.category]}` }}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">{r.name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{ color: riskColor[r.category], backgroundColor: `${riskColor[r.category]}22` }}
                >
                  {r.category}
                </span>
              </div>
              <p className="text-xs text-white/40">{r.state} · NDMA {r.ndmaTier} tier · score {Math.round(r.score)}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
