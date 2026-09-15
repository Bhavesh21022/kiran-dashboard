"use client";

import { useState, useRef, useEffect } from "react";
import { LocationReading } from "@/lib/queries";

// Yahi wo INTERFACE hai jiske na hone ki wajah se Vercel error de raha tha
interface SearchBarProps {
  locations?: LocationReading[];
  onSelectLocation?: (locationId: string) => void;
}

export default function SearchBar({ locations = [], onSelectLocation }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Search filter logic
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase()) ||
    loc.state.toLowerCase().includes(query.toLowerCase())
  );

  // Bahar click karne par dropdown band karne ka logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Jab user kisi city par click kare
  const handleSelect = (loc: LocationReading) => {
    setQuery("");
    setIsOpen(false);
    
    if (onSelectLocation) {
      onSelectLocation(loc.id);
    } else {
      // Fallback custom event agar bina prop ke use kiya ho
      window.dispatchEvent(
        new CustomEvent("citySelected", {
          detail: { name: loc.name, lat: loc.lat, lon: loc.lng },
        })
      );
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search city or state..."
          className="w-full bg-black/40 border border-white/20 text-white rounded-full px-5 py-2 pl-10 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Dropdown Search Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex justify-between items-center"
              >
                <div>
                  <div className="text-white text-sm font-semibold">{loc.name}</div>
                  <div className="text-gray-400 text-xs">{loc.state}</div>
                </div>
                <div className="text-orange-400 text-xs font-bold">{loc.tempC}°C</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No cities found
            </div>
          )}
        </div>
      )}
    </div>
  );
}