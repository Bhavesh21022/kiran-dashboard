"use client";

import ThermalGauge from "./ThermalGauge";
import { riskColor } from "@/lib/thermalIndex";
import { LocationReading } from "@/lib/queries";

const MOCK: LocationReading[] = [
  { id: "mock-1", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, tempC: 46, rh: 22, windKmh: 6, score: 92, category: "Extreme", ndmaTier: "Red", recordedAt: "" },
  { id: "mock-2", name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, tempC: 45, rh: 28, windKmh: 5, score: 89, category: "Extreme", ndmaTier: "Red", recordedAt: "" },
  { id: "mock-3", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, tempC: 41, rh: 25, windKmh: 8, score: 74, category: "High", ndmaTier: "Orange", recordedAt: "" },
  { id: "mock-4", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, tempC: 40, rh: 30, windKmh: 9, score: 70, category: "High", ndmaTier: "Orange", recordedAt: "" },
  { id: "mock-5", name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, tempC: 39, rh: 35, windKmh: 10, score: 66, category: "High", ndmaTier: "Orange", recordedAt: "" },
];

interface Props {
  readings?: LocationReading[];
  onSelect: (locationId: string) => void;
}

export default function TopRiskCities({ readings, onSelect }: Props) {
  const source = readings && readings.length > 0 ? readings : MOCK;
  const top = [...source].sort((a, b) => b.score - a.score).slice(0, 8);

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
      {top.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className="glass flex min-w-[168px] shrink-0 flex-col items-center gap-1 rounded-2xl p-3 text-left transition hover:bg-white/8"
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-medium">{r.name}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ color: riskColor[r.category], backgroundColor: `${riskColor[r.category]}22` }}
            >
              {r.category}
            </span>
          </div>
          <ThermalGauge score={r.score} category={r.category} size={100} />
          <span className="text-[10px] text-white/35">{r.state}</span>
        </button>
      ))}
    </div>
  );
}
