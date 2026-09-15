"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { RiskCategory, riskColor } from "@/lib/thermalIndex";
import { LocationReading } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";

interface Props {
  nationalAvgCategory: RiskCategory;
  locations?: LocationReading[];
  onSelectLocation: (locationId: string) => void;
}

export default function Navbar({ nationalAvgCategory, locations, onSelectLocation }: Props) {
  const [lowData, setLowData] = useState(false);
  const { lang, setLang } = useI18n();

  return (
    <header className="glass fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
      <div className="flex items-center gap-2 shrink-0">
        <motion.span
          className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-400 to-red-500"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <span className="kiran-shimmer font-display text-xl font-bold tracking-tight">KIRAN</span>
      </div>

      <div className="hidden flex-1 max-w-md sm:block">
        <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          title="Language"
          className="rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/50 hover:text-white/80"
        >
          {lang === "en" ? "EN" : "हिं"}
        </button>
        <button
          onClick={() => setLowData((v) => !v)}
          title="Low Data Mode"
          className={`hidden rounded-full border px-2 py-1 text-[10px] sm:block ${lowData ? "border-risk-low text-risk-low" : "border-white/15 text-white/40"}`}
        >
          {lowData ? "Low Data: On" : "Low Data"}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-risk-low animate-pulseSlow" />
          <span className="hidden sm:inline">System Live</span>
        </div>

        <div className="glass rounded-full px-3 py-1.5 text-xs font-medium" style={{ color: riskColor[nationalAvgCategory] }}>
          National: {nationalAvgCategory}
        </div>
      </div>
    </header>
  );
}
