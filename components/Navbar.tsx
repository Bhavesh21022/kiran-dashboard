// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { LocationReading } from "@/lib/queries";
import { RiskCategory } from "@/lib/thermalIndex";
import { useI18n } from "@/lib/i18n";

interface NavbarProps {
  nationalAvgCategory: RiskCategory;
  locations: LocationReading[];
  onSelectLocation: (locationId: string) => void;
}

export default function Navbar({ nationalAvgCategory, locations, onSelectLocation }: NavbarProps) {
  const { t, lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const getBadgeColor = (cat: RiskCategory) => {
    switch (cat) {
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Moderate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Extreme": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMenu}
            className="sm:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">☀️</span>
            <span className="font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              KIRAN
            </span>
          </div>
        </div>

        {/* Middle: SearchBar Component */}
        <div className="hidden flex-1 max-w-md sm:block">
          <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        </div>

        {/* Right: National Status Badge & Language Switcher */}
        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${getBadgeColor(nationalAvgCategory)}`}>
            <span className="w-2 h-2 rounded-full animate-ping bg-current" />
            <span>National Avg: {nationalAvgCategory}</span>
          </div>

          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition"
          >
            {lang === "en" ? "🇮🇳 हिंदी" : "🇬🇧 English"}
          </button>
        </div>

      </div>
    </header>
  );
}